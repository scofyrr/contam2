import { createFileRoute } from "@tanstack/react-router";
import { createPermissionGuard } from "@/modules/auth/guards/permission-guards";
import { UsuariosAdminPremium } from "@/modules/auth/components/usuarios-admin-premium";

export const Route = createFileRoute("/_app/admin/usuarios")({
  beforeLoad: createPermissionGuard("admin.usuarios"),
  component: AdminUsuariosPage,
});

function AdminUsuariosPage() {
  return <UsuariosAdminPremium />;
}
