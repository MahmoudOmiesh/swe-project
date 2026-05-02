import { relations } from "drizzle-orm";
import {
  pgTable,
  integer,
  text,
  numeric,
  timestamp,
} from "drizzle-orm/pg-core";
import { reservationServices } from "./reservation-services";

export const services = pgTable("services", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull().unique(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const servicesRelations = relations(services, ({ many }) => ({
  reservationServices: many(reservationServices),
}));
