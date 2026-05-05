"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { useTRPC } from "@/utils/trpc/react";
import { colors } from "@/components/dashboard/theme";
import { MetricCard } from "@/components/housekeeping/metric-card";
import { TaskStatus } from "@/components/housekeeping/task-status";
import type { User } from "@/lib/auth-client";

interface MyHousekeepingPageProps {
  user: User;
}

export function MyHousekeepingPage({ user }: MyHousekeepingPageProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: metrics = [] } = useQuery(
    trpc.myHousekeeping.metrics.queryOptions(),
  );

  const { data: tasks = [], isLoading } = useQuery(
    trpc.myHousekeeping.myTasks.queryOptions(),
  );

  const updateStatus = useMutation(
    trpc.myHousekeeping.updateStatus.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries();
      },
    }),
  );

  const pendingCount = tasks.filter((t) => t.status !== "done").length;

  return (
    <div className="hms-shell flex flex-1 flex-col overflow-hidden">
      {/* Topbar */}
      <header className="hms-topbar flex shrink-0 items-center justify-between px-5 py-[13px]">
        <div>
          <h1
            className="font-display text-[17px]"
            style={{ color: colors.text }}
          >
            My tasks
          </h1>
          <div className="text-[10px]" style={{ color: colors.textMuted }}>
            Welcome back, {user.name}
          </div>
        </div>
        <div className="text-[11px]" style={{ color: colors.textMuted }}>
          {new Date().toLocaleDateString("en-GB", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
          })}{" "}
          · Shift 08:00–16:00
        </div>
      </header>

      {/* Body */}
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

        {/* Tasks list */}
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
              Today's assigned tasks
            </h2>
            <span
              className="text-[11px]"
              style={{ color: colors.textMuted }}
            >
              {pendingCount} pending
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {isLoading && (
              <div
                className="flex items-center justify-center py-8 text-[11px]"
                style={{ color: colors.textMuted }}
              >
                <Loader2 size={14} className="mr-2 animate-spin" />
                Loading tasks…
              </div>
            )}

            {!isLoading && tasks.length === 0 && (
              <div
                className="py-8 text-center text-[11px]"
                style={{ color: colors.textMuted }}
              >
                You have no tasks assigned today. Enjoy your shift! 🌿
              </div>
            )}

            {tasks.map((task) => {
              const isDone = task.status === "done";
              const isInProgress = task.status === "in_progress";
              const isPending = task.status === "pending";
              const busy =
                updateStatus.isPending &&
                updateStatus.variables?.id === task.id;

              return (
                <div
                  key={task.id}
                  className="flex items-center gap-4 rounded-[14px] bg-white px-4 py-4"
                  style={{
                    border: `0.5px solid ${colors.border2}`,
                    opacity: isDone ? 0.7 : 1,
                  }}
                >
                  <div
                    className="w-12 text-[24px] font-light"
                    style={{ color: colors.text }}
                  >
                    {task.room}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div
                      className="text-[12px] font-medium"
                      style={{
                        color: colors.text,
                        textDecoration: isDone ? "line-through" : "none",
                      }}
                    >
                      {task.title}
                    </div>
                    <div
                      className="text-[10px]"
                      style={{ color: colors.textMuted }}
                    >
                      {task.subtitle} · {task.type === "maintenance"
                        ? "Maintenance"
                        : "Cleaning"}{" "}
                      · {task.time}
                    </div>
                    {task.notes && (
                      <div
                        className="mt-1 text-[10px] italic"
                        style={{ color: colors.textSub }}
                      >
                        {task.notes}
                      </div>
                    )}
                  </div>

                  <TaskStatus
                    tone={task.statusTone}
                    label={task.statusLabel}
                  />

                  <div className="flex shrink-0 gap-1.5">
                    {isPending && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          updateStatus.mutate({
                            id: task.id,
                            status: "in_progress",
                          })
                        }
                        className="flex items-center gap-1 rounded-full px-3 py-[5px] text-[10px] font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
                        style={{
                          background: colors.status.cleaning.bg,
                          color: colors.status.cleaning.text,
                          border: `0.5px solid ${colors.status.cleaning.border}`,
                          fontFamily: "inherit",
                          cursor: "pointer",
                        }}
                      >
                        {busy && <Loader2 size={10} className="animate-spin" />}
                        Start
                      </button>
                    )}
                    {(isPending || isInProgress) && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          updateStatus.mutate({
                            id: task.id,
                            status: "done",
                          })
                        }
                        className="flex items-center gap-1 rounded-full px-3 py-[5px] text-[10px] font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
                        style={{
                          background: colors.gold,
                          color: "#fff",
                          border: "none",
                          fontFamily: "inherit",
                          cursor: "pointer",
                        }}
                      >
                        {busy && <Loader2 size={10} className="animate-spin" />}
                        Mark done
                      </button>
                    )}
                    {isDone && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          updateStatus.mutate({
                            id: task.id,
                            status: "in_progress",
                          })
                        }
                        className="flex items-center gap-1 rounded-full px-3 py-[5px] text-[10px] font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
                        style={{
                          background: "transparent",
                          color: colors.textSub,
                          border: `0.5px solid ${colors.border}`,
                          fontFamily: "inherit",
                          cursor: "pointer",
                        }}
                      >
                        {busy && <Loader2 size={10} className="animate-spin" />}
                        Reopen
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {updateStatus.error && (
            <p className="mt-3 rounded-md bg-red-50 px-2 py-1.5 text-[10px] text-red-600">
              {updateStatus.error.message}
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
