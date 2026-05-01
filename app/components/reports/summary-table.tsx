import { colors } from "@/components/dashboard/theme";
import type { SummaryRow } from "./mock-data";

export function SummaryTable({ title, rows }: { title: string; rows: SummaryRow[] }) {
  return (
    <section className="rounded-[16px] p-4" style={{ background: colors.cream2, border: `0.5px solid ${colors.border2}` }}>
      <h3 className="mb-4 text-[12px] font-medium" style={{ color: colors.text }}>{title}</h3>

      <div className="flex flex-col gap-3">
        {rows.map((row) => {
          const valueColor =
            row.tone === "positive"
              ? colors.status.available.text
              : row.tone === "negative"
                ? colors.status.maintenance.text
                : row.tone === "gold"
                  ? colors.gold
                  : colors.text;

          return (
            <div key={row.label} className="flex items-center justify-between gap-3 border-b pb-2 last:border-b-0 last:pb-0" style={{ borderColor: colors.border2 }}>
              <span className="text-[12px]" style={{ color: colors.textSub }}>{row.label}</span>
              <span className="text-[12px] font-medium" style={{ color: valueColor }}>{row.value}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

