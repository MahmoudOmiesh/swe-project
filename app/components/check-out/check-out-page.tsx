"use client";

import { useState } from "react";
import { colors } from "@/components/dashboard/theme";
import { FrontDeskTabs } from "@/components/ui/front-desk-tabs";
import { BillTone } from "./bill-tone";
import { CHECK_OUT_ALERTS, CHECK_OUT_DEPARTURES, type DepartureRecord } from "./mock-data";
import { PaymentButton } from "./payment-button";
import { StatusBadge } from "./status-badge";

interface CheckOutPageProps {
  basePath: string;
}

export function CheckOutPage({ basePath }: CheckOutPageProps) {
  const [selectedDeparture, setSelectedDeparture] = useState<DepartureRecord>(CHECK_OUT_DEPARTURES[0]);
  const [paymentMethod, setPaymentMethod] = useState("Cash");

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
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <section
              className="rounded-[14px] p-4"
              style={{ background: colors.cream2, border: `0.5px solid ${colors.border2}` }}
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-[12px] font-medium" style={{ color: colors.text }}>
                  Today's departures
                </h2>
                <span className="text-[11px]" style={{ color: colors.textMuted }}>
                  4 guests
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {CHECK_OUT_DEPARTURES.map((departure) => {
                  const active = selectedDeparture.id === departure.id;

                  return (
                    <button
                      key={departure.id}
                      onClick={() => setSelectedDeparture(departure)}
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
            </section>

            <section
              className="rounded-[14px] p-4"
              style={{ background: colors.cream2, border: `0.5px solid ${colors.border2}` }}
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-[12px] font-medium" style={{ color: colors.text }}>
                  Late checkout alerts
                </h2>
                <span className="text-[11px]" style={{ color: colors.textMuted }}>
                  1 active
                </span>
              </div>

              {CHECK_OUT_ALERTS.map((alert) => (
                <div
                  key={alert.id}
                  className="rounded-[12px] px-3 py-3 text-[11px]"
                  style={{ background: colors.cream, border: `0.5px solid ${colors.border2}`, color: colors.textSub }}
                >
                  {alert.message}
                </div>
              ))}
            </section>
          </div>

          <aside
            className="w-[360px] flex-shrink-0 rounded-[16px] p-4"
            style={{ background: colors.cream, border: `0.5px solid ${colors.border2}` }}
          >
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
                  {selectedDeparture.nationality} · {selectedDeparture.staySummary}
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

            <div className="mt-5">
              <div
                className="mb-3 text-[10px] font-medium uppercase tracking-[0.12em]"
                style={{ color: colors.textMuted }}
              >
                Payment method
              </div>

              <div className="grid grid-cols-2 gap-2">
                {["Cash", "Credit / Debit card", "Bank transfer", "Online payment"].map((method) => (
                  <PaymentButton
                    key={method}
                    label={method}
                    active={paymentMethod === method}
                    onClick={() => setPaymentMethod(method)}
                  />
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

