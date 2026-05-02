import { relations } from "drizzle-orm";
import { pgTable, integer, text, timestamp, numeric } from "drizzle-orm/pg-core";
import { reservations } from "./reservations";

export const reservationActivities = pgTable("reservation_activities", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  reservationId: integer("reservation_id")
    .notNull()
    .references(() => reservations.id, { onDelete: "cascade" }),

  activity: text("activity").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reservationActivitiesRelations = relations(
  reservationActivities,
  ({ one }) => ({
    reservation: one(reservations, {
      fields: [reservationActivities.reservationId],
      references: [reservations.id],
    }),
  }),
);
