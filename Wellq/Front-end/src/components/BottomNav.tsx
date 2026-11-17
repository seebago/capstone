import React from 'react';
import type { Language } from '../locales/translations';
import { translations } from '../locales/translations';

export type ActiveTab = 'exams' | 'chat';

interface BottomNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenMenu: () => void;
  lang: Language;
  role?: 'patient' | 'clinician';
  unreadCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenMenu,
  lang,
  role = 'patient',
  unreadCount = 2,
}) => {
  const t = translations[lang];

  return (
    <nav className="bottom-nav-container">
      {/* Tab 1: Exámenes */}
      <button
        className={`bottom-nav-item ${activeTab === 'exams' ? 'active' : ''}`}
        onClick={() => onSelectTab('exams')}
        aria-label={t.navExams}
      >
        <div className="nav-icon-wrapper">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        </div>
        <span className="nav-item-label">{t.navExams}</span>
      </button>

      {/* Tab 2: Chat (Only visible for Patient, hidden for Clinician) */}
      {role === 'patient' && (
        <button
          className={`bottom-nav-item ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => onSelectTab('chat')}
          aria-label={t.navChat}
        >
          <div className="nav-icon-wrapper">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
          </div>
          <span className="nav-item-label">{t.navChat}</span>
        </button>
      )}

      {/* Tab 3: Menú (Opens Drawer) */}
      <button
        className="bottom-nav-item menu-trigger"
        onClick={onOpenMenu}
        aria-label={t.navMenu}
      >
        <div className="nav-icon-wrapper">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
          {unreadCount > 0 && <span className="nav-badge-dot"></span>}
        </div>
        <span className="nav-item-label">{t.navMenu}</span>
      </button>
    </nav>
  );
};
