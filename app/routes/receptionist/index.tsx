import { useRouteLoaderData } from "react-router";
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import type { loader as layoutLoader } from "./layout";
import type { User } from "@/lib/auth-client";

export default function ReceptionistHome() {
  const data = useRouteLoaderData<typeof layoutLoader>("routes/receptionist/layout");
  const user = data?.user as unknown as User;

  return <DashboardPage user={user} basePath="/receptionist" />;
}
