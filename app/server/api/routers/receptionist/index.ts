import { router } from "@/server/api";
import { bookingsRouter } from "./bookings";
import { roomsRouter } from "./rooms";

export const receptionistRouter = router({
  bookings: bookingsRouter,
  rooms: roomsRouter,
});
