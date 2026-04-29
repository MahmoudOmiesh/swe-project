import type { User } from "@/lib/auth-client";
import { StatCard } from "./stat-card";
import { RoomStatusGrid } from "./room-status-grid";
import { TodaysGuests } from "./todays-guests";
import { OccupancyChart } from "./occupancy-chart";
import { NotificationsPanel } from "./notifications-panel";

interface DashboardPageProps {
  user: User;
  basePath: string;
}

export function DashboardPage({ user, basePath }: DashboardPageProps) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user.name.split(" ")[0];

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
            value="74%"
            sub={
              <>
                <span className="hms-emphasis">+6%</span> vs last week
              </>
            }
          />
          <StatCard
            label="Check-ins today"
            value="8"
            sub={
              <>
                <span className="hms-emphasis">3</span> pending arrival
              </>
            }
          />
          <StatCard label="Revenue (EGP)" value="42,150" sub="This week" />
          <StatCard
            label="Rooms to clean"
            value="5"
            sub={
              <>
                <span className="hms-emphasis">2</span> urgent
              </>
            }
          />
        </div>

        <div className="hms-main-grid">
          <div className="hms-stack-col">
            <RoomStatusGrid />
            <TodaysGuests basePath={basePath} />
          </div>
          <div className="hms-stack-col">
            <OccupancyChart />
            <NotificationsPanel />
          </div>
        </div>
      </main>
    </div>
  );
}
