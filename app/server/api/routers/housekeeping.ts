import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { housekeepingProcedure, router } from "@/server/api";
import {
  listMyTasks,
  getMyMetrics,
  updateMyTaskStatus,
} from "@/server/db/data-access/housekeeping";
import { colors } from "@/components/dashboard/theme";

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmtTime(d: Date) {
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function statusTone(
  priority: "low" | "medium" | "high",
  status: "pending" | "in_progress" | "done",
): "urgent" | "normal" | "done" {
  if (status === "done") return "done";
  if (priority === "high") return "urgent";
  return "normal";
}

function statusLabel(
  priority: "low" | "medium" | "high",
  status: "pending" | "in_progress" | "done",
): string {
  if (status === "done") return "Done";
  if (status === "in_progress") return "In progress";
  if (priority === "high") return "Urgent";
  return "Pending";
}

// ─── Router ─────────────────────────────────────────────────────────────────

export const myHousekeepingRouter = router({
  /** Aggregate metrics for the housekeeper's own dashboard. */
  metrics: housekeepingProcedure.query(async ({ ctx }) => {
    const m = await getMyMetrics(ctx.session.user.id);
    return [
      {
        label: "Assigned today",
        value: m.assigned,
        valueColor: colors.text,
      },
      {
        label: "Pending",
        value: m.pending,
        valueColor: colors.status.cleaning.text,
      },
      {
        label: "In progress",
        value: m.inProgress,
        valueColor: colors.status.maintenance.text,
      },
      {
        label: "Completed",
        value: m.done,
        valueColor: colors.status.available.text,
      },
    ];
  }),

  /** Tasks assigned to me today. */
  myTasks: housekeepingProcedure.query(async ({ ctx }) => {
    const rows = await listMyTasks(ctx.session.user.id);
    return rows.map((r) => ({
      id: r.id,
      room: r.room.number,
      type: r.type,
      title: r.title,
      subtitle: `${capitalize(r.room.type)} · Floor ${r.room.floor}`,
      time: fmtTime(r.createdAt),
      priority: r.priority,
      status: r.status,
      notes: r.notes,
      statusLabel: statusLabel(r.priority, r.status),
      statusTone: statusTone(r.priority, r.status),
    }));
  }),

  /** Update one of MY task statuses. Owners enforced server-side. */
  updateStatus: housekeepingProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "in_progress", "done"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updated = await updateMyTaskStatus(
        input.id,
        ctx.session.user.id,
        input.status,
      );
      if (!updated) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task not found or not assigned to you",
        });
      }
      return { id: updated.id, status: updated.status };
    }),
});
