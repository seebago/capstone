from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, model_validator


class StrictModel(BaseModel):
    model_config = ConfigDict(extra='forbid', allow_inf_nan=False, str_strip_whitespace=True)


class Login(StrictModel):
    email: str = Field(min_length=3, max_length=150)
    password: str = Field(min_length=1, max_length=200)


class MarkerInput(StrictModel):
    marker_code: Literal['demo_marker_a', 'demo_marker_b']
    value_canonical: float = Field(strict=True, ge=-10000, le=10000)
    unit_canonical: Literal['demo_unit'] = 'demo_unit'
    reference_low: float = Field(strict=True)
    reference_high: float = Field(strict=True)
    confidence: float = Field(strict=True, ge=0, le=1)

    @model_validator(mode='after')
    def valid_range(self):
        if self.reference_low >= self.reference_high:
            raise ValueError('Reference low must be below reference high')
        return self


class CreateExam(StrictModel):
    patient_id: str = Field(min_length=1, max_length=80)
    case_id: str = Field(min_length=1, max_length=80)
    title: str = Field(min_length=3, max_length=120)
    document_type: Literal['blood_panel', 'urine_panel'] = 'blood_panel'
    identity_match: Literal['match', 'unknown', 'mismatch'] = 'match'
    markers: list[MarkerInput] = Field(min_length=1, max_length=2)

    @model_validator(mode='after')
    def unique_markers(self):
        if len({m.marker_code for m in self.markers}) != len(self.markers):
            raise ValueError('Duplicate marker code')
        return self


class Correction(StrictModel):
    marker_code: Literal['demo_marker_a', 'demo_marker_b']
    value_canonical: float = Field(strict=True, ge=-10000, le=10000)
    reason: str = Field(min_length=3, max_length=160)


class ActionInput(StrictModel):
    action: Literal['confirm', 'discard', 'validate', 'reject']
    extraction_id: str = Field(min_length=1, max_length=80)
    expected_revision: int = Field(strict=True, ge=1)
    identity_confirmed: bool = False
    resolved_markers: list[str] = Field(default_factory=list, max_length=2)
    review_reason: str = Field(default='', max_length=160)
    corrections: list[Correction] = Field(default_factory=list, max_length=2)

    @model_validator(mode='after')
    def valid_edits(self):
        if self.action != 'confirm' and (self.corrections or self.resolved_markers or self.identity_confirmed):
            raise ValueError('Review fields are only accepted with confirmation')
        if len({e.marker_code for e in self.corrections}) != len(self.corrections):
            raise ValueError('Duplicate correction')
        return self


class DemoProfile(StrictModel):
    role: Literal["patient", "clinician"]


class DocumentReview(StrictModel):
    action: Literal['confirm', 'validate', 'error']
    expected_revision: int = Field(strict=True, ge=1)
    reason: str = Field(default='', max_length=240)
