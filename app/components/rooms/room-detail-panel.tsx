"use client";

import { useState } from "react";
import { Link } from "react-router";
import { X, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/utils/trpc/react";
import type { RouterOutputs } from "@/utils/trpc/react";
import { colors } from "@/components/dashboard/theme";
import { RoomStatusBadge, TextBadge } from "./status-badge";
import { roomTypeLabel } from "./mock-data";

type RoomDetail = NonNullable<RouterOutputs["receptionist"]["rooms"]["getById"]>;

interface RoomDetailPanelProps {
  roomId:   number;
  basePath: string;
  onClose:  () => void;
}

// ─── Small labelled field ─────────────────────────────────────────────────────

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div
        className="mb-[2px] text-[9px] font-medium uppercase tracking-[0.1em]"
        style={{ color: colors.textMuted }}
      >
        {label}
      </div>
      <div className="text-[12px]" style={{ color: colors.text }}>
        {value}
      </div>
    </div>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────

function Divider() {
  return <div style={{ height: "0.5px", background: colors.border2 }} />;
}

// ─── Action button ────────────────────────────────────────────────────────────

function ActionButton({
  label,
  onClick,
  loading,
  variant = "outline",
}: {
  label: string;
  onClick: () => void;
  loading?: boolean;
  variant?: "gold" | "outline";
}) {
  const isGold = variant === "gold";
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex w-full items-center justify-center gap-1.5 rounded-full py-[7px] text-[11px] font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
      style={{
        background: isGold ? colors.gold : "transparent",
        color:      isGold ? "#fff" : colors.textSub,
        border:     isGold ? "none" : `0.5px solid ${colors.border}`,
        cursor:     loading ? "not-allowed" : "pointer",
        fontFamily: "inherit",
      }}
    >
      {loading && <Loader2 size={12} className="animate-spin" />}
      {label}
    </button>
  );
}

// ─── Panel ────────────────────────────────────────────────────────────────────

export function RoomDetailPanel({ roomId, basePath, onClose }: RoomDetailPanelProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: room, isLoading } = useQuery(
    trpc.receptionist.rooms.getById.queryOptions({ id: roomId }),
  );

  const [maintenanceNote, setMaintenanceNote] = useState("");

  const updateServiceMode = useMutation(
    trpc.receptionist.rooms.updateServiceMode.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries();
        setMaintenanceNote("");
      },
    }),
  );

  if (isLoading || !room) {
    return (
      <aside
        className="flex h-full w-[260px] flex-shrink-0 items-center justify-center"
        style={{
          background: colors.cream,
          borderLeft: `0.5px solid ${colors.border}`,
        }}
      >
        <Loader2 size={20} className="animate-spin" style={{ color: colors.textMuted }} />
      </aside>
    );
  }

  return (
    <aside
      className="flex h-full w-[260px] flex-shrink-0 flex-col gap-3 overflow-y-auto p-4"
      style={{
        background:  colors.cream,
        borderLeft: `0.5px solid ${colors.border}`,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div
            className="mb-[4px] text-[9px] font-medium uppercase tracking-[0.1em]"
            style={{ color: colors.textMuted }}
          >
            Floor {room.floor}
          </div>
          <div
            className="font-display text-[22px] leading-none"
            style={{ color: colors.text }}
          >
            Room {room.number}
          </div>
          <div className="mt-[6px]">
            <RoomStatusBadge status={room.status} />
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

      {/* Room details grid */}
      <div>
        <div
          className="mb-[8px] text-[9px] font-medium uppercase tracking-[0.1em]"
          style={{ color: colors.textMuted }}
        >
          Room details
        </div>
        <div className="grid grid-cols-2 gap-[8px]">
          <Field label="Type"     value={roomTypeLabel[room.type] ?? room.type} />
          <Field label="Floor"    value={room.floor} />
          <Field label="Rate"     value={`EGP ${room.ratePerNight.toLocaleString()}/night`} />
          <Field label="Capacity" value={`${room.capacity} guest${room.capacity > 1 ? "s" : ""}`} />
        </div>
      </div>

      <Divider />

      {/* Current guest — only when occupied */}
      {room.status === "occupied" && room.guest && (
        <>
          <div>
            <div
              className="mb-[8px] text-[9px] font-medium uppercase tracking-[0.1em]"
              style={{ color: colors.textMuted }}
            >
              Current guest
            </div>

            {/* Guest avatar row */}
            <div
              className="mb-[8px] flex items-center gap-2 rounded-[8px] p-[8px]"
              style={{ background: colors.cream2, border: `0.5px solid ${colors.border2}` }}
            >
              <div
                className="flex h-[28px] w-[28px] flex-shrink-0 items-center justify-center rounded-full text-[9px] font-medium"
                style={{ background: room.guest.avatarBg, color: room.guest.avatarColor }}
              >
                {room.guest.initials}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-medium" style={{ color: colors.text }}>
                    {room.guest.name}
                  </span>
                  {room.guest.isLoyal && (
                    <TextBadge>loyal</TextBadge>
                  )}
                </div>
                <div className="text-[9px]" style={{ color: colors.textMuted }}>
                  Booking {room.guest.bookingId}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-[8px]">
              <Field label="Check-in"  value={room.guest.checkIn}  />
              <Field label="Check-out" value={room.guest.checkOut} />
            </div>

            {/* Active services */}
            {room.guest.services.length > 0 && (
              <div className="mt-[8px]">
                <div
                  className="mb-[4px] text-[9px] font-medium uppercase tracking-[0.1em]"
                  style={{ color: colors.textMuted }}
                >
                  Active services
                </div>
                <div className="flex flex-wrap gap-1">
                  {room.guest.services.map((s) => (
                    <TextBadge key={s}>{s}</TextBadge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Divider />
        </>
      )}

      {/* Maintenance note */}
      {room.status === "maintenance" && room.maintenanceNote && (
        <>
          <div>
            <div
              className="mb-[6px] text-[9px] font-medium uppercase tracking-[0.1em]"
              style={{ color: colors.textMuted }}
            >
              Maintenance note
            </div>
            <div
              className="rounded-[8px] p-[9px] text-[11px]"
              style={{
                background: "#FCEBEB",
                color: "#A32D2D",
                border: "0.5px solid #F09595",
              }}
            >
              {room.maintenanceNote}
            </div>
          </div>
          <Divider />
        </>
      )}

      {/* Status actions — only for non-occupied rooms */}
      {room.status !== "occupied" && (
        <>
          <div>
            <div
              className="mb-[6px] text-[9px] font-medium uppercase tracking-[0.1em]"
              style={{ color: colors.textMuted }}
            >
              Change status
            </div>

            <div className="flex flex-col gap-[6px]">
              {/* Available → Cleaning / Maintenance */}
              {room.status === "available" && (
                <>
                  <ActionButton
                    label="Mark as Cleaning"
                    variant="outline"
                    loading={updateServiceMode.isPending}
                    onClick={() =>
                      updateServiceMode.mutate({
                        id: room.id,
                        serviceMode: "cleaning",
                      })
                    }
                  />
                  <ActionButton
                    label="Mark as Maintenance"
                    variant="outline"
                    loading={updateServiceMode.isPending}
                    onClick={() =>
                      updateServiceMode.mutate({
                        id: room.id,
                        serviceMode: "maintenance",
                        maintenanceNote: maintenanceNote || undefined,
                      })
                    }
                  />
                  <input
                    value={maintenanceNote}
                    onChange={(e) => setMaintenanceNote(e.target.value)}
                    placeholder="Maintenance note (optional)"
                    className="w-full rounded-[8px] px-[10px] py-[7px] text-[11px] outline-none"
                    style={{
                      background: colors.cream2,
                      border: `0.5px solid ${colors.border}`,
                      color: colors.text,
                      fontFamily: "inherit",
                    }}
                  />
                </>
              )}

              {/* Cleaning → Available / Maintenance */}
              {room.status === "cleaning" && (
                <>
                  <ActionButton
                    label="Mark as Available"
                    variant="gold"
                    loading={updateServiceMode.isPending}
                    onClick={() =>
                      updateServiceMode.mutate({
                        id: room.id,
                        serviceMode: null,
                      })
                    }
                  />
                  <ActionButton
                    label="Mark as Maintenance"
                    variant="outline"
                    loading={updateServiceMode.isPending}
                    onClick={() =>
                      updateServiceMode.mutate({
                        id: room.id,
                        serviceMode: "maintenance",
                        maintenanceNote: maintenanceNote || undefined,
                      })
                    }
                  />
                  <input
                    value={maintenanceNote}
                    onChange={(e) => setMaintenanceNote(e.target.value)}
                    placeholder="Maintenance note (optional)"
                    className="w-full rounded-[8px] px-[10px] py-[7px] text-[11px] outline-none"
                    style={{
                      background: colors.cream2,
                      border: `0.5px solid ${colors.border}`,
                      color: colors.text,
                      fontFamily: "inherit",
                    }}
                  />
                </>
              )}

              {/* Maintenance → Available / Cleaning */}
              {room.status === "maintenance" && (
                <>
                  <ActionButton
                    label="Mark as Available"
                    variant="gold"
                    loading={updateServiceMode.isPending}
                    onClick={() =>
                      updateServiceMode.mutate({
                        id: room.id,
                        serviceMode: null,
                      })
                    }
                  />
                  <ActionButton
                    label="Mark as Cleaning"
                    variant="outline"
                    loading={updateServiceMode.isPending}
                    onClick={() =>
                      updateServiceMode.mutate({
                        id: room.id,
                        serviceMode: "cleaning",
                      })
                    }
                  />
                </>
              )}
            </div>
          </div>

          <Divider />
        </>
      )}

      {/* Actions — booking/billing links only for occupied rooms */}
      {room.status === "occupied" && room.guest && (
        <div className="mt-auto flex flex-col gap-[6px]">
          <Link
            to={`${basePath}/bookings/${room.guest.bookingId.replace("#", "")}`}
            className="block rounded-full py-[7px] text-center text-[11px] font-medium transition-opacity hover:opacity-80"
            style={{ background: colors.gold, color: "#fff" }}
          >
            View full booking
          </Link>
          <Link
            to={`${basePath}/billing/new?room=${room.number}`}
            className="block rounded-full py-[7px] text-center text-[11px] font-medium transition-colors hover:bg-[#F0EBE0]"
            style={{
              background: "transparent",
              color: colors.textSub,
              border: `0.5px solid ${colors.border}`,
            }}
          >
            Generate bill
          </Link>
        </div>
      )}
    </aside>
  );
}
