// routes/_app.tsx - MODIFICADO
import { createFileRoute, Outlet, Link, useRouter, useLocation, Navigate } from "@tanstack/react-router";
import { useSession } from "@/hooks/use-session";
import { supabase } from "@/integrations/supabase/client";
import { FileSpreadsheet, LogOut, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

const nav = [
  { to: "/sire-registros", label: "Registros SIRE", icon: FileSpreadsheet },
] as const;

function AppLayout() {
  const { session, loading, error } = useSession(); // ✅ Obtener error del provider
  const router = useRouter();
  const location = useLocation();

  // ✅ Mostrar error si hay problema de conexión (del provider o 402)
  if (error) {
    return (
      <div className="min-h-screen grid place-items-center p-4 bg-background">
        <div className="text-center space-y-6 max-w-md">
          <div className="flex justify-center">
            <div className="rounded-full bg-destructive/10 p-3">
              <AlertCircle className="size-8 text-destructive" />
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Error de conexión</h2>
            <p className="text-muted-foreground text-sm">
              No se pudo establecer conexión con el servidor de autenticación.
            </p>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg text-left space-y-3">
            <p className="text-xs font-mono text-destructive break-all">
              {error.message}
            </p>
            
            <div className="border-t border-border pt-3">
              <p className="text-xs font-medium mb-2">Posibles causas:</p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                <li>Problema de pago en Lovable.dev (Error 402)</li>
                <li>Variables de entorno de Supabase no configuradas</li>
                <li>El proyecto de Supabase no existe o está suspendido</li>
                <li>Problemas de red o CORS</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Button onClick={() => window.location.reload()} variant="default">
              <RefreshCw className="size-4 mr-2" />
              Reintentar
            </Button>
            <Button onClick={() => window.location.href = "/login"} variant="outline">
              Ir al login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Loading state con spinner (sin timeout adicional)
  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent mx-auto mb-4" />
          <div className="text-muted-foreground text-sm">Verificando sesión...</div>
        </div>
      </div>
    );
  }
  
  // ✅ Redirigir si no hay sesión
  if (!session) {
    return <Navigate to="/login" />;
  }

  // ✅ App normal
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
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
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
            <div className="font-medium text-sidebar-foreground truncate">
              {session.user.user_metadata?.nombre ?? session.user.email?.split('@')[0] ?? "Usuario"}
            </div>
            <div className="text-sidebar-foreground/60 text-xs truncate">{session.user.email}</div>
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
