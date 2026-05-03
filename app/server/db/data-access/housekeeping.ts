import { eq, and, gte, sql } from "drizzle-orm";
import { db } from "@/server/db";
import {
  housekeepingTasks,
  housekeepingStaff,
} from "@/server/db/schema";

// ─── Staff ──────────────────────────────────────────────────────────────────

/** List all housekeeping staff. */
export async function listStaff() {
  return db.query.housekeepingStaff.findMany({
    orderBy: (s, { asc }) => [asc(s.name)],
  });
}

/** List staff with today's task progress (assigned/done counts). */
export async function listStaffWithProgress() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  return db
    .select({
      id: housekeepingStaff.id,
      name: housekeepingStaff.name,
      total: sql<number>`count(${housekeepingTasks.id})`.mapWith(Number),
      done: sql<number>`count(*) filter (where ${housekeepingTasks.status} = 'done')`.mapWith(
        Number,
      ),
    })
    .from(housekeepingStaff)
    .leftJoin(
      housekeepingTasks,
      and(
        eq(housekeepingTasks.assignedToId, housekeepingStaff.id),
        gte(housekeepingTasks.createdAt, startOfDay),
      ),
    )
    .groupBy(housekeepingStaff.id, housekeepingStaff.name)
    .orderBy(housekeepingStaff.name);
}

// ─── Tasks ──────────────────────────────────────────────────────────────────

/** List today's housekeeping tasks with their associated room. */
export async function listTodayTasks() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  return db.query.housekeepingTasks.findMany({
    where: gte(housekeepingTasks.createdAt, startOfDay),
    with: {
      room: {
        columns: { id: true, number: true, type: true, floor: true },
      },
      assignedTo: {
        columns: { id: true, name: true },
      },
    },
    orderBy: (tasks, { asc }) => [asc(tasks.createdAt)],
  });
}

/** List all open maintenance issues (any date, not done). */
export async function listMaintenanceIssues() {
  return db.query.housekeepingTasks.findMany({
    where: and(
      eq(housekeepingTasks.type, "maintenance"),
      eq(housekeepingTasks.status, "pending"),
    ),
    with: {
      room: {
        columns: { id: true, number: true, type: true, floor: true },
      },
    },
    orderBy: (tasks, { desc }) => [desc(tasks.createdAt)],
  });
}

/** Get aggregate metrics for today's housekeeping. */
export async function getHousekeepingMetrics() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const rows = await db
    .select({
      toClean: sql<number>`count(*) filter (where ${housekeepingTasks.type} = 'cleaning' and ${housekeepingTasks.status} != 'done' and ${housekeepingTasks.createdAt} >= ${startOfDay})`.mapWith(
        Number,
      ),
      cleanedToday: sql<number>`count(*) filter (where ${housekeepingTasks.type} = 'cleaning' and ${housekeepingTasks.status} = 'done' and ${housekeepingTasks.createdAt} >= ${startOfDay})`.mapWith(
        Number,
      ),
      maintenance: sql<number>`count(*) filter (where ${housekeepingTasks.type} = 'maintenance' and ${housekeepingTasks.status} != 'done')`.mapWith(
        Number,
      ),
      urgent: sql<number>`count(*) filter (where ${housekeepingTasks.priority} = 'high' and ${housekeepingTasks.status} != 'done' and ${housekeepingTasks.createdAt} >= ${startOfDay})`.mapWith(
        Number,
      ),
    })
    .from(housekeepingTasks);

  return rows[0] ?? { toClean: 0, cleanedToday: 0, maintenance: 0, urgent: 0 };
}

/** Create a new housekeeping task (cleaning or maintenance). */
export async function createTask(input: {
  roomId: number;
  type: "cleaning" | "maintenance";
  title: string;
  priority?: "low" | "medium" | "high";
  notes?: string;
  assignedToId?: number;
}) {
  const [task] = await db
    .insert(housekeepingTasks)
    .values({
      roomId: input.roomId,
      type: input.type,
      title: input.title,
      priority: input.priority ?? "medium",
      notes: input.notes,
      assignedToId: input.assignedToId,
    })
    .returning();

  return task;
}

/** Update the status of a task. */
export async function updateTaskStatus(
  id: number,
  status: "pending" | "in_progress" | "done",
) {
  const [updated] = await db
    .update(housekeepingTasks)
    .set({ status })
    .where(eq(housekeepingTasks.id, id))
    .returning();

  return updated;
}
