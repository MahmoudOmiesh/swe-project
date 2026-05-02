"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/utils/trpc/react";
import type { User } from "@/lib/auth-client";
import { StatCard } from "./stat-card";
import { RoomStatusGrid } from "./room-status-grid";
import { TodaysGuests } from "./todays-guests";
import { OccupancyChart } from "./occupancy-chart";
import { useNavigate } from "react-router";

interface DashboardPageProps {
  user: User;
  basePath: string;
}

function formatCurrency(n: number) {
  return n.toLocaleString("en-EG", { maximumFractionDigits: 0 });
}

export function DashboardPage({ user, basePath }: DashboardPageProps) {
  const trpc = useTRPC();
  const navigate = useNavigate();

  // ── Queries ──────────────────────────────────────────────────────────────
  const { data: stats } = useQuery(
    trpc.hotel.dashboard.stats.queryOptions(),
  );

  const { data: roomsList = [] } = useQuery(
    trpc.hotel.rooms.list.queryOptions(),
  );

  const { data: guests = [] } = useQuery(
    trpc.hotel.dashboard.guests.queryOptions(),
  );

  const { data: occupancy = [] } = useQuery(
    trpc.hotel.dashboard.weeklyOccupancy.queryOptions(),
  );

  // ── Derived ──────────────────────────────────────────────────────────────
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user.name.split(" ")[0];

  const roomItems = roomsList.map((r) => ({ id: r.id, number: r.number, status: r.status }));

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="hms-shell flex flex-1 flex-col overflow-hidden">
      <header className="hms-topbar hms-page-header">
        <h1 className="font-display hms-page-title">
          {greeting}, {firstName}
        </h1>
        <span className="hms-date-chip">{dateStr}</span>
      </header>

      <main className="hms-shell hms-page-main">
        <p className="hms-page-caption">Overview · Today&apos;s snapshot</p>

        <div className="hms-kpi-grid">
          <StatCard
            label="Occupancy"
            value={stats ? `${stats.occupancyPercent}%` : "—"}
          />
          <StatCard
            label="Check-ins today"
            value={stats ? stats.checkInsToday : "—"}
            sub={
              stats ? (
                <>
                  <span className="hms-emphasis">{stats.checkInsToday}</span> pending arrival
                </>
              ) : undefined
            }
          />
          <StatCard
            label="Revenue (EGP)"
            value={stats ? formatCurrency(stats.revenueThisWeek) : "—"}
            sub="This week"
          />
          <StatCard
            label="Rooms to clean"
            value={stats ? stats.roomsToClean : "—"}
          />
        </div>

        <div className="hms-main-grid">
          <div className="hms-stack-col">
            <RoomStatusGrid
              rooms={roomItems}
              onViewAll={() => navigate(`${basePath}/rooms`)}
              onRoomClick={(roomId) => navigate(`${basePath}/rooms?room=${roomId}`)}
            />
            <TodaysGuests
              basePath={basePath}
              guests={guests}
              onNewBooking={() => navigate(`${basePath}/bookings?panel=new`)}
              onGuestClick={(g) => navigate(`${basePath}/bookings?panel=detail&id=${g.id}`)}
            />
          </div>
          <div className="hms-stack-col">
            <OccupancyChart days={occupancy} />
          </div>
        </div>
      </main>
    </div>
  );
}
