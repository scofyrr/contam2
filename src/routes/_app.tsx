import { createFileRoute, Outlet, Link, useLocation } from "@tanstack/react-router";
import { useSession } from "@/hooks/use-session";
import { supabase } from "@/integrations/supabase/client";
import {
  FileSpreadsheet,
  LogOut,
  AlertCircle,
  RefreshCw,
  BookOpen,
  BarChart3,
  LayoutDashboard,
  Building2,
  FileText,
  Landmark,
  Wallet,
  UserCircle,
  ClipboardList,
  Shield,
  Bell,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiChatBubble } from "@/components/ai-chat-bubble";
import { AppTopBar, ExpandedModeHint } from "@/components/layout/app-topbar";
import { ContribuyentesProvider } from "@/hooks/use-contribuyentes";
import { NotificationsProvider } from "@/hooks/use-notifications";
import { AlertSystemProvider } from "@/hooks/use-alert-system";
import { FloatingAlertButtonPremium } from "@/components/notifications/floating-alert-button-premium";
import { SidebarAlertBadge } from "@/components/notifications/system-notifications-dropdown-premium";
import { useUiPreferences } from "@/hooks/use-ui-preferences";
import { AccessibilityLoupePremium } from "@/components/accessibility/accessibility-loupe-premium";
import { cn } from "@/lib/utils";
import { useEstudioConfig } from "@/hooks/use-estudio-config";
import { usePermission } from "@/hooks/use-permissions";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/contribuyentes", label: "Contribuyentes", icon: Building2 },
  { to: "/ficha-ruc", label: "Ficha RUC", icon: FileText },
  { to: "/pcge", label: "Plan de Cuentas", icon: Landmark },
  { to: "/tareas", label: "Tareas", icon: ClipboardList },
  { to: "/libro-caja", label: "Libro Caja", icon: Wallet },
  { to: "/sire-registros", label: "Registros SIRE", icon: FileSpreadsheet },
  { to: "/sire-sync", label: "Sync SIRE", icon: RefreshCw },
  { to: "/libro-diario", label: "Libro Diario", icon: BookOpen },
  { to: "/dashboard-estadisticas", label: "Estadísticas SIRE", icon: BarChart3 },
  { to: "/mi-cuenta", label: "Mi Cuenta", icon: UserCircle },
] as const;

const adminNav = { to: "/admin/usuarios", label: "Admin RBAC", icon: Shield } as const;
const auditoriaNav = { to: "/admin/auditoria", label: "Auditoría", icon: Shield } as const;
const performanceNav = { to: "/admin/performance", label: "Rendimiento", icon: Shield } as const;
const configuracionNav = { to: "/admin/configuracion", label: "Configuración", icon: Settings } as const;

function AppLayout() {
  const { session, loading, error } = useSession();
  const location = useLocation();

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
            <p className="text-xs font-mono text-destructive break-all">{error.message}</p>

            <div className="border-t border-border pt-3">
              <p className="text-xs font-medium mb-2">Posibles causas:</p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
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
          </div>
        </div>
      </div>
    );
  }

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

  if (!session) {
    return (
      <div className="min-h-screen grid place-items-center bg-background p-4">
        <div className="text-center space-y-4">
          <div className="text-destructive text-lg font-semibold">No autenticado</div>
          <p className="text-muted-foreground text-sm">
            Inicia sesión para acceder al sistema contable.
          </p>
          <Button onClick={() => (window.location.href = "/login")}>Ir al login</Button>
        </div>
      </div>
    );
  }

  return (
    <NotificationsProvider>
      <AlertSystemProvider>
        <DashboardShell session={session} location={location} />
      </AlertSystemProvider>
    </NotificationsProvider>
  );
}

function DashboardShell({
  session,
  location,
}: {
  session: NonNullable<ReturnType<typeof useSession>["session"]>;
  location: ReturnType<typeof useLocation>;
}) {
  const { expandedMode, toggleExpandedMode } = useUiPreferences();
  const canAdmin = usePermission("admin.usuarios");
  const canAuditoria = usePermission("admin.auditoria");
  const canPerformance = usePermission("admin.configuracion");
  const { sidebar, colores, isFeatureActive } = useEstudioConfig();
  const userEmail = session.user.email ?? "";
  const userName =
    session.user.user_metadata?.nombre ?? userEmail.split("@")[0] ?? "Usuario";

  return (
    <div className="min-h-screen flex bg-background font-sans">
      {!expandedMode && (
        <aside className="w-64 shrink-0 bg-sidebar text-sidebar-foreground flex flex-col shadow-premium-elevated border-r border-sidebar-border">
          <button
            type="button"
            onClick={toggleExpandedMode}
            className="p-6 flex items-center gap-3 border-b border-sidebar-border w-full text-left transition-all duration-300 hover:bg-sidebar-accent/50 group cursor-pointer"
            title="Clic para activar Modo Expandido (pantalla completa)"
          >
            <div className="size-10 rounded-xl bg-primary text-primary-foreground grid place-items-center font-display font-bold shadow-premium-medium pulse-glow group-hover:scale-105 transition-transform">
              C
            </div>
            <div>
              <div className="font-display text-lg font-semibold leading-none tracking-tight text-premium-gold">
                CONTAM
              </div>
              <div className="text-xs text-sidebar-foreground/60 mt-1.5">Sistema Contable</div>
            </div>
          </button>

          <nav className="flex-1 p-4 space-y-1">
            {nav
              .filter(({ to }) => {
                if (!sidebar.modulos.includes(to)) return false;
                if (to === "/dashboard-estadisticas" && !sidebar.mostrar_dashboard_estadisticas) return false;
                if (to === "/sire-sync" && !sidebar.mostrar_estadisticas_sire) return false;
                return true;
              })
              .map(({ to, label, icon: Icon }) => {
              const active = location.pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-300 ease-out",
                    active
                      ? "bg-primary text-primary-foreground font-medium shadow-premium-medium border border-primary/25"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground hover:translate-x-0.5",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-4 shrink-0",
                      active ? "text-primary-foreground" : "text-sidebar-foreground/50",
                    )}
                    strokeWidth={1.5}
                  />
                  {label}
                  {to === "/tareas" && <SidebarAlertBadge type="tasks" />}
                </Link>
              );
            })}
            {canAdmin ? (
              <Link
                to="/admin/dashboard-estudio"
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-300 ease-out mt-2 border border-[#C8A95A]/20",
                  location.pathname.startsWith("/admin/dashboard-estudio")
                    ? "bg-[#C8A95A]/15 text-[#C8A95A] font-medium"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-[#C8A95A]",
                )}
              >
                <LayoutDashboard className="size-4 shrink-0" strokeWidth={1.5} />
                Centro de Control
              </Link>
            ) : null}
            {canAdmin ? (
              <Link
                to={adminNav.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-300 ease-out mt-2 border border-[#C8A44D]/20",
                  location.pathname.startsWith(adminNav.to)
                    ? "bg-[#C8A44D]/20 text-[#C8A44D] font-medium"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-[#C8A44D]",
                )}
              >
                <Shield className="size-4 shrink-0" strokeWidth={1.5} />
                {adminNav.label}
              </Link>
            ) : null}
            {canAuditoria ? (
              <Link
                to={auditoriaNav.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-300 ease-out border border-[#00C8FF]/20",
                  location.pathname.startsWith(auditoriaNav.to)
                    ? "bg-[#00C8FF]/20 text-[#00C8FF] font-medium"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-[#00C8FF]",
                )}
              >
                <Shield className="size-4 shrink-0" strokeWidth={1.5} />
                {auditoriaNav.label}
              </Link>
            ) : null}
            {canPerformance ? (
              <Link
                to={performanceNav.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-300 ease-out border border-[#00C897]/20",
                  location.pathname.startsWith(performanceNav.to)
                    ? "bg-[#00C897]/20 text-[#00C897] font-medium"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-[#00C897]",
                )}
              >
                <Shield className="size-4 shrink-0" strokeWidth={1.5} />
                {performanceNav.label}
              </Link>
            ) : null}
            {canPerformance ? (
              <Link
                to={configuracionNav.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-300 ease-out border border-[#C8A95A]/20",
                  location.pathname.startsWith(configuracionNav.to)
                    ? "bg-[#C8A95A]/15 text-[#C8A95A] font-medium"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-[#C8A95A]",
                )}
              >
                <Settings className="size-4 shrink-0" strokeWidth={1.5} />
                {configuracionNav.label}
              </Link>
            ) : null}
            <Link
              to="/notificaciones"
              className={cn(
                "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-300 ease-out mt-2 border border-[#00D4FF]/15",
                location.pathname.startsWith("/notificaciones")
                  ? "bg-[#00D4FF]/15 text-[#00D4FF] font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-[#00D4FF]",
              )}
            >
              <Bell className="size-4 shrink-0" strokeWidth={1.5} />
              Notificaciones
              <SidebarAlertBadge type="notifications" />
            </Link>
          </nav>

          <div className="p-4 border-t border-sidebar-border space-y-2">
            <div className="px-3 py-3 rounded-xl glass-surface text-xs">
              <div className="font-medium text-sidebar-foreground truncate">{userName}</div>
              <div className="text-sidebar-foreground/50 text-xs truncate mt-0.5">{userEmail}</div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground rounded-xl"
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = "/login";
              }}
            >
              <LogOut className="size-4 mr-2" />
              Cerrar sesión
            </Button>
          </div>
        </aside>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <AppTopBar />
        <main className="flex-1 overflow-x-hidden bg-background page-enter">
          <ContribuyentesProvider>
            <Outlet />
          </ContribuyentesProvider>
        </main>
      </div>

      {expandedMode && (
        <button
          type="button"
          onClick={toggleExpandedMode}
          className="fixed top-4 left-4 z-40 flex items-center gap-2 rounded-xl bg-sidebar text-sidebar-foreground px-3 py-2 shadow-lg border border-sidebar-border hover:bg-sidebar-accent transition-colors cursor-pointer"
          title="Clic para restaurar Modo Estándar"
        >
          <div className="size-8 rounded-lg bg-primary text-primary-foreground grid place-items-center font-display font-bold text-sm">
            C
          </div>
          <span className="font-display text-sm font-semibold hidden sm:inline">CONTAM</span>
        </button>
      )}

      <ExpandedModeHint />
      {sidebar.mostrar_lupa_accesibilidad && <AccessibilityLoupePremium />}
      {colores.fab_visible && isFeatureActive("fab_alertas_dual") && <FloatingAlertButtonPremium />}
      {(sidebar.mostrar_chat_ai || isFeatureActive("chat_ia_contador")) && <AiChatBubble />}
    </div>
  );
}
