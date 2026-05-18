import { createFileRoute, redirect } from "@tanstack/react-router";
import { me } from "@/lib/auth.functions";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const u = await me();
    if (u) throw redirect({ to: "/dashboard" });
    throw redirect({ to: "/login" });
  },
});
