import { useState } from "react";
import { NOTIFICATIONS, NOTIFICATION_STYLES } from "./data";

export function NotificationsPanel() {
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  return (
    <div className="hms-surface hms-panel">
      <div className="hms-panel-header">
        <span className="hms-panel-title">Notifications</span>
        <button
          type="button"
          className="hms-link-button"
          onClick={() => setNotifications([])}
          disabled={notifications.length === 0}
        >
          Clear all
        </button>
      </div>
      <div className="hms-notifications-list">
        {notifications.length === 0 ? (
          <div className="hms-empty-state">No pending notifications.</div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className="hms-inset hms-notification-item"
              style={{ borderLeft: `2px solid ${NOTIFICATION_STYLES[n.type].border}` }}
            >
              <div
                className="hms-notification-icon"
                style={{
                  background: NOTIFICATION_STYLES[n.type].iconBg,
                  color: NOTIFICATION_STYLES[n.type].iconColor,
                }}
              >
                {NOTIFICATION_STYLES[n.type].symbol}
              </div>
              <div>
                <div className="hms-notification-message">{n.message}</div>
                <div className="hms-notification-time">{n.time}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
