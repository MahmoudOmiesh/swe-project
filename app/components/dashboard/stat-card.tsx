interface StatCardProps {
  label: string;
  value: string | number;
  sub?: React.ReactNode;
}

export function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div className="hms-surface hms-stat-card">
      <div className="hms-stat-label">{label}</div>
      <div className="font-display hms-stat-value">{value}</div>
      {sub && <div className="hms-stat-sub">{sub}</div>}
    </div>
  );
}
