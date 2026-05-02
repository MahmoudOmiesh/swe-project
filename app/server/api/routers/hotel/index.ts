import { router } from "@/server/api";
import { bookingsRouter } from "./bookings";
import { roomsRouter } from "./rooms";
import { dashboardRouter } from "./dashboard";

export const hotelRouter = router({
  bookings: bookingsRouter,
  rooms: roomsRouter,
  dashboard: dashboardRouter,
});
