import { createFileRoute } from "@tanstack/react-router";
import { ComprobantePage } from "@/components/comprobante-page";

export const Route = createFileRoute("/_app/compras")({
  head: () => ({ meta: [{ title: "Compras — CONTAM" }] }),
  component: () => <ComprobantePage tipo="COMPRA" />,
});
