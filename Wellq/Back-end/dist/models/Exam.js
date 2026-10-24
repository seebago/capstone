import { Schema, model } from 'mongoose';
const MarkerSchema = new Schema({
    code: { type: String, required: true },
    name: { type: String, required: true },
    value: { type: Number, required: true },
    unit: { type: String, required: true },
    confidence: { type: Number, default: 1.0 },
    reference_low: Number,
    reference_high: Number,
}, { _id: false });
const MeasurementSchema = new Schema({
    name: { type: String, required: true },
    value: { type: Schema.Types.Mixed, required: true },
    unit: { type: String, required: true },
    reference: { type: String, default: null },
    comparison: {
        type: String,
        enum: ['within', 'below', 'above', 'no_reference', 'unit_mismatch', 'invalid_reference'],
        default: 'no_reference',
    },
    page: { type: Number, default: 1 },
    source: { type: String, default: '' },
}, { _id: false });
const ExamSchema = new Schema({
    client_id: { type: String, required: true, index: true },
    patient_id: { type: String, required: true, index: true },
    clinical_test_id: { type: String, required: true, unique: true },
    status: {
        type: String,
        enum: ['awaiting_confirmation', 'confirmed_by_patient', 'clinically_validated', 'rejected', 'error'],
        default: 'awaiting_confirmation',
    },
    revision: { type: Number, default: 1 },
    document_name: String,
    document_type: String,
    document_size: Number,
    document_data: String,
    proposal: [MarkerSchema],
    confirmed: [MarkerSchema],
    measurements: [MeasurementSchema],
    range_review: {
        version: { type: String, default: 'document-ranges-v1' },
        outcome: { type: String, default: 'read' },
        pages_read: { type: Number, default: 1 },
        diagnosis: { type: Schema.Types.Mixed, default: null },
        requires_professional_review: { type: Boolean, default: true },
    },
    identity_match: { type: String, enum: ['match', 'unknown', 'mismatch'], default: 'match' },
    identity_confirmed: { type: Boolean, default: false },
    review_reason: { type: String, default: '' },
    confirmed_by: String,
    confirmed_at: String,
    validated_by: String,
    validated_at: String,
    audit_trail: [
        {
            action: String,
            actor: String,
            role: String,
            timestamp: String,
            client_id: String,
            reason: String,
            details: String,
        },
    ],
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});
export const Exam = model('Exam', ExamSchema);
