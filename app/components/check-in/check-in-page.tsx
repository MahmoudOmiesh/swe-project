"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/utils/trpc/react";
import { colors } from "@/components/dashboard/theme";
import { FrontDeskTabs } from "@/components/ui/front-desk-tabs";
import { ArrivalList } from "./arrival-list";
import type { ArrivalListItem } from "./arrival-list";
import { ReadonlyField } from "./readonly-field";
import { SectionTitle } from "./section-title";
import { ServicePill } from "./service-pill";

interface CheckInPageProps {
  basePath: string;
}

export function CheckInPage({ basePath }: CheckInPageProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // ── Queries ──────────────────────────────────────────────────────────────────
  const {
    data: arrivals = [],
    isLoading: isLoadingArrivals,
  } = useQuery(trpc.hotel.bookings.todayArrivals.queryOptions());

  const { data: availableServices = [] } = useQuery(
    trpc.hotel.bookings.availableServices.queryOptions(),
  );

  // ── Local state ──────────────────────────────────────────────────────────────
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedServiceIds, setSelectedServiceIds] = useState<Set<number>>(new Set());

  // Derive the selected arrival from the list
  const selectedArrival = arrivals.find((a) => a.id === selectedId) ?? null;

  // Auto-select first arrival when data loads or selection becomes invalid
  useEffect(() => {
    if (arrivals.length > 0 && !arrivals.find((a) => a.id === selectedId)) {
      setSelectedId(arrivals[0].id);
      setSelectedServiceIds(new Set(arrivals[0].services.map((s) => s.id)));
    }
  }, [arrivals, selectedId]);

  // ── Check-in mutation ────────────────────────────────────────────────────────
  const checkInMutation = useMutation(
    trpc.hotel.bookings.checkIn.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.hotel.bookings.todayArrivals.queryKey(),
        });
        setSelectedId(null);
      },
    }),
  );

  // ── Handlers ─────────────────────────────────────────────────────────────────
  function handleSelectArrival(item: ArrivalListItem) {
    setSelectedId(item.id);
    const arrival = arrivals.find((a) => a.id === item.id);
    if (arrival) {
      setSelectedServiceIds(new Set(arrival.services.map((s) => s.id)));
    }
  }

  function handleToggleService(serviceId: number) {
    setSelectedServiceIds((prev) => {
      const next = new Set(prev);
      if (next.has(serviceId)) {
        next.delete(serviceId);
      } else {
        next.add(serviceId);
      }
      return next;
    });
  }

  function handleCheckIn() {
    if (!selectedArrival) return;
    checkInMutation.mutate({
      id: selectedArrival.id,
      serviceIds: Array.from(selectedServiceIds),
    });
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="hms-shell flex flex-1 flex-col overflow-hidden">
      <header className="hms-topbar flex items-center justify-between px-5 py-[13px]">
        <h1 className="font-display text-[17px]" style={{ color: colors.text }}>
          Check-in / Check-out
        </h1>
        <FrontDeskTabs basePath={basePath} active="checkin" />
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 gap-4 overflow-y-auto p-[18px]">
          {/* ── Left column: Arrivals list ──────────────────────────────────── */}
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            {isLoadingArrivals ? (
              <div
                className="rounded-[14px] p-4"
                style={{ background: colors.cream2, border: `0.5px solid ${colors.border2}` }}
              >
                <div className="py-6 text-center text-[12px]" style={{ color: colors.textMuted }}>
                  Loading arrivals…
                </div>
              </div>
            ) : (
              <ArrivalList
                title="Today's arrivals"
                meta={`${arrivals.length} expected`}
                items={arrivals}
                selectedId={selectedId}
                onSelect={handleSelectArrival}
              />
            )}
          </div>

          {/* ── Right column: Guest detail panel ────────────────────────────── */}
          {selectedArrival ? (
            <aside
              className="w-[360px] flex-shrink-0 overflow-y-auto rounded-[16px] p-4"
              style={{ background: colors.cream, border: `0.5px solid ${colors.border2}` }}
            >
              <SectionTitle>Guest details</SectionTitle>

              <div className="grid grid-cols-2 gap-3">
                <ReadonlyField label="Full name" value={selectedArrival.guestName} />
                <ReadonlyField label="Date of birth" value={selectedArrival.dob} />
                <ReadonlyField label="ID / Passport no." value={selectedArrival.nationalId} />
                <ReadonlyField label="Phone number" value={selectedArrival.phone} />
              </div>

              <div className="mt-3">
                <ReadonlyField label="Address" value={selectedArrival.address} />
              </div>

              <div className="mt-5">
                <SectionTitle>Stay details</SectionTitle>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <ReadonlyField label="Booking ID" value={selectedArrival.bookingId} />
                <ReadonlyField label="Room" value={selectedArrival.room} />
                <ReadonlyField label="Check-in date" value={selectedArrival.checkInDate} />
                <ReadonlyField label="Check-out date" value={selectedArrival.checkOutDate} />
                <ReadonlyField label="No. of guests" value={String(selectedArrival.numGuests)} />
                <ReadonlyField label="Rate / night" value={`EGP ${selectedArrival.ratePerNight}`} />
              </div>

              <div className="mt-5">
                <SectionTitle>Additional services</SectionTitle>
                <div className="grid grid-cols-2 gap-2">
                  {availableServices.map((service) => (
                    <ServicePill
                      key={service.id}
                      label={service.name}
                      extra={Number(service.price) > 0 ? `+EGP ${service.price}` : undefined}
                      active={selectedServiceIds.has(service.id)}
                      onClick={() => handleToggleService(service.id)}
                    />
                  ))}
                </div>
              </div>

              {/* ── Check-in action ──────────────────────────────────────── */}
              <button
                onClick={handleCheckIn}
                disabled={checkInMutation.isPending}
                className="mt-6 w-full rounded-full py-[10px] text-[12px] font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
                style={{
                  background: colors.gold,
                  color: "#fff",
                  border: "none",
                  cursor: checkInMutation.isPending ? "not-allowed" : "pointer",
                }}
              >
                {checkInMutation.isPending ? "Checking in…" : "Confirm check-in"}
              </button>

              {checkInMutation.isError && (
                <div className="mt-2 text-center text-[11px] text-red-500">
                  {checkInMutation.error.message}
                </div>
              )}
            </aside>
          ) : (
            <aside
              className="flex w-[360px] flex-shrink-0 items-center justify-center rounded-[16px]"
              style={{ background: colors.cream, border: `0.5px solid ${colors.border2}` }}
            >
              <div className="text-center text-[12px]" style={{ color: colors.textMuted }}>
                {arrivals.length > 0
                  ? "Select a guest to view details"
                  : "No arrivals expected today"}
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
