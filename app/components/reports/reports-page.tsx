"use client";

import { useState } from "react";
import { colors } from "@/components/dashboard/theme";
import { BOOKING_SUMMARY, DAILY_REVENUE, FLOOR_OCCUPANCY, HOUSEKEEPING_SUMMARY, REPORT_KPIS, REVENUE_SOURCES, TOP_ROOMS } from "./mock-data";
import { KpiCard } from "./kpi-card";
import { SummaryTable } from "./summary-table";

export function ReportsPage() {
  const [timeRange, setTimeRange] = useState("This week");
  const maxRevenue = Math.max(...DAILY_REVENUE.map((item) => item.amount));
  const maxSource = Math.max(...REVENUE_SOURCES.map((item) => item.amount));
  const chartMaxHeight = 84;

  const handleExportPdf = async () => {
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    let y = 40;

    pdf.setFontSize(18);
    pdf.text(`Hotel Reports - ${timeRange}`, 40, y);
    y += 24;

    pdf.setFontSize(11);
    REPORT_KPIS.forEach((item) => {
      pdf.text(`${item.label}: ${item.value} (${item.sub})`, 40, y);
      y += 18;
    });

    y += 10;
    pdf.text("Daily revenue", 40, y);
    y += 18;
    DAILY_REVENUE.forEach((item) => {
      pdf.text(`${item.day}: EGP ${item.amount.toLocaleString()}`, 50, y);
      y += 16;
    });

    y += 10;
    pdf.text("Occupancy by floor", 40, y);
    y += 18;
    FLOOR_OCCUPANCY.forEach((item) => {
      pdf.text(`${item.floor}: ${item.percent}% (${item.ratio})`, 50, y);
      y += 16;
    });

    y += 10;
    pdf.text("Revenue by source", 40, y);
    y += 18;
    REVENUE_SOURCES.forEach((item) => {
      pdf.text(`${item.label}: EGP ${item.amount.toLocaleString()}`, 50, y);
      y += 16;
    });

    y += 10;
    pdf.text("Top performing rooms", 40, y);
    y += 18;
    TOP_ROOMS.forEach((room) => {
      pdf.text(`${room.room} - ${room.details} - EGP ${room.amount.toLocaleString()}`, 50, y);
      y += 16;
    });

    y += 10;
    pdf.text("Booking summary", 40, y);
    y += 18;
    BOOKING_SUMMARY.forEach((row) => {
      pdf.text(`${row.label}: ${row.value}`, 50, y);
      y += 16;
    });

    y += 10;
    pdf.text("Housekeeping summary", 40, y);
    y += 18;
    HOUSEKEEPING_SUMMARY.forEach((row) => {
      pdf.text(`${row.label}: ${row.value}`, 50, y);
      y += 16;
    });

    pdf.save("reports-summary.pdf");
  };

  return (
    <div className="hms-shell flex flex-1 flex-col overflow-hidden">
      <header className="hms-topbar flex items-center justify-between px-5 py-[13px]">
        <h1 className="font-display text-[17px]" style={{ color: colors.text }}>Reports</h1>
        <div className="flex items-center gap-2">
          <select value={timeRange} onChange={(event) => setTimeRange(event.target.value)} className="rounded-full px-4 py-[8px] text-[11px] outline-none" style={{ background: colors.cream2, border: `0.5px solid ${colors.border2}`, color: colors.textSub }}>
            <option>This week</option>
            <option>This month</option>
          </select>
          <button type="button" onClick={handleExportPdf} className="rounded-full px-4 py-[8px] text-[11px] font-medium" style={{ background: colors.gold, color: "#fff", border: "none" }}>
            Export PDF
          </button>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 overflow-y-auto p-[18px]">
        <div className="grid grid-cols-4 gap-[10px]">
          {REPORT_KPIS.map((item) => <KpiCard key={item.label} {...item} />)}
        </div>

        <div className="grid grid-cols-[1.35fr_1fr] gap-4">
          <section className="rounded-[16px] px-4 pt-4 pb-4" style={{ background: colors.cream2, border: `0.5px solid ${colors.border2}` }}>
            <div className="mb-[18px] flex items-center justify-between">
              <h2 className="text-[12px] font-medium" style={{ color: colors.text }}>Daily revenue — this week</h2>
              <span className="text-[11px]" style={{ color: colors.textMuted }}>EGP</span>
            </div>

            <div className="px-[2px]">
              <div className="flex h-[98px] items-end gap-[4px]">
                {DAILY_REVENUE.map((item) => (
                  <div key={item.day} className="flex flex-1 flex-col items-center gap-[3px]">
                    <div className="w-full rounded-t-[4px]" style={{ height: `${(item.amount / maxRevenue) * chartMaxHeight}px`, background: item.highlighted ? colors.gold : "#D6BF8D" }} />
                    <div className="text-[10px] leading-none" style={{ color: colors.textMuted }}>{item.day}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-[22px] flex items-center justify-between text-[12px]">
              <div>
                <div style={{ color: colors.textMuted }}>Peak day</div>
                <div style={{ color: colors.text, fontWeight: 500 }}>Wednesday — EGP 8,400</div>
              </div>
              <div className="text-right">
                <div style={{ color: colors.textMuted }}>Lowest day</div>
                <div style={{ color: colors.text, fontWeight: 500 }}>Tuesday — EGP 4,200</div>
              </div>
            </div>
          </section>

          <div className="flex flex-col gap-4">
            <section className="rounded-[16px] p-4" style={{ background: colors.cream2, border: `0.5px solid ${colors.border2}` }}>
              <h3 className="mb-4 text-[12px] font-medium" style={{ color: colors.text }}>Occupancy by floor</h3>
              <div className="flex flex-col gap-3">
                {FLOOR_OCCUPANCY.map((item) => (
                  <div key={item.floor} className="grid grid-cols-[28px_1fr_80px] items-center gap-3">
                    <span className="text-[11px]" style={{ color: colors.textSub }}>{item.floor}</span>
                    <div className="rounded-full" style={{ height: 8, background: "rgba(184,150,90,0.12)" }}>
                      <div className="rounded-full" style={{ width: `${item.percent}%`, height: 8, background: colors.gold }} />
                    </div>
                    <span className="text-right text-[11px]" style={{ color: colors.textMuted }}>{item.percent}% — {item.ratio}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[16px] p-4" style={{ background: colors.cream2, border: `0.5px solid ${colors.border2}` }}>
              <h3 className="mb-4 text-[12px] font-medium" style={{ color: colors.text }}>Revenue by source</h3>
              <div className="flex flex-col gap-3">
                {REVENUE_SOURCES.map((item) => (
                  <div key={item.label} className="grid grid-cols-[90px_1fr_90px] items-center gap-3">
                    <span className="text-[11px]" style={{ color: colors.textSub }}>{item.label}</span>
                    <div className="rounded-full" style={{ height: 8, background: "rgba(184,150,90,0.12)" }}>
                      <div className="rounded-full" style={{ width: `${(item.amount / maxSource) * 100}%`, height: 8, background: item.color }} />
                    </div>
                    <span className="text-right text-[11px]" style={{ color: colors.textMuted }}>EGP {item.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_1fr_1fr] gap-4">
          <section className="rounded-[16px] p-4" style={{ background: colors.cream2, border: `0.5px solid ${colors.border2}` }}>
            <h3 className="mb-4 text-[12px] font-medium" style={{ color: colors.text }}>Top performing rooms</h3>
            <div className="flex flex-col gap-3">
              {TOP_ROOMS.map((room) => (
                <div key={room.room} className="grid grid-cols-[40px_1fr_90px] items-center gap-3 border-b pb-2 last:border-b-0 last:pb-0" style={{ borderColor: colors.border2 }}>
                  <div className="text-[24px] font-light" style={{ color: colors.text }}>{room.room}</div>
                  <div>
                    <div className="text-[12px] font-medium" style={{ color: colors.text }}>{room.details}</div>
                    <div className="text-[10px]" style={{ color: colors.textMuted }}>{room.guest}</div>
                  </div>
                  <div className="text-right text-[12px] font-medium" style={{ color: colors.gold }}>EGP {room.amount.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </section>

          <SummaryTable title="Booking summary" rows={BOOKING_SUMMARY} />
          <SummaryTable title="Housekeeping summary" rows={HOUSEKEEPING_SUMMARY} />
        </div>
      </main>
    </div>
  );
}

