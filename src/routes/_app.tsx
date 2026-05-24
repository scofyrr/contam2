import { createFileRoute, Outlet, Link, useRouter, useLocation, Navigate } from "@tanstack/react-router";
import { useSession } from "@/hooks/use-session";
import { supabase } from "@/integrations/supabase/client";
import { FileSpreadsheet, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

const nav = [
  { to: "/sire-registros", label: "Registros SIRE", icon: FileSpreadsheet },
] as const;

function AppLayout() {
  const { session, loading } = useSession();
  const router = useRouter();
  const location = useLocation();
  const [timeoutReached, setTimeoutReached] = useState(false);

  // ✅ Timeout de emergencia: si después de 5 segundos sigue cargando, mostrar error
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.warn("⚠️ Timeout: loading siguió true por 5 segundos");
        setTimeoutReached(true);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [loading]);

  // ✅ Mostrar error si hubo timeout
  if (timeoutReached) {
    return (
      <div className="min-h-screen grid place-items-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-destructive text-lg font-semibold">⚠️ Error de conexión</div>
          <p className="text-muted-foreground text-sm">
            No se pudo conectar con Supabase. Verificá que las variables de entorno estén configuradas.
          </p>
          <div className="bg-muted p-3 rounded text-left text-xs">
            <strong>Posibles causas:</strong>
            <ul className="list-disc pl-4 mt-2 space-y-1">
              <li>Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY</li>
              <li>El proyecto de Supabase no existe</li>
              <li>Problemas de red/CORS en Lovable</li>
            </ul>
          </div>
          <Button onClick={() => window.location.reload()}>Reintentar</Button>
        </div>
      </div>
    );
  }

  // ✅ Loading state con spinner
  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <div className="text-muted-foreground text-sm">Cargando sesión…</div>
        </div>
      </div>
    );
  }
  
  if (!session) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-64 shrink-0 bg-sidebar text-sidebar-foreground flex flex-col">
        <div className="p-5 flex items-center gap-3 border-b border-sidebar-border">
          <div className="size-9 rounded-md bg-sidebar-primary text-sidebar-primary-foreground grid place-items-center font-display font-bold">C</div>
          <div>
            <div className="font-display text-lg font-semibold leading-none">CONTAM</div>
            <div className="text-xs text-sidebar-foreground/60 mt-1">Sistema Contable Moderno</div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map(({ to, label, icon: Icon }) => {
            const active = location.pathname.startsWith(to);
            return (
              <Link 
                key={to} 
                to={to}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  active 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50"
                }`}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border space-y-2">
          <div className="px-3 py-2 text-xs">
            <div className="font-medium text-sidebar-foreground">
              {session.user.user_metadata?.nombre ?? "Administrador"}
            </div>
            <div className="text-sidebar-foreground/60">{session.user.email}</div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={async () => { 
              await supabase.auth.signOut(); 
              router.navigate({ to: "/login" }); 
            }}
          >
            <LogOut className="size-4 mr-2" /> 
            Cerrar sesión
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
