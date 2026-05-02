import { auth } from "@/lib/auth.server";
import type { Route } from "./+types/redirect";
import { redirect } from "react-router";
import { ROLES } from "@/lib/roles";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    throw redirect("/login");
  }

  if (session.user.role === ROLES.MANAGER) {
    throw redirect("/manager");
  }

  if (session.user.role === ROLES.RECEPTIONIST) {
    throw redirect("/receptionist");
  }
}

export default function Home() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <p className="text-muted-foreground text-sm">
        You are not authorized to use this application.
      </p>
    </div>
  );
}
