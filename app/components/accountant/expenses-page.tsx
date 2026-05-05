"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/utils/trpc/react";
import { colors } from "@/components/dashboard/theme";

function fmtEgp(n: number) {
  return `EGP ${Math.round(n).toLocaleString("en-US")}`;
}

export function AccountantExpensesPage() {
  const trpc = useTRPC();
  const { data: suppliers = [], isLoading } = useQuery(
    trpc.hotel.suppliers.list.queryOptions(),
  );

  const [filter, setFilter] = useState<"all" | "pending" | "done">("all");

  const flatOrders = useMemo(() => {
    const rows: {
      key: string;
      supplier: string;
      category: string;
      title: string;
      amount: number;
      status: "Pending" | "Done";
      date: string;
    }[] = [];
    for (const s of suppliers) {
      for (const o of s.orders) {
        rows.push({
          key: `${s.id}-${o.id}`,
          supplier: s.name,
          category: s.category,
          title: o.title,
          amount: o.amount,
          status: o.status,
          date: o.date,
        });
      }
    }
    return rows;
  }, [suppliers]);

  const visible = flatOrders.filter((o) => {
    if (filter === "all") return true;
    if (filter === "pending") return o.status === "Pending";
    if (filter === "done") return o.status === "Done";
    return true;
  });

  const totalAll = flatOrders.reduce((acc, o) => acc + o.amount, 0);
  const totalPending = flatOrders
    .filter((o) => o.status === "Pending")
    .reduce((acc, o) => acc + o.amount, 0);
  const totalDone = flatOrders
    .filter((o) => o.status === "Done")
    .reduce((acc, o) => acc + o.amount, 0);

  // Per-supplier totals
  const perSupplier = useMemo(() => {
    return [...suppliers]
      .map((s) => ({
        id: s.id,
        name: s.name,
        category: s.category,
        total: s.orders.reduce((a, o) => a + o.amount, 0),
        count: s.orders.length,
      }))
      .filter((s) => s.count > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }, [suppliers]);

  function exportCsv() {
    const header = ["Supplier", "Category", "Title", "Amount", "Status", "Date"];
    const rows = flatOrders.map((o) => [
      o.supplier,
      o.category,
      o.title,
      o.amount.toFixed(2),
      o.status,
      o.date,
    ]);
    const csv = [header, ...rows]
      .map((r) =>
        r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "supplier-expenses.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="hms-shell flex flex-1 flex-col overflow-hidden">
      <header className="hms-topbar flex items-center justify-between px-5 py-[13px]">
        <h1
          className="font-display text-[17px]"
          style={{ color: colors.text }}
        >
          Expenses
        </h1>
        <button
          type="button"
          onClick={exportCsv}
          disabled={flatOrders.length === 0}
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

      <main className="flex flex-1 flex-col gap-4 overflow-y-auto p-[18px]">
        {/* Summary tiles */}
        <div className="grid grid-cols-3 gap-[10px]">
          <Tile label="Total expenses" value={fmtEgp(totalAll)} />
          <Tile
            label="Pending"
            value={fmtEgp(totalPending)}
            accent="#993C1D"
          />
          <Tile label="Settled" value={fmtEgp(totalDone)} accent="#3B6D11" />
        </div>

        <div className="grid grid-cols-[1.5fr_1fr] gap-4">
          {/* Orders table */}
          <section
            className="overflow-hidden rounded-[16px]"
            style={{
              background: colors.cream2,
              border: `0.5px solid ${colors.border2}`,
            }}
          >
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: `0.5px solid ${colors.border2}` }}
            >
              <h2
                className="text-[12px] font-medium"
                style={{ color: colors.text }}
              >
                All supplier orders
              </h2>
              <div className="flex items-center gap-2">
                {(["all", "pending", "done"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    className="rounded-full px-3 py-[4px] text-[10px] font-medium uppercase tracking-[0.1em]"
                    style={{
                      background:
                        filter === f
                          ? colors.gold
                          : "rgba(184,150,90,0.10)",
                      color: filter === f ? "#fff" : colors.textSub,
                      border: `0.5px solid ${colors.border2}`,
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div
              className="grid px-4 py-2 text-[10px] font-medium uppercase tracking-[0.12em]"
              style={{
                color: colors.textMuted,
                borderBottom: `0.5px solid ${colors.border2}`,
                gridTemplateColumns: "1.4fr 1fr 100px 90px 80px",
              }}
            >
              <div>Supplier</div>
              <div>Item</div>
              <div>Date</div>
              <div className="text-right">Amount</div>
              <div className="text-right">Status</div>
            </div>

            {isLoading ? (
              <div
                className="px-4 py-6 text-center text-[12px]"
                style={{ color: colors.textMuted }}
              >
                Loading…
              </div>
            ) : visible.length === 0 ? (
              <div
                className="px-4 py-6 text-center text-[12px]"
                style={{ color: colors.textMuted }}
              >
                No orders match this filter.
              </div>
            ) : (
              visible.map((o) => (
                <div
                  key={o.key}
                  className="grid items-center px-4 py-3"
                  style={{
                    borderBottom: `0.5px solid ${colors.border2}`,
                    gridTemplateColumns: "1.4fr 1fr 100px 90px 80px",
                  }}
                >
                  <div>
                    <div
                      className="text-[12px] font-medium"
                      style={{ color: colors.text }}
                    >
                      {o.supplier}
                    </div>
                    <div
                      className="text-[10px]"
                      style={{ color: colors.textMuted }}
                    >
                      {o.category}
                    </div>
                  </div>
                  <div className="text-[12px]" style={{ color: colors.text }}>
                    {o.title}
                  </div>
                  <div
                    className="text-[11px]"
                    style={{ color: colors.textMuted }}
                  >
                    {o.date}
                  </div>
                  <div
                    className="text-right text-[12px] font-medium"
                    style={{ color: colors.text }}
                  >
                    {fmtEgp(o.amount)}
                  </div>
                  <div className="text-right">
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
                </div>
              ))
            )}
          </section>

          {/* Per-supplier breakdown */}
          <section
            className="rounded-[16px] p-4"
            style={{
              background: colors.cream2,
              border: `0.5px solid ${colors.border2}`,
            }}
          >
            <h3
              className="mb-4 text-[12px] font-medium"
              style={{ color: colors.text }}
            >
              Top suppliers by spend
            </h3>
            <div className="flex flex-col gap-3">
              {perSupplier.length === 0 ? (
                <div
                  className="py-3 text-center text-[12px]"
                  style={{ color: colors.textMuted }}
                >
                  No supplier spend yet.
                </div>
              ) : (
                perSupplier.map((s) => {
                  const max = perSupplier[0]?.total || 1;
                  const pct = (s.total / max) * 100;
                  return (
                    <div
                      key={s.id}
                      className="grid grid-cols-[1fr_90px] items-center gap-3"
                    >
                      <div>
                        <div
                          className="text-[12px] font-medium"
                          style={{ color: colors.text }}
                        >
                          {s.name}
                        </div>
                        <div
                          className="text-[10px]"
                          style={{ color: colors.textMuted }}
                        >
                          {s.category} · {s.count} order
                          {s.count !== 1 ? "s" : ""}
                        </div>
                        <div
                          className="mt-1 rounded-full"
                          style={{
                            height: 6,
                            background: "rgba(184,150,90,0.12)",
                          }}
                        >
                          <div
                            className="rounded-full"
                            style={{
                              width: `${pct}%`,
                              height: 6,
                              background: colors.gold,
                            }}
                          />
                        </div>
                      </div>
                      <div
                        className="text-right text-[12px] font-medium"
                        style={{ color: colors.gold }}
                      >
                        {fmtEgp(s.total)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function Tile({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
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
        style={{ color: accent ?? colors.text }}
      >
        {value}
      </div>
    </div>
  );
}
