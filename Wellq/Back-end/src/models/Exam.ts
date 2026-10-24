import { Schema, model, Document } from 'mongoose';
import { IMeasurement } from '../utils/rangeReview.js';

export interface IMarker {
  code: string;
  name: string;
  value: number;
  unit: string;
  confidence?: number;
  reference_low?: number;
  reference_high?: number;
}

export interface IAuditEntry {
  action: string;
  actor: string;
  role: string;
  timestamp: string;
  client_id: string;
  reason?: string;
  details?: string;
}

export interface IExam extends Document {
  client_id: string; // Tenant isolation (e.g., clinic-alpha, clinic-beta)
  patient_id: string;
  clinical_test_id: string;
  status: 'awaiting_confirmation' | 'confirmed_by_patient' | 'clinically_validated' | 'rejected' | 'error';
  revision: number;
  document_name?: string;
  document_type?: string;
  document_size?: number;
  document_data?: string; // Base64 data URL for instant viewing
  proposal: IMarker[];
  confirmed: IMarker[];
  measurements: IMeasurement[];
  range_review?: {
    version: string;
    outcome: string;
    pages_read: number;
    diagnosis: null;
    requires_professional_review: boolean;
  };
  identity_match: 'match' | 'unknown' | 'mismatch';
  identity_confirmed?: boolean;
  review_reason?: string;
  confirmed_by?: string;
  confirmed_at?: string;
  validated_by?: string;
  validated_at?: string;
  audit_trail: IAuditEntry[];
  created_at: Date;
  updated_at: Date;
}

const MarkerSchema = new Schema<IMarker>(
  {
    code: { type: String, required: true },
    name: { type: String, required: true },
    value: { type: Number, required: true },
    unit: { type: String, required: true },
    confidence: { type: Number, default: 1.0 },
    reference_low: Number,
    reference_high: Number,
  },
  { _id: false }
);

const MeasurementSchema = new Schema<IMeasurement>(
  {
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
  },
  { _id: false }
);

const ExamSchema = new Schema<IExam>({
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

export const Exam = model<IExam>('Exam', ExamSchema);
