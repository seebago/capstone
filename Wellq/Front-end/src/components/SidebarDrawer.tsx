import { useState } from 'react';
import type { UserProfile, ClinicLocation } from '../types/portal';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  profile: UserProfile;
  locations: ClinicLocation[];
}

export function SidebarDrawer({
  isOpen,
  onClose,
  theme,
  onToggleTheme,
  profile,
  locations,
}: SidebarDrawerProps) {
  const [activeModal, setActiveModal] = useState<'perfil' | 'ubicaciones' | 'contacto' | null>(null);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="sidebar-backdrop" onClick={onClose} />

      {/* Slide-out Drawer from Right */}
      <aside className="sidebar-drawer" aria-label="Menú Lateral">
        <div className="sidebar-header">
          <div className="sidebar-user-brief">
            <div className="avatar-circle">
              {profile.name.charAt(0)}
            </div>
            <div>
              <strong className="sidebar-user-name">{profile.name}</strong>
              <small className="sidebar-user-rut">{profile.rut}</small>
            </div>
          </div>
          <button className="btn-close-sidebar" onClick={onClose} aria-label="Cerrar menú">
            ✕
          </button>
        </div>

        <nav className="sidebar-menu-list">
          {/* 1. Perfil */}
          <button
            className="sidebar-menu-item"
            onClick={() => setActiveModal('perfil')}
          >
            <div className="sidebar-item-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div className="sidebar-item-text">
              <strong>Perfil</strong>
              <small>Datos personales y cobertura de salud</small>
            </div>
            <span className="sidebar-arrow">›</span>
          </button>

          {/* 2. Ubicaciones */}
          <button
            className="sidebar-menu-item"
            onClick={() => setActiveModal('ubicaciones')}
          >
            <div className="sidebar-item-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            <div className="sidebar-item-text">
              <strong>Ubicaciones</strong>
              <small>Clínicas, centros médicos y laboratorios</small>
            </div>
            <span className="sidebar-arrow">›</span>
          </button>

          {/* 3. Contacto */}
          <button
            className="sidebar-menu-item"
            onClick={() => setActiveModal('contacto')}
          >
            <div className="sidebar-item-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </div>
            <div className="sidebar-item-text">
              <strong>Contacto</strong>
              <small>Mesa de ayuda, WhatsApp y emergencias</small>
            </div>
            <span className="sidebar-arrow">›</span>
          </button>

          {/* 4. Modo Oscuro */}
          <div className="sidebar-menu-item toggle-item" onClick={onToggleTheme}>
            <div className="sidebar-item-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            </div>
            <div className="sidebar-item-text">
              <strong>Modo Oscuro</strong>
              <small>{theme === 'dark' ? 'Activado (Tema Oscuro)' : 'Desactivado (Tema Claro)'}</small>
            </div>
            <div className={`switch-toggle ${theme === 'dark' ? 'checked' : ''}`}>
              <div className="switch-handle" />
            </div>
          </div>
        </nav>

        <div className="sidebar-footer">
          <small>WellMedical App v2.4 · Red de Salud</small>
        </div>
      </aside>

      {/* Sub-modals for Perfil, Ubicaciones, Contacto */}
      {activeModal === 'perfil' && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="modal-content info-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>👤 Mi Perfil de Paciente</h4>
              <button className="btn-close" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <div className="profile-details">
              <div className="profile-field">
                <span className="field-label">Nombre completo:</span>
                <strong>{profile.name}</strong>
              </div>
              <div className="profile-field">
                <span className="field-label">RUT:</span>
                <strong>{profile.rut}</strong>
              </div>
              <div className="profile-field">
                <span className="field-label">Correo electrónico:</span>
                <span>{profile.email}</span>
              </div>
              <div className="profile-field">
                <span className="field-label">Teléfono de contacto:</span>
                <span>{profile.phone}</span>
              </div>
              <div className="profile-field">
                <span className="field-label">Previsión de Salud:</span>
                <span className="badge-tag">{profile.insurance}</span>
              </div>
              <div className="profile-field">
                <span className="field-label">Contacto de emergencia:</span>
                <span>{profile.emergencyContact.name} ({profile.emergencyContact.relation}) - {profile.emergencyContact.phone}</span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-primary" onClick={() => setActiveModal(null)}>Entendido</button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'ubicaciones' && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="modal-content info-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>📍 Centros Médicos y Ubicaciones</h4>
              <button className="btn-close" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <div className="locations-list">
              {locations.map((loc) => (
                <div key={loc.id} className="location-card">
                  <div className="location-title">
                    <strong>{loc.name}</strong>
                    <span className="commune-tag">{loc.commune}</span>
                  </div>
                  <p className="loc-address">📌 {loc.address}</p>
                  <p className="loc-hours">🕒 Horario: {loc.hours}</p>
                  <p className="loc-phone">📞 Teléfono: {loc.phone}</p>
                  <div className="loc-services">
                    {loc.services.map((s, idx) => (
                      <span key={idx} className="service-chip">{s}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn-primary" onClick={() => setActiveModal(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'contacto' && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="modal-content info-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>📞 Canales de Contacto y Atención</h4>
              <button className="btn-close" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <div className="contact-options">
              <div className="contact-box highlight-phone">
                <span className="contact-icon">☎️</span>
                <div>
                  <strong>Mesa Central y Agendamiento</strong>
                  <p>600 400 2026 / (02) 2899 3000</p>
                  <small>Lunes a Viernes de 08:00 a 20:00 hrs</small>
                </div>
              </div>

              <div className="contact-box highlight-wsp">
                <span className="contact-icon">💬</span>
                <div>
                  <strong>Asistente WhatsApp WellMedical</strong>
                  <p>+56 9 8765 4321</p>
                  <small>Consultas de estado de exámenes y citas</small>
                </div>
              </div>

              <div className="contact-box highlight-email">
                <span className="contact-icon">✉️</span>
                <div>
                  <strong>Correo de Soporte al Paciente</strong>
                  <p>contacto@wellmedical.cl</p>
                  <small>Respuesta en menos de 24 horas hábiles</small>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-primary" onClick={() => setActiveModal(null)}>Listo</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
