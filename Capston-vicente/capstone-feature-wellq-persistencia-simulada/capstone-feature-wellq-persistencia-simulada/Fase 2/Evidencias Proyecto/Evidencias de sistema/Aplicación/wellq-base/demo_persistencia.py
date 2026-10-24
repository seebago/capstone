"""Demo: confirm a synthetic exam, persist it, restart, read it back.

Run with: python -m demo
"""
import json
import os
import tempfile
from datetime import datetime, timezone

from persistence.sqlite_repository import SqliteRepository
from prototype.domain import Context, Extraction, Marker, score_eligibility, transition

NOW = datetime(2026, 9, 30, tzinfo=timezone.utc)


def main():
    marker = Marker("synthetic_marker", 5.0, "demo_unit", 1.0, 10.0, 0.99)
    extraction = Extraction("tenant_demo", "patient_demo", "test_demo", "extraction_demo", (marker,))
    patient = Context("patient_demo_user", "tenant_demo", "patient",
                       frozenset({"patient_demo"}), frozenset({"exam:confirm"}),
                       frozenset({"clinical_tests"}), "demo")
    clinician = Context("clinician_demo_user", "tenant_demo", "clinician",
                         frozenset({"patient_demo"}), frozenset({"exam:validate", "score:read"}),
                         frozenset({"clinical_tests", "lab_scoring"}), "demo")

    with tempfile.TemporaryDirectory() as tmp:
        db_path = os.path.join(tmp, "wellq_sim.db")

        # --- process "before restart" ---
        repo = SqliteRepository(db_path)
        outcome = transition(extraction, patient, "confirm",
                              extraction.extraction_id, extraction.revision, NOW)
        repo.apply_outcome(outcome)
        eligibility = score_eligibility(outcome.extraction, clinician,
                                         canonical_units={"synthetic_marker": "demo_unit"},
                                         scoring_version="demo-not-clinical-v0",
                                         catalog_version="synthetic-v0")
        repo.save_eligibility("tenant_demo", eligibility)
        repo.close()

        # --- simulated restart: brand-new connection, same file ---
        reopened = SqliteRepository(db_path)
        restored = reopened.get_extraction("tenant_demo", "extraction_demo")
        other_tenant_view = reopened.get_extraction("tenant_other", "extraction_demo")
        print(json.dumps({
            "synthetic_only": True,
            "after_restart": {
                "status": restored.status,
                "revision": restored.revision,
                "confirmed_markers": [m.marker_code for m in restored.confirmed],
            },
            "cross_tenant_read_from_tenant_other": other_tenant_view,
            "pending_outbox_jobs": reopened.pending_outbox("tenant_demo"),
            "eligibility": {
                "included": eligibility.included,
                "excluded": eligibility.excluded,
            },
            "score": None,
            "note": "No clinical scoring model. Engine (SQLite here) is a "
                    "simulation; ADR-006 (Mongo vs PostgreSQL) is still open.",
        }, indent=2))
        reopened.close()


if __name__ == "__main__":
    main()
