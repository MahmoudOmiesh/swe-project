import { auth } from "@/lib/auth.server";
import type { Route } from "../manager/+types/layout";
import { ROLES } from "@/lib/roles";
import { Outlet, redirect } from "react-router";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (session?.user?.role !== ROLES.MANAGER) {
    throw redirect("/");
  }
}

export default function ManagerLayout() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
