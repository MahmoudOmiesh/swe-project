import { X } from "lucide-react";
import { colors } from "@/components/dashboard/theme";
import { BookingStatusBadge } from "./booking-status-badge";
import type { Booking } from "./mock-data";

// ─── Small helpers ────────────────────────────────────────────────────────────

function Divider() {
  return <div style={{ height: "0.5px", background: colors.border2 }} />;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mb-[7px] text-[9px] font-medium uppercase tracking-[0.1em]"
      style={{ color: colors.textMuted }}
    >
      {children}
    </div>
  );
}

function Field({ label, value, highlight }: { label: string; value: React.ReactNode; highlight?: boolean }) {
  return (
    <div>
      <div className="mb-[2px] text-[9px]" style={{ color: colors.textMuted }}>{label}</div>
      <div
        className="text-[11px]"
        style={{ color: highlight ? colors.gold : colors.text, fontWeight: highlight ? 500 : 400 }}
      >
        {value}
      </div>
    </div>
  );
}

function ActionButton({
  children,
  variant = "outline",
  onClick,
  danger,
}: {
  children: React.ReactNode;
  variant?: "primary" | "outline";
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-full py-[7px] text-center text-[11px] font-medium transition-opacity hover:opacity-80"
      style={{
        background:  variant === "primary" ? colors.gold : "transparent",
        color:       variant === "primary" ? "#fff" : danger ? "#A32D2D" : colors.textSub,
        border:      variant === "primary" ? "none" : `0.5px solid ${danger ? "rgba(163,45,45,0.3)" : colors.border}`,
        fontFamily:  "inherit",
        cursor:      "pointer",
      }}
    >
      {children}
    </button>
  );
}

// ─── Panel ────────────────────────────────────────────────────────────────────

interface BookingDetailPanelProps {
  booking: Booking;
  onClose: () => void;
}

export function BookingDetailPanel({ booking, onClose }: BookingDetailPanelProps) {
  const total = booking.nights * booking.ratePerNight;

  return (
    <aside
      className="flex h-full w-[264px] flex-shrink-0 flex-col gap-3 overflow-y-auto p-4"
      style={{ background: colors.cream, borderLeft: `0.5px solid ${colors.border}` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div
            className="mb-[4px] text-[9px] font-medium uppercase tracking-[0.1em]"
            style={{ color: colors.textMuted }}
          >
            Booking {booking.id}
          </div>
          <div className="font-display text-[18px] leading-tight" style={{ color: colors.text }}>
            {booking.guest.name}
          </div>
          <div className="mt-[5px]">
            <BookingStatusBadge status={booking.status} />
          </div>
        </div>
        <button
          onClick={onClose}
          className="mt-1 rounded-md p-1 transition-colors hover:bg-[#F0EBE0]"
          aria-label="Close panel"
        >
          <X size={14} style={{ color: colors.textMuted }} />
        </button>
      </div>

      <Divider />

      {/* Guest details */}
      <div>
        <SectionLabel>Guest details</SectionLabel>

        {/* Avatar card */}
        <div
          className="mb-[8px] flex items-center gap-2 rounded-[8px] p-[8px]"
          style={{ background: colors.cream2, border: `0.5px solid ${colors.border2}` }}
        >
          <div
            className="flex h-[28px] w-[28px] flex-shrink-0 items-center justify-center rounded-full text-[9px] font-medium"
            style={{ background: booking.guest.avatarBg, color: booking.guest.avatarColor }}
          >
            {booking.guest.initials}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-medium" style={{ color: colors.text }}>
                {booking.guest.name}
              </span>
              {booking.guest.isLoyal && (
                <span
                  className="rounded-full px-[5px] py-px text-[7px] font-medium"
                  style={{ background: colors.goldPale, color: colors.status.occupied.text }}
                >
                  loyal
                </span>
              )}
            </div>
            <div className="text-[9px]" style={{ color: colors.textMuted }}>
              {booking.guest.nationality} · ID: {booking.guest.nationalId}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-[8px]">
          <Field label="Nationality" value={booking.guest.nationality} />
          <Field label="Guests"      value={`${booking.guest.numGuests} adult${booking.guest.numGuests > 1 ? "s" : ""}`} />
          <Field label="Phone"       value={booking.guest.phone} />
        </div>
      </div>

      <Divider />

      {/* Stay details */}
      <div>
        <SectionLabel>Stay details</SectionLabel>
        <div className="grid grid-cols-2 gap-[8px]">
          <Field label="Room"       value={`${booking.room} · ${booking.roomType}`} />
          <Field label="Rate"       value={`EGP ${booking.ratePerNight.toLocaleString()}/night`} />
          <Field label="Check-in"   value={booking.checkIn} />
          <Field label="Check-out"  value={booking.checkOut} />
          <Field label="Duration"   value={`${booking.nights} night${booking.nights > 1 ? "s" : ""}`} />
          <Field label="Total"      value={`EGP ${total.toLocaleString()}`} highlight />
        </div>
      </div>

      <Divider />

      {/* Services / Activities */}
      <div>
        <SectionLabel>Services</SectionLabel>
        {booking.activities.length > 0 ? (
          <div className="flex flex-col gap-[6px]">
            {booking.activities.map((a, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-[10px] font-medium" style={{ color: colors.text }}>
                  {a.activity}
                </span>
                <span className="text-[10px]" style={{ color: colors.textMuted }}>
                  EGP {Number(a.price).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <span className="text-[10px]" style={{ color: colors.textMuted }}>None</span>
        )}
      </div>

      {/* Actions */}
      {booking.status !== "cancelled" && booking.status !== "checked-out" && (
        <div className="mt-auto flex flex-col gap-[6px]">
          {booking.status === "new" && (
            <ActionButton variant="primary">Check in</ActionButton>
          )}
          {booking.status === "checked-in" && (
            <ActionButton variant="primary">Process check-out</ActionButton>
          )}
          <ActionButton>Edit booking</ActionButton>
          <ActionButton danger>Cancel booking</ActionButton>
        </div>
      )}
    </aside>
  );
}
