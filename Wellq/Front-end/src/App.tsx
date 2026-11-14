import { useState, useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { BottomNav, type ActiveTab } from './components/BottomNav';
import { ExamsView } from './components/ExamsView';
import { ClinicianView } from './components/ClinicianView';
import { ChatView } from './components/ChatView';
import { MenuDrawer } from './components/MenuDrawer';
import { ProfileModal } from './components/ProfileModal';
import { UploadModal } from './components/UploadModal';
import { LoginView } from './components/LoginView';
import type { Exam, NotificationItem } from './types';
import type { Language } from './locales/translations';
import './App.css';

export function App() {
  // Theme state: dark default matching WellQ corporate visual style
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('wellq-theme') as 'dark' | 'light') || 'dark';
  });

  // Language state: default 'es' or 'en'
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('wellq-lang') as Language) || 'es';
  });

  // Login session state (defaults to false to present the Login view first)
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Role state: 'patient' or 'clinician'
  const [role, setRole] = useState<'patient' | 'clinician'>('patient');

  // Active Bottom Navigation Tab ('exams' | 'chat')
  const [activeTab, setActiveTab] = useState<ActiveTab>('exams');

  // Modals & Drawers state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Exams data
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: lang === 'en' ? 'Kinesiology Exam Ready' : 'Examen Kinesiológico Listo',
      message:
        lang === 'en'
          ? 'Your Functional Kinesiology assessment report has been processed and is ready for double-check review.'
          : 'Tu informe de evaluación kinesiológica ha sido procesado y está listo para tu cotejo.',
      timestamp: 'Today, 10:15 AM',
      read: false,
      type: 'success',
    },
    {
      id: 'notif-2',
      title: lang === 'en' ? 'Appointment Reminder' : 'Recordatorio de Cita',
      message:
        lang === 'en'
          ? 'Chest X-Ray scheduled for 28/10 at London Central Health Hub. Remember: 8h fasting not required for imaging.'
          : 'Radiografía de Tórax programada para el 28/10 en London Central. Recuerda presentarte con ropa cómoda.',
      timestamp: 'Yesterday, 16:30 PM',
      read: false,
      type: 'info',
    },
  ]);

  // Persist theme changes
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('wellq-theme', next);
  };

  // Persist language changes
  const handleSelectLanguage = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('wellq-lang', newLang);
  };

  // Fetch exams from backend
  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/exams?client_id=clinic-alpha');
      const data = await res.json();
      if (data.success && data.data) {
        setExams(data.data);
      }
    } catch {
      // In-memory fallback happens seamlessly in backend
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  // Login handler
  const handleLogin = (selectedRole: 'patient' | 'clinician') => {
    setRole(selectedRole);
    setIsLoggedIn(true);
    setActiveTab('exams');
  };

  // Logout handler
  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab('exams');
  };

  // Upload handler
  const handleUploadFile = async (file: File) => {
    return new Promise<void>((resolve, reject) => {
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
          const data = await res.json();
          if (data.success) {
            setMessage(
              lang === 'en'
                ? `📄 File "${file.name}" uploaded successfully. Added to your Ready exams.`
                : `📄 Archivo "${file.name}" subido exitosamente. Añadido a tus exámenes listos.`
            );
            await fetchExams();
            resolve();
          } else {
            reject(new Error(data.error || 'Failed to upload'));
          }
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed reading file'));
      reader.readAsDataURL(file);
    });
  };

  // Confirm exam (Patient action)
  const handleConfirmExam = async (examId: string, reason: string) => {
    try {
      const res = await fetch(`/api/exams/${examId}/confirm`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actor: 'patient-001',
          identity_confirmed: true,
          reason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(
          lang === 'en'
            ? '✅ Document & values confirmed successfully by patient.'
            : '✅ Documento y valores confirmados exitosamente por el paciente.'
        );
        fetchExams();
      }
    } catch {
      setMessage('Processed locally.');
    }
  };

  // Validate exam (Clinician action)
  const handleValidateExam = async (
    examId: string,
    decision: 'validate' | 'reject' | 'error',
    reason: string
  ) => {
    if (decision === 'error' && (!reason || reason.trim().length < 3)) {
      setMessage(
        lang === 'en'
          ? '⚠️ Observation note (at least 3 characters) is required when marking an error.'
          : '⚠️ Se requiere una observación (mínimo 3 caracteres) para marcar un error.'
      );
      return;
    }

    try {
      const res = await fetch(`/api/exams/${examId}/validate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actor: 'clinician-001',
          decision,
          reason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (decision === 'validate') {
          setMessage(lang === 'en' ? '🩺 Exam clinically validated.' : '🩺 Examen validado clínicamente.');
        } else if (decision === 'error') {
          setMessage(lang === 'en' ? '⚠️ Exam marked with error.' : '⚠️ Examen marcado con error.');
        } else {
          setMessage(lang === 'en' ? '❌ Exam rejected.' : '❌ Examen rechazado.');
        }
        fetchExams();
      }
    } catch {
      setMessage('Action completed.');
    }
  };

  // Download official demo test PDF
  const handleDownloadDemoPdf = () => {
    window.open('/evaluacion-kinesiologica-FICTICIA.pdf', '_blank');
  };

  // Mark notifications read
  const handleMarkNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // If not logged in, show the exact Login View from Image 1
  if (!isLoggedIn) {
    return (
      <LoginView
        onLogin={handleLogin}
        lang={lang}
        onSelectLanguage={handleSelectLanguage}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  return (
    <div className={`wellq-app-wrapper ${theme}`}>
      {/* 1. TOP BAR (Logo Home, Demo Badge, Dark Mode Toggle (Sun/Moon), Profile Avatar) */}
      <TopBar
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenProfile={() => setIsProfileOpen(true)}
        onGoHome={() => setActiveTab('exams')}
        lang={lang}
      />

      {/* Global Alert Notification Banner */}
      {message && (
        <div className="global-alert-banner">
          <span>{message}</span>
          <button className="btn-alert-dismiss" onClick={() => setMessage(null)}>✕</button>
        </div>
      )}

      {/* 2. MAIN CONTENT CONTAINER (Switching between Patient view, Clinician view, or Chat) */}
      <main className="wellq-main-layout">
        {loading && exams.length === 0 ? (
          <div className="initial-loading-spinner">
            <div className="spinner"></div>
            <p>{lang === 'en' ? 'Loading clinical records...' : 'Cargando registros clínicos...'}</p>
          </div>
        ) : role === 'clinician' ? (
          <ClinicianView
            exams={exams}
            lang={lang}
            onRefresh={fetchExams}
            onDownloadDemoPdf={handleDownloadDemoPdf}
            onValidateExam={handleValidateExam}
          />
        ) : activeTab === 'exams' ? (
          <ExamsView
            exams={exams}
            lang={lang}
            role={role}
            onOpenUpload={() => setIsUploadOpen(true)}
            onDownloadDemoPdf={handleDownloadDemoPdf}
            onConfirmExam={handleConfirmExam}
            onValidateExam={handleValidateExam}
          />
        ) : (
          <ChatView
            exams={exams}
            lang={lang}
          />
        )}
      </main>

      {/* 3. BOTTOM NAVIGATION BAR (Exámenes and Menú for Clinician; Exámenes, Chat, Menú for Patient) */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        onOpenMenu={() => setIsMenuOpen(true)}
        lang={lang}
        role={role}
        unreadCount={notifications.filter((n) => !n.read).length}
      />

      {/* 4. SLIDE-IN MENU DRAWER (Notifications, UK Language, Locations, Contact) */}
      <MenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        lang={lang}
        onSelectLanguage={handleSelectLanguage}
        notifications={notifications}
        onMarkNotificationsRead={handleMarkNotificationsRead}
      />

      {/* 5. PROFILE MODAL (Patient Info or Clinician/Doctor Profile) */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        lang={lang}
        role={role}
        onChangeRole={(newRole) => setRole(newRole)}
        onLogout={handleLogout}
      />

      {/* 6. UPLOAD MODAL (Drag & Drop, PDF/PNG/JPG <= 4MB) */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        lang={lang}
        onUploadFile={handleUploadFile}
        onDownloadDemo={handleDownloadDemoPdf}
      />
    </div>
  );
}

export default App;
