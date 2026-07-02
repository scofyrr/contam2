import type { ComponentType } from "react";
import { Link } from "@tanstack/react-router";
import {
  CheckSquare,
  FilePlus,
  Link2,
  Wallet,
  BookOpen,
  ClipboardList,
  FileSpreadsheet,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWidgetDashboard } from "@/modules/dashboard/context/widget-dashboard-context";
import { DashboardSection } from "@/modules/dashboard/components/dashboard-shared";

const ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  FilePlus,
  CheckSquare,
  Wallet,
  BookOpen,
  ClipboardList,
  FileSpreadsheet,
  LayoutDashboard,
  Link: Link2,
};

function resolveIcon(name: string) {
  return ICON_MAP[name] ?? Link2;
}

export function EnlacesRapidosWidget() {
  const { contenido, colores } = useWidgetDashboard();
  const enlaces = contenido.enlaces_rapidos ?? [];

  if (enlaces.length === 0) return null;

  return (
    <DashboardSection title="Enlaces rápidos" icon={<Link2 className="size-4" style={{ color: colores.acento }} />}>
      <div className="grid gap-2">
        {enlaces.map((e) => {
          const Icon = resolveIcon(e.icono);
          return (
            <Button
              key={`${e.url}-${e.label}`}
              variant="outline"
              size="sm"
              className="justify-start rounded-xl border-white/10 h-9 text-xs"
              asChild
            >
              <Link to={e.url}>
                <Icon className="size-3.5 mr-2" style={{ color: colores.acento }} />
                {e.label}
              </Link>
            </Button>
          );
        })}
      </div>
    </DashboardSection>
  );
}

export default EnlacesRapidosWidget;
