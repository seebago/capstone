import type { ActiveTab } from '../types/portal';

interface BottomNavBarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
}

export function BottomNavBar({ activeTab, onSelectTab }: BottomNavBarProps) {
  return (
    <nav className="bottom-nav-bar" aria-label="Navegación principal">
      {/* 1. Cita */}
      <button
        className={`bottom-nav-item ${activeTab === 'cita' ? 'active' : ''}`}
        onClick={() => onSelectTab('cita')}
      >
        <div className="nav-icon-wrapper">
          <svg
            className="bottom-nav-svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
            <polyline points="9 16 11 18 15 14"></polyline>
          </svg>
        </div>
        <span className="nav-label">Cita</span>
      </button>

      {/* 2. Examenes */}
      <button
        className={`bottom-nav-item ${activeTab === 'examenes' ? 'active' : ''}`}
        onClick={() => onSelectTab('examenes')}
      >
        <div className="nav-icon-wrapper">
          <svg
            className="bottom-nav-svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
            <line x1="9" y1="11" x2="9.01" y2="11"></line>
            <line x1="13" y1="11" x2="17" y2="11"></line>
            <line x1="9" y1="15" x2="9.01" y2="15"></line>
            <line x1="13" y1="15" x2="17" y2="15"></line>
          </svg>
        </div>
        <span className="nav-label">Examenes</span>
      </button>

      {/* 3. Recetas */}
      <button
        className={`bottom-nav-item ${activeTab === 'recetas' ? 'active' : ''}`}
        onClick={() => onSelectTab('recetas')}
      >
        <div className="nav-icon-wrapper">
          <svg
            className="bottom-nav-svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        </div>
        <span className="nav-label">Recetas</span>
      </button>

      {/* 4. Agendar */}
      <button
        className={`bottom-nav-item ${activeTab === 'agendar' ? 'active' : ''}`}
        onClick={() => onSelectTab('agendar')}
      >
        <div className="nav-icon-wrapper">
          <svg
            className="bottom-nav-svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
        </div>
        <span className="nav-label">Agendar</span>
      </button>
    </nav>
  );
}
