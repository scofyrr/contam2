import { useEffect, useState, type ReactNode } from "react";
import {
  Building2,
  Calendar,
  CheckCircle2,
  MapPin,
  Shield,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Contribuyente, RegimenTributario } from "@/modules/profiling/types/profiling";

const GLASS =
  "rounded-2xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-md text-slate-100 shadow-xl shadow-emerald-950/20";

function useClientMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

function formatDate(iso: string | null, mounted: boolean): string {
  if (!iso || !mounted) return "—";
  try {
    return new Intl.DateTimeFormat("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "America/Lima",
    }).format(new Date(iso.includes("T") ? iso : `${iso}T12:00:00`));
  } catch {
    return iso;
  }
}

function CondicionDomicilioBadge({ condicion }: { condicion: string | null }) {
  const normalized = (condicion ?? "").toUpperCase();
  const habido = normalized.includes("HABIDO") && !normalized.includes("NO");

  if (!condicion) {
    return (
      <Badge variant="outline" className="border-slate-600 text-slate-400">
        Sin condición
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-semibold tracking-wide",
        habido
          ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300"
          : "border-red-500/50 bg-red-500/15 text-red-300",
      )}
    >
      {habido ? "HABIDO" : "NO HABIDO"}
    </Badge>
  );
}

function RegimenBadge({ regimen }: { regimen: RegimenTributario | null }) {
  if (!regimen) {
    return (
      <Badge variant="outline" className="border-slate-600 text-slate-400">
        Régimen N/D
      </Badge>
    );
  }

  const colors: Record<RegimenTributario, string> = {
    NRUS: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    RER: "border-sky-500/40 bg-sky-500/10 text-sky-300",
    RMT: "border-violet-500/40 bg-violet-500/10 text-violet-300",
    RG: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  };

  const labels: Record<RegimenTributario, string> = {
    NRUS: "Nuevo RUS",
    RER: "RER",
    RMT: "RMT",
    RG: "Régimen General",
  };

  return (
    <Badge variant="outline" className={cn("font-medium", colors[regimen])}>
      {labels[regimen]}
    </Badge>
  );
}

function EstadoContribuyenteBadge({ estado }: { estado: string | null }) {
  const u = (estado ?? "").toUpperCase();
  const activo = u.includes("ACTIV") && !u.includes("INACTIV");

  return (
    <Badge
      variant="outline"
      className={cn(
        activo
          ? "border-emerald-500/40 text-emerald-300"
          : "border-slate-500/40 text-slate-400",
      )}
    >
      {estado ?? "Sin estado SUNAT"}
    </Badge>
  );
}

export interface FichaRucCardProps {
  contribuyente: Contribuyente;
  className?: string;
}

export function FichaRucCard({ contribuyente, className }: FichaRucCardProps) {
  const mounted = useClientMounted();

  const ubicacion = [contribuyente.distrito, contribuyente.provincia, contribuyente.departamento]
    .filter(Boolean)
    .join(", ");

  return (
    <article className={cn(GLASS, "overflow-hidden", className)}>
      <header className="border-b border-slate-800/80 bg-gradient-to-r from-emerald-950/40 to-slate-900/40 px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-400/90">
              <Building2 className="size-5" />
              <span className="text-xs font-semibold uppercase tracking-widest">
                Ficha RUC — Profiling
              </span>
            </div>
            <h2 className="text-xl font-bold leading-tight text-slate-50 sm:text-2xl">
              {contribuyente.razonSocial}
            </h2>
            {contribuyente.nombreComercial && (
              <p className="text-sm text-slate-400">{contribuyente.nombreComercial}</p>
            )}
          </div>

          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-right">
            <p className="text-[10px] uppercase tracking-wider text-emerald-400/80">RUC</p>
            <p className="font-mono text-lg font-bold text-emerald-300">{contribuyente.ruc}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <CondicionDomicilioBadge condicion={contribuyente.condicionDomicilio} />
          <EstadoContribuyenteBadge estado={contribuyente.estadoContribuyente} />
          <RegimenBadge regimen={contribuyente.codigoRegimen} />
          {contribuyente.esBuenContribuyente && (
            <Badge variant="outline" className="border-emerald-400/40 text-emerald-300">
              <ShieldCheck className="mr-1 size-3" /> Buen Contribuyente
            </Badge>
          )}
          {contribuyente.esAgenteRetencion && (
            <Badge variant="outline" className="border-amber-400/40 text-amber-300">
              <ShieldAlert className="mr-1 size-3" /> Agente Retención
            </Badge>
          )}
          {contribuyente.esAgentePercepcion && (
            <Badge variant="outline" className="border-orange-400/40 text-orange-300">
              <Shield className="mr-1 size-3" /> Agente Percepción
            </Badge>
          )}
        </div>
      </header>

      <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
        <InfoTile
          icon={<MapPin className="size-4 text-emerald-400" />}
          label="Domicilio fiscal"
          value={contribuyente.direccionFiscal ?? "—"}
          sub={ubicacion || undefined}
        />
        <InfoTile
          icon={<Calendar className="size-4 text-emerald-400" />}
          label="Inicio actividades"
          value={formatDate(contribuyente.fechaInicioActividades, mounted)}
        />
        <InfoTile
          icon={<CheckCircle2 className="size-4 text-emerald-400" />}
          label="Actividad principal"
          value={contribuyente.actividadEconomicaPrincipal ?? "—"}
        />
        <InfoTile
          label="Sistema emisión"
          value={contribuyente.sistemaEmision ?? "—"}
        />
        <InfoTile
          label="Sistema contabilidad"
          value={contribuyente.sistemaContabilidad ?? "—"}
        />
        <InfoTile
          label="Ubigeo"
          value={contribuyente.ubigeo ?? "—"}
        />
      </div>

      {(contribuyente.anexos.length > 0 ||
        contribuyente.representantes.length > 0 ||
        contribuyente.tributos.length > 0) && (
        <footer className="grid gap-4 border-t border-slate-800/80 px-6 py-4 sm:grid-cols-3">
          <CountPill label="Anexos" count={contribuyente.anexos.length} />
          <CountPill label="Representantes" count={contribuyente.representantes.length} />
          <CountPill label="Tributos" count={contribuyente.tributos.length} />
        </footer>
      )}
    </article>
  );
}

function InfoTile({
  icon,
  label,
  value,
  sub,
}: {
  icon?: ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800/60 bg-slate-950/40 p-4">
      <div className="mb-1 flex items-center gap-2">
        {icon}
        <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
          {label}
        </span>
      </div>
      <p className="text-sm font-medium text-slate-200">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

function CountPill({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-800/50 bg-slate-950/30 px-4 py-2">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="font-mono text-sm font-semibold text-emerald-400">{count}</span>
    </div>
  );
}

export function FichaRucCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn(GLASS, "animate-pulse p-6", className)}>
      <div className="mb-4 h-6 w-1/3 rounded bg-slate-800" />
      <div className="mb-2 h-8 w-2/3 rounded bg-slate-800" />
      <div className="mb-6 h-4 w-1/2 rounded bg-slate-800" />
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="h-20 rounded-xl bg-slate-800/80" />
        <div className="h-20 rounded-xl bg-slate-800/80" />
        <div className="h-20 rounded-xl bg-slate-800/80" />
      </div>
    </div>
  );
}
