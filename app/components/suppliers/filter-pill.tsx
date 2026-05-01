import { colors } from "@/components/dashboard/theme";

export function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-full px-4 py-[7px] text-[10px] font-medium"
      style={{
        background: active ? colors.gold : colors.cream,
        color: active ? "#fff" : colors.textSub,
        border: `0.5px solid ${active ? colors.gold : colors.border2}`,
      }}
    >
      {label}
    </button>
  );
}

