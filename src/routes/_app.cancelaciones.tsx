import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/cancelaciones")({
  beforeLoad: () => {
    throw redirect({ to: "/libro-caja", search: { tab: "liquidaciones" } });
  },
});
