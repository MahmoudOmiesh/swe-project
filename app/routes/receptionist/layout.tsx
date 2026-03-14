import { auth } from "@/lib/auth.server";
import type { Route } from "../receptionist/+types/layout";
import { ROLES } from "@/lib/roles";
import { Outlet, redirect } from "react-router";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (session?.user?.role !== ROLES.RECEPTIONIST) {
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
