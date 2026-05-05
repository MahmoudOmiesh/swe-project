import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  integer,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { rooms } from "./rooms";
import { user } from "./auth";

export const taskType = pgEnum("housekeeping_task_type", [
  "cleaning",
  "maintenance",
]);

export const taskPriority = pgEnum("housekeeping_task_priority", [
  "low",
  "medium",
  "high",
]);

export const taskStatus = pgEnum("housekeeping_task_status", [
  "pending",
  "in_progress",
  "done",
]);

// ─── Housekeeping tasks (cleaning + maintenance) ────────────────────────────
//
// Tasks are now assigned directly to users with the `housekeeping` role
// (auth `user` table), so a separate housekeeping_staff table is no longer
// needed.

export const housekeepingTasks = pgTable("housekeeping_tasks", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  roomId: integer("room_id")
    .notNull()
    .references(() => rooms.id, { onDelete: "cascade" }),
  assignedToId: text("assigned_to_id").references(() => user.id, {
    onDelete: "set null",
  }),
  type: taskType("type").notNull(),
  title: text("title").notNull(),
  priority: taskPriority("priority").notNull().default("medium"),
  status: taskStatus("status").notNull().default("pending"),
  notes: text("notes"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const housekeepingTasksRelations = relations(
  housekeepingTasks,
  ({ one }) => ({
    room: one(rooms, {
      fields: [housekeepingTasks.roomId],
      references: [rooms.id],
    }),
    assignedTo: one(user, {
      fields: [housekeepingTasks.assignedToId],
      references: [user.id],
    }),
  }),
);
