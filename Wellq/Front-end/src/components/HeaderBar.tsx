interface HeaderBarProps {
  onToggleSidebar: () => void;
  onOpenNotifications: () => void;
  unreadCount: number;
}

export function HeaderBar({
  onToggleSidebar,
  onOpenNotifications,
  unreadCount,
}: HeaderBarProps) {
  return (
    <header className="top-header">
      {/* Left: Logo only with purple highlight as in wireframe */}
      <div className="header-left">
        <div className="logo-box" title="WellMedical / WellQ">
          <img
            src="/wellq-app-icon.webp"
            alt="WellMedical Logo"
            className="header-logo-img"
          />
        </div>
      </div>

      {/* Right: Notifications Bell + Square Rounded 3-line Hamburger */}
      <div className="header-right">
        {/* Notification Bell */}
        <button
          className="header-icon-btn btn-bell"
          onClick={onOpenNotifications}
          aria-label="Notificaciones"
          title="Ver Notificaciones"
        >
          <svg
            className="icon-svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.36 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.63 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16ZM16 17H8V11C8 8.52 9.51 6.5 12 6.5C14.49 6.5 16 8.52 16 11V17Z" />
          </svg>
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
        </button>

        {/* Square Rounded Hamburger Button (3 lines) */}
        <button
          className="header-icon-btn btn-hamburger"
          onClick={onToggleSidebar}
          aria-label="Abrir menú lateral"
          title="Menú"
        >
          <div className="hamburger-box">
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </div>
        </button>
      </div>
    </header>
  );
}
