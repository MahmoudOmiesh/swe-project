import { router } from "@/server/api";
import { testRouter } from "./test";
import { hotelRouter } from "./hotel";

export const appRouter = router({
  test: testRouter,
  hotel: hotelRouter,
});

export type AppRouter = typeof appRouter;
