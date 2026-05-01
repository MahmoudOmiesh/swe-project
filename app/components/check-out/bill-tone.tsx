import { colors } from "@/components/dashboard/theme";

export function BillTone({
  value,
  tone,
}: {
  value: number;
  tone?: "default" | "muted" | "success";
}) {
  const color =
    tone === "success"
      ? colors.status.available.text
      : tone === "muted"
        ? colors.textMuted
        : colors.text;

  return <span style={{ color, fontWeight: tone === "success" ? 500 : 400 }}>EGP {value.toFixed(2)}</span>;
}

