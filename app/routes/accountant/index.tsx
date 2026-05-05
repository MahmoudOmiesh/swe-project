import { useRouteLoaderData } from "react-router";
import { AccountantDashboard } from "@/components/accountant/dashboard";
import type { loader as layoutLoader } from "./layout";
import type { User } from "@/lib/auth-client";

export default function AccountantHome() {
  const data = useRouteLoaderData<typeof layoutLoader>(
    "routes/accountant/layout",
  );
  const user = data?.user as unknown as User;

  return <AccountantDashboard user={user} />;
}
