import { createFileRoute } from "@tanstack/react-router";
import { createPermissionGuard } from "@/modules/auth/guards/permission-guards";
import { DashboardAdminPremium } from "@/modules/admin/components/dashboard-admin-premium";

export const Route = createFileRoute("/_app/admin/dashboard-estudio")({
  beforeLoad: createPermissionGuard("dashboard.configurar"),
  component: AdminDashboardEstudioPage,
});

function AdminDashboardEstudioPage() {
  return <DashboardAdminPremium />;
}
