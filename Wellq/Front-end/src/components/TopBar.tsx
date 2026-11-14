import React from 'react';
import type { Language } from '../locales/translations';
import { translations } from '../locales/translations';

interface TopBarProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenProfile: () => void;
  onGoHome: () => void;
  lang: Language;
}

export const TopBar: React.FC<TopBarProps> = ({
  theme,
  onToggleTheme,
  onOpenProfile,
  onGoHome,
  lang,
}) => {
  const t = translations[lang];

  return (
    <header className="topbar-container">
      {/* Left: Brand Logo / Home trigger */}
      <button
        className="topbar-logo-btn"
        onClick={onGoHome}
        title="WellQ Medical - Return to home"
      >
        <div className="topbar-logo-box">
          <img
            src="/wellq-app-icon.webp"
            alt="WellQ Medical"
            className="topbar-logo-img"
          />
        </div>
        <div className="topbar-brand-text">
          <span className="brand-title">WellQ</span>
          <span className="brand-subtitle">
            {lang === 'en' ? 'Medical Exams' : 'Exámenes médicos'}
          </span>
        </div>
      </button>

      {/* Right Controls: Demo Badge, Theme Toggle (Sun/Moon), Profile Avatar */}
      <div className="topbar-actions">
        {/* Demo pill badge */}
        <span className="demo-fictitious-pill topbar-demo-pill">
          {t.demoBadge}
        </span>

        {/* Dark/Light mode toggle (Sun when dark, Moon when light) */}
        <button
          className="topbar-icon-btn theme-btn"
          onClick={onToggleTheme}
          title={theme === 'dark' ? t.lightMode : t.darkMode}
          aria-label={theme === 'dark' ? t.lightMode : t.darkMode}
        >
          {theme === 'dark' ? (
            /* Sun icon (to switch to light mode) */
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
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

        {/* Profile Avatar Button */}
        <button
          className="topbar-icon-btn profile-btn"
          onClick={onOpenProfile}
          title={t.navProfile}
          aria-label={t.navProfile}
        >
          <div className="avatar-circle">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        </button>
      </div>
    </header>
  );
};
