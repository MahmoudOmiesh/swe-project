import { router } from "@/server/api";
import { bookingsRouter } from "./bookings";
import { roomsRouter } from "./rooms";
import { dashboardRouter } from "./dashboard";
import { housekeepingRouter } from "./housekeeping";
import { suppliersRouter } from "./suppliers";

export const hotelRouter = router({
  bookings: bookingsRouter,
  rooms: roomsRouter,
  dashboard: dashboardRouter,
  housekeeping: housekeepingRouter,
  suppliers: suppliersRouter,
});
