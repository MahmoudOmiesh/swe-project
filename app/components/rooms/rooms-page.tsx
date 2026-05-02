"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/utils/trpc/react";
import { colors } from "@/components/dashboard/theme";
import type { RoomStatus } from "@/components/dashboard/theme";
import { groupByFloor, countByStatus } from "./mock-data";
import { RoomCard } from "./room-card";
import type { RoomListItem } from "./room-card";
import { RoomDetailPanel } from "./room-detail-panel";

// ─── Filter pill ──────────────────────────────────────────────────────────────

function Pill({
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

// ─── Summary card ─────────────────────────────────────────────────────────────

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
      className="rounded-[10px] p-[11px] text-center"
      style={{ background: colors.cream2, border: `0.5px solid ${colors.border2}` }}
    >
      <div
        className="font-display text-[22px] leading-none"
        style={{ color: valueColor ?? colors.text }}
      >
        {value}
      </div>
      <div
        className="mt-[3px] text-[9px] uppercase tracking-[0.1em]"
        style={{ color: colors.textMuted }}
      >
        {label}
      </div>
    </div>
  );
}

// ─── Floor section header ─────────────────────────────────────────────────────

function FloorHeader({ floor, count }: { floor: number; count: number }) {
  return (
    <div className="mb-[8px] flex items-center gap-[10px]">
      <span className="text-[10px] font-medium" style={{ color: colors.textMuted }}>
        Floor {floor}
      </span>
      <div className="flex-1" style={{ height: "0.5px", background: colors.border2 }} />
      <span className="text-[9px]" style={{ color: colors.textMuted }}>
        {count} room{count !== 1 ? "s" : ""}
      </span>
    </div>
  );
}

// ─── Status filter options ────────────────────────────────────────────────────

const STATUS_FILTERS: { label: string; value: RoomStatus | "all" }[] = [
  { label: "All",         value: "all"         },
  { label: "Available",   value: "available"   },
  { label: "Occupied",    value: "occupied"    },
  { label: "Cleaning",    value: "cleaning"    },
  { label: "Maintenance", value: "maintenance" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

interface RoomsPageProps {
  basePath: string;
}

export function RoomsPage({ basePath }: RoomsPageProps) {
  const trpc = useTRPC();
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: rooms = [], isLoading } = useQuery(
    trpc.receptionist.rooms.list.queryOptions(),
  );

  const [statusFilter, setStatusFilter] = useState<RoomStatus | "all">("all");
  const [floorFilter,  setFloorFilter]  = useState<number | "all">("all");
  const [search,       setSearch]       = useState("");

  // Panel state from search params
  const selectedId = searchParams.get("room") ? Number(searchParams.get("room")) : null;

  // Derived: filtered rooms
  const filtered = useMemo(() => {
    return rooms.filter((room) => {
      if (statusFilter !== "all" && room.status !== statusFilter) return false;
      if (floorFilter  !== "all" && room.floor  !== floorFilter)  return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !room.number.includes(q) &&
          !room.guestName?.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [rooms, statusFilter, floorFilter, search]);

  // Derived: counts and groups
  const counts    = useMemo(() => countByStatus(rooms), [rooms]);
  const byFloor   = useMemo(() => groupByFloor(filtered), [filtered]);
  const floors    = useMemo(() => [...byFloor.keys()].sort(), [byFloor]);
  const allFloors = [...new Set(rooms.map((r) => r.floor))].sort();

  function handleSelect(room: RoomListItem) {
    const next = new URLSearchParams(searchParams);
    if (selectedId === room.id) {
      next.delete("room");
    } else {
      next.set("room", String(room.id));
    }
    setSearchParams(next, { replace: true });
  }

  return (
    <div className="hms-shell flex flex-1 flex-col overflow-hidden">
      {/* Topbar */}
      <header
        className="hms-topbar flex flex-shrink-0 items-center justify-between px-5 py-[13px]"
      >
        <h1
          className="font-display text-[17px]"
          style={{ color: colors.text }}
        >
          Rooms
        </h1>
      </header>

      {/* Body */}
      <div className="hms-shell flex flex-1 overflow-hidden">
        {/* Scroll area */}
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-[18px]">

          {/* Summary bar */}
          <div className="grid grid-cols-4 gap-[9px]">
            <SummaryCard label="Total rooms"  value={rooms.length} />
            <SummaryCard label="Occupied"     value={counts.occupied}    valueColor={colors.status.occupied.text}    />
            <SummaryCard label="Available"    value={counts.available}   valueColor={colors.status.available.text}   />
            <SummaryCard label="Cleaning"     value={counts.cleaning}    valueColor={colors.status.cleaning.text}    />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search room, guest…"
              className="w-[180px] rounded-full px-3 py-[5px] text-[11px] outline-none"
              style={{
                background: colors.cream2,
                border:     `0.5px solid ${colors.border}`,
                color:      colors.text,
                fontFamily: "inherit",
              }}
            />

            {STATUS_FILTERS.map((f) => (
              <Pill
                key={f.value}
                label={f.label}
                active={statusFilter === f.value}
                onClick={() => setStatusFilter(f.value)}
              />
            ))}

            <div className="ml-auto flex gap-2">
              <Pill
                label="All floors"
                active={floorFilter === "all"}
                onClick={() => setFloorFilter("all")}
              />
              {allFloors.map((floor) => (
                <Pill
                  key={floor}
                  label={`Floor ${floor}`}
                  active={floorFilter === floor}
                  onClick={() => setFloorFilter(floor)}
                />
              ))}
            </div>
          </div>

          {/* Room grid by floor */}
          {isLoading ? (
            <div
              className="mt-8 text-center text-[12px]"
              style={{ color: colors.textMuted }}
            >
              Loading rooms…
            </div>
          ) : floors.length === 0 ? (
            <div
              className="mt-8 text-center text-[12px]"
              style={{ color: colors.textMuted }}
            >
              No rooms match your filters.
            </div>
          ) : (
            floors.map((floor) => {
              const floorRooms = byFloor.get(floor)!;
              return (
                <div key={floor}>
                  <FloorHeader floor={floor} count={floorRooms.length} />
                  <div className="grid grid-cols-4 gap-[9px]">
                    {floorRooms.map((room) => (
                      <RoomCard
                        key={room.id}
                        room={room}
                        isSelected={selectedId === room.id}
                        onClick={handleSelect}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Detail panel */}
        {selectedId !== null && (
          <RoomDetailPanel
            roomId={selectedId}
            basePath={basePath}
            onClose={() => {
              const next = new URLSearchParams(searchParams);
              next.delete("room");
              setSearchParams(next, { replace: true });
            }}
          />
        )}
      </div>
    </div>
  );
}
