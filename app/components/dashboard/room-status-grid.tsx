import {
  ROOMS,
  ROOM_STATUS_LABELS,
  ROOM_STATUS_STYLES,
} from "./data";

export function RoomStatusGrid() {
  return (
    <div className="hms-surface hms-panel">
      <div className="hms-panel-header">
        <span className="hms-panel-title">Room Status Overview</span>
        <button type="button" className="hms-link-button">
          View all
        </button>
      </div>
      <div className="hms-room-grid">
        {ROOMS.map((r) => (
          <button
            key={r.number}
            type="button"
            className="hms-room-cell"
            aria-label={`Room ${r.number} is ${r.status}`}
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
        {ROOM_STATUS_LABELS.map(({ status, label, count }) => (
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
