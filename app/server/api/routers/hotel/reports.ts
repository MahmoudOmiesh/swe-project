import { z } from "zod";
import { financeProcedure, router } from "@/server/api";
import { getReportData } from "@/server/db/data-access/reports";

export const reportsRouter = router({
  /** Full report data for the reports page — KPIs, charts, summaries. */
  getData: financeProcedure
    .input(z.object({ timeRange: z.enum(["week", "month"]) }))
    .query(({ input }) => getReportData(input.timeRange)),
});
