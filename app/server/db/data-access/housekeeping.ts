import { eq, and, gte, sql, asc } from "drizzle-orm";
import { db } from "@/server/db";
import { housekeepingTasks, user } from "@/server/db/schema";
import { ROLES } from "@/lib/roles";

// ─── Staff (users with `housekeeping` role) ────────────────────────────────

/** List all users with the housekeeping role. */
export async function listStaff() {
  return db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
    })
    .from(user)
    .where(eq(user.role, ROLES.HOUSEKEEPING))
    .orderBy(asc(user.name));
}

/** List housekeeping users with today's task progress (assigned/done counts). */
export async function listStaffWithProgress() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  return db
    .select({
      id: user.id,
      name: user.name,
      total: sql<number>`count(${housekeepingTasks.id})`.mapWith(Number),
      done: sql<number>`count(*) filter (where ${housekeepingTasks.status} = 'done')`.mapWith(
        Number,
      ),
    })
    .from(user)
    .leftJoin(
      housekeepingTasks,
      and(
        eq(housekeepingTasks.assignedToId, user.id),
        gte(housekeepingTasks.createdAt, startOfDay),
      ),
    )
    .where(eq(user.role, ROLES.HOUSEKEEPING))
    .groupBy(user.id, user.name)
    .orderBy(user.name);
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

/** List tasks assigned to a specific housekeeping user (today's tasks only). */
export async function listMyTasks(userId: string) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  return db.query.housekeepingTasks.findMany({
    where: and(
      eq(housekeepingTasks.assignedToId, userId),
      gte(housekeepingTasks.createdAt, startOfDay),
    ),
    with: {
      room: {
        columns: { id: true, number: true, type: true, floor: true },
      },
    },
    orderBy: (tasks, { asc, desc }) => [
      asc(tasks.status),
      desc(tasks.priority),
      asc(tasks.createdAt),
    ],
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

/** Per-user metrics for a single housekeeper (today). */
export async function getMyMetrics(userId: string) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const rows = await db
    .select({
      assigned: sql<number>`count(*) filter (where ${housekeepingTasks.createdAt} >= ${startOfDay})`.mapWith(
        Number,
      ),
      pending: sql<number>`count(*) filter (where ${housekeepingTasks.status} = 'pending' and ${housekeepingTasks.createdAt} >= ${startOfDay})`.mapWith(
        Number,
      ),
      inProgress: sql<number>`count(*) filter (where ${housekeepingTasks.status} = 'in_progress' and ${housekeepingTasks.createdAt} >= ${startOfDay})`.mapWith(
        Number,
      ),
      done: sql<number>`count(*) filter (where ${housekeepingTasks.status} = 'done' and ${housekeepingTasks.createdAt} >= ${startOfDay})`.mapWith(
        Number,
      ),
    })
    .from(housekeepingTasks)
    .where(eq(housekeepingTasks.assignedToId, userId));

  return rows[0] ?? { assigned: 0, pending: 0, inProgress: 0, done: 0 };
}

/** Create a new housekeeping task (cleaning or maintenance). */
export async function createTask(input: {
  roomId: number;
  type: "cleaning" | "maintenance";
  title: string;
  priority?: "low" | "medium" | "high";
  notes?: string;
  assignedToId: string;
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

/** Update task status only if assigned to the given user. */
export async function updateMyTaskStatus(
  id: number,
  userId: string,
  status: "pending" | "in_progress" | "done",
) {
  const [updated] = await db
    .update(housekeepingTasks)
    .set({ status })
    .where(
      and(
        eq(housekeepingTasks.id, id),
        eq(housekeepingTasks.assignedToId, userId),
      ),
    )
    .returning();

  return updated;
}
