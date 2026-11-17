import React from 'react';
import type { Language } from '../locales/translations';
import { translations } from '../locales/translations';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  role: 'patient' | 'clinician';
  onChangeRole: (newRole: 'patient' | 'clinician') => void;
  onLogout?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  lang,
  role,
  onChangeRole,
  onLogout,
}) => {
  const t = translations[lang];

  if (!isOpen) return null;

  const isClinician = role === 'clinician';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content profile-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h4>{isClinician ? t.clinicianProfileTitle : t.patientProfileTitle}</h4>
          <button className="btn-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Profile Card Summary */}
        <div className="profile-identity-card">
          <div className="profile-avatar-large">
            {isClinician ? (
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"></path>
                <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"></path>
                <circle cx="20" cy="10" r="2"></circle>
              </svg>
            ) : (
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            )}
          </div>
          <div className="profile-text-details">
            <h3 className="patient-name">
              {isClinician ? t.doctorName : 'Aron Germain Navarro'}
            </h3>
            <span className="profile-role-tag">
              {isClinician ? t.doctorRole : '👤 Patient · NHS Registered'}
            </span>
            <div className="profile-meta-row">
              {isClinician ? (
                <>
                  <small><strong>{t.gmcNumber}</strong> 7482910</small>
                  <small><strong>{t.specialty}</strong> Kinesiology & Rehabilitation</small>
                </>
              ) : (
                <>
                  <small><strong>{t.nhsNumber}</strong> 482 910 3841</small>
                  <small><strong>{t.dob}</strong> 14/08/1998</small>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Acciones de sesión primero (lo que la persona viene a hacer aquí) */}
        <div className="role-switcher-section">
          <label className="role-label">
            {lang === 'en' ? 'Current Session Mode:' : 'Modo de Sesión Actual:'}
          </label>
          <small className="role-switch-hint">
            {lang === 'en'
              ? 'Switching role signs in again as the other demo user.'
              : 'Cambiar de rol vuelve a iniciar sesión con el otro usuario demo.'}
          </small>
          <div className="role-button-group">
            <button
              className={`role-btn ${role === 'patient' ? 'active' : ''}`}
              onClick={() => onChangeRole('patient')}
            >
              👤 {t.btnEnterPatient}
            </button>
            <button
              className={`role-btn ${role === 'clinician' ? 'active' : ''}`}
              onClick={() => onChangeRole('clinician')}
            >
              🩺 {t.btnEnterClinician}
            </button>
          </div>

          {onLogout && (
            <div className="logout-btn-container">
              <button
                className="btn-logout-session"
                onClick={() => {
                  onClose();
                  onLogout();
                }}
              >
                🚪 {t.btnLogout}
              </button>
            </div>
          )}
        </div>
        {/* Información complementaria (sintética), después de las acciones */}
        {isClinician ? (
          <div className="streak-goal-card clinician-stats-card">
            <div className="streak-header">
              <span className="streak-flame">🩺</span>
              <div className="streak-stats">
                <strong className="streak-number">12</strong>
                <span className="streak-label">
                  {lang === 'en' ? 'Exams Validated This Month' : 'Exámenes Validados Este Mes'}
                </span>
              </div>
            </div>
            <p className="streak-subtitle">
              {t.dutyStationLabel} {t.dutyStationValue}
            </p>

            <div className="health-goals-box">
              <div className="goal-item">
                <span className="goal-icon">👥</span>
                <span>{t.assignedPatientsLabel} 24 {lang === 'en' ? 'active' : 'activos'}</span>
              </div>
              <div className="goal-item">
                <span className="goal-icon">⏱️</span>
                <span>{lang === 'en' ? 'Avg. Validation: < 24 hrs' : 'Validación prom: < 24 hrs'}</span>
              </div>
              <div className="goal-item">
                <span className="goal-icon">🛡️</span>
                <span>{lang === 'en' ? 'Clinical Protocol: Active' : 'Protocolo Clínico: Activo'}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="streak-goal-card">
            <div className="streak-header">
              <span className="streak-flame">🔥</span>
              <div className="streak-stats">
                <strong className="streak-number">2</strong>
                <span className="streak-label">{t.dayStreak}</span>
              </div>
            </div>
            <p className="streak-subtitle">{t.streakDesc}</p>

            <div className="health-goals-box">
              <div className="goal-item">
                <span className="goal-icon">🏃</span>
                <span>{t.goalExercise}</span>
              </div>
              <div className="goal-item">
                <span className="goal-icon">😴</span>
                <span>{t.goalSleep}</span>
              </div>
              <div className="goal-item">
                <span className="goal-icon">🧘</span>
                <span>{t.goalStress}</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
