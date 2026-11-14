import React from 'react';
import type { Language } from '../locales/translations';
import { translations } from '../locales/translations';

interface LoginViewProps {
  onLogin: (role: 'patient' | 'clinician') => void;
  lang: Language;
  onSelectLanguage: (lang: Language) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLogin,
  lang,
  onSelectLanguage,
  theme,
  onToggleTheme,
}) => {
  const t = translations[lang];

  return (
    <div className={`login-view-wrapper ${theme}`}>
      {/* Top Header Bar matching MVP */}
      <header className="login-topbar">
        <div className="login-brand-group">
          <div className="login-logo-box">
            <img
              src="/wellq-app-icon.webp"
              alt="WellQ Logo"
              className="login-logo-img"
            />
          </div>
          <span className="login-brand-name">WellQ</span>
          <span className="login-brand-subtitle">
            {lang === 'en' ? 'Medical Exams' : 'Exámenes médicos'}
          </span>
        </div>

        <div className="login-topbar-actions">
          <span className="demo-fictitious-pill">{t.demoBadge}</span>

          {/* Language toggle button (ES / UK) */}
          <button
            type="button"
            className="lang-capsule-btn"
            onClick={() => onSelectLanguage(lang === 'es' ? 'en' : 'es')}
            title={lang === 'es' ? 'Switch from ES to UK (English)' : 'Cambiar de UK a SPA (Español)'}
            aria-label="Toggle language between ES and UK"
          >
            <span className={`lang-segment ${lang === 'es' ? 'active' : ''}`}>ES</span>
            <span className="lang-divider">/</span>
            <span className={`lang-segment ${lang === 'en' ? 'active' : ''}`}>UK</span>
          </button>

          {/* Theme toggle icon button (Sun/Moon) */}
          <button
            type="button"
            className="topbar-icon-btn theme-btn"
            onClick={onToggleTheme}
            title={theme === 'dark' ? t.lightMode : t.darkMode}
            aria-label={theme === 'dark' ? t.lightMode : t.darkMode}
          >
            {theme === 'dark' ? (
              /* Sun icon (to switch to light mode) */
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="12" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              /* Moon icon (to switch to dark mode) */
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="login-main-container">
        <div className="login-grid-layout">
          {/* Left Column: Capstone Info & Instructions */}
          <div className="login-info-column">
            <div className="login-eyebrow">{t.eyebrowCapstone}</div>
            <h1 className="login-headline">{t.loginHeadline}</h1>
            <p className="login-subhead">{t.loginSubhead}</p>

            <ol className="login-steps-list">
              <li className="login-step-item">
                <span className="step-number">1.</span>
                <span className="step-text">{t.loginStep1}</span>
              </li>
              <li className="login-step-item">
                <span className="step-number">2.</span>
                <span className="step-text">{t.loginStep2}</span>
              </li>
              <li className="login-step-item">
                <span className="step-number">3.</span>
                <span className="step-text">{t.loginStep3}</span>
              </li>
            </ol>
          </div>

          {/* Right Column: Profile Selection Card */}
          <div className="login-card-column">
            <div className="login-selection-card">
              <h2 className="selection-card-title">{t.loginCardTitle}</h2>
              <p className="selection-card-subtitle">{t.loginCardSubtitle}</p>

              <div className="login-options-group">
                {/* Patient Option */}
                <div className="login-option-block">
                  <button
                    className="btn-login-patient"
                    onClick={() => onLogin('patient')}
                  >
                    {t.btnEnterPatient}
                  </button>
                  <p className="login-option-hint">{t.patientEntryHint}</p>
                </div>

                {/* Clinician Option */}
                <div className="login-option-block">
                  <button
                    className="btn-login-clinician"
                    onClick={() => onLogin('clinician')}
                  >
                    {t.btnEnterClinician}
                  </button>
                  <p className="login-option-hint">{t.clinicianEntryHint}</p>
                </div>
              </div>

              <div className="login-card-footer-notice">
                <p>{t.loginSyntheticWarning}</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Page Footer */}
      <footer className="login-page-footer">
        <p>{t.footerNotice}</p>
      </footer>
    </div>
  );
};
