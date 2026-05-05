import { useRouteLoaderData } from "react-router";
import { MyHousekeepingPage } from "@/components/my-housekeeping";
import type { loader as layoutLoader } from "./layout";
import type { User } from "@/lib/auth-client";

export default function HousekeepingHome() {
  const data = useRouteLoaderData<typeof layoutLoader>(
    "routes/housekeeping/layout",
  );
  const user = data?.user as unknown as User;

  return <MyHousekeepingPage user={user} />;
}
