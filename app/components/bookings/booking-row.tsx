import { cn } from "@/lib/utils";
import { colors } from "@/components/dashboard/theme";
import { BookingStatusBadge } from "./booking-status-badge";
import type { RouterOutputs } from "@/utils/trpc/react";

export type BookingListItem = RouterOutputs["hotel"]["bookings"]["list"][number];

interface BookingRowProps {
  booking:    BookingListItem;
  isSelected: boolean;
  onClick:    (booking: BookingListItem) => void;
}

// Column widths — must match BookingsTable header
export const COL_WIDTHS = "52px 1fr 80px 95px 95px 80px";

export function BookingRow({ booking, isSelected, onClick }: BookingRowProps) {
  return (
    <button
      onClick={() => onClick(booking)}
      className={cn(
        "grid w-full items-center px-[14px] py-[10px] text-left transition-colors",
        "border-b last:border-b-0",
        isSelected ? "border-l-2" : "border-l-2 border-l-transparent",
      )}
      style={{
        gridTemplateColumns: COL_WIDTHS,
        borderBottomColor:   colors.border2,
        borderLeftColor:     isSelected ? colors.gold : "transparent",
        background:          isSelected ? colors.cream : "transparent",
        fontFamily:          "inherit",
        cursor:              "pointer",
      }}
    >
      {/* ID */}
      <span className="text-[10px]" style={{ color: colors.textMuted }}>
        #{booking.id}
      </span>

      {/* Guest */}
      <div className="flex items-center gap-[7px]">
        <div
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[8px] font-medium"
          style={{ background: booking.avatarBg, color: booking.avatarColor }}
        >
          {booking.guestInitials}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <span className="truncate text-[11px] font-medium" style={{ color: colors.text }}>
              {booking.guestName}
            </span>
            {booking.isLoyal && (
              <span
                className="rounded-full px-[5px] py-px text-[7px] font-medium"
                style={{ background: colors.goldPale, color: colors.status.occupied.text }}
              >
                Loyal
              </span>
            )}
          </div>
          <div className="text-[9px]" style={{ color: colors.textMuted }}>
            {booking.numGuests} guest{booking.numGuests > 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Room */}
      <span className="text-[11px]" style={{ color: colors.text }}>
        {booking.room} · {booking.roomType}
      </span>

      {/* Check-in */}
      <span className="text-[10px]" style={{ color: colors.textMuted }}>
        {booking.checkIn}
      </span>

      {/* Check-out */}
      <span className="text-[10px]" style={{ color: colors.textMuted }}>
        {booking.checkOut}
      </span>

      {/* Status */}
      <div>
        <BookingStatusBadge status={booking.status} />
      </div>
    </button>
  );
}
