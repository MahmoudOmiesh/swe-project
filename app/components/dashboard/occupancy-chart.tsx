import type { OccupancyDay } from "./data";

interface OccupancyChartProps {
  days: OccupancyDay[];
}

export function OccupancyChart({ days }: OccupancyChartProps) {
  const max = Math.max(...days.map((d) => d.value), 1);
  return (
    <div className="hms-surface hms-panel">
      <div className="hms-panel-header">
        <span className="hms-panel-title">Weekly Occupancy</span>
        <span className="hms-panel-meta">This week</span>
      </div>
      <div className="hms-bars-row">
        {days.map((d) => (
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
        {days.map((d) => (
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
