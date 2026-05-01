import { colors } from "@/components/dashboard/theme";

export function BillingSummaryCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-[14px] px-4 py-4 text-center" style={{ background: colors.cream2, border: `0.5px solid ${colors.border2}` }}>
      <div className="font-display text-[22px] leading-none" style={{ color: accent ?? colors.text }}>
        {value}
      </div>
      <div className="mt-2 text-[10px] uppercase tracking-[0.12em]" style={{ color: colors.textMuted }}>
        {label}
      </div>
    </div>
  );
}

