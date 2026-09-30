"""Executable D/E rules, not a production backend or a clinical scoring model.

Context must eventually come from verified server identity, membership and
commercial entitlements. This pure prototype deliberately provides no JWT or DB
adapter. Callers must persist returned state/events atomically before replying.
"""
from dataclasses import dataclass, replace
from datetime import datetime
from math import isfinite


class RuleError(ValueError):
    """Stable domain error code; never embeds clinical values."""


@dataclass(frozen=True)
class Context:
    actor_id: str
    client_id: str
    role: str
    patient_ids: frozenset[str]
    permissions: frozenset[str]
    features: frozenset[str]
    origin: str


@dataclass(frozen=True)
class Marker:
    marker_code: str
    value_canonical: float | None
    unit_canonical: str | None
    reference_low: float | None
    reference_high: float | None
    confidence: float
    mapping_status: str = "mapped"
    validation_passed: bool = True
    censoring: str | None = None
    value_type: str = "numeric"

    def __post_init__(self):
        if not self.marker_code or not isfinite(self.confidence) or not 0 <= self.confidence <= 1:
            raise RuleError("INVALID_MARKER")
        if self.mapping_status not in {"mapped", "unmapped"}:
            raise RuleError("INVALID_MAPPING_STATUS")
        if self.censoring not in {None, "left", "right"}:
            raise RuleError("INVALID_CENSORING")
        if self.value_type not in {"numeric", "qualitative", "ordinal"}:
            raise RuleError("INVALID_VALUE_TYPE")
        for value in (self.value_canonical, self.reference_low, self.reference_high):
            if value is not None and (isinstance(value, bool) or not isfinite(value)):
                raise RuleError("NON_FINITE_VALUE")
        if self.reference_low is not None and self.reference_high is not None:
            if self.reference_low >= self.reference_high:
                raise RuleError("INVALID_REFERENCE_RANGE")


@dataclass(frozen=True)
class Extraction:
    client_id: str
    patient_id: str
    clinical_test_id: str
    extraction_id: str
    proposal: tuple[Marker, ...]
    status: str = "awaiting_confirmation"
    revision: int = 1
    confirmed: tuple[Marker, ...] = ()
    identity_match: str = "match"
    confirmed_by: str | None = None
    confirmed_at: str | None = None
    validated_by: str | None = None
    validated_at: str | None = None

    def __post_init__(self):
        if self.status not in {"awaiting_confirmation", "confirmed", "clinically_validated", "discarded", "rejected"}:
            raise RuleError("INVALID_STATUS")
        if self.identity_match not in {"match", "mismatch", "unknown"}:
            raise RuleError("INVALID_IDENTITY_MATCH")
        if self.revision < 1 or not all((self.client_id, self.patient_id, self.clinical_test_id, self.extraction_id)):
            raise RuleError("INVALID_EXTRACTION")
        # Initial slice allows one panel only; repeated codes require stable row IDs.
        if len({m.marker_code for m in self.proposal}) != len(self.proposal):
            raise RuleError("DUPLICATE_MARKER")


@dataclass(frozen=True)
class AuditEvent:
    actor_id: str
    client_id: str
    action: str
    occurred_at: str
    origin: str
    result: str
    clinical_test_id: str
    extraction_id: str
    revision: int


@dataclass(frozen=True)
class Outcome:
    extraction: Extraction
    event: AuditEvent
    score_action: str  # enqueue | invalidate | none; intent, not a durable job


def authorize(context: Context, extraction: Extraction, permission: str, feature: str):
    if context.client_id != extraction.client_id:
        raise RuleError("NOT_FOUND")
    if extraction.patient_id not in context.patient_ids:
        raise RuleError("NO_PATIENT_ACCESS")
    if permission not in context.permissions:
        raise RuleError("PERMISSION_DENIED")
    if feature not in context.features:
        raise RuleError("FEATURE_NOT_INCLUDED")
    if not context.actor_id or not context.origin:
        raise RuleError("INVALID_CONTEXT")


def transition(extraction: Extraction, context: Context, action: str,
               expected_extraction_id: str, expected_revision: int, now: datetime,
               *, resolved_markers: frozenset[str] = frozenset(),
               identity_confirmed: bool = False, confidence_threshold: float = 0.9) -> Outcome:
    """Confirm/discard or validate/reject; no edits, persistence or idempotency yet.

    `resolved_markers` records explicit human checking of low-confidence fields.
    The 0.9 threshold is a synthetic test setting, not a clinical parameter.
    """
    if action not in {"confirm", "discard", "validate", "reject"}:
        raise RuleError("INVALID_ACTION")
    patient_action = action in {"confirm", "discard"}
    authorize(context, extraction, "exam:confirm" if patient_action else "exam:validate", "clinical_tests")
    if context.role != ("patient" if patient_action else "clinician"):
        raise RuleError("PERMISSION_DENIED")
    if expected_extraction_id != extraction.extraction_id:
        raise RuleError("EXTRACTION_SUPERSEDED")
    if expected_revision != extraction.revision:
        raise RuleError("REVISION_CONFLICT")
    if extraction.status != ("awaiting_confirmation" if patient_action else "confirmed"):
        raise RuleError("INVALID_TRANSITION")
    if now.tzinfo is None or now.utcoffset() is None:
        raise RuleError("TIMEZONE_REQUIRED")
    if not isfinite(confidence_threshold) or not 0 <= confidence_threshold <= 1:
        raise RuleError("INVALID_CONFIDENCE_THRESHOLD")
    timestamp = now.isoformat()
    if action == "confirm":
        if extraction.identity_match != "match" and not identity_confirmed:
            raise RuleError("IDENTITY_UNRESOLVED")
        codes = {m.marker_code for m in extraction.proposal}
        if not resolved_markers <= codes:
            raise RuleError("UNKNOWN_MARKER")
        if any(not m.validation_passed for m in extraction.proposal):
            raise RuleError("VALIDATION_FAILED")
        if any(m.confidence < confidence_threshold and m.marker_code not in resolved_markers for m in extraction.proposal):
            raise RuleError("CONFIDENCE_UNRESOLVED")
        updated = replace(extraction, status="confirmed", confirmed=extraction.proposal,
                          confirmed_by=context.actor_id, confirmed_at=timestamp)
    elif action == "discard":
        updated = replace(extraction, status="discarded")
    else:
        updated = replace(extraction, status="clinically_validated" if action == "validate" else "rejected",
                          validated_by=context.actor_id, validated_at=timestamp)
    updated = replace(updated, revision=extraction.revision + 1)
    event = AuditEvent(context.actor_id, context.client_id, action, timestamp,
                       context.origin, "success", extraction.clinical_test_id,
                       extraction.extraction_id, updated.revision)
    return Outcome(updated, event, {"confirm": "enqueue", "reject": "invalidate"}.get(action, "none"))


@dataclass(frozen=True)
class Eligibility:
    included: tuple[str, ...]
    excluded: tuple[tuple[str, str], ...]
    scoring_version: str
    catalog_version: str
    extraction_id: str
    revision: int


def score_eligibility(extraction: Extraction, context: Context, *,
                      canonical_units: dict[str, str], scoring_version: str,
                      catalog_version: str) -> Eligibility:
    """E entry gate only: deliberately returns no numeric or medical score."""
    authorize(context, extraction, "score:read", "lab_scoring")
    if context.role != "clinician":
        raise RuleError("PERMISSION_DENIED")
    if not scoring_version or not catalog_version:
        raise RuleError("VERSION_REQUIRED")
    if extraction.status not in {"confirmed", "clinically_validated"}:
        raise RuleError("NOT_CONFIRMED")
    included, excluded = [], []
    for marker in extraction.confirmed:
        reason = None
        if marker.mapping_status != "mapped" or marker.marker_code not in canonical_units:
            reason = "UNMAPPED"
        elif not marker.validation_passed:
            reason = "VALIDATION_FAILED"
        elif marker.value_type != "numeric" or marker.value_canonical is None:
            reason = "NON_NUMERIC"
        elif marker.censoring is not None:
            reason = "CENSORED_UNSUPPORTED"
        elif not marker.unit_canonical or marker.unit_canonical != canonical_units[marker.marker_code]:
            reason = "UNIT_NOT_SUPPORTED"
        elif marker.reference_low is None or marker.reference_high is None:
            reason = "REFERENCE_MISSING"
        if reason:
            excluded.append((marker.marker_code, reason))
        else:
            included.append(marker.marker_code)
    return Eligibility(tuple(included), tuple(excluded), scoring_version,
                       catalog_version, extraction.extraction_id, extraction.revision)
