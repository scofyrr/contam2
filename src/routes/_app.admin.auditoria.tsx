import { createFileRoute } from "@tanstack/react-router";
import { createPermissionGuard } from "@/modules/auth/guards/permission-guards";
import { AuditoriaPremiumPanel } from "@/modules/auditoria/components/auditoria-premium-panel";

export const Route = createFileRoute("/_app/admin/auditoria")({
  beforeLoad: createPermissionGuard("admin.auditoria"),
  component: AdminAuditoriaPage,
});

function AdminAuditoriaPage() {
  return <AuditoriaPremiumPanel />;
}
