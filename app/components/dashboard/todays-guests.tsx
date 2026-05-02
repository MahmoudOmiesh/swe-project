import { Link } from "react-router";
import type { GuestStatus } from "./data";
import { GUEST_STATUS_LABELS, GUEST_STATUS_STYLES } from "./data";

export interface DashboardGuest {
  id: number;
  name: string;
  initials: string;
  avatarBg: string;
  avatarColor: string;
  room: string;
  roomType: string;
  bookingId: string;
  status: GuestStatus;
  isLoyal: boolean;
}

interface TodaysGuestsProps {
  basePath: string;
  guests: DashboardGuest[];
  onNewBooking?: () => void;
  onGuestClick?: (guest: DashboardGuest) => void;
}

export function TodaysGuests({ basePath, guests, onNewBooking, onGuestClick }: TodaysGuestsProps) {
  return (
    <div className="hms-surface hms-panel">
      <div className="hms-panel-header">
        <span className="hms-panel-title">Today&apos;s Guests</span>
        {onNewBooking ? (
          <button type="button" className="hms-link-button" onClick={onNewBooking}>
            + New booking
          </button>
        ) : (
          <Link to={`${basePath}/bookings/new`} className="hms-link-button">
            + New booking
          </Link>
        )}
      </div>
      <div className="hms-guest-list">
        {guests.length === 0 ? (
          <div className="hms-empty-state">No guests today.</div>
        ) : (
          guests.map((g) => (
            <button type="button" key={g.id} className="hms-inset hms-guest-item" onClick={() => onGuestClick?.(g)}>
              <div
                className="hms-guest-avatar"
                style={{ background: g.avatarBg, color: g.avatarColor }}
              >
                {g.initials}
              </div>
              <div className="hms-guest-content">
                <div className="hms-guest-row">
                  <span className="hms-guest-name">{g.name}</span>
                  {g.isLoyal && <span className="hms-guest-note">loyal guest</span>}
                </div>
                <div className="hms-guest-meta">
                  Room {g.room} · {g.roomType} · {g.bookingId}
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
          ))
        )}
      </div>
    </div>
  );
}
