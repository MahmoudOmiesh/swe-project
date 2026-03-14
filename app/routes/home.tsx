import type { Route } from "./+types/home";
import { useTRPC } from "@/utils/trpc/react";
import { useQuery } from "@tanstack/react-query";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.test.hello.queryOptions());

  return (
    <div>
      <h1>Hello</h1>
      <p>{data}</p>
    </div>
  );
}
