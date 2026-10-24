from dataclasses import asdict, replace, FrozenInstanceError
from datetime import datetime, timezone
import unittest
from prototype.domain import Context, Extraction, Marker, RuleError, score_eligibility, transition


class DomainTests(unittest.TestCase):
    def setUp(self):
        self.marker = Marker("synthetic_marker", 5.0, "demo_unit", 1.0, 10.0, 0.99)
        self.extraction = Extraction("tenant_a", "patient_a", "test_a", "extraction_a", (self.marker,))
        self.patient = Context("user_a", "tenant_a", "patient", frozenset({"patient_a"}),
                               frozenset({"exam:confirm"}), frozenset({"clinical_tests"}), "test")
        self.clinician = Context("clinician_a", "tenant_a", "clinician", frozenset({"patient_a"}),
                                 frozenset({"exam:validate", "score:read"}),
                                 frozenset({"clinical_tests", "lab_scoring"}), "test")
        self.now = datetime(2026, 9, 29, tzinfo=timezone.utc)

    def act(self, action="confirm", extraction=None, context=None, **kwargs):
        ex = extraction or self.extraction
        return transition(ex, context or self.patient, action, ex.extraction_id, ex.revision, self.now, **kwargs)

    def eligible(self, extraction, context=None):
        return score_eligibility(extraction, context or self.clinician,
                                  canonical_units={"synthetic_marker": "demo_unit"},
                                  scoring_version="demo-v0", catalog_version="synthetic-v0")

    def test_confirmation_preserves_proposal_and_original(self):
        result = self.act()
        self.assertEqual(result.extraction.status, "confirmed")
        self.assertEqual(result.extraction.proposal, self.extraction.proposal)
        self.assertEqual(self.extraction.status, "awaiting_confirmation")
        self.assertEqual(result.score_action, "enqueue")
        self.assertEqual(result.extraction.revision, 2)
        with self.assertRaises(FrozenInstanceError):
            result.extraction.status = "rejected"

    def test_patient_confirmation_suffices_for_eligibility(self):
        eligible = self.eligible(self.act().extraction)
        self.assertEqual(eligible.included, ("synthetic_marker",))
        self.assertEqual(eligible.extraction_id, "extraction_a")
        self.assertEqual(eligible.revision, 2)

    def test_unconfirmed_data_never_enters_scoring(self):
        with self.assertRaisesRegex(RuleError, "NOT_CONFIRMED"):
            self.eligible(self.extraction)

    def test_cross_tenant_confirm_and_score_denied(self):
        with self.assertRaisesRegex(RuleError, "NOT_FOUND"):
            self.act(context=replace(self.patient, client_id="tenant_b"))
        with self.assertRaisesRegex(RuleError, "NOT_FOUND"):
            self.eligible(self.act().extraction, replace(self.clinician, client_id="tenant_b"))

    def test_other_patient_same_tenant_denied(self):
        with self.assertRaisesRegex(RuleError, "NO_PATIENT_ACCESS"):
            self.act(context=replace(self.patient, patient_ids=frozenset({"patient_b"})))

    def test_missing_clinical_relationship_denied(self):
        with self.assertRaisesRegex(RuleError, "NO_PATIENT_ACCESS"):
            self.act("validate", self.act().extraction, replace(self.clinician, patient_ids=frozenset()))

    def test_permission_and_commercial_gate_are_independent(self):
        for field, code in (("permissions", "PERMISSION_DENIED"), ("features", "FEATURE_NOT_INCLUDED")):
            with self.subTest(field=field), self.assertRaisesRegex(RuleError, code):
                self.act(context=replace(self.patient, **{field: frozenset()}))

    def test_patient_cannot_read_score_even_with_permission(self):
        patient = replace(self.patient, permissions=frozenset({"score:read"}), features=frozenset({"lab_scoring"}))
        with self.assertRaisesRegex(RuleError, "PERMISSION_DENIED"):
            self.eligible(self.act().extraction, patient)

    def test_stale_extraction_and_revision_fail(self):
        for ex_id, revision, code in (("old", 1, "EXTRACTION_SUPERSEDED"), ("extraction_a", 0, "REVISION_CONFLICT")):
            with self.subTest(code=code), self.assertRaisesRegex(RuleError, code):
                transition(self.extraction, self.patient, "confirm", ex_id, revision, self.now)

    def test_repeated_confirmation_requires_idempotency_adapter(self):
        with self.assertRaisesRegex(RuleError, "INVALID_TRANSITION"):
            self.act(extraction=self.act().extraction)

    def test_low_confidence_requires_explicit_review(self):
        ex = replace(self.extraction, proposal=(replace(self.marker, confidence=0.2),))
        with self.assertRaisesRegex(RuleError, "CONFIDENCE_UNRESOLVED"):
            self.act(extraction=ex)
        self.assertEqual(self.act(extraction=ex, resolved_markers=frozenset({"synthetic_marker"})).extraction.status, "confirmed")

    def test_unknown_resolution_rejected(self):
        with self.assertRaisesRegex(RuleError, "UNKNOWN_MARKER"):
            self.act(resolved_markers=frozenset({"unknown"}))

    def test_failed_validation_cannot_be_bypassed_by_review(self):
        ex = replace(self.extraction, proposal=(replace(self.marker, validation_passed=False),))
        with self.assertRaisesRegex(RuleError, "VALIDATION_FAILED"):
            self.act(extraction=ex, resolved_markers=frozenset({"synthetic_marker"}))

    def test_identity_mismatch_and_unknown_block_until_reviewed(self):
        for identity in ("mismatch", "unknown"):
            ex = replace(self.extraction, identity_match=identity)
            with self.subTest(identity=identity), self.assertRaisesRegex(RuleError, "IDENTITY_UNRESOLVED"):
                self.act(extraction=ex)
            self.assertEqual(self.act(extraction=ex, identity_confirmed=True).extraction.status, "confirmed")

    def test_discard_never_scores(self):
        result = self.act("discard")
        self.assertEqual(result.score_action, "none")
        self.assertEqual(result.extraction.proposal, self.extraction.proposal)
        with self.assertRaisesRegex(RuleError, "NOT_CONFIRMED"):
            self.eligible(result.extraction)

    def test_validation_preserves_patient_authorship(self):
        confirmed = self.act().extraction
        validated = self.act("validate", confirmed, self.clinician).extraction
        self.assertEqual(validated.confirmed_by, confirmed.confirmed_by)
        self.assertEqual(validated.validated_by, self.clinician.actor_id)
        self.assertEqual(self.eligible(validated).included, ("synthetic_marker",))

    def test_clinical_rejection_invalidates_scoring(self):
        rejected = self.act("reject", self.act().extraction, self.clinician)
        self.assertEqual(rejected.score_action, "invalidate")
        with self.assertRaisesRegex(RuleError, "NOT_CONFIRMED"):
            self.eligible(rejected.extraction)

    def test_audit_has_five_dimensions_without_values(self):
        event = asdict(self.act().event)
        for field in ("actor_id", "action", "occurred_at", "origin", "result"):
            self.assertTrue(event[field])
        self.assertNotIn("value_canonical", event)
        self.assertNotIn("proposal", event)

    def test_exclusion_reasons_are_explicit(self):
        cases = (({"mapping_status": "unmapped"}, "UNMAPPED"),
                 ({"unit_canonical": "unknown"}, "UNIT_NOT_SUPPORTED"),
                 ({"reference_low": None}, "REFERENCE_MISSING"),
                 ({"value_canonical": None}, "NON_NUMERIC"),
                 ({"censoring": "left"}, "CENSORED_UNSUPPORTED"))
        for change, reason in cases:
            ex = replace(self.extraction, proposal=(replace(self.marker, **change),))
            with self.subTest(reason=reason):
                result = self.eligible(self.act(extraction=ex).extraction)
                self.assertEqual(result.included, ())
                self.assertEqual(result.excluded, (("synthetic_marker", reason),))

    def test_invalid_numeric_inputs_rejected(self):
        for value in (float("nan"), float("inf"), float("-inf"), True):
            with self.subTest(value=value), self.assertRaises(RuleError):
                replace(self.marker, value_canonical=value)
        with self.assertRaisesRegex(RuleError, "INVALID_REFERENCE_RANGE"):
            replace(self.marker, reference_low=10, reference_high=1)

    def test_duplicate_markers_fail_in_initial_single_panel_slice(self):
        with self.assertRaisesRegex(RuleError, "DUPLICATE_MARKER"):
            replace(self.extraction, proposal=(self.marker, self.marker))

    def test_naive_time_rejected(self):
        with self.assertRaisesRegex(RuleError, "TIMEZONE_REQUIRED"):
            transition(self.extraction, self.patient, "confirm", "extraction_a", 1, datetime(2026, 9, 29))


if __name__ == "__main__":
    unittest.main()
