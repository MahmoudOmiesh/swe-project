"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/utils/trpc/react";
import { colors } from "@/components/dashboard/theme";
import { FrontDeskTabs } from "@/components/ui/front-desk-tabs";
import { BillTone } from "./bill-tone";
import { PaymentButton } from "./payment-button";
import { StatusBadge } from "./status-badge";

// ── Payment method mapping ───────────────────────────────────────────────────

const PAYMENT_OPTIONS = [
  { label: "Cash", value: "cash" },
  { label: "Credit / Debit card", value: "card" },
  { label: "Bank transfer", value: "bank_transfer" },
  { label: "Online payment", value: "other" },
] as const;

type PaymentMethodValue = (typeof PAYMENT_OPTIONS)[number]["value"];

// ── Page ─────────────────────────────────────────────────────────────────────

interface CheckOutPageProps {
  basePath: string;
}

export function CheckOutPage({ basePath }: CheckOutPageProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // ── Queries ────────────────────────────────────────────────────────────────
  const {
    data: departures = [],
    isLoading: isLoadingDepartures,
  } = useQuery(trpc.receptionist.bookings.todayDepartures.queryOptions());

  // ── Local state ────────────────────────────────────────────────────────────
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodValue>("cash");

  const selectedDeparture = departures.find((d) => d.id === selectedId) ?? null;

  // Auto-select first departure when data loads or selection becomes invalid
  useEffect(() => {
    if (departures.length > 0 && !departures.find((d) => d.id === selectedId)) {
      setSelectedId(departures[0].id);
    }
  }, [departures, selectedId]);

  // ── Check-out mutation ─────────────────────────────────────────────────────
  const checkOutMutation = useMutation(
    trpc.receptionist.bookings.checkOut.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.receptionist.bookings.todayDepartures.queryKey(),
        });
      },
    }),
  );

  function handleCheckOut() {
    if (!selectedDeparture || selectedDeparture.paymentStatus === "Paid") return;
    checkOutMutation.mutate({
      id: selectedDeparture.id,
      paymentMethod,
    });
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="hms-shell flex flex-1 flex-col overflow-hidden">
      <header className="hms-topbar flex items-center justify-between px-5 py-[13px]">
        <h1 className="font-display text-[17px]" style={{ color: colors.text }}>
          Check-in / Check-out
        </h1>
        <FrontDeskTabs basePath={basePath} active="checkout" />
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 gap-4 overflow-y-auto p-[18px]">
          {/* ── Left column ──────────────────────────────────────────────── */}
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            {/* Departures list */}
            <section
              className="rounded-[14px] p-4"
              style={{ background: colors.cream2, border: `0.5px solid ${colors.border2}` }}
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-[12px] font-medium" style={{ color: colors.text }}>
                  Today's departures
                </h2>
                <span className="text-[11px]" style={{ color: colors.textMuted }}>
                  {departures.length} guest{departures.length !== 1 ? "s" : ""}
                </span>
              </div>

              {isLoadingDepartures ? (
                <div
                  className="py-6 text-center text-[12px]"
                  style={{ color: colors.textMuted }}
                >
                  Loading departures…
                </div>
              ) : departures.length === 0 ? (
                <div
                  className="rounded-[12px] px-4 py-6 text-center text-[12px]"
                  style={{ color: colors.textMuted }}
                >
                  No departures expected today
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {departures.map((departure) => {
                    const active = selectedId === departure.id;

                    return (
                      <button
                        key={departure.id}
                        onClick={() => setSelectedId(departure.id)}
                        className="flex items-center gap-3 rounded-[12px] px-2 py-[10px] text-left"
                        style={{
                          background: active ? colors.cream : "transparent",
                          border: `0.5px solid ${active ? colors.border2 : "transparent"}`,
                        }}
                      >
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-medium"
                          style={{ background: departure.avatarBg, color: departure.avatarColor }}
                        >
                          {departure.initials}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="text-[12px] font-medium" style={{ color: colors.text }}>
                            {departure.guestName}
                          </div>
                          <div className="text-[10px]" style={{ color: colors.textMuted }}>
                            {departure.roomLabel} · {departure.bookingId}
                          </div>
                        </div>

                        <StatusBadge status={departure.paymentStatus} />
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

          </div>

          {/* ── Right column: Bill panel ──────────────────────────────────── */}
          {selectedDeparture ? (
            <aside
              className="w-[360px] flex-shrink-0 overflow-y-auto rounded-[16px] p-4"
              style={{ background: colors.cream, border: `0.5px solid ${colors.border2}` }}
            >
              {/* Guest header */}
              <div
                className="mb-4 border-b pb-2 text-[10px] font-medium uppercase tracking-[0.12em]"
                style={{ color: colors.textMuted, borderColor: colors.border2 }}
              >
                Guest — {selectedDeparture.guestName} · {selectedDeparture.roomLabel}
              </div>

              <div
                className="mb-4 flex items-center gap-3 rounded-[14px] px-3 py-3"
                style={{ background: colors.cream2, border: `0.5px solid ${colors.border2}` }}
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-[11px] font-medium"
                  style={{ background: selectedDeparture.avatarBg, color: selectedDeparture.avatarColor }}
                >
                  {selectedDeparture.initials}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-[12px] font-medium" style={{ color: colors.text }}>
                    {selectedDeparture.guestName}
                  </div>
                  <div className="text-[10px]" style={{ color: colors.textMuted }}>
                    {selectedDeparture.staySummary}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[9px]" style={{ color: colors.textMuted }}>
                    Booking
                  </div>
                  <div className="text-[12px] font-medium" style={{ color: colors.text }}>
                    {selectedDeparture.bookingId}
                  </div>
                </div>
              </div>

              {/* Bill summary */}
              <div
                className="rounded-[14px] p-4"
                style={{ background: colors.cream2, border: `0.5px solid ${colors.border2}` }}
              >
                <div
                  className="mb-3 border-b pb-2 text-[10px] font-medium uppercase tracking-[0.12em]"
                  style={{ color: colors.textMuted, borderColor: colors.border2 }}
                >
                  Bill summary
                </div>

                <div className="flex flex-col gap-3">
                  {selectedDeparture.billItems.map((item) => (
                    <div key={item.label} className="flex items-center justify-between gap-3 text-[12px]">
                      <span style={{ color: colors.textSub }}>{item.label}</span>
                      <BillTone value={item.amount} tone={item.tone} />
                    </div>
                  ))}
                </div>

                <div
                  className="mt-4 flex items-center justify-between rounded-[12px] px-4 py-4"
                  style={{ background: colors.cream, border: `0.5px solid ${colors.goldLight}` }}
                >
                  <span className="text-[12px] font-medium" style={{ color: colors.textSub }}>
                    Total due
                  </span>
                  <span className="font-display text-[22px]" style={{ color: colors.text }}>
                    EGP {selectedDeparture.totalDue.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Payment method + checkout button — only for pending */}
              {selectedDeparture.paymentStatus === "Pending" && (
                <>
                  <div className="mt-5">
                    <div
                      className="mb-3 text-[10px] font-medium uppercase tracking-[0.12em]"
                      style={{ color: colors.textMuted }}
                    >
                      Payment method
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {PAYMENT_OPTIONS.map((opt) => (
                        <PaymentButton
                          key={opt.value}
                          label={opt.label}
                          active={paymentMethod === opt.value}
                          onClick={() => setPaymentMethod(opt.value)}
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleCheckOut}
                    disabled={checkOutMutation.isPending}
                    className="mt-6 w-full rounded-full py-[10px] text-[12px] font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
                    style={{
                      background: colors.gold,
                      color: "#fff",
                      border: "none",
                      cursor: checkOutMutation.isPending ? "not-allowed" : "pointer",
                    }}
                  >
                    {checkOutMutation.isPending ? "Processing…" : "Confirm check-out"}
                  </button>

                  {checkOutMutation.isError && (
                    <div className="mt-2 text-center text-[11px] text-red-500">
                      {checkOutMutation.error.message}
                    </div>
                  )}
                </>
              )}

              {selectedDeparture.paymentStatus === "Paid" && (
                <div
                  className="mt-5 rounded-[12px] px-4 py-3 text-center text-[11px] font-medium"
                  style={{
                    background: colors.status.available.bg,
                    color: colors.status.available.text,
                    border: `0.5px solid ${colors.status.available.border}`,
                  }}
                >
                  Payment completed — guest checked out
                </div>
              )}
            </aside>
          ) : (
            <aside
              className="flex w-[360px] flex-shrink-0 items-center justify-center rounded-[16px]"
              style={{ background: colors.cream, border: `0.5px solid ${colors.border2}` }}
            >
              <div className="text-center text-[12px]" style={{ color: colors.textMuted }}>
                {departures.length > 0
                  ? "Select a guest to view bill"
                  : "No departures expected today"}
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
