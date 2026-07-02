import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/hooks/use-permissions";

export const Route = createFileRoute("/unauthorized")({
  validateSearch: (search: Record<string, unknown>) => ({
    permiso: typeof search.permiso === "string" ? search.permiso : undefined,
    from: typeof search.from === "string" ? search.from : undefined,
  }),
  component: UnauthorizedPage,
});

function UnauthorizedPage() {
  const { permiso, from } = Route.useSearch();
  const { roles, loading } = usePermissions();
  const sinRoles = !loading && roles.length === 0;

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-b from-[#060B14] to-[#080E1E] p-6">
      <div className="max-w-lg w-full text-center space-y-6">
        <div className="relative mx-auto w-32 h-32">
          <div className="absolute inset-0 rounded-full bg-[#FF5E7A]/20 blur-2xl animate-pulse" />
          <div className="relative size-32 rounded-full border border-[#FF5E7A]/30 bg-white/[0.03] grid place-items-center backdrop-blur-xl">
            <Lock className="size-14 text-[#FF5E7A]" strokeWidth={1.5} />
          </div>
        </div>

        <div>
          <h1 className="font-display text-2xl text-[#E8EDF5]">Acceso Restringido</h1>
          <p className="text-[#8899B4] text-sm mt-2">
            {sinRoles
              ? "Tu cuenta no tiene roles asignados. Solicita acceso al administrador del estudio."
              : "No tienes los permisos necesarios para acceder a esta sección."}
          </p>
        </div>

        {permiso ? (
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-left">
            <div className="flex items-center gap-2 text-[#FF5E7A] text-sm font-medium">
              <ShieldAlert className="size-4" />
              Permiso requerido
            </div>
            <p className="font-mono text-[#C8A44D] text-sm mt-2">{permiso}</p>
            {from ? <p className="text-xs text-[#8899B4] mt-2">Ruta: {from}</p> : null}
          </div>
        ) : null}

        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild className="bg-[#C8A44D] text-black hover:bg-[#C8A44D]/90">
            <Link to="/dashboard-estadisticas">Volver al inicio</Link>
          </Button>
          {sinRoles ? (
            <Button asChild variant="outline" className="border-white/10">
              <a href="mailto:admin@estudio.com?subject=Solicitud%20de%20acceso%20CONTAM">Solicitar acceso</a>
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
