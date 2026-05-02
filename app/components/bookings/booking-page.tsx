"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/utils/trpc/react";
import { colors } from "@/components/dashboard/theme";
import type { BookingStatus, Booking } from "./mock-data";
import { BookingRow, COL_WIDTHS } from "./booking-row";
import { BookingDetailPanel } from "./booking-detail-panel";
import { NewBookingPanel } from "./new-booking-panel";

// ─── Status filter config ─────────────────────────────────────────────────────

const STATUS_FILTERS: { label: string; value: BookingStatus | "all" }[] = [
  { label: "All",         value: "all"         },
  { label: "New",         value: "new"         },
  { label: "Checked In",  value: "checked-in"  },
  { label: "Checked Out", value: "checked-out" },
  { label: "Cancelled",   value: "cancelled"   },
];

// ─── Table header columns ─────────────────────────────────────────────────────

const TABLE_HEADERS = ["ID", "Guest", "Room", "Check-in", "Check-out", "Status"];

// ─── Small reusable pieces ────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: number;
  valueColor?: string;
}) {
  return (
    <div
      className="rounded-[10px] p-[10px] text-center"
      style={{ background: colors.cream2, border: `0.5px solid ${colors.border2}` }}
    >
      <div
        className="font-display text-[20px] leading-none"
        style={{ color: valueColor ?? colors.text }}
      >
        {value}
      </div>
      <div
        className="mt-[3px] text-[9px] uppercase tracking-[0.08em]"
        style={{ color: colors.textMuted }}
      >
        {label}
      </div>
    </div>
  );
}

function FilterPill({
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
      onClick={onClick}
      className="rounded-full px-3 py-1 text-[10px] transition-all"
      style={{
        background:  active ? colors.gold : "transparent",
        color:       active ? "#fff" : colors.textSub,
        border:      `0.5px solid ${active ? colors.gold : colors.border}`,
        fontFamily:  "inherit",
        cursor:      "pointer",
      }}
    >
      {label}
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface BookingsPageProps {
  basePath: string;
}

type PanelMode = "detail" | "new" | null;

export function BookingsPage({ basePath }: BookingsPageProps) {
  const trpc = useTRPC();

  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
  const [search,       setSearch]       = useState("");
  const [selected,     setSelected]     = useState<Booking | null>(null);
  const [panelMode,    setPanelMode]    = useState<PanelMode>(null);

  // Backend queries
  const listInput = {
    ...(statusFilter !== "all" ? { status: statusFilter } : {}),
    ...(search.trim() ? { search: search.trim() } : {}),
  };

  const { data: bookings = [], isLoading: isLoadingList } = useQuery(
    trpc.receptionist.bookings.list.queryOptions(
      Object.keys(listInput).length > 0 ? listInput : undefined,
    ),
  );

  const { data: stats } = useQuery(
    trpc.receptionist.bookings.stats.queryOptions(),
  );

  function handleSelectBooking(booking: Booking) {
    if (selected?.id === booking.id && panelMode === "detail") {
      setSelected(null);
      setPanelMode(null);
    } else {
      setSelected(booking);
      setPanelMode("detail");
    }
  }

  function handleNewBooking() {
    setSelected(null);
    setPanelMode("new");
  }

  function handleClosePanel() {
    setSelected(null);
    setPanelMode(null);
  }

  return (
    <div className="hms-shell flex flex-1 flex-col overflow-hidden">
      {/* Topbar */}
      <header className="hms-topbar flex flex-shrink-0 items-center justify-between px-5 py-[13px]">
        <h1 className="font-display text-[17px]" style={{ color: colors.text }}>
          Bookings
        </h1>
        <button
          onClick={handleNewBooking}
          className="rounded-full px-[14px] py-[6px] text-[11px] font-medium transition-opacity hover:opacity-80"
          style={{
            background: colors.gold,
            color:      "#fff",
            border:     "none",
            fontFamily: "inherit",
            cursor:     "pointer",
          }}
        >
          + New booking
        </button>
      </header>

      {/* Body */}
      <div className="hms-shell flex flex-1 overflow-hidden">
        {/* Left — table */}
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-[18px]">
          {/* Summary */}
          <div className="grid grid-cols-4 gap-[9px]">
            <SummaryCard label="Total"       value={stats?.total ?? 0}                                               />
            <SummaryCard label="Checked In"  value={stats?.checkedIn ?? 0}  valueColor={colors.status.available.text}   />
            <SummaryCard label="New"         value={stats?.new ?? 0}        valueColor={colors.status.occupied.text}    />
            <SummaryCard label="Cancelled"   value={stats?.cancelled ?? 0}  valueColor={colors.status.maintenance.text} />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search guest, room, ID…"
              className="w-[200px] rounded-full px-3 py-[5px] text-[11px] outline-none"
              style={{
                background: colors.cream2,
                border:     `0.5px solid ${colors.border}`,
                color:      colors.text,
                fontFamily: "inherit",
              }}
            />
            {STATUS_FILTERS.map((f) => (
              <FilterPill
                key={f.value}
                label={f.label}
                active={statusFilter === f.value}
                onClick={() => setStatusFilter(f.value)}
              />
            ))}
          </div>

          {/* Table */}
          <div
            className="overflow-hidden rounded-[10px]"
            style={{ background: colors.cream2, border: `0.5px solid ${colors.border2}` }}
          >
            {/* Table header */}
            <div
              className="grid px-[14px] py-[9px]"
              style={{
                gridTemplateColumns: COL_WIDTHS,
                borderBottom:        `0.5px solid ${colors.border2}`,
                background:          colors.cream,
              }}
            >
              {TABLE_HEADERS.map((h) => (
                <div
                  key={h}
                  className="text-[9px] font-medium uppercase tracking-[0.1em]"
                  style={{ color: colors.textMuted }}
                >
                  {h}
                </div>
              ))}
            </div>

            {/* Rows */}
            {isLoadingList ? (
              <div
                className="py-8 text-center text-[12px]"
                style={{ color: colors.textMuted }}
              >
                Loading bookings…
              </div>
            ) : bookings.length === 0 ? (
              <div
                className="py-8 text-center text-[12px]"
                style={{ color: colors.textMuted }}
              >
                No bookings match your filters.
              </div>
            ) : (
              bookings.map((booking) => (
                <BookingRow
                  key={booking.id}
                  booking={booking}
                  isSelected={selected?.id === booking.id}
                  onClick={handleSelectBooking}
                />
              ))
            )}
          </div>
        </div>

        {/* Right — detail or new booking panel */}
        {panelMode === "detail" && selected && (
          <BookingDetailPanel
            booking={selected}
            onClose={handleClosePanel}
          />
        )}
        {panelMode === "new" && (
          <NewBookingPanel onClose={handleClosePanel} />
        )}
      </div>
    </div>
  );
}
