import { createFileRoute } from "@tanstack/react-router";
import { ComprobantePage } from "@/components/comprobante-page";

export const Route = createFileRoute("/_app/ventas")({
  head: () => ({ meta: [{ title: "Ventas — CONTAM" }] }),
  component: () => <ComprobantePage tipo="VENTA" />,
});
