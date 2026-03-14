import { relations } from "drizzle-orm";
import { pgTable, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { reservations } from "./reservations";

export const roomType = pgEnum("room_type", ["single", "double", "triple"]);
export const roomStatus = pgEnum("room_status", [
  "available",
  "occupied",
  "maintenance",
]);

export const rooms = pgTable("rooms", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  number: text("room_number").notNull().unique(),
  type: roomType("type").notNull(),
  status: text("status").notNull().default("available"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const roomsRelations = relations(rooms, ({ many }) => ({
  reservations: many(reservations),
}));
