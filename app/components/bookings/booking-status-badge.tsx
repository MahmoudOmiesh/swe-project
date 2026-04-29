import { cn } from "@/lib/utils";
import { bookingStatusConfig, type BookingStatus } from "./mock-data";

interface BookingStatusBadgeProps {
  status:    BookingStatus;
  className?: string;
}

export function BookingStatusBadge({ status, className }: BookingStatusBadgeProps) {
  const { label, bg, text } = bookingStatusConfig[status];
  return (
    <span
      className={cn("inline-block rounded-full px-2 py-[2px] text-[8px] font-medium", className)}
      style={{ background: bg, color: text }}
    >
      {label}
    </span>
  );
}
