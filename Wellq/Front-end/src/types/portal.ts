export type ExamStatus = 'listo' | 'pendiente' | 'no_realizado' | 'awaiting_confirmation' | 'confirmed_by_patient' | 'clinically_validated' | 'rejected' | 'error';

export interface Marker {
  code: string;
  name: string;
  value: number;
  unit: string;
  confidence?: number;
  reference_low?: number;
  reference_high?: number;
}

export interface Measurement {
  name: string;
  value: string | number;
  unit: string;
  reference: string | null;
  comparison: 'within' | 'below' | 'above' | 'no_reference' | 'unit_mismatch' | 'invalid_reference';
  page: number;
  source: string;
}

export interface AuditEntry {
  action: string;
  actor: string;
  role: string;
  timestamp: string;
  client_id: string;
  reason?: string;
  details?: string;
}

export interface Exam {
  _id: string;
  client_id: string;
  patient_id: string;
  clinical_test_id: string;
  status: ExamStatus;
  status_category: 'listo' | 'pendiente' | 'no_realizado';
  estimated_time?: string; // For "pendiente" state
  scheduled_date?: string; // For "no_realizado" state
  preparation_notes?: string;
  revision: number;
  document_name?: string;
  document_type?: string;
  document_size?: number;
  document_data?: string;
  proposal: Marker[];
  confirmed: Marker[];
  measurements: Measurement[];
  identity_match: 'match' | 'unknown' | 'mismatch';
  identity_confirmed?: boolean;
  review_reason?: string;
  confirmed_by?: string;
  confirmed_at?: string;
  validated_by?: string;
  validated_at?: string;
  audit_trail: AuditEntry[];
  created_at: string;
  updated_at?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  attachedExamId?: string;
  attachedExamName?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'success' | 'info' | 'warning';
}

export interface ClinicLocation {
  id: string;
  name: string;
  city: string;
  address: string;
  postalCode: string;
  phone: string;
  hours: string;
  isMain?: boolean;
}
