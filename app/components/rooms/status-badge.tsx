import { cn } from "@/lib/utils";
import { colors } from "@/components/dashboard/theme";
import type { RoomStatus } from "@/components/dashboard/theme";

// ─── Room status badge ────────────────────────────────────────────────────────

interface RoomStatusBadgeProps {
  status: RoomStatus;
  className?: string;
}

const ROOM_STATUS_LABEL: Record<RoomStatus, string> = {
  occupied:    "Occupied",
  available:   "Available",
  cleaning:    "Cleaning",
  maintenance: "Maintenance",
};

export function RoomStatusBadge({ status, className }: RoomStatusBadgeProps) {
  const { bg, text } = colors.status[status];
  return (
    <span
      className={cn("inline-block rounded-full px-2 py-[2px] text-[8px] font-medium", className)}
      style={{ background: bg, color: text }}
    >
      {ROOM_STATUS_LABEL[status]}
    </span>
  );
}

// ─── Generic text badge ───────────────────────────────────────────────────────
// Used for "loyal guest", services, etc.

interface TextBadgeProps {
  children: React.ReactNode;
  bg?: string;
  color?: string;
  className?: string;
}

export function TextBadge({
  children,
  bg    = colors.goldPale,
  color = colors.status.occupied.text,
  className,
}: TextBadgeProps) {
  return (
    <span
      className={cn("inline-block rounded-full px-[5px] py-px text-[8px] font-medium", className)}
      style={{ background: bg, color }}
    >
      {children}
    </span>
  );
}
