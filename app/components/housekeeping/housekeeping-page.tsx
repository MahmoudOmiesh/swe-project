"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/utils/trpc/react";
import { colors } from "@/components/dashboard/theme";
import { MetricCard } from "./metric-card";
import { TaskStatus } from "./task-status";
import { NewTaskPanel } from "./new-task-panel";

export function HousekeepingPage() {
  const trpc = useTRPC();
  const [showPanel, setShowPanel] = useState(false);

  // ── Queries ──────────────────────────────────────────────────────────────
  const { data: metrics = [] } = useQuery(
    trpc.hotel.housekeeping.metrics.queryOptions(),
  );
  const { data: tasks = [] } = useQuery(
    trpc.hotel.housekeeping.tasks.queryOptions(),
  );
  const { data: issues = [] } = useQuery(
    trpc.hotel.housekeeping.issues.queryOptions(),
  );
  const { data: staffOnDuty = [] } = useQuery(
    trpc.hotel.housekeeping.staffOnDuty.queryOptions(),
  );

  const pendingTasks = tasks.filter((t) => t.statusTone !== "done").length;

  return (
    <div className="hms-shell flex flex-1 flex-col overflow-hidden">
      {/* Topbar */}
      <header className="hms-topbar flex shrink-0 items-center justify-between px-5 py-[13px]">
        <h1
          className="font-display text-[17px]"
          style={{ color: colors.text }}
        >
          Housekeeping
        </h1>
        <div className="flex items-center gap-3">
          <div className="text-[11px]" style={{ color: colors.textMuted }}>
            {new Date().toLocaleDateString("en-GB", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            })}{" "}
            · Shift 08:00–16:00
          </div>
          <button
            type="button"
            onClick={() => setShowPanel(true)}
            className="rounded-full px-[14px] py-[6px] text-[11px] font-medium transition-opacity hover:opacity-80"
            style={{
              background: colors.gold,
              color: "#fff",
              border: "none",
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            + New task
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <main className="flex flex-1 flex-col gap-4 overflow-y-auto p-[18px]">
          {/* Metric cards */}
          <div className="grid grid-cols-4 gap-[10px]">
            {metrics.map((metric) => (
              <MetricCard
                key={metric.label}
                label={metric.label}
                value={metric.value}
                valueColor={metric.valueColor}
              />
            ))}
          </div>

          <div className="grid grid-cols-[1.15fr_0.85fr] gap-4">
            {/* ── Left: Cleaning tasks ────────────────────────────────────── */}
            <section
              className="rounded-[16px] p-4"
              style={{
                background: colors.cream2,
                border: `0.5px solid ${colors.border2}`,
              }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2
                  className="text-[12px] font-medium"
                  style={{ color: colors.text }}
                >
                  Cleaning tasks — today
                </h2>
                <span
                  className="text-[11px]"
                  style={{ color: colors.textMuted }}
                >
                  {pendingTasks} pending
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {tasks.length === 0 && (
                  <div
                    className="py-6 text-center text-[11px]"
                    style={{ color: colors.textMuted }}
                  >
                    No cleaning tasks for today
                  </div>
                )}
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-4 rounded-[14px] bg-white px-4 py-4"
                    style={{ border: `0.5px solid ${colors.border2}` }}
                  >
                    <div
                      className="w-10 text-[24px] font-light"
                      style={{ color: colors.text }}
                    >
                      {task.room}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div
                        className="text-[12px] font-medium"
                        style={{ color: colors.text }}
                      >
                        {task.title}
                      </div>
                      <div
                        className="text-[10px]"
                        style={{ color: colors.textMuted }}
                      >
                        {task.subtitle} · {task.time}
                      </div>
                    </div>

                    <TaskStatus
                      tone={task.statusTone}
                      label={task.statusLabel}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* ── Right column ────────────────────────────────────────────── */}
            <div className="flex flex-col gap-4">
              {/* Maintenance issues */}
              <section
                className="rounded-[16px] p-4"
                style={{
                  background: colors.cream2,
                  border: `0.5px solid ${colors.border2}`,
                }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h2
                    className="text-[12px] font-medium"
                    style={{ color: colors.text }}
                  >
                    Maintenance issues
                  </h2>
                  <span
                    className="text-[11px]"
                    style={{ color: colors.status.maintenance.text }}
                  >
                    {issues.length} open
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {issues.length === 0 && (
                    <div
                      className="py-4 text-center text-[11px]"
                      style={{ color: colors.textMuted }}
                    >
                      No open maintenance issues
                    </div>
                  )}
                  {issues.map((issue) => (
                    <div
                      key={issue.id}
                      className="rounded-[14px] px-4 py-3"
                      style={{
                        background: colors.status.maintenance.bg,
                        border: `0.5px solid ${colors.status.maintenance.border}`,
                      }}
                    >
                      <div
                        className="text-[12px] font-medium"
                        style={{ color: colors.status.maintenance.text }}
                      >
                        {issue.room} — {issue.title}
                      </div>
                      <div
                        className="text-[10px]"
                        style={{ color: colors.textMuted }}
                      >
                        {issue.reportedAt}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Staff on duty */}
              <section
                className="rounded-[16px] p-4"
                style={{
                  background: colors.cream2,
                  border: `0.5px solid ${colors.border2}`,
                }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h2
                    className="text-[12px] font-medium"
                    style={{ color: colors.text }}
                  >
                    Staff on duty
                  </h2>
                  <span
                    className="text-[11px]"
                    style={{ color: colors.textMuted }}
                  >
                    {staffOnDuty.length} active
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {staffOnDuty.length === 0 && (
                    <div
                      className="py-4 text-center text-[11px]"
                      style={{ color: colors.textMuted }}
                    >
                      No staff registered yet
                    </div>
                  )}
                  {staffOnDuty.map((staff) => (
                    <div key={staff.id} className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-full text-[10px] font-medium"
                        style={{
                          background: staff.avatarBg,
                          color: staff.avatarColor,
                        }}
                      >
                        {staff.initials}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div
                          className="text-[12px] font-medium"
                          style={{ color: colors.text }}
                        >
                          {staff.name}
                        </div>
                        <div
                          className="text-[10px]"
                          style={{ color: colors.textMuted }}
                        >
                          {staff.progressLabel}
                        </div>
                      </div>

                      <div
                        className="w-20 rounded-full"
                        style={{
                          height: 6,
                          background: "rgba(184,150,90,0.12)",
                        }}
                      >
                        <div
                          className="rounded-full"
                          style={{
                            width: `${staff.progress}%`,
                            height: 6,
                            background: colors.gold,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </main>

        {/* Side panel */}
        {showPanel && <NewTaskPanel onClose={() => setShowPanel(false)} />}
      </div>
    </div>
  );
}
