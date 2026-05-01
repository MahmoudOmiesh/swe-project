"use client";

import { useState } from "react";
import { colors } from "@/components/dashboard/theme";
import { FrontDeskTabs } from "@/components/ui/front-desk-tabs";
import { ArrivalList } from "./arrival-list";
import { CHECK_IN_ARRIVALS, SERVICE_OPTIONS, type ArrivalRecord } from "./mock-data";
import { ReadonlyField } from "./readonly-field";
import { SectionTitle } from "./section-title";
import { ServicePill } from "./service-pill";

interface CheckInPageProps {
  basePath: string;
}

export function CheckInPage({ basePath }: CheckInPageProps) {
  const [selectedArrival, setSelectedArrival] = useState<ArrivalRecord>(CHECK_IN_ARRIVALS[0]);

  const departures = CHECK_IN_ARRIVALS.slice(0, 2).map((item, index) => ({
    ...item,
    id: `${item.id}-departure`,
    guestName: index === 0 ? "Mohamed Hassan" : "Omar Saad",
    initials: index === 0 ? "MH" : "OS",
    roomLabel: index === 0 ? "Room 107 · pending payment" : "Room 105 · balance cleared",
    time: index === 0 ? "12:00" : "11:00",
  }));

  const handleSelectArrival = (item: ArrivalRecord) => {
    setSelectedArrival({ ...item, services: [...item.services] });
  };

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
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <ArrivalList
              title="Today's arrivals"
              meta="3 expected"
              items={CHECK_IN_ARRIVALS}
              selectedId={selectedArrival.id}
              onSelect={handleSelectArrival}
            />

            <ArrivalList
              title="Today's departures"
              meta="2 expected"
              items={departures}
              selectedId=""
              onSelect={() => undefined}
            />
          </div>

          <aside
            className="w-[360px] flex-shrink-0 rounded-[16px] p-4"
            style={{ background: colors.cream, border: `0.5px solid ${colors.border2}` }}
          >
            <SectionTitle>Guest details</SectionTitle>

            <div className="grid grid-cols-2 gap-3">
              <ReadonlyField label="Full name" value={selectedArrival.guestName} />
              <ReadonlyField label="Nationality" value={selectedArrival.nationality} />
              <ReadonlyField label="ID / Passport no." value={selectedArrival.nationalId} />
              <ReadonlyField label="Phone number" value={selectedArrival.phone} />
              <ReadonlyField label="Occupation" value={selectedArrival.occupation} />
              <ReadonlyField label="Purpose of visit" value={selectedArrival.purpose} />
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
                {SERVICE_OPTIONS.map((service) => (
                  <ServicePill
                    key={service.key}
                    label={service.label}
                    extra={service.extra}
                    active={selectedArrival.services.includes(service.key)}
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
