import { relations } from "drizzle-orm";
import { pgTable, integer, timestamp } from "drizzle-orm/pg-core";
import { reservations } from "./reservations";
import { services } from "./services";

export const reservationServices = pgTable("reservation_services", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  reservationId: integer("reservation_id")
    .notNull()
    .references(() => reservations.id, { onDelete: "cascade" }),
  serviceId: integer("service_id")
    .notNull()
    .references(() => services.id, { onDelete: "restrict" }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reservationServicesRelations = relations(
  reservationServices,
  ({ one }) => ({
    reservation: one(reservations, {
      fields: [reservationServices.reservationId],
      references: [reservations.id],
    }),
    service: one(services, {
      fields: [reservationServices.serviceId],
      references: [services.id],
    }),
  }),
);
