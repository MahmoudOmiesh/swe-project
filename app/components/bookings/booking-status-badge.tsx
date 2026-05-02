import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  "new":         { label: "New",         bg: "#E6F1FB", text: "#185FA5" },
  "checked-in":  { label: "Checked In",  bg: "#EAF3DE", text: "#3B6D11" },
  "checked-out": { label: "Checked Out", bg: "#F5EDD8", text: "#7A5018" },
  "cancelled":   { label: "Cancelled",   bg: "#FCEBEB", text: "#A32D2D" },
};

interface BookingStatusBadgeProps {
  status:    string;
  className?: string;
}

export function BookingStatusBadge({ status, className }: BookingStatusBadgeProps) {
  const config = statusConfig[status];
  if (!config) return null;
  return (
    <span
      className={cn("inline-block rounded-full px-2 py-[2px] text-[8px] font-medium", className)}
      style={{ background: config.bg, color: config.text }}
    >
      {config.label}
    </span>
  );
}
