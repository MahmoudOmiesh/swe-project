import { colors } from "@/components/dashboard/theme";

interface MetricCardProps {
  label: string;
  value: number;
  valueColor: string;
}

export function MetricCard({ label, value, valueColor }: MetricCardProps) {
  return (
    <div
      className="rounded-[14px] px-4 py-4 text-center"
      style={{ background: colors.cream2, border: `0.5px solid ${colors.border2}` }}
    >
      <div className="font-display text-[26px] leading-none" style={{ color: valueColor }}>
        {value}
      </div>
      <div className="mt-2 text-[10px] uppercase tracking-[0.12em]" style={{ color: colors.textMuted }}>
        {label}
      </div>
    </div>
  );
}

