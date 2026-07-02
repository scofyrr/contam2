import { createFileRoute } from "@tanstack/react-router";
import { createPermissionGuard } from "@/modules/auth/guards/permission-guards";
import { DashboardAdminPremium } from "@/modules/admin/components/dashboard-admin-premium";
import { ContadorDashboardPremium } from "@/modules/dashboard/components/contador-dashboard-premium";
import { useIsAdminDashboard } from "@/hooks/use-dashboard-premium";
import { Skeleton } from "@/components/ui/skeleton";
import { usePermissions } from "@/hooks/use-permissions";

export const Route = createFileRoute("/_app/dashboard")({
  beforeLoad: createPermissionGuard("dashboard.leer"),
  component: DashboardRouterPage,
});

function DashboardRouterPage() {
  const { loading } = usePermissions();
  const isAdmin = useIsAdminDashboard();

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-64 bg-white/5" />
        <div className="grid grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  if (isAdmin) {
    return <DashboardAdminPremium />;
  }

  return <ContadorDashboardPremium />;
}
