"""Simulated database for the WellQ exams module — HITO 1 evidence.

This is NOT the production database decision (ADR-006 is still open:
MongoDB vs. PostgreSQL+RLS). It is a persistence adapter around the pure
domain rules in ``prototype.domain`` (authored by Sebastian, commit
38830fa), built so the team can demonstrate "a real record survives a
restart, isolated by tenant" without having picked the final engine yet.

Design rules followed (see BITACORA_ARQUITECTURA.md "Invariantes de
diseno" and PLAN_FASES_COMPONENTES.md SS6.2):

- Every row carries ``client_id``. Every read is filtered by it in SQL,
  never trusted from a bare id passed by a caller.
- Writing an ``Outcome`` (the result of ``prototype.domain.transition``)
  persists the updated extraction AND its audit event in a single SQLite
  transaction, plus a durable "outbox" row recording the score action
  that a future worker must still process. This is the simulated
  equivalent of "guarda evento y encola calculo; no lo calcula
  sincronicamente" from ARQUITECTURA_BASE.md.
- Field names mirror ``prototype.domain`` (which in turn mirrors the
  canonical schema, Documento Maestro SS6, and WellQ_Modelo_de_Datos.docx
  where an equivalent field exists) — nothing is renamed here.
- No clinical values are written to the audit_events table beyond what
  ``prototype.domain.AuditEvent`` already exposes (it never carries
  ``value_canonical`` or ``proposal`` — verified in
  REVISION_38830fa_wellq-base.md).

This module still does not implement: JWT/identity verification, feature
plans tied to a real commercial catalog, idempotency keys for repeated
PATCH calls, or a real worker draining the outbox. Those remain open
items for the next phase (see the informe that ships with this commit).
"""
from __future__ import annotations

import json
import sqlite3
from contextlib import contextmanager
from dataclasses import asdict
from typing import Iterator, Optional

from prototype.domain import AuditEvent, Eligibility, Extraction, Marker, Outcome

SCHEMA = """
CREATE TABLE IF NOT EXISTS extractions (
    client_id TEXT NOT NULL,
    extraction_id TEXT NOT NULL,
    clinical_test_id TEXT NOT NULL,
    patient_id TEXT NOT NULL,
    revision INTEGER NOT NULL,
    status TEXT NOT NULL,
    data TEXT NOT NULL,
    PRIMARY KEY (client_id, extraction_id)
);

CREATE TABLE IF NOT EXISTS audit_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id TEXT NOT NULL,
    extraction_id TEXT NOT NULL,
    revision INTEGER NOT NULL,
    action TEXT NOT NULL,
    data TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_tenant ON audit_events(client_id, extraction_id);

CREATE TABLE IF NOT EXISTS outbox (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id TEXT NOT NULL,
    extraction_id TEXT NOT NULL,
    revision INTEGER NOT NULL,
    job_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending'
);
CREATE INDEX IF NOT EXISTS idx_outbox_tenant_status ON outbox(client_id, status);

CREATE TABLE IF NOT EXISTS eligibility_snapshots (
    client_id TEXT NOT NULL,
    extraction_id TEXT NOT NULL,
    revision INTEGER NOT NULL,
    data TEXT NOT NULL,
    PRIMARY KEY (client_id, extraction_id, revision)
);
"""


class RepositoryError(ValueError):
    """Raised for cross-tenant access attempts or malformed rows."""


def _marker_to_dict(marker: Marker) -> dict:
    return asdict(marker)


def _marker_from_dict(data: dict) -> Marker:
    return Marker(**data)


def _extraction_to_json(extraction: Extraction) -> str:
    payload = asdict(extraction)
    payload["proposal"] = [asdict(m) for m in extraction.proposal]
    payload["confirmed"] = [asdict(m) for m in extraction.confirmed]
    return json.dumps(payload)


def _extraction_from_json(raw: str) -> Extraction:
    payload = json.loads(raw)
    payload["proposal"] = tuple(_marker_from_dict(m) for m in payload["proposal"])
    payload["confirmed"] = tuple(_marker_from_dict(m) for m in payload["confirmed"])
    return Extraction(**payload)


def _event_to_json(event: AuditEvent) -> str:
    return json.dumps(asdict(event))


def _event_from_json(raw: str) -> AuditEvent:
    return AuditEvent(**json.loads(raw))


def _eligibility_to_json(eligibility: Eligibility) -> str:
    payload = asdict(eligibility)
    payload["excluded"] = [list(pair) for pair in eligibility.excluded]
    return json.dumps(payload)


def _eligibility_from_json(raw: str) -> Eligibility:
    payload = json.loads(raw)
    payload["included"] = tuple(payload["included"])
    payload["excluded"] = tuple(tuple(pair) for pair in payload["excluded"])
    return Eligibility(**payload)


class SqliteRepository:
    """Tenant-scoped persistence for Extraction / AuditEvent / Eligibility.

    Every public method that reads or writes a specific record takes
    ``client_id`` explicitly and filters by it — there is no method that
    accepts a bare ``extraction_id`` without a tenant, on purpose: that
    mirrors the invariant already written in BITACORA_ARQUITECTURA.md
    ("el client_id efectivo... nunca de una cabecera, URL o cuerpo") even
    though, in this prototype, the caller (not a verified JWT) still
    supplies the client_id — identity verification is explicitly out of
    scope here and remains an open item.
    """

    def __init__(self, path: str = ":memory:"):
        self._conn = sqlite3.connect(path)
        self._conn.execute("PRAGMA foreign_keys = ON")
        self._conn.executescript(SCHEMA)
        self._conn.commit()

    def close(self) -> None:
        self._conn.close()

    @contextmanager
    def _transaction(self) -> Iterator[sqlite3.Cursor]:
        cursor = self._conn.cursor()
        try:
            yield cursor
            self._conn.commit()
        except Exception:
            self._conn.rollback()
            raise

    # -- writes -----------------------------------------------------------

    def apply_outcome(self, outcome: Outcome) -> None:
        """Persist the updated extraction and its audit event atomically.

        Also enqueues a durable outbox row for ``outcome.score_action``
        when it is not "none" — the simulated stand-in for "guarda el
        evento y encola el calculo; no lo calcula sincronicamente".
        """
        extraction = outcome.extraction
        with self._transaction() as cur:
            cur.execute(
                """
                INSERT INTO extractions (client_id, extraction_id, clinical_test_id,
                                          patient_id, revision, status, data)
                VALUES (:client_id, :extraction_id, :clinical_test_id, :patient_id,
                        :revision, :status, :data)
                ON CONFLICT(client_id, extraction_id) DO UPDATE SET
                    revision = excluded.revision,
                    status = excluded.status,
                    data = excluded.data
                """,
                {
                    "client_id": extraction.client_id,
                    "extraction_id": extraction.extraction_id,
                    "clinical_test_id": extraction.clinical_test_id,
                    "patient_id": extraction.patient_id,
                    "revision": extraction.revision,
                    "status": extraction.status,
                    "data": _extraction_to_json(extraction),
                },
            )
            cur.execute(
                """
                INSERT INTO audit_events (client_id, extraction_id, revision, action, data)
                VALUES (?, ?, ?, ?, ?)
                """,
                (
                    outcome.event.client_id,
                    outcome.event.extraction_id,
                    outcome.event.revision,
                    outcome.event.action,
                    _event_to_json(outcome.event),
                ),
            )
            if outcome.score_action != "none":
                cur.execute(
                    """
                    INSERT INTO outbox (client_id, extraction_id, revision, job_type, status)
                    VALUES (?, ?, ?, ?, 'pending')
                    """,
                    (extraction.client_id, extraction.extraction_id,
                     extraction.revision, outcome.score_action),
                )

    def save_eligibility(self, client_id: str, eligibility: Eligibility) -> None:
        if eligibility.extraction_id and client_id:
            with self._transaction() as cur:
                cur.execute(
                    """
                    INSERT INTO eligibility_snapshots (client_id, extraction_id, revision, data)
                    VALUES (?, ?, ?, ?)
                    ON CONFLICT(client_id, extraction_id, revision) DO UPDATE SET data = excluded.data
                    """,
                    (client_id, eligibility.extraction_id, eligibility.revision,
                     _eligibility_to_json(eligibility)),
                )

    def mark_outbox_done(self, client_id: str, job_id: int) -> None:
        with self._transaction() as cur:
            cur.execute(
                "UPDATE outbox SET status = 'done' WHERE client_id = ? AND id = ?",
                (client_id, job_id),
            )

    # -- reads, always tenant-scoped --------------------------------------

    def get_extraction(self, client_id: str, extraction_id: str) -> Optional[Extraction]:
        row = self._conn.execute(
            "SELECT data FROM extractions WHERE client_id = ? AND extraction_id = ?",
            (client_id, extraction_id),
        ).fetchone()
        return _extraction_from_json(row[0]) if row else None

    def list_extractions(self, client_id: str) -> list[Extraction]:
        rows = self._conn.execute(
            "SELECT data FROM extractions WHERE client_id = ? ORDER BY extraction_id",
            (client_id,),
        ).fetchall()
        return [_extraction_from_json(r[0]) for r in rows]

    def list_audit_events(self, client_id: str, extraction_id: Optional[str] = None) -> list[AuditEvent]:
        if extraction_id is None:
            rows = self._conn.execute(
                "SELECT data FROM audit_events WHERE client_id = ? ORDER BY id",
                (client_id,),
            ).fetchall()
        else:
            rows = self._conn.execute(
                "SELECT data FROM audit_events WHERE client_id = ? AND extraction_id = ? ORDER BY id",
                (client_id, extraction_id),
            ).fetchall()
        return [_event_from_json(r[0]) for r in rows]

    def get_eligibility(self, client_id: str, extraction_id: str, revision: int) -> Optional[Eligibility]:
        row = self._conn.execute(
            """SELECT data FROM eligibility_snapshots
               WHERE client_id = ? AND extraction_id = ? AND revision = ?""",
            (client_id, extraction_id, revision),
        ).fetchone()
        return _eligibility_from_json(row[0]) if row else None

    def pending_outbox(self, client_id: str) -> list[dict]:
        rows = self._conn.execute(
            """SELECT id, extraction_id, revision, job_type FROM outbox
               WHERE client_id = ? AND status = 'pending' ORDER BY id""",
            (client_id,),
        ).fetchall()
        return [
            {"id": r[0], "extraction_id": r[1], "revision": r[2], "job_type": r[3]}
            for r in rows
        ]
