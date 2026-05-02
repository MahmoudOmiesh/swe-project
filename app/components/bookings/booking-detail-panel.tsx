"use client";

import { useState } from "react";
import { X, Loader2, ArrowLeft } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useTRPC } from "@/utils/trpc/react";
import type { RouterOutputs } from "@/utils/trpc/react";
import { colors } from "@/components/dashboard/theme";
import { BookingStatusBadge } from "./booking-status-badge";

export type BookingDetail = NonNullable<RouterOutputs["receptionist"]["bookings"]["getById"]>;

// ─── Small helpers ────────────────────────────────────────────────────────────

function Divider() {
  return <div style={{ height: "0.5px", background: colors.border2 }} />;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mb-[7px] text-[9px] font-medium uppercase tracking-widest"
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
  disabled,
  loading,
}: {
  children: React.ReactNode;
  variant?: "primary" | "outline";
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="flex w-full items-center justify-center gap-1.5 rounded-full py-[7px] text-center text-[11px] font-medium transition-opacity hover:opacity-80 disabled:opacity-60"
      style={{
        background:  variant === "primary" ? colors.gold : "transparent",
        color:       variant === "primary" ? "#fff" : danger ? "#A32D2D" : colors.textSub,
        border:      variant === "primary" ? "none" : `0.5px solid ${danger ? "rgba(163,45,45,0.3)" : colors.border}`,
        fontFamily:  "inherit",
        cursor:      disabled || loading ? "not-allowed" : "pointer",
      }}
    >
      {loading && <Loader2 size={12} className="animate-spin" />}
      {children}
    </button>
  );
}

// ─── Bill line helper ────────────────────────────────────────────────────────

function BillLine({
  label,
  detail,
  amount,
  bold,
  muted,
}: {
  label: string;
  detail?: string;
  amount: number;
  bold?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <div className="min-w-0">
        <span
          className="text-[10px]"
          style={{
            color: muted ? colors.textMuted : colors.text,
            fontWeight: bold ? 600 : 400,
          }}
        >
          {label}
        </span>
        {detail && (
          <span className="ml-1 text-[9px]" style={{ color: colors.textMuted }}>
            {detail}
          </span>
        )}
      </div>
      <span
        className="shrink-0 text-[10px] tabular-nums"
        style={{
          color: bold ? colors.gold : muted ? colors.textMuted : colors.text,
          fontWeight: bold ? 600 : 400,
        }}
      >
        EGP {amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
    </div>
  );
}

// ─── Payment method pill ─────────────────────────────────────────────────────

const PAYMENT_METHODS = [
  { value: "cash",          label: "Cash" },
  { value: "card",          label: "Card" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "other",         label: "Other" },
] as const;

function paymentMethodLabel(value: string) {
  return PAYMENT_METHODS.find((m) => m.value === value)?.label ?? value;
}

type PaymentMethod = (typeof PAYMENT_METHODS)[number]["value"];

function PaymentPill({
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
      type="button"
      onClick={onClick}
      className="rounded-full px-3 py-[5px] text-[10px] font-medium transition-all"
      style={{
        background: active ? colors.gold : "transparent",
        color:      active ? "#fff" : colors.textSub,
        border:     `0.5px solid ${active ? colors.gold : colors.border}`,
        fontFamily: "inherit",
        cursor:     "pointer",
      }}
    >
      {label}
    </button>
  );
}

// ─── Checkout view ───────────────────────────────────────────────────────────

function CheckoutView({
  booking,
  onBack,
  onClose,
}: {
  booking: BookingDetail;
  onBack: () => void;
  onClose: () => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");

  const checkOutMutation = useMutation(
    trpc.receptionist.bookings.checkOut.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries();
        onClose();
      },
    }),
  );

  // Bill calculations (mirrors the DAL logic)
  const roomTotal = booking.nights * booking.ratePerNight;
  const extrasTotal = booking.services.reduce(
    (sum, s) => sum + Number(s.price),
    0,
  );
  const subtotal = roomTotal + extrasTotal;
  const tax = subtotal * 0.14;
  const total = subtotal + tax;

  function handleConfirm() {
    checkOutMutation.mutate({ id: booking.id, paymentMethod });
  }

  return (
    <aside
      className="flex h-full w-[264px] shrink-0 flex-col gap-3 overflow-y-auto p-4"
      style={{ background: colors.cream, borderLeft: `0.5px solid ${colors.border}` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={onBack}
            className="mb-[6px] flex items-center gap-1 text-[9px] font-medium uppercase tracking-widest transition-colors hover:opacity-70"
            style={{ color: colors.textMuted, background: "none", border: "none", fontFamily: "inherit", cursor: "pointer", padding: 0 }}
          >
            <ArrowLeft size={10} />
            Back
          </button>
          <div className="font-display text-[16px] leading-tight" style={{ color: colors.text }}>
            Check out
          </div>
          <div className="mt-[3px] text-[10px]" style={{ color: colors.textMuted }}>
            {booking.guestName} · #{booking.id}
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

      {/* Bill summary */}
      <div>
        <SectionLabel>Bill summary</SectionLabel>

        <div
          className="flex flex-col gap-[8px] rounded-[8px] p-[10px]"
          style={{ background: colors.cream2, border: `0.5px solid ${colors.border2}` }}
        >
          {/* Room */}
          <BillLine
            label="Room"
            detail={`${booking.room} · ${booking.nights} night${booking.nights > 1 ? "s" : ""} × EGP ${booking.ratePerNight.toLocaleString()}`}
            amount={roomTotal}
          />

          {/* Services */}
          {booking.services.map((s) => (
            <BillLine key={s.id} label={s.name} amount={Number(s.price)} />
          ))}

          <Divider />

          {/* Subtotal */}
          <BillLine label="Subtotal" amount={subtotal} />

          {/* Tax */}
          <BillLine label="Tax (14%)" amount={tax} muted />

          <Divider />

          {/* Total */}
          <BillLine label="Total" amount={total} bold />
        </div>
      </div>

      <Divider />

      {/* Payment method */}
      <div>
        <SectionLabel>Payment method</SectionLabel>
        <div className="flex flex-wrap gap-[6px]">
          {PAYMENT_METHODS.map((m) => (
            <PaymentPill
              key={m.value}
              label={m.label}
              active={paymentMethod === m.value}
              onClick={() => setPaymentMethod(m.value)}
            />
          ))}
        </div>
      </div>

      {/* Error feedback */}
      {checkOutMutation.error && (
        <p className="rounded-md bg-red-50 px-2 py-1.5 text-[10px] text-red-600">
          {checkOutMutation.error.message}
        </p>
      )}

      {/* Actions */}
      <div className="mt-auto flex flex-col gap-[6px]">
        <ActionButton
          variant="primary"
          onClick={handleConfirm}
          loading={checkOutMutation.isPending}
          disabled={checkOutMutation.isPending}
        >
          Complete check-out
        </ActionButton>
        <ActionButton onClick={onBack} disabled={checkOutMutation.isPending}>
          Cancel
        </ActionButton>
      </div>
    </aside>
  );
}

// ─── Detail view ─────────────────────────────────────────────────────────────

function DetailView({
  booking,
  onClose,
  onEdit,
  onCheckout,
}: {
  booking: BookingDetail;
  onClose: () => void;
  onEdit: () => void;
  onCheckout: () => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const updateStatus = useMutation(
    trpc.receptionist.bookings.updateStatus.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries();
        onClose();
      },
    }),
  );

  function handleCheckIn() {
    updateStatus.mutate({ id: booking.id, status: "checked-in" });
  }

  function handleCancel() {
    updateStatus.mutate({ id: booking.id, status: "cancelled" });
  }

  const total = booking.nights * booking.ratePerNight;

  return (
    <aside
      className="flex h-full w-[264px] shrink-0 flex-col gap-3 overflow-y-auto p-4"
      style={{ background: colors.cream, borderLeft: `0.5px solid ${colors.border}` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div
            className="mb-[4px] text-[9px] font-medium uppercase tracking-widest"
            style={{ color: colors.textMuted }}
          >
            Booking #{booking.id}
          </div>
          <div className="font-display text-[18px] leading-tight" style={{ color: colors.text }}>
            {booking.guestName}
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
            className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full text-[9px] font-medium"
            style={{ background: booking.avatarBg, color: booking.avatarColor }}
          >
            {booking.guestInitials}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-medium" style={{ color: colors.text }}>
                {booking.guestName}
              </span>
              {booking.isLoyal && (
                <span
                  className="rounded-full px-[5px] py-px text-[7px] font-medium"
                  style={{ background: colors.goldPale, color: colors.status.occupied.text }}
                >
                  loyal
                </span>
              )}
            </div>
            <div className="text-[9px]" style={{ color: colors.textMuted }}>
              ID: {booking.nationalId}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-[8px]">
          <Field label="Guests" value={`${booking.numGuests} adult${booking.numGuests > 1 ? "s" : ""}`} />
          <Field label="Phone"  value={booking.phone} />
        </div>
      </div>

      <Divider />

      {/* Stay details */}
      <div>
        <SectionLabel>Stay details</SectionLabel>
        <div className="grid grid-cols-2 gap-[8px]">
          <Field label="Room"       value={`${booking.room} · ${booking.roomType}`} />
          <Field label="Rate"       value={`EGP ${booking.ratePerNight.toLocaleString()}/night`} />
          <Field label="Check-in"   value={format(booking.checkIn, "d MMM yyyy")} />
          <Field label="Check-out"  value={format(booking.checkOut, "d MMM yyyy")} />
          <Field label="Duration"   value={`${booking.nights} night${booking.nights > 1 ? "s" : ""}`} />
          <Field label="Total"      value={`EGP ${total.toLocaleString()}`} highlight />
        </div>
      </div>

      <Divider />

      {/* Services */}
      <div>
        <SectionLabel>Services</SectionLabel>
        {booking.services.length > 0 ? (
          <div className="flex flex-col gap-[6px]">
            {booking.services.map((s) => (
              <div key={s.id} className="flex items-center justify-between">
                <span className="text-[10px] font-medium" style={{ color: colors.text }}>
                  {s.name}
                </span>
                <span className="text-[10px]" style={{ color: colors.textMuted }}>
                  EGP {Number(s.price).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <span className="text-[10px]" style={{ color: colors.textMuted }}>None</span>
        )}
      </div>

      {/* Mutation error feedback */}
      {updateStatus.error && (
        <p className="rounded-md bg-red-50 px-2 py-1.5 text-[10px] text-red-600">
          {updateStatus.error.message}
        </p>
      )}

      {/* Actions — vary by status */}
      {booking.status === "new" && (
        <div className="mt-auto flex flex-col gap-[6px]">
          <ActionButton
            variant="primary"
            onClick={handleCheckIn}
            loading={updateStatus.isPending && updateStatus.variables?.status === "checked-in"}
            disabled={updateStatus.isPending}
          >
            Check in
          </ActionButton>
          <ActionButton onClick={onEdit} disabled={updateStatus.isPending}>Edit booking</ActionButton>
          <ActionButton
            danger
            onClick={handleCancel}
            loading={updateStatus.isPending && updateStatus.variables?.status === "cancelled"}
            disabled={updateStatus.isPending}
          >
            Cancel booking
          </ActionButton>
        </div>
      )}

      {booking.status === "checked-in" && (
        <div className="mt-auto flex flex-col gap-[6px]">
          <ActionButton variant="primary" onClick={onCheckout}>Check out</ActionButton>
        </div>
      )}

      {/* Bill info for checked-out reservations */}
      {booking.status === "checked-out" && booking.bill && (
        <>
          <Divider />
          <div>
            <SectionLabel>Bill</SectionLabel>
            <div
              className="flex flex-col gap-[8px] rounded-[8px] p-[10px]"
              style={{ background: colors.cream2, border: `0.5px solid ${colors.border2}` }}
            >
              <BillLine
                label="Room"
                detail={`${booking.nights} night${booking.nights > 1 ? "s" : ""} × EGP ${booking.ratePerNight.toLocaleString()}`}
                amount={booking.nights * booking.ratePerNight}
              />

              {Number(booking.bill.extraServices) > 0 && (
                <BillLine label="Services" amount={Number(booking.bill.extraServices)} />
              )}

              {Number(booking.bill.discount) > 0 && (
                <BillLine label="Discount" amount={-Number(booking.bill.discount)} muted />
              )}

              <BillLine label="Tax (14%)" amount={Number(booking.bill.tax)} muted />

              <Divider />

              <BillLine label="Total" amount={Number(booking.bill.totalAmount)} bold />

              <Divider />

              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-widest" style={{ color: colors.textMuted }}>
                  Paid via
                </span>
                <span className="text-[10px] font-medium" style={{ color: colors.text }}>
                  {paymentMethodLabel(booking.bill.paymentMethod)}
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </aside>
  );
}

// ─── Panel (orchestrator) ────────────────────────────────────────────────────

interface BookingDetailPanelProps {
  bookingId: number;
  onClose: () => void;
  onEdit: () => void;
}

export function BookingDetailPanel({ bookingId, onClose, onEdit }: BookingDetailPanelProps) {
  const trpc = useTRPC();
  const [view, setView] = useState<"detail" | "checkout">("detail");

  const { data: booking, isLoading } = useQuery(
    trpc.receptionist.bookings.getById.queryOptions({ id: bookingId }),
  );

  // Loading / not found
  if (isLoading || !booking) {
    return (
      <aside
        className="flex h-full w-[264px] shrink-0 items-center justify-center"
        style={{ background: colors.cream, borderLeft: `0.5px solid ${colors.border}` }}
      >
        <Loader2 size={20} className="animate-spin" style={{ color: colors.textMuted }} />
      </aside>
    );
  }

  if (view === "checkout") {
    return (
      <CheckoutView
        booking={booking}
        onBack={() => setView("detail")}
        onClose={onClose}
      />
    );
  }

  return (
    <DetailView
      booking={booking}
      onClose={onClose}
      onEdit={onEdit}
      onCheckout={() => setView("checkout")}
    />
  );
}
