import { colors } from "@/components/dashboard/theme";

export function TaskStatus({
  tone,
  label,
}: {
  tone: "urgent" | "normal" | "done";
  label: string;
}) {
  const palette =
    tone === "urgent"
      ? { bg: colors.status.maintenance.bg, text: colors.status.maintenance.text }
      : tone === "done"
        ? { bg: colors.status.available.bg, text: colors.status.available.text }
        : { bg: colors.status.cleaning.bg, text: colors.status.cleaning.text };

  return (
    <span className="rounded-full px-2 py-[3px] text-[9px] font-medium" style={{ background: palette.bg, color: palette.text }}>
      {label}
    </span>
  );
}

