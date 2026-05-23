import { createFileRoute, Outlet, Link, useRouter, useLocation, Navigate } from "@tanstack/react-router";
import { useSession } from "@/hooks/use-session";
import { supabase } from "@/integrations/supabase/client";
import { FileSpreadsheet, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  if (loading) return <div className="min-h-screen grid place-items-center text-muted-foreground text-sm">Cargando sesión…</div>;
  if (!session) return <Navigate to="/login" />;

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
              <Link key={to} to={to}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${active ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50"}`}>
                <Icon className="size-4" />{label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border space-y-2">
          <div className="px-3 py-2 text-xs">
            <div className="font-medium text-sidebar-foreground">{session.user.user_metadata?.nombre ?? "Administrador"}</div>
            <div className="text-sidebar-foreground/60">{session.user.email}</div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={async () => { await supabase.auth.signOut(); router.navigate({ to: "/login" }); }}>
            <LogOut className="size-4 mr-2" /> Cerrar sesión
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-x-hidden"><Outlet /></main>
    </div>
  );
}
