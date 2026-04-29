import { useState } from "react";
import { SignInForm } from "@/components/auth/sign-in-form";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { redirect } from "react-router";
import type { Route } from "./+types/login";
import { auth } from "@/lib/auth.server";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (session?.user) {
    throw redirect("/");
  }
}

export default function Auth() {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-4"
      style={{ background: "oklch(0.18 0.01 60)" }}
    >
      {mode === "sign-in" ? <SignInForm /> : <SignUpForm />}

      <p className="text-muted-foreground text-sm">
        <span>
          {mode === "sign-in"
            ? "Don't have an account? "
            : "Already have an account? "}
        </span>

        <button
          className="text-primary cursor-pointer underline-offset-4 hover:underline"
          onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
        >
          {mode === "sign-in" ? "Sign up" : "Sign in"}
        </button>
      </p>
    </div>
  );
}
