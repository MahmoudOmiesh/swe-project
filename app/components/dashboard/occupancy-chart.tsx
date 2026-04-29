import { OCCUPANCY_DAYS } from "./data";

export function OccupancyChart() {
  const max = Math.max(...OCCUPANCY_DAYS.map((d) => d.value));
  return (
    <div className="hms-surface hms-panel">
      <div className="hms-panel-header">
        <span className="hms-panel-title">Weekly Occupancy</span>
        <span className="hms-panel-meta">This week</span>
      </div>
      <div className="hms-bars-row">
        {OCCUPANCY_DAYS.map((d) => (
          <div
            key={d.label}
            className="hms-bar"
            style={{
              height: `${(d.value / max) * 100}%`,
              background: d.current ? "#B8965A" : "rgba(184,150,90,0.45)",
            }}
          />
        ))}
      </div>
      <div className="hms-days-row">
        {OCCUPANCY_DAYS.map((d) => (
          <div
            key={d.label}
            className="hms-day-label"
            style={{
              color: d.current ? "#B8965A" : "#9C8B78",
              fontWeight: d.current ? 500 : 400,
            }}
          >
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
}
