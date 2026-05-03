import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "@/server/api";
import {
  listTodayTasks,
  listMaintenanceIssues,
  getHousekeepingMetrics,
  createTask,
  updateTaskStatus,
  listStaff,
  listStaffWithProgress,
} from "@/server/db/data-access/housekeeping";
import {
  listRooms,
  updateRoomServiceMode,
} from "@/server/db/data-access/rooms";
import { colors } from "@/components/dashboard/theme";

// ─── Helpers ────────────────────────────────────────────────────────────────

const AVATAR_PALETTE = [
  { bg: "#EEEDFE", text: "#534AB7" },
  { bg: "#E1F5EE", text: "#0F6E56" },
  { bg: "#FAECE7", text: "#993C1D" },
  { bg: "#F5EDD8", text: "#7A5018" },
  { bg: "#FBEAF0", text: "#72243E" },
  { bg: "#E6F1FB", text: "#185FA5" },
  { bg: "#F1EFE8", text: "#5F5E5A" },
] as const;

function avatarColors(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

function initials(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return fullName.slice(0, 2).toUpperCase();
}

function fmtTime(d: Date) {
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
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
  if (priority === "high") return "Urgent";
  return "Normal";
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── Router ─────────────────────────────────────────────────────────────────

export const housekeepingRouter = router({
  /** Aggregate metrics for the top cards. */
  metrics: protectedProcedure.query(async () => {
    const m = await getHousekeepingMetrics();
    return [
      {
        label: "To clean",
        value: m.toClean,
        valueColor: colors.status.cleaning.text,
      },
      {
        label: "Cleaned today",
        value: m.cleanedToday,
        valueColor: colors.status.available.text,
      },
      {
        label: "Maintenance",
        value: m.maintenance,
        valueColor: colors.status.maintenance.text,
      },
      {
        label: "Urgent",
        value: m.urgent,
        valueColor: colors.status.occupied.text,
      },
    ];
  }),

  /** Today's cleaning tasks. */
  tasks: protectedProcedure.query(async () => {
    const rows = await listTodayTasks();
    return rows
      .filter((r) => r.type === "cleaning")
      .map((r) => ({
        id: String(r.id),
        room: r.room.number,
        title: r.title,
        subtitle: `${capitalize(r.room.type)} · Floor ${r.room.floor}`,
        time: fmtTime(r.createdAt),
        statusLabel: statusLabel(r.priority, r.status),
        statusTone: statusTone(r.priority, r.status),
      }));
  }),

  /** Open maintenance issues. */
  issues: protectedProcedure.query(async () => {
    const rows = await listMaintenanceIssues();
    return rows.map((r) => ({
      id: String(r.id),
      room: `Room ${r.room.number}`,
      title: r.title,
      reportedAt: `Reported ${fmtDate(r.createdAt)}${r.priority === "high" ? " · Urgent" : ""}`,
    }));
  }),

  /** Rooms that are currently available (not occupied, not cleaning/maintenance). */
  availableRooms: protectedProcedure.query(async () => {
    const rows = await listRooms();
    return rows
      .filter((r) => {
        const hasActiveReservation = r.reservations.length > 0;
        return !r.serviceMode && !hasActiveReservation;
      })
      .map((r) => ({
        id: r.id,
        number: r.number,
        type: r.type,
        floor: r.floor,
        label: `${r.number} · ${capitalize(r.type)} · Floor ${r.floor}`,
      }));
  }),

  /** All housekeeping staff (for the assignment dropdown). */
  staff: protectedProcedure.query(async () => {
    return listStaff();
  }),

  /** Staff on duty with today's task progress. */
  staffOnDuty: protectedProcedure.query(async () => {
    const rows = await listStaffWithProgress();
    return rows.map((r) => {
      const avatar = avatarColors(r.name);
      const progress = r.total > 0 ? Math.round((r.done / r.total) * 100) : 0;
      return {
        id: String(r.id),
        name: r.name,
        initials: initials(r.name),
        avatarBg: avatar.bg,
        avatarColor: avatar.text,
        progressLabel:
          r.total > 0 ? `${r.done}/${r.total} tasks done` : "No tasks",
        progress,
      };
    });
  }),

  /** Create a new housekeeping task and update the room's service mode. */
  createTask: protectedProcedure
    .input(
      z.object({
        roomId: z.number(),
        type: z.enum(["cleaning", "maintenance"]),
        title: z.string().min(1, "Title is required"),
        priority: z.enum(["low", "medium", "high"]).default("medium"),
        notes: z.string().optional(),
        assignedToId: z.number().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      // Create the task
      const task = await createTask({
        roomId: input.roomId,
        type: input.type,
        title: input.title,
        priority: input.priority,
        notes: input.notes,
        assignedToId: input.assignedToId,
      });

      // Update the room's service mode to match the task type
      await updateRoomServiceMode(
        input.roomId,
        input.type,
        input.type === "maintenance" ? input.title : undefined,
      );

      return { id: task.id };
    }),

  /** Update a task's status (e.g. mark as done). */
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "in_progress", "done"]),
      }),
    )
    .mutation(async ({ input }) => {
      const updated = await updateTaskStatus(input.id, input.status);
      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });
      }
      return { id: updated.id };
    }),
});
