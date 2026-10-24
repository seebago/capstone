import type { NotificationItem } from '../types/portal';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
}

export function NotificationsModal({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
}: NotificationsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content notifications-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="notifications-header-title">
            <span className="bell-symbol">🔔</span>
            <h4>Centro de Notificaciones</h4>
          </div>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="notifications-toolbar">
          <small>{notifications.filter((n) => !n.read).length} notificaciones nuevas</small>
          <button className="btn-text btn-sm" onClick={onMarkAllAsRead}>
            Marcar todas como leídas
          </button>
        </div>

        <div className="notifications-list">
          {notifications.map((item) => (
            <div key={item.id} className={`notification-card ${item.read ? 'read' : 'unread'}`}>
              <div className="notification-icon">
                {item.type === 'exam' && '📄'}
                {item.type === 'appointment' && '📅'}
                {item.type === 'prescription' && '💊'}
                {item.type === 'system' && '🔔'}
              </div>
              <div className="notification-body">
                <strong>{item.title}</strong>
                <p>{item.message}</p>
                <small className="notif-time">{item.date}</small>
              </div>
              {!item.read && <span className="unread-dot" />}
            </div>
          ))}
        </div>

        <div className="modal-footer">
          <button className="btn-primary" onClick={onClose}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
