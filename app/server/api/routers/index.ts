import { router } from "@/server/api";
import { testRouter } from "./test";
import { hotelRouter } from "./hotel";
import { myHousekeepingRouter } from "./housekeeping";

export const appRouter = router({
  test: testRouter,
  hotel: hotelRouter,
  myHousekeeping: myHousekeepingRouter,
});

export type AppRouter = typeof appRouter;
