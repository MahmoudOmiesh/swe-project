"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/utils/trpc/react";
import { colors } from "@/components/dashboard/theme";
import { BillingSummaryCard } from "./billing-summary-card";
import { InvoiceStatus } from "./invoice-status";

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(n: number) {
  return `EGP ${n.toLocaleString("en-EG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function BillingPage() {
  const trpc = useTRPC();

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data: bills = [], isLoading } = useQuery(
    trpc.receptionist.bookings.bills.queryOptions(),
  );

  const { data: stats } = useQuery(
    trpc.receptionist.bookings.billingStats.queryOptions(),
  );

  // ── Local state ────────────────────────────────────────────────────────────
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const selectedInvoice = bills.find((b) => b.id === selectedId) ?? null;

  // Auto-select first bill when data loads
  useEffect(() => {
    if (bills.length > 0 && !bills.find((b) => b.id === selectedId)) {
      setSelectedId(bills[0].id);
    }
  }, [bills, selectedId]);

  // ── Export CSV ─────────────────────────────────────────────────────────────
  function handleExportCsv() {
    const header = ["Bill #", "Guest", "Room", "Amount", "Status", "Booking ID", "Payment Method"];
    const rows = bills.map((bill) => [
      bill.billNumber,
      bill.guestName,
      bill.room,
      bill.amount.toFixed(2),
      bill.status,
      bill.bookingId,
      bill.paymentMethod,
    ]);

    const csv = [header, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "billing-data.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  // ── Summary cards ──────────────────────────────────────────────────────────
  const summaryCards = [
    {
      label: "Revenue this week",
      value: stats ? formatCurrency(stats.revenueThisWeek) : "—",
    },
    {
      label: "Paid invoices",
      value: stats ? String(stats.paidCount) : "—",
      accent: colors.status.available.text,
    },
    {
      label: "Pending payments",
      value: stats ? String(stats.pendingCount) : "—",
      accent: colors.status.maintenance.text,
    },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="hms-shell flex flex-1 flex-col overflow-hidden">
      <header className="hms-topbar flex items-center justify-between px-5 py-[13px]">
        <h1 className="font-display text-[17px]" style={{ color: colors.text }}>
          Billing
        </h1>

        <button
          type="button"
          onClick={handleExportCsv}
          disabled={bills.length === 0}
          className="rounded-full px-4 py-[8px] text-[11px] font-medium disabled:opacity-50"
          style={{
            background: colors.cream,
            border: `0.5px solid ${colors.border2}`,
            color: colors.textSub,
          }}
        >
          Export CSV
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 gap-4 overflow-y-auto p-[18px]">
          {/* ── Left column ────────────────────────────────────────────── */}
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-[10px]">
              {summaryCards.map((item) => (
                <BillingSummaryCard
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  accent={item.accent}
                />
              ))}
            </div>

            {/* Invoice table */}
            <section
              className="overflow-hidden rounded-[16px]"
              style={{ background: colors.cream2, border: `0.5px solid ${colors.border2}` }}
            >
              <div
                className="grid px-4 py-3 text-[10px] font-medium uppercase tracking-[0.12em]"
                style={{
                  color: colors.textMuted,
                  borderBottom: `0.5px solid ${colors.border2}`,
                  gridTemplateColumns: "90px 1.3fr 80px 120px",
                }}
              >
                <div>Bill #</div>
                <div>Guest</div>
                <div>Room</div>
                <div>Amount</div>
              </div>

              {isLoading ? (
                <div
                  className="px-4 py-6 text-center text-[12px]"
                  style={{ color: colors.textMuted }}
                >
                  Loading bills…
                </div>
              ) : bills.length === 0 ? (
                <div
                  className="px-4 py-6 text-center text-[12px]"
                  style={{ color: colors.textMuted }}
                >
                  No bills yet
                </div>
              ) : (
                bills.map((invoice) => {
                  const active = selectedId === invoice.id;
                  return (
                    <button
                      key={invoice.id}
                      onClick={() => setSelectedId(invoice.id)}
                      className="grid w-full items-center px-4 py-3 text-left"
                      style={{
                        gridTemplateColumns: "90px 1.3fr 80px 120px",
                        background: active ? colors.cream : "transparent",
                        borderLeft: active
                          ? `2px solid ${colors.gold}`
                          : "2px solid transparent",
                        borderBottom: `0.5px solid ${colors.border2}`,
                      }}
                    >
                      <div className="text-[12px]" style={{ color: colors.textSub }}>
                        {invoice.billNumber}
                      </div>
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-7 w-7 items-center justify-center rounded-full text-[9px] font-medium"
                          style={{ background: invoice.avatarBg, color: invoice.avatarColor }}
                        >
                          {invoice.initials}
                        </div>
                        <div className="text-[12px] font-medium" style={{ color: colors.text }}>
                          {invoice.guestName}
                        </div>
                      </div>
                      <div className="text-[12px]" style={{ color: colors.text }}>
                        {invoice.room}
                      </div>
                      <div className="text-[12px] font-medium" style={{ color: colors.text }}>
                        EGP {invoice.amount.toFixed(2)}
                      </div>
                    </button>
                  );
                })
              )}
            </section>
          </div>

          {/* ── Right column: Invoice detail ───────────────────────────── */}
          {selectedInvoice ? (
            <aside
              className="w-[360px] flex-shrink-0 overflow-y-auto rounded-[16px] p-4"
              style={{ background: colors.cream, border: `0.5px solid ${colors.border2}` }}
            >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h2 className="font-display text-[18px]" style={{ color: colors.text }}>
                    Bill {selectedInvoice.billNumber}
                  </h2>
                  <div className="text-[11px]" style={{ color: colors.textMuted }}>
                    {selectedInvoice.guestName} · {selectedInvoice.bookingId}
                  </div>
                </div>
                <InvoiceStatus status={selectedInvoice.status} />
              </div>

              <div
                className="mb-3 border-b pb-2 text-[10px] font-medium uppercase tracking-[0.12em]"
                style={{ color: colors.textMuted, borderColor: colors.border2 }}
              >
                Breakdown
              </div>

              <div className="flex flex-col gap-3">
                {selectedInvoice.lineItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-3 text-[12px]"
                  >
                    <span style={{ color: colors.textSub }}>{item.label}</span>
                    <span
                      style={{
                        color:
                          item.tone === "success"
                            ? colors.status.available.text
                            : colors.text,
                        fontWeight: item.tone === "success" ? 500 : 400,
                      }}
                    >
                      EGP {item.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div
                className="mt-4 flex items-center justify-between rounded-[12px] px-4 py-4"
                style={{ background: colors.goldPale, border: `0.5px solid ${colors.goldLight}` }}
              >
                <span className="text-[12px] font-medium" style={{ color: colors.textSub }}>
                  Total
                </span>
                <span className="font-display text-[22px]" style={{ color: colors.text }}>
                  EGP {selectedInvoice.amount.toFixed(2)}
                </span>
              </div>

              <div className="mt-5">
                <div
                  className="mb-3 text-[10px] font-medium uppercase tracking-[0.12em]"
                  style={{ color: colors.textMuted }}
                >
                  Payment method
                </div>
                <div
                  className="rounded-[12px] px-4 py-3 text-[12px]"
                  style={{
                    background: colors.cream2,
                    border: `0.5px solid ${colors.border2}`,
                    color: colors.text,
                  }}
                >
                  {selectedInvoice.paymentMethod === "cash" && "Cash"}
                  {selectedInvoice.paymentMethod === "card" && "Credit / Debit card"}
                  {selectedInvoice.paymentMethod === "bank_transfer" && "Bank transfer"}
                  {selectedInvoice.paymentMethod === "other" && "Online payment"}
                </div>
              </div>
            </aside>
          ) : (
            <aside
              className="flex w-[360px] flex-shrink-0 items-center justify-center rounded-[16px]"
              style={{ background: colors.cream, border: `0.5px solid ${colors.border2}` }}
            >
              <div className="text-center text-[12px]" style={{ color: colors.textMuted }}>
                {bills.length > 0
                  ? "Select a bill to view details"
                  : "No bills to display"}
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
