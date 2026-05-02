import { router } from "@/server/api";
import { bookingsRouter } from "./bookings";

export const receptionistRouter = router({
  bookings: bookingsRouter,
});
