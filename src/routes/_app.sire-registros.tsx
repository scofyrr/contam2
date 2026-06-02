import { createFileRoute } from "@tanstack/react-router";
import { SireRegistrosPage } from "@/components/sire/sire-registros-page";

export const Route = createFileRoute("/_app/sire-registros")({
  component: SireRegistrosPage,
});
