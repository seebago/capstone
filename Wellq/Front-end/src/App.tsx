import { useState, useEffect, useRef } from 'react';
import { HeaderBar } from './components/HeaderBar';
import { BottomNavBar } from './components/BottomNavBar';
import { SidebarDrawer } from './components/SidebarDrawer';
import { NotificationsModal } from './components/NotificationsModal';
import { AppointmentsTab } from './components/tabs/AppointmentsTab';
import { ExamsTab } from './components/tabs/ExamsTab';
import { PrescriptionsTab } from './components/tabs/PrescriptionsTab';
import { BookingTab } from './components/tabs/BookingTab';
import type {
  ActiveTab,
  Appointment,
  PortalExam,
  Prescription,
  NotificationItem,
  UserProfile,
  ClinicLocation,
} from './types/portal';
import './App.css';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('examenes');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [systemNotice, setSystemNotice] = useState<string | null>(null);

  // Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Patient Profile Data
  const [profile] = useState<UserProfile>({
    name: 'Aron Germain Navarro',
    rut: '19.876.543-2',
    email: 'aron.germain@alumnos.duoc.cl',
    phone: '+56 9 7654 3210',
    insurance: 'Fonasa Tramo B / CruzBlanca',
    birthDate: '15/06/1999',
    emergencyContact: {
      name: 'María Navarro',
      phone: '+56 9 9123 4567',
      relation: 'Madre',
    },
  });

  // Clinic Locations Data
  const [locations] = useState<ClinicLocation[]>([
    {
      id: 'loc-1',
      name: 'Clínica Alpha - Sede Providencia',
      address: 'Av. Providencia 1240, Providencia',
      commune: 'Santiago, Región Metropolitana',
      phone: '(02) 2899 3001',
      hours: 'Lunes a Viernes 07:30 a 20:00 hrs · Sábado 08:00 a 14:00 hrs',
      services: ['Kinesiología', 'Laboratorio', 'Medicina General', 'Toma de Muestras'],
    },
    {
      id: 'loc-2',
      name: 'Clínica Beta - Sede Las Condes',
      address: 'Av. Apoquindo 4500, Las Condes',
      commune: 'Santiago, Región Metropolitana',
      phone: '(02) 2899 3002',
      hours: 'Lunes a Viernes 08:00 a 19:30 hrs',
      services: ['Imagenología', 'Resonancia', 'Cardiología', 'Traumatología'],
    },
    {
      id: 'loc-3',
      name: 'Centro Médico Maipú',
      address: 'Av. Pajaritos 2200, Maipú',
      commune: 'Santiago, Región Metropolitana',
      phone: '(02) 2899 3003',
      hours: 'Lunes a Viernes 08:00 a 18:00 hrs',
      services: ['Medicina General', 'Kinesiología', 'Toma de Muestras'],
    },
  ]);

  // Appointments Data
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: 'app-1',
      specialty: 'Kinesiología y Rehabilitación Funcional',
      doctor: 'Dra. Camila Soto',
      location: 'Clínica Alpha - Providencia (Box 204)',
      date: '2026-10-28',
      time: '10:30',
      status: 'confirmada',
    },
    {
      id: 'app-2',
      specialty: 'Medicina General y Preventiva',
      doctor: 'Dr. Andrés Silva',
      location: 'Clínica Alpha - Providencia (Box 105)',
      date: '2026-11-04',
      time: '15:15',
      status: 'confirmada',
    },
  ]);

  // Exams Data (Synced with backend if available + initial synthetic items)
  const [exams, setExams] = useState<PortalExam[]>([
    {
      id: 'DOC-KINE-2026-001',
      name: 'Evaluación Kinesiológica Funcional (Rango y Movilidad)',
      laboratory: 'Unidad de Kinesiología y Fisioterapia · Clínica Alpha',
      dateRequested: '20/10/2026',
      status: 'listo',
      documentName: 'evaluacion-kinesiologica-FICTICIA.pdf',
      documentData: '',
      measurementsCount: 4,
    },
    {
      id: 'DOC-LAB-2026-002',
      name: 'Hemograma Completo y Perfil Bioquímico',
      laboratory: 'Laboratorio Clínico Central · Clínica Alpha',
      dateRequested: '23/10/2026',
      status: 'pendiente',
      estimatedWaitTime: 'Tiempo estimado de entrega: ~18 horas',
    },
    {
      id: 'DOC-IMG-2026-003',
      name: 'Resonancia Magnética Articular de Rodilla',
      laboratory: 'Centro de Imagenología Médica · Clínica Beta',
      dateRequested: '24/10/2026',
      status: 'no_realizado',
    },
  ]);

  // Prescriptions Data
  const [prescriptions] = useState<Prescription[]>([
    {
      id: 'presc-101',
      date: '20/10/2026',
      doctorName: 'Dra. Camila Soto',
      specialty: 'Kinesiología y Medicina Física',
      title: 'Receta Consulta Médica Kinesiología - Rehabilitación Motora',
      medications: [
        {
          name: 'Ibuprofeno 400 mg (Comprimidos)',
          dosage: '1 comprimido',
          frequency: 'Cada 8 horas con las comidas',
          duration: '5 días',
        },
        {
          name: 'Gel tópico de Diclofenaco 1.16%',
          dosage: 'Aplicación moderada en zona articular',
          frequency: '3 veces al día con suave masaje',
          duration: '7 días',
        },
      ],
      indications: 'Realizar ejercicios guiados de estiramiento de cuádriceps e isquiotibiales. Evitar cargas de impacto por 10 días.',
    },
    {
      id: 'presc-102',
      date: '15/09/2026',
      doctorName: 'Dr. Andrés Silva',
      specialty: 'Medicina General',
      title: 'Receta Consulta Médica Preventiva y Suplementación',
      medications: [
        {
          name: 'Vitamina D3 800 UI (Cápsulas blandas)',
          dosage: '1 cápsula diaria',
          frequency: 'Junto con el desayuno',
          duration: '30 días',
        },
      ],
      indications: 'Mantener hidratación adecuada (al menos 2 litros de agua diarios) y control en 3 meses.',
    },
  ]);

  // Notifications Data
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'Examen Listo para Descargar',
      message: 'Tu examen de Evaluación Kinesiológica Funcional ya está disponible con firma digital.',
      date: 'Hoy, 09:15 hrs',
      read: false,
      type: 'exam',
    },
    {
      id: 'notif-2',
      title: 'Recordatorio de Cita Médica',
      message: 'Tienes una consulta de Kinesiología con la Dra. Camila Soto el 28 de Octubre a las 10:30 hrs.',
      date: 'Ayer, 18:30 hrs',
      read: false,
      type: 'appointment',
    },
    {
      id: 'notif-3',
      title: 'Nueva Receta Electrónica',
      message: 'Se ha emitido la receta médica correspondiente a tu última consulta de kinesiología.',
      date: '20 Oct, 11:00 hrs',
      read: true,
      type: 'prescription',
    },
  ]);

  // Load real PDF and exams from backend
  useEffect(() => {
    const fetchBackendExams = async () => {
      try {
        const res = await fetch('/api/exams?client_id=clinic-alpha');
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const apiExams: PortalExam[] = json.data.map((be: any, idx: number) => ({
            id: be.clinical_test_id || be._id,
            name: be.document_name ? be.document_name.replace(/\.[^/.]+$/, '').replace(/-/g, ' ') : `Examen Clínico N° ${idx + 1}`,
            laboratory: 'Laboratorio Clínico · Clínica Alpha',
            dateRequested: new Date(be.created_at).toLocaleDateString('es-CL'),
            status: be.status === 'clinically_validated' || be.status === 'confirmed_by_patient' ? 'listo' : be.status === 'awaiting_confirmation' ? 'listo' : 'pendiente',
            documentName: be.document_name || 'evaluacion-kinesiologica-FICTICIA.pdf',
            documentData: be.document_data || '',
            measurementsCount: be.measurements?.length || be.proposal?.length || 0,
          }));

          // Merge with pending/unperformed mocks for full wireframe demonstration
          setExams([
            apiExams[0],
            {
              id: 'DOC-LAB-2026-002',
              name: 'Hemograma Completo y Perfil Bioquímico',
              laboratory: 'Laboratorio Clínico Central · Clínica Alpha',
              dateRequested: '23/10/2026',
              status: 'pendiente',
              estimatedWaitTime: 'Tiempo estimado de entrega: ~18 horas',
            },
            {
              id: 'DOC-IMG-2026-003',
              name: 'Resonancia Magnética Articular de Rodilla',
              laboratory: 'Centro de Imagenología Médica · Clínica Beta',
              dateRequested: '24/10/2026',
              status: 'no_realizado',
            },
            ...apiExams.slice(1),
          ]);
        }
      } catch {
        // Continue with local mock data
      }
    };

    fetchBackendExams();
  }, []);

  // Handlers for Appointment Management
  const handleRescheduleAppointment = (id: string, newDate: string, newTime: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, date: newDate, time: newTime } : a))
    );
    setSystemNotice(`✅ Cita reprogramada exitosamente para el ${newDate} a las ${newTime} hrs.`);
  };

  const handleCancelAppointment = (id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
    setSystemNotice('🗑️ Cita médica cancelada correctamente.');
  };

  const handleAddAppointment = (newAppt: Appointment) => {
    setAppointments((prev) => [newAppt, ...prev]);
    setNotifications((prev) => [
      {
        id: 'notif-' + Date.now(),
        title: 'Nueva Cita Agendada',
        message: `Cita reservada para ${newAppt.specialty} el ${newAppt.date} a las ${newAppt.time} hrs.`,
        date: 'Recién',
        read: false,
        type: 'appointment',
      },
      ...prev,
    ]);
  };

  const handleAddExam = (newExam: PortalExam) => {
    setExams((prev) => [newExam, ...prev]);
    setNotifications((prev) => [
      {
        id: 'notif-' + Date.now(),
        title: 'Hora de Examen Registrada',
        message: `Solicitud registrada para "${newExam.name}" en ${newExam.laboratory}.`,
        date: 'Recién',
        read: false,
        type: 'exam',
      },
      ...prev,
    ]);
  };

  // Upload handler for adding documents
  const handleFileUpload = async (file: File) => {
    if (file.size > 4 * 1024 * 1024) {
      setSystemNotice('⚠️ El archivo supera el límite máximo de 4 MB.');
      return;
    }

    setIsUploading(true);
    setSystemNotice('Procesando documento...');

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        const res = await fetch('/api/exams/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: 'clinic-alpha',
            patient_id: 'patient-001',
            filename: file.name,
            content_type: file.type,
            file_data: base64Data,
          }),
        });
        const json = await res.json();
        if (json.success && json.data) {
          const newExam: PortalExam = {
            id: json.data.clinical_test_id || 'exam-' + Date.now(),
            name: file.name.replace(/\.[^/.]+$/, '').replace(/-/g, ' '),
            laboratory: 'Carga Digital de Paciente · Clínica Alpha',
            dateRequested: new Date().toLocaleDateString('es-CL'),
            status: 'listo',
            documentName: file.name,
            documentData: base64Data,
            measurementsCount: json.data.measurements?.length || 4,
          };
          setExams((prev) => [newExam, ...prev]);
          setSystemNotice(`📄 Documento "${file.name}" cargado exitosamente. Ya puedes visualizarlo.`);
          setUploadModalOpen(false);
          setActiveTab('examenes');
        }
      } catch {
        setSystemNotice('⚠️ Error al subir archivo. Inténtalo nuevamente.');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  return (
    <div className={`portal-app-wrapper ${theme}`}>
      {/* 1. TOP HEADER (Logo left, Notification Bell + 3-lines button right) */}
      <HeaderBar
        onToggleSidebar={() => setIsSidebarOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        unreadCount={unreadNotifCount}
      />

      {/* Notice Alert Banner */}
      {systemNotice && (
        <div className="system-notice-banner">
          <span>{systemNotice}</span>
          <button onClick={() => setSystemNotice(null)}>✕</button>
        </div>
      )}

      {/* 2. MAIN SCROLLABLE VIEWPORT */}
      <main className="portal-main-viewport">
        {activeTab === 'cita' && (
          <AppointmentsTab
            appointments={appointments}
            onReschedule={handleRescheduleAppointment}
            onCancel={handleCancelAppointment}
            onGoToBooking={() => setActiveTab('agendar')}
          />
        )}

        {activeTab === 'examenes' && (
          <ExamsTab
            exams={exams}
            onUploadClick={() => setUploadModalOpen(true)}
            onDownloadDemoPdf={() => window.open('/evaluacion-kinesiologica-FICTICIA.pdf', '_blank')}
          />
        )}

        {activeTab === 'recetas' && (
          <PrescriptionsTab prescriptions={prescriptions} />
        )}

        {activeTab === 'agendar' && (
          <BookingTab
            onAddAppointment={handleAddAppointment}
            onAddExam={handleAddExam}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}
      </main>

      {/* 3. FIXED BOTTOM NAVIGATION BAR (Cita, Exámenes, Recetas, Agendar) */}
      <BottomNavBar activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* 4. LATERAL DRAWER (Perfil, Ubicaciones, Contacto, Modo Oscuro) */}
      <SidebarDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        profile={profile}
        locations={locations}
      />

      {/* 5. NOTIFICATIONS MODAL / POPUP */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={() => {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        }}
      />

      {/* 6. UPLOAD DOCUMENT MODAL */}
      {uploadModalOpen && (
        <div className="modal-backdrop" onClick={() => setUploadModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>📄 Cargar Examen Médico</h4>
              <button className="btn-close" onClick={() => setUploadModalOpen(false)}>✕</button>
            </div>

            <div
              className="dropzone-area"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".pdf,image/png,image/jpeg,image/jpg"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
              <div className="dropzone-icon">📄</div>
              <strong>Arrastra tu examen aquí o haz clic para seleccionarlo</strong>
              <p className="dropzone-hint">
                Admite archivos <strong>PDF, PNG o JPG</strong> (máx. 4 MB).<br />
                <span className="badge-synthetic">Cumplimiento confidencialidad Ley 20.584</span>
              </p>
              {isUploading && <p className="loading-text">Cargando y procesando archivo...</p>}
            </div>

            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => window.open('/evaluacion-kinesiologica-FICTICIA.pdf', '_blank')}
              >
                📥 Descargar PDF Ficticio de Ejemplo
              </button>
              <button className="btn-text" onClick={() => setUploadModalOpen(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
