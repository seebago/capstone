import React, { useRef, useState } from 'react';
import { useHorizontalSwipe } from '../hooks/useHorizontalSwipe';
import type { Language } from '../locales/translations';
import { translations } from '../locales/translations';
import type { ClinicLocation, NotificationItem } from '../types';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onSelectLanguage: (lang: Language) => void;
  notifications: NotificationItem[];
  onMarkNotificationsRead: () => void;
}

const UK_LOCATIONS: ClinicLocation[] = [
  {
    id: 'loc-1',
    name: 'London Central Health Hub',
    city: 'London',
    address: '14 Harley Street, Marylebone',
    postalCode: 'W1G 9PQ',
    phone: '+44 20 7946 0192',
    hours: 'Mon – Fri: 08:00 – 20:00 | Sat: 09:00 – 14:00',
    isMain: true,
  },
  {
    id: 'loc-2',
    name: 'Manchester Diagnostic Centre',
    city: 'Manchester',
    address: '25 Deansgate, City Centre',
    postalCode: 'M3 2AY',
    phone: '+44 161 496 0381',
    hours: 'Mon – Fri: 08:30 – 18:30',
  },
  {
    id: 'loc-3',
    name: 'Edinburgh Diagnostic & Imaging Hub',
    city: 'Edinburgh',
    address: '10 George Street, New Town',
    postalCode: 'EH2 2PF',
    phone: '+44 131 496 0774',
    hours: 'Mon – Fri: 08:00 – 19:00',
  },
];

export const MenuDrawer: React.FC<MenuDrawerProps> = ({
  isOpen,
  onClose,
  lang,
  onSelectLanguage,
  notifications,
  onMarkNotificationsRead,
}) => {
  const t = translations[lang];
  const [activeSection, setActiveSection] = useState<'notifications' | 'language' | 'locations' | 'contact'>('notifications');

  // Gesto inverso al de apertura: el panel entra desde la derecha, así que
  // deslizar hacia la derecha (sobre el panel o el fondo oscuro) lo cierra.
  const overlayRef = useRef<HTMLDivElement | null>(null);
  useHorizontalSwipe({ enabled: isOpen, direction: 'right', onSwipe: onClose, target: overlayRef, ignoreSelector: '.drawer-nav-tabs' });

  if (!isOpen) return null;

  return (
    <div className="drawer-overlay" ref={overlayRef} onClick={onClose}>
      <aside className="drawer-content" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-title-group">
            <h3>{t.menuTitle}</h3>
            <span className="drawer-badge">UK Portal</span>
          </div>
          <button className="btn-drawer-close" onClick={onClose} aria-label="Close menu">✕</button>
        </div>

        {/* Navigation Tabs inside Drawer */}
        <div className="drawer-nav-tabs">
          <button
            className={`drawer-tab-btn ${activeSection === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveSection('notifications')}
          >
            <span className="tab-icon">🔔</span>
            <span className="tab-text">{t.menuNotifications}</span>
            {notifications.some(n => !n.read) && <span className="tab-badge"></span>}
          </button>

          <button
            className={`drawer-tab-btn ${activeSection === 'language' ? 'active' : ''}`}
            onClick={() => setActiveSection('language')}
          >
            <span className="tab-icon">🌐</span>
            <span className="tab-text">{t.menuLanguage}</span>
          </button>

          <button
            className={`drawer-tab-btn ${activeSection === 'locations' ? 'active' : ''}`}
            onClick={() => setActiveSection('locations')}
          >
            <span className="tab-icon">📍</span>
            <span className="tab-text">{t.menuLocations}</span>
          </button>

          <button
            className={`drawer-tab-btn ${activeSection === 'contact' ? 'active' : ''}`}
            onClick={() => setActiveSection('contact')}
          >
            <span className="tab-icon">📞</span>
            <span className="tab-text">{t.menuContact}</span>
          </button>
        </div>

        {/* Section Content Area */}
        <div className="drawer-body">
          {/* Section: NOTIFICATIONS */}
          {activeSection === 'notifications' && (
            <div className="drawer-section">
              <div className="section-subhead">
                <h4>{t.menuNotifications}</h4>
                {notifications.some(n => !n.read) && (
                  <button className="btn-link" onClick={onMarkNotificationsRead}>
                    {t.markAllRead}
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <p className="drawer-empty">{t.notificationsEmpty}</p>
              ) : (
                <div className="notifications-list">
                  {notifications.map((item) => (
                    <div key={item.id} className={`notification-card ${item.read ? 'read' : 'unread'}`}>
                      <div className="notification-icon">
                        {item.type === 'success' && '🟢'}
                        {item.type === 'info' && '🔵'}
                        {item.type === 'warning' && '🟡'}
                      </div>
                      <div className="notification-body">
                        <strong>{item.title}</strong>
                        <p>{item.message}</p>
                        <small className="notification-time">{item.timestamp}</small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Section: LANGUAGE */}
          {activeSection === 'language' && (
            <div className="drawer-section">
              <div className="section-subhead">
                <h4>{t.menuLanguage}</h4>
              </div>
              <p className="section-desc">
                {lang === 'en'
                  ? 'Select your preferred language. Configured primarily for the United Kingdom NHS standards.'
                  : 'Selecciona tu idioma preferido. Configurado principalmente según los estándares del Reino Unido.'}
              </p>

              <div className="language-selector-group">
                <button
                  className={`lang-option-card ${lang === 'en' ? 'selected' : ''}`}
                  onClick={() => onSelectLanguage('en')}
                >
                  <span className="flag">🇬🇧</span>
                  <div className="lang-info">
                    <strong>English (UK)</strong>
                    <small>Default · United Kingdom NHS Portal</small>
                  </div>
                  {lang === 'en' && <span className="check-mark">✓</span>}
                </button>

                <button
                  className={`lang-option-card ${lang === 'es' ? 'selected' : ''}`}
                  onClick={() => onSelectLanguage('es')}
                >
                  <span className="flag">🇨🇱</span>
                  <div className="lang-info">
                    <strong>Español</strong>
                    <small>Traducción completa / Soporte bilingüe</small>
                  </div>
                  {lang === 'es' && <span className="check-mark">✓</span>}
                </button>
              </div>
            </div>
          )}

          {/* Section: LOCATIONS */}
          {activeSection === 'locations' && (
            <div className="drawer-section">
              <div className="section-subhead">
                <h4>{t.locationsTitle}</h4>
              </div>
              <div className="locations-list">
                {UK_LOCATIONS.map((loc) => (
                  <div key={loc.id} className="location-card">
                    <div className="location-header">
                      <strong>{loc.name}</strong>
                      {loc.isMain && <span className="main-tag">Main Hub</span>}
                    </div>
                    <p className="location-address">📍 {loc.address}, {loc.city} {loc.postalCode}</p>
                    <p className="location-hours">🕒 {t.openHours} {loc.hours}</p>
                    <p className="location-phone">📞 {t.phone} {loc.phone}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: CONTACT */}
          {activeSection === 'contact' && (
            <div className="drawer-section">
              <div className="section-subhead">
                <h4>{t.contactTitle}</h4>
              </div>

              <div className="contact-card highlight">
                <div className="contact-icon">📞</div>
                <div className="contact-info">
                  <span className="contact-label">{t.contactHelpline}</span>
                  <strong className="contact-value">+44 20 7946 0912</strong>
                  <small>Available 24/7 for patient diagnostic inquiries.</small>
                </div>
              </div>

              <div className="contact-card">
                <div className="contact-icon">✉️</div>
                <div className="contact-info">
                  <span className="contact-label">{t.contactEmail}</span>
                  <strong className="contact-value">support.uk@wellqmedical.com</strong>
                  <small>Response within 2 hours on business days.</small>
                </div>
              </div>

              <div className="nhs-notice-box">
                <span className="nhs-badge">NHS 111</span>
                <p>{t.contactNhsInfo}</p>
              </div>

              <div className="emergency-warning-box">
                <p>⚠️ {t.contactEmergency}</p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};
