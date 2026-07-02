import { createFileRoute } from "@tanstack/react-router";
import { createPermissionGuard } from "@/modules/auth/guards/permission-guards";
import { PerformancePremiumPanel } from "@/modules/performance/components/performance-premium-panel";

export const Route = createFileRoute("/_app/admin/performance")({
  beforeLoad: createPermissionGuard("admin.configuracion"),
  component: AdminPerformancePage,
});

function AdminPerformancePage() {
  return <PerformancePremiumPanel />;
}
