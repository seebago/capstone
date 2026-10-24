"""Run from wellq-base directory: python -m prototype.demo."""
from dataclasses import asdict
from datetime import datetime, timezone
import json
from .domain import Context, Extraction, Marker, score_eligibility, transition


def main():
    marker = Marker("synthetic_marker", 5.0, "demo_unit", 1.0, 10.0, 0.99)
    extraction = Extraction("demo_tenant", "demo_patient", "demo_test", "demo_extraction", (marker,))
    patient = Context("demo_patient_user", "demo_tenant", "patient", frozenset({"demo_patient"}),
                      frozenset({"exam:confirm"}), frozenset({"clinical_tests"}), "local-demo")
    clinician = Context("demo_clinician", "demo_tenant", "clinician", frozenset({"demo_patient"}),
                        frozenset({"score:read"}), frozenset({"lab_scoring"}), "local-demo")
    result = transition(extraction, patient, "confirm", extraction.extraction_id,
                        extraction.revision, datetime(2026, 9, 29, tzinfo=timezone.utc))
    eligibility = score_eligibility(result.extraction, clinician,
                                    canonical_units={"synthetic_marker": "demo_unit"},
                                    scoring_version="demo-not-clinical-v0", catalog_version="synthetic-v0")
    print(json.dumps({"synthetic_only": True, "status": result.extraction.status,
                      "score_action_intent": result.score_action,
                      "eligibility": asdict(eligibility), "score": None,
                      "note": "No clinical scoring model or persistence is implemented."}, indent=2))


if __name__ == "__main__":
    main()
