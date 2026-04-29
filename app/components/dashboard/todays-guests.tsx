import { Link } from "react-router";
import {
  GUESTS,
  GUEST_STATUS_LABELS,
  GUEST_STATUS_STYLES,
} from "./data";

export function TodaysGuests({ basePath }: { basePath: string }) {
  return (
    <div className="hms-surface hms-panel">
      <div className="hms-panel-header">
        <span className="hms-panel-title">Today&apos;s Guests</span>
        <Link to={`${basePath}/bookings/new`} className="hms-link-button">
          + New booking
        </Link>
      </div>
      <div className="hms-guest-list">
        {GUESTS.map((g) => (
          <button type="button" key={g.id} className="hms-inset hms-guest-item">
            <div
              className="hms-guest-avatar"
              style={{ background: g.avatarBg, color: g.avatarColor }}
            >
              {g.initials}
            </div>
            <div className="hms-guest-content">
              <div className="hms-guest-row">
                <span className="hms-guest-name">{g.name}</span>
                {g.note && <span className="hms-guest-note">{g.note}</span>}
              </div>
              <div className="hms-guest-meta">
                Room {g.room} · {g.type} · {g.bookingId}
              </div>
            </div>
            <span
              className="hms-guest-status"
              style={{
                background: GUEST_STATUS_STYLES[g.status].bg,
                color: GUEST_STATUS_STYLES[g.status].color,
              }}
            >
              {GUEST_STATUS_LABELS[g.status]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
