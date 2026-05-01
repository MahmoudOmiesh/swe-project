import { colors } from "@/components/dashboard/theme";

export function KpiCard({
  label,
  value,
  sub,
  subTone,
}: {
  label: string;
  value: string;
  sub: string;
  subTone?: "positive" | "negative" | "neutral";
}) {
  const subColor =
    subTone === "positive"
      ? colors.status.available.text
      : subTone === "negative"
        ? colors.status.maintenance.text
        : colors.textMuted;

  return (
    <div className="rounded-[14px] px-4 py-4" style={{ background: colors.cream2, border: `0.5px solid ${colors.border2}` }}>
      <div className="text-[10px] uppercase tracking-[0.12em]" style={{ color: colors.textMuted }}>{label}</div>
      <div className="mt-2 font-display text-[22px]" style={{ color: colors.text }}>{value}</div>
      <div className="mt-1 text-[11px]" style={{ color: subColor }}>{sub}</div>
    </div>
  );
}

