import { createFileRoute, redirect, Outlet, Link, useRouter, useLocation } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { me, logout } from "@/lib/auth.functions";
import { useQuery } from "@tanstack/react-query";
import { LayoutDashboard, Users, Receipt, ShoppingCart, FileDown, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/_app")({
  beforeLoad: async () => {
    const u = await me();
    if (!u) throw redirect({ to: "/login" });
    return { user: u };
  },
  component: AppLayout,
});

const nav = [
  { to: "/dashboard", label: "Resumen", icon: LayoutDashboard },
  { to: "/entidades", label: "Entidades", icon: Users },
  { to: "/ventas", label: "Ventas (RVIE)", icon: Receipt },
  { to: "/compras", label: "Compras (RCE)", icon: ShoppingCart },
  { to: "/sire", label: "Exportar SIRE", icon: FileDown },
] as const;

function AppLayout() {
  const { user } = Route.useRouteContext();
  const router = useRouter();
  const location = useLocation();
  const doLogout = useServerFn(logout);
  const meFn = useServerFn(me);
  useQuery({ queryKey: ["me"], queryFn: () => meFn(), initialData: user });

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-64 shrink-0 bg-sidebar text-sidebar-foreground flex flex-col">
        <div className="p-5 flex items-center gap-3 border-b border-sidebar-border">
          <div className="size-9 rounded-md bg-sidebar-primary text-sidebar-primary-foreground grid place-items-center font-display font-bold">C</div>
          <div>
            <div className="font-display text-lg font-semibold leading-none">CONTAM</div>
            <div className="text-xs text-sidebar-foreground/60 mt-1">SUNAT / SIRE</div>
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
            <div className="font-medium text-sidebar-foreground">{user.nombre}</div>
            <div className="text-sidebar-foreground/60">{user.email}</div>
            <div className="text-sidebar-primary mt-1">{user.rol}</div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={async () => {
              await doLogout({});
              router.navigate({ to: "/login" });
            }}
          >
            <LogOut className="size-4 mr-2" /> Cerrar sesión
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
      <Toaster richColors position="top-right" />
    </div>
  );
}
