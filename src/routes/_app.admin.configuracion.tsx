import { createFileRoute } from "@tanstack/react-router";
import { createPermissionGuard } from "@/modules/auth/guards/permission-guards";
import { ConfiguracionPremiumPanel } from "@/modules/admin/components/configuracion-premium-panel";

export const Route = createFileRoute("/_app/admin/configuracion")({
  beforeLoad: createPermissionGuard("admin.configuracion"),
  component: AdminConfiguracionPage,
});

function AdminConfiguracionPage() {
  return <ConfiguracionPremiumPanel />;
}
