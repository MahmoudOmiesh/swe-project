import { colors } from "@/components/dashboard/theme";

interface ReadonlyFieldProps {
  label: string;
  value: string;
}

export function ReadonlyField({ label, value }: ReadonlyFieldProps) {
  return (
    <div>
      <div
        className="mb-[5px] text-[9px] font-medium uppercase tracking-[0.12em]"
        style={{ color: colors.textMuted }}
      >
        {label}
      </div>
      <div
        className="rounded-[10px] px-3 py-[10px] text-[12px]"
        style={{
          background: colors.cream,
          border: `0.5px solid ${colors.border2}`,
          color: value ? colors.text : colors.textMuted,
        }}
      >
        {value}
      </div>
    </div>
  );
}

