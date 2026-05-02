import type { RoomStatus } from "./data";
import { ROOM_STATUS_STYLES } from "./data";

interface RoomItem {
  id: number;
  number: string;
  status: RoomStatus;
}

interface RoomStatusGridProps {
  rooms: RoomItem[];
  onViewAll?: () => void;
  onRoomClick?: (roomId: number) => void;
}

export function RoomStatusGrid({ rooms, onViewAll, onRoomClick }: RoomStatusGridProps) {
  const legend = (["occupied", "available", "cleaning", "maintenance"] as const).map(
    (status) => ({
      status,
      label: status.charAt(0).toUpperCase() + status.slice(1),
      count: rooms.filter((r) => r.status === status).length,
    }),
  );

  return (
    <div className="hms-surface hms-panel">
      <div className="hms-panel-header">
        <span className="hms-panel-title">Room Status Overview</span>
        <button type="button" className="hms-link-button" onClick={onViewAll}>
          View all
        </button>
      </div>
      <div className="hms-room-grid">
        {rooms.map((r) => (
          <button
            key={r.number}
            type="button"
            className="hms-room-cell"
            aria-label={`Room ${r.number} is ${r.status}`}
            onClick={() => onRoomClick?.(r.id)}
            style={{
              background: ROOM_STATUS_STYLES[r.status].bg,
              color: ROOM_STATUS_STYLES[r.status].color,
              borderColor: ROOM_STATUS_STYLES[r.status].border,
            }}
          >
            {r.number}
          </button>
        ))}
      </div>
      <div className="hms-legend">
        {legend.map(({ status, label, count }) => (
          <div key={status} className="hms-legend-item">
            <div
              className="hms-legend-swatch"
              style={{ background: ROOM_STATUS_STYLES[status].border }}
            />
            <span className="hms-legend-text">
              {label} ({count})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
