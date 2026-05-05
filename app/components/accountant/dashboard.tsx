"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/utils/trpc/react";
import { colors } from "@/components/dashboard/theme";
import type { User } from "@/lib/auth-client";

interface AccountantDashboardProps {
  user: User;
}

function fmtEgp(n: number) {
  return `EGP ${Math.round(n).toLocaleString("en-US")}`;
}

export function AccountantDashboard({ user }: AccountantDashboardProps) {
  const trpc = useTRPC();

  // ── Queries ─────────────────────────────────────────────────────────
  const { data: monthReport } = useQuery(
    trpc.hotel.reports.getData.queryOptions({ timeRange: "month" }),
  );
  const { data: weekReport } = useQuery(
    trpc.hotel.reports.getData.queryOptions({ timeRange: "week" }),
  );
  const { data: bills = [] } = useQuery(
    trpc.hotel.bookings.bills.queryOptions(),
  );
  const { data: billStats } = useQuery(
    trpc.hotel.bookings.billingStats.queryOptions(),
  );
  const { data: suppliers = [] } = useQuery(
    trpc.hotel.suppliers.list.queryOptions(),
  );

  // ── Derived ─────────────────────────────────────────────────────────
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user.name.split(" ")[0];

  // Pull KPI values out of the report (already computed server-side)
  const monthRevenueKpi = monthReport?.kpis.find(
    (k) => k.label === "Total revenue",
  );
  const weekRevenueKpi = weekReport?.kpis.find(
    (k) => k.label === "Total revenue",
  );
  const monthBookingsKpi = monthReport?.kpis.find(
    (k) => k.label === "Total bookings",
  );

  // Supplier expense totals (sum of all orders, this month vs all-time)
  const monthStart = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
  let supplierExpensesAllTime = 0;
  let supplierOpenOrdersAmt = 0;
  let supplierOpenOrdersCount = 0;
  const flatOrders: {
    supplier: string;
    title: string;
    amount: number;
    status: "Pending" | "Done";
    date: string;
  }[] = [];
  for (const s of suppliers) {
    for (const o of s.orders) {
      supplierExpensesAllTime += o.amount;
      flatOrders.push({
        supplier: s.name,
        title: o.title,
        amount: o.amount,
        status: o.status,
        date: o.date,
      });
      if (o.status === "Pending") {
        supplierOpenOrdersAmt += o.amount;
        supplierOpenOrdersCount += 1;
      }
    }
  }

  // Recent bills (latest 6)
  const recentBills = [...bills]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 6);

  // Recent supplier orders — they come pre-sorted via "1 day ago" relative
  // labels; just take the first 6 from the flattened list.
  const recentOrders = flatOrders.slice(0, 6);

  // Net cash position (bills paid − supplier expenses paid)
  const totalRevenueAllBills = bills.reduce((acc, b) => acc + b.amount, 0);
  const netCash = totalRevenueAllBills - supplierExpensesAllTime;

  // ── Render ──────────────────────────────────────────────────────────
  return (
    <div className="hms-shell flex flex-1 flex-col overflow-hidden">
      <header className="hms-topbar hms-page-header">
        <h1 className="font-display hms-page-title">
          {greeting}, {firstName}
        </h1>
        <span className="hms-date-chip">{dateStr}</span>
      </header>

      <main className="hms-shell hms-page-main">
        <p className="hms-page-caption">Finance · Accountant overview</p>

        {/* KPI grid — finance focus */}
        <div className="hms-kpi-grid">
          <KpiTile
            label="Revenue this month"
            value={monthRevenueKpi?.value ?? "—"}
            sub={monthRevenueKpi?.sub}
            tone={monthRevenueKpi?.subTone}
          />
          <KpiTile
            label="Revenue this week"
            value={weekRevenueKpi?.value ?? "—"}
            sub={weekRevenueKpi?.sub}
            tone={weekRevenueKpi?.subTone}
          />
          <KpiTile
            label="Paid invoices"
            value={billStats ? String(billStats.paidCount) : "—"}
            sub="all time"
          />
          <KpiTile
            label="Pending payments"
            value={billStats ? String(billStats.pendingCount) : "—"}
            sub="awaiting collection"
            tone={
              (billStats?.pendingCount ?? 0) > 0 ? "negative" : "neutral"
            }
          />
        </div>

        <div className="hms-kpi-grid">
          <KpiTile
            label="Supplier expenses"
            value={fmtEgp(supplierExpensesAllTime)}
            sub="all time"
          />
          <KpiTile
            label="Open orders"
            value={String(supplierOpenOrdersCount)}
            sub={fmtEgp(supplierOpenOrdersAmt)}
            tone={supplierOpenOrdersCount > 0 ? "negative" : "neutral"}
          />
          <KpiTile
            label="Net cash position"
            value={fmtEgp(netCash)}
            sub="revenue − expenses"
            tone={netCash >= 0 ? "positive" : "negative"}
          />
          <KpiTile
            label="Bookings this month"
            value={monthBookingsKpi?.value ?? "—"}
            sub={monthBookingsKpi?.sub}
            tone={monthBookingsKpi?.subTone}
          />
        </div>

        {/* Two-column lists */}
        <div className="hms-main-grid">
          <div className="hms-stack-col">
            <Section title="Recent invoices" subtitle="Last 6 bills">
              {recentBills.length === 0 ? (
                <EmptyRow>No bills yet.</EmptyRow>
              ) : (
                recentBills.map((b) => (
                  <Row
                    key={b.id}
                    left={
                      <>
                        <div
                          className="text-[12px] font-medium"
                          style={{ color: colors.text }}
                        >
                          {b.billNumber} · {b.guestName}
                        </div>
                        <div
                          className="text-[10px]"
                          style={{ color: colors.textMuted }}
                        >
                          Room {b.room} ·{" "}
                          {b.paymentMethod === "cash"
                            ? "Cash"
                            : b.paymentMethod === "card"
                              ? "Card"
                              : b.paymentMethod === "bank_transfer"
                                ? "Transfer"
                                : "Online"}
                        </div>
                      </>
                    }
                    right={
                      <div
                        className="text-[12px] font-medium"
                        style={{ color: colors.text }}
                      >
                        {fmtEgp(b.amount)}
                      </div>
                    }
                  />
                ))
              )}
            </Section>

            <Section
              title="Revenue by source — this month"
              subtitle="Top contributors"
            >
              {(monthReport?.revenueSources ?? []).length === 0 ? (
                <EmptyRow>No revenue this month yet.</EmptyRow>
              ) : (
                (monthReport?.revenueSources ?? []).slice(0, 6).map((s) => (
                  <Row
                    key={s.label}
                    left={
                      <div
                        className="text-[12px]"
                        style={{ color: colors.textSub }}
                      >
                        {s.label}
                      </div>
                    }
                    right={
                      <div
                        className="text-[12px] font-medium"
                        style={{ color: colors.text }}
                      >
                        {fmtEgp(s.amount)}
                      </div>
                    }
                  />
                ))
              )}
            </Section>
          </div>

          <div className="hms-stack-col">
            <Section title="Recent supplier orders" subtitle="Last 6 orders">
              {recentOrders.length === 0 ? (
                <EmptyRow>No supplier orders yet.</EmptyRow>
              ) : (
                recentOrders.map((o, i) => (
                  <Row
                    key={`${o.supplier}-${i}`}
                    left={
                      <>
                        <div
                          className="text-[12px] font-medium"
                          style={{ color: colors.text }}
                        >
                          {o.title}
                        </div>
                        <div
                          className="text-[10px]"
                          style={{ color: colors.textMuted }}
                        >
                          {o.supplier} · {o.date}
                        </div>
                      </>
                    }
                    right={
                      <div className="flex flex-col items-end gap-1">
                        <div
                          className="text-[12px] font-medium"
                          style={{ color: colors.text }}
                        >
                          {fmtEgp(o.amount)}
                        </div>
                        <span
                          className="rounded-full px-2 py-[1px] text-[9px] font-medium"
                          style={{
                            background:
                              o.status === "Pending"
                                ? "rgba(212,176,122,0.18)"
                                : "rgba(151,196,89,0.18)",
                            color:
                              o.status === "Pending" ? "#8E5A10" : "#3B6D11",
                          }}
                        >
                          {o.status}
                        </span>
                      </div>
                    }
                  />
                ))
              )}
            </Section>

            <Section title="Booking summary — this month" subtitle="Status mix">
              {(monthReport?.bookingSummary ?? []).map((row) => (
                <Row
                  key={row.label}
                  left={
                    <div
                      className="text-[12px]"
                      style={{ color: colors.textSub }}
                    >
                      {row.label}
                    </div>
                  }
                  right={
                    <div
                      className="text-[12px] font-medium"
                      style={{
                        color:
                          row.tone === "positive"
                            ? "#3B6D11"
                            : row.tone === "negative"
                              ? "#993C1D"
                              : row.tone === "gold"
                                ? colors.gold
                                : colors.text,
                      }}
                    >
                      {row.value}
                    </div>
                  }
                />
              ))}
            </Section>
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Small UI helpers ──────────────────────────────────────────────────

function KpiTile({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "positive" | "negative" | "neutral";
}) {
  const subColor =
    tone === "positive"
      ? "#3B6D11"
      : tone === "negative"
        ? "#993C1D"
        : colors.textMuted;
  return (
    <div
      className="rounded-[16px] p-4"
      style={{
        background: colors.cream2,
        border: `0.5px solid ${colors.border2}`,
      }}
    >
      <div
        className="text-[10px] font-medium uppercase tracking-[0.12em]"
        style={{ color: colors.textMuted }}
      >
        {label}
      </div>
      <div
        className="font-display mt-2 text-[22px]"
        style={{ color: colors.text }}
      >
        {value}
      </div>
      {sub ? (
        <div className="mt-1 text-[11px]" style={{ color: subColor }}>
          {sub}
        </div>
      ) : null}
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="rounded-[16px] p-4"
      style={{
        background: colors.cream2,
        border: `0.5px solid ${colors.border2}`,
      }}
    >
      <div className="mb-3 flex items-end justify-between">
        <h2
          className="text-[12px] font-medium"
          style={{ color: colors.text }}
        >
          {title}
        </h2>
        {subtitle ? (
          <span
            className="text-[10px] uppercase tracking-[0.12em]"
            style={{ color: colors.textMuted }}
          >
            {subtitle}
          </span>
        ) : null}
      </div>
      <div className="flex flex-col">{children}</div>
    </section>
  );
}

function Row({
  left,
  right,
}: {
  left: React.ReactNode;
  right: React.ReactNode;
}) {
  return (
    <div
      className="flex items-center justify-between gap-3 py-2"
      style={{ borderBottom: `0.5px solid ${colors.border2}` }}
    >
      <div className="min-w-0 flex-1">{left}</div>
      <div className="flex-shrink-0">{right}</div>
    </div>
  );
}

function EmptyRow({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="py-3 text-center text-[12px]"
      style={{ color: colors.textMuted }}
    >
      {children}
    </div>
  );
}
