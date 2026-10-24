export type ActiveTab = 'cita' | 'examenes' | 'recetas' | 'agendar';

export type SidebarSection = 'perfil' | 'ubicaciones' | 'contacto' | null;

export interface Appointment {
  id: string;
  specialty: string;
  doctor: string;
  location: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: 'confirmada' | 'pendiente' | 'cancelada';
}

export type ExamStatus = 'no_realizado' | 'pendiente' | 'listo';

export interface PortalExam {
  id: string;
  name: string;
  laboratory: string;
  dateRequested: string;
  status: ExamStatus;
  estimatedWaitTime?: string; // e.g. "Disponible en aprox. 18 hrs"
  documentName?: string;
  documentData?: string; // base64 or url
  measurementsCount?: number;
  isExpanded?: boolean;
}

export interface Prescription {
  id: string;
  date: string;
  doctorName: string;
  specialty: string;
  title: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  indications: string;
  pdfDataUrl?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'exam' | 'appointment' | 'prescription' | 'system';
}

export interface UserProfile {
  name: string;
  rut: string;
  email: string;
  phone: string;
  insurance: string;
  birthDate: string;
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
}

export interface ClinicLocation {
  id: string;
  name: string;
  address: string;
  commune: string;
  phone: string;
  hours: string;
  services: string[];
}
