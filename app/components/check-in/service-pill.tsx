import { colors } from "@/components/dashboard/theme";

interface ServicePillProps {
  label: string;
  extra?: string;
  active: boolean;
  onClick?: () => void;
}

export function ServicePill({ label, extra, active, onClick }: ServicePillProps) {
  const Tag = onClick ? "button" : "div";

  return (
    <Tag
      onClick={onClick}
      className="flex items-center gap-2 rounded-[10px] px-3 py-[10px] text-[11px]"
      style={{
        background: active ? colors.goldPale : colors.cream,
        border: `0.5px solid ${active ? colors.goldLight : colors.border2}`,
        color: colors.textSub,
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <span
        style={{
          width: 12,
          height: 12,
          borderRadius: 3,
          background: active ? colors.gold : "transparent",
          border: `0.5px solid ${active ? colors.gold : colors.border2}`,
          flexShrink: 0,
        }}
      />
      <span>
        {label}
        {extra ? ` (${extra})` : ""}
      </span>
    </Tag>
  );
}
