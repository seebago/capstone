import os
import tempfile
import unittest
from datetime import datetime, timezone

from persistence.sqlite_repository import SqliteRepository
from prototype.domain import Context, Extraction, Marker, score_eligibility, transition


def make_extraction(client_id="tenant_a", extraction_id="extraction_a"):
    marker = Marker("synthetic_marker", 5.0, "demo_unit", 1.0, 10.0, 0.99)
    return Extraction(client_id, "patient_a", "test_a", extraction_id, (marker,))


def make_context(role="patient", client_id="tenant_a", patient_ids=("patient_a",)):
    if role == "patient":
        perms, features = frozenset({"exam:confirm"}), frozenset({"clinical_tests"})
    else:
        perms = frozenset({"exam:validate", "score:read"})
        features = frozenset({"clinical_tests", "lab_scoring"})
    return Context("actor", client_id, role, frozenset(patient_ids), perms, features, "test")


NOW = datetime(2026, 9, 30, tzinfo=timezone.utc)


class SqliteRepositoryTests(unittest.TestCase):
    def setUp(self):
        self.repo = SqliteRepository(":memory:")

    def tearDown(self):
        self.repo.close()

    def test_apply_outcome_persists_extraction_and_audit_together(self):
        extraction = make_extraction()
        outcome = transition(extraction, make_context(), "confirm",
                              extraction.extraction_id, extraction.revision, NOW)
        self.repo.apply_outcome(outcome)

        stored = self.repo.get_extraction("tenant_a", "extraction_a")
        self.assertIsNotNone(stored)
        self.assertEqual(stored.status, "confirmed")
        self.assertEqual(stored.revision, 2)
        self.assertEqual(stored.confirmed, outcome.extraction.confirmed)

        events = self.repo.list_audit_events("tenant_a", "extraction_a")
        self.assertEqual(len(events), 1)
        self.assertEqual(events[0].action, "confirm")

    def test_confirm_enqueues_outbox_job_reject_invalidates_discard_does_not(self):
        extraction = make_extraction()
        confirm_outcome = transition(extraction, make_context(), "confirm",
                                      extraction.extraction_id, extraction.revision, NOW)
        self.repo.apply_outcome(confirm_outcome)
        self.assertEqual(
            [job["job_type"] for job in self.repo.pending_outbox("tenant_a")],
            ["enqueue"],
        )

        clinician = make_context(role="clinician")
        reject_outcome = transition(confirm_outcome.extraction, clinician, "reject",
                                     confirm_outcome.extraction.extraction_id,
                                     confirm_outcome.extraction.revision, NOW)
        self.repo.apply_outcome(reject_outcome)
        job_types = [job["job_type"] for job in self.repo.pending_outbox("tenant_a")]
        self.assertIn("invalidate", job_types)

        discarded = transition(make_extraction(extraction_id="extraction_b"), make_context(),
                                "discard", "extraction_b", 1, NOW)
        self.repo.apply_outcome(discarded)
        # discard's score_action is "none": no new job for extraction_b.
        extraction_b_jobs = [j for j in self.repo.pending_outbox("tenant_a") if j["extraction_id"] == "extraction_b"]
        self.assertEqual(extraction_b_jobs, [])

    def test_cross_tenant_read_returns_nothing(self):
        extraction = make_extraction()
        outcome = transition(extraction, make_context(), "confirm",
                              extraction.extraction_id, extraction.revision, NOW)
        self.repo.apply_outcome(outcome)

        self.assertIsNone(self.repo.get_extraction("tenant_b", "extraction_a"))
        self.assertEqual(self.repo.list_extractions("tenant_b"), [])
        self.assertEqual(self.repo.list_audit_events("tenant_b"), [])
        self.assertEqual(self.repo.pending_outbox("tenant_b"), [])

    def test_eligibility_snapshot_round_trip_preserves_tuples(self):
        extraction = make_extraction()
        confirmed = transition(extraction, make_context(), "confirm",
                               extraction.extraction_id, extraction.revision, NOW).extraction
        eligibility = score_eligibility(confirmed, make_context(role="clinician"),
                                        canonical_units={"synthetic_marker": "demo_unit"},
                                        scoring_version="demo-v0", catalog_version="synthetic-v0")
        self.repo.save_eligibility("tenant_a", eligibility)

        stored = self.repo.get_eligibility("tenant_a", eligibility.extraction_id, eligibility.revision)
        self.assertEqual(stored, eligibility)
        self.assertIsInstance(stored.included, tuple)
        self.assertIsInstance(stored.excluded, tuple)

    def test_data_survives_reconnect_same_file(self):
        with tempfile.TemporaryDirectory() as tmp:
            db_path = os.path.join(tmp, "wellq_sim.db")
            repo = SqliteRepository(db_path)
            extraction = make_extraction()
            outcome = transition(extraction, make_context(), "confirm",
                                  extraction.extraction_id, extraction.revision, NOW)
            repo.apply_outcome(outcome)
            repo.close()  # simulates the process restarting

            reopened = SqliteRepository(db_path)
            try:
                stored = reopened.get_extraction("tenant_a", "extraction_a")
                self.assertIsNotNone(stored)
                self.assertEqual(stored.status, "confirmed")
                self.assertEqual(len(reopened.list_audit_events("tenant_a")), 1)
            finally:
                reopened.close()

    def test_transaction_rolls_back_on_failure(self):
        with self.assertRaises(Exception):
            with self.repo._transaction() as cur:
                cur.execute(
                    "INSERT INTO outbox (client_id, extraction_id, revision, job_type) VALUES (?, ?, ?, ?)",
                    ("tenant_a", "will_not_persist", 1, "enqueue"),
                )
                raise RuntimeError("simulated mid-transaction failure")
        self.assertEqual(self.repo.pending_outbox("tenant_a"), [])

    def test_repeated_apply_outcome_updates_extraction_but_appends_audit(self):
        extraction = make_extraction()
        confirm_outcome = transition(extraction, make_context(), "confirm",
                                      extraction.extraction_id, extraction.revision, NOW)
        self.repo.apply_outcome(confirm_outcome)

        clinician = make_context(role="clinician")
        validate_outcome = transition(confirm_outcome.extraction, clinician, "validate",
                                       confirm_outcome.extraction.extraction_id,
                                       confirm_outcome.extraction.revision, NOW)
        self.repo.apply_outcome(validate_outcome)

        self.assertEqual(len(self.repo.list_extractions("tenant_a")), 1)
        stored = self.repo.get_extraction("tenant_a", "extraction_a")
        self.assertEqual(stored.status, "clinically_validated")
        self.assertEqual(len(self.repo.list_audit_events("tenant_a", "extraction_a")), 2)


if __name__ == "__main__":
    unittest.main()
