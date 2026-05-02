import { router } from "@/server/api";
import { testRouter } from "./test";
import { receptionistRouter } from "./receptionist";

export const appRouter = router({
  test: testRouter,
  receptionist: receptionistRouter,
});

export type AppRouter = typeof appRouter;
