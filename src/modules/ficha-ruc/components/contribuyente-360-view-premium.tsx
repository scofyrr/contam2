import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Building2,
  Download,
  Loader2,
  Pencil,
  RefreshCw,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useConsultarSunat, useDashboard360, useFichaCompleta } from "@/hooks/use-ficha-ruc-premium";
import { cn } from "@/lib/utils";
import type { FichaRucMeta } from "@/modules/ficha-ruc/types/sunat";

const TAB_IDS = [
  "dashboard",
  "sunat",
  "representantes",
  "establecimientos",
  "comprobantes",
  "cxc_cxp",
  "caja",
] as const;
type TabId = (typeof TAB_IDS)[number];

function fmt(n: number) {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN", maximumFractionDigits: 0 }).format(n);
}

function EstadoBadge({ estado }: { estado: string }) {
  const u = estado.toUpperCase();
  const cls =
    u.includes("ACTIVO") && !u.includes("INACTIV")
      ? "bg-[#00C897]/20 text-[#00C897] border-[#00C897]/40"
      : u.includes("SUSP")
        ? "bg-[#F0A500]/20 text-[#F0A500] border-[#F0A500]/40"
        : "bg-[#FF5E7A]/20 text-[#FF5E7A] border-[#FF5E7A]/40";
  return (
    <Badge variant="outline" className={cn("font-medium", cls)}>
      {u.includes("ACTIVO") && !u.includes("INACTIV") ? "🟢 ACTIVO" : u.includes("SUSP") ? "🟡 SUSPENSIÓN" : "🔴 " + estado}
    </Badge>
  );
}

function FuenteBadge({ fuente, meta }: { fuente?: string; meta?: FichaRucMeta }) {
  const f = fuente ?? meta?.fuenteDatos ?? "MANUAL";
  if (f.includes("SUNAT")) return <Badge variant="outline" className="border-emerald-500/40 text-emerald-400">SUNAT ✓</Badge>;
  if (f.includes("SIRE")) return <Badge variant="outline" className="border-amber-500/40 text-amber-400">SIRE ⚠</Badge>;
  return <Badge variant="outline" className="border-red-500/40 text-red-400">MANUAL</Badge>;
}

function KpiCard({
  label,
  value,
  sub,
  spark,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  spark: number[];
  tone: string;
}) {
  const data = spark.map((v, i) => ({ i, v }));
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-4 hover:scale-[1.02] transition-transform">
      <p className="text-xs text-[#8899B4]">{label}</p>
      <p className="font-mono text-2xl font-semibold mt-1 text-[#E8EDF5]">{value}</p>
      <div className="h-8 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line type="monotone" dataKey="v" stroke={tone} strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {sub ? <p className="text-[10px] text-[#8899B4] mt-1">{sub}</p> : null}
    </div>
  );
}

function TabSkeleton() {
  return <Skeleton className="h-48 rounded-xl bg-white/5" />;
}

export function Contribuyente360ViewPremium({
  ruc,
  periodo,
  onEdit,
}: {
  ruc: string;
  periodo?: string;
  onEdit?: () => void;
}) {
  const [tab, setTab] = useState<TabId>("dashboard");
  const { data: completa, isLoading: loadingFicha } = useFichaCompleta(ruc);
  const consultar = useConsultarSunat();
  const dashEnabled = tab === "dashboard" || tab === "comprobantes" || tab === "cxc_cxp" || tab === "caja";
  const { data: dash, isLoading: loadingDash } = useDashboard360(ruc, periodo ?? null, dashEnabled);

  const ficha = completa?.ficha;
  const meta = completa?.meta;

  const direccion = useMemo(() => {
    if (!ficha) return "—";
    const d = ficha.domicilioFiscal;
    return [d.tipoNombreVia, d.distrito, d.provincia, d.departamento].filter(Boolean).join(", ") || "—";
  }, [ficha]);

  const actividad = ficha?.modificacionContribuyente.actividadEconomicaPrincipal || ficha?.domicilioFiscal.actividadEconomica || "—";

  const handleSunat = async () => {
    try {
      await consultar.mutateAsync({ ruc, forzar: true });
      toast.success("Ficha actualizada desde SUNAT");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al consultar SUNAT");
    }
  };

  if (loadingFicha) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 rounded-2xl bg-white/5" />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-28 bg-white/5" />
          <Skeleton className="h-28 bg-white/5" />
          <Skeleton className="h-28 bg-white/5" />
        </div>
      </div>
    );
  }

  const desactualizada = meta?.estadoActualizacion?.includes("DESACTUALIZADA");

  return (
    <div
      className="rounded-2xl border border-[#1A2740]/50 p-4 md:p-6 space-y-4"
      style={{ background: "linear-gradient(180deg, #060B14 0%, #080E1E 100%)" }}
    >
      <p className="text-xs tracking-widest text-[#8899B4]">📋 EXPEDIENTE DEL CONTRIBUYENTE</p>

      {/* Hero */}
      <div className="rounded-2xl border border-[#1A2740]/50 bg-[#0D1525]/80 backdrop-blur-xl p-5 grid md:grid-cols-[1fr_auto] gap-4">
        <div className="space-y-2">
          <h2 className="text-xl md:text-2xl font-bold text-[#C8A44D]">
            {ficha?.general.razonSocial || ruc}
          </h2>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-mono text-[#E8EDF5]">RUC: {ruc}</span>
            <EstadoBadge estado={ficha?.general.estadoContribuyente ?? "ACTIVO"} />
            {desactualizada ? (
              <Badge variant="outline" className="border-amber-500/50 text-amber-400 text-[10px]">
                Desactualizada
              </Badge>
            ) : null}
          </div>
          <p className="text-xs text-[#8899B4] flex items-center gap-1">
            <Building2 className="size-3" /> {direccion}
          </p>
          <p className="text-xs text-[#8899B4]">🏭 {actividad}</p>
          <p className="text-[10px] text-[#8899B4]">
            📅 Última actividad: {meta?.ultimaActividad ? new Date(meta.ultimaActividad).toLocaleDateString("es-PE") : "—"}
            {" · "}
            📊 {meta?.cantidadComprobantes ?? dash?.comprobantesCompra ?? 0} comprobantes
          </p>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <FuenteBadge meta={meta} />
          <p className="text-[10px] text-[#8899B4]">
            Actualizado: {meta?.ultimaActualizacion ? new Date(meta.ultimaActualizacion).toLocaleString("es-PE") : "Nunca"}
          </p>
          <div className="flex flex-wrap gap-2 justify-end">
            <Button
              size="sm"
              variant="outline"
              className="border-[#00C897]/40 text-[#00C897]"
              disabled={consultar.isPending}
              onClick={() => void handleSunat()}
            >
              {consultar.isPending ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
              SUNAT
            </Button>
            {onEdit ? (
              <Button size="sm" variant="ghost" onClick={onEdit}>
                <Pencil className="size-4" /> Editar
              </Button>
            ) : null}
            <Button size="sm" variant="ghost">
              <Download className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      {loadingDash ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <TabSkeleton />
          <TabSkeleton />
          <TabSkeleton />
        </div>
      ) : dash ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 motion-safe:animate-in motion-safe:fade-in">
          <KpiCard
            label={`💰 Compras ${periodo?.slice(0, 4) ?? new Date().getFullYear()}`}
            value={fmt(dash.comprasAnio)}
            sub={`${dash.comprobantesCompra} comprobantes`}
            spark={dash.sparklineCompras}
            tone="#00C8FF"
          />
          <KpiCard
            label={`💵 Ventas ${periodo?.slice(0, 4) ?? new Date().getFullYear()}`}
            value={fmt(dash.ventasAnio)}
            sub={`${dash.comprobantesVenta} comprobantes`}
            spark={dash.sparklineVentas}
            tone="#9B87F5"
          />
          <KpiCard
            label="📈 Ratio Ventas/Compras"
            value={`${dash.ratioComercial}x`}
            sub={dash.ratioSalud === "SALUDABLE" ? "🟢 Saludable" : dash.ratioSalud === "ATENCION" ? "🟡 A revisar" : "🔴 Riesgoso"}
            spark={dash.sparklineVentas.map((v, i) => (dash.sparklineCompras[i] ? v / dash.sparklineCompras[i]! : 0))}
            tone="#C8A44D"
          />
        </div>
      ) : null}

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as TabId)}>
        <TabsList className="flex flex-wrap h-auto gap-1 bg-white/[0.03]">
          <TabsTrigger value="dashboard">📊 Dashboard</TabsTrigger>
          <TabsTrigger value="sunat">📋 Datos SUNAT</TabsTrigger>
          <TabsTrigger value="representantes">👤 Representantes</TabsTrigger>
          <TabsTrigger value="establecimientos">🏢 Establecimientos</TabsTrigger>
          <TabsTrigger value="comprobantes">📄 Comprobantes</TabsTrigger>
          <TabsTrigger value="cxc_cxp">💰 CXC/CXP</TabsTrigger>
          <TabsTrigger value="caja">💳 Caja</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-4 motion-safe:animate-in motion-safe:slide-in-from-right-2">
          {loadingDash || !dash ? (
            <TabSkeleton />
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <h4 className="text-sm font-semibold mb-3">Actividad mensual</h4>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dash.actividadMensual}>
                      <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="compras" fill="#00C8FF" name="Compras" />
                      <Bar dataKey="ventas" fill="#9B87F5" name="Ventas" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <h4 className="text-sm font-semibold mb-3">Distribución</h4>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Compras", value: dash.comprasAnio },
                          { name: "Ventas", value: dash.ventasAnio },
                        ]}
                        dataKey="value"
                        innerRadius={40}
                        outerRadius={70}
                      >
                        <Cell fill="#00C8FF" />
                        <Cell fill="#9B87F5" />
                      </Pie>
                      <Tooltip formatter={(v: number) => fmt(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                  <div className="rounded-lg bg-white/[0.03] p-2">CXC: <strong>{fmt(dash.saldoCxc)}</strong></div>
                  <div className="rounded-lg bg-white/[0.03] p-2">CXP: <strong>{fmt(dash.saldoCxp)}</strong></div>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="sunat" className="mt-4">
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            {[
              ["Razón social", ficha?.general.razonSocial],
              ["Tipo", ficha?.general.tipoContribuyente],
              ["Estado", ficha?.general.estadoContribuyente],
              ["Inscripción", ficha?.general.fechaInscripcion],
              ["Inicio actividades", ficha?.general.fechaInicioActividades],
              ["Nombre comercial", ficha?.modificacionContribuyente.nombreComercial],
              ["Actividad principal", actividad],
              ["Departamento", ficha?.domicilioFiscal.departamento],
              ["Provincia", ficha?.domicilioFiscal.provincia],
              ["Distrito", ficha?.domicilioFiscal.distrito],
            ].map(([k, v]) => (
              <div key={String(k)} className="rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2">
                <p className="text-[10px] text-[#8899B4]">{k}</p>
                <p className="text-[#E8EDF5]">{v || "—"}</p>
              </div>
            ))}
          </div>
          {ficha?.tributosAfectos.length ? (
            <Table className="mt-4">
              <TableHeader>
                <TableRow>
                  <TableHead>Tributo</TableHead>
                  <TableHead>Desde</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ficha.tributosAfectos.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.tributo}</TableCell>
                    <TableCell>{t.afectoDesde || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : null}
        </TabsContent>

        <TabsContent value="representantes" className="mt-4">
          <div className="grid sm:grid-cols-2 gap-3">
            {(ficha?.representantesLegales ?? []).length === 0 ? (
              <p className="text-sm text-[#8899B4]">Sin representantes registrados</p>
            ) : (
              ficha!.representantesLegales.map((r) => (
                <div key={r.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 flex gap-3">
                  <User className="size-8 text-[#C8A44D] shrink-0" />
                  <div>
                    <p className="font-semibold text-[#E8EDF5]">{r.apellidosNombres}</p>
                    <p className="text-xs text-[#8899B4]">{r.cargo}</p>
                    <p className="text-[10px] font-mono text-[#8899B4]">{r.tipoNroDoc}</p>
                    <p className="text-[10px] text-[#8899B4]">Desde {r.fechaDesde || "—"}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="establecimientos" className="mt-4">
          <div className="grid sm:grid-cols-2 gap-3">
            {(ficha?.establecimientosAnexos ?? []).map((e) => (
              <div key={e.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="flex justify-between">
                  <span className="font-mono text-xs text-[#00C8FF]">{e.codigo}</span>
                  <span className="text-[10px] text-[#8899B4]">{e.tipo}</span>
                </div>
                <p className="text-sm mt-2 text-[#E8EDF5]">{e.domicilio || e.denominacion}</p>
                <p className="text-[10px] text-[#8899B4]">{e.otrasReferencias}</p>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="comprobantes" className="mt-4">
          {loadingDash ? (
            <TabSkeleton />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Comprobante</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(dash?.ultimosComprobantes ?? []).slice(0, 50).map((c) => (
                  <TableRow key={c.id} className="hover:bg-white/[0.03]">
                    <TableCell>{c.fecha}</TableCell>
                    <TableCell>{c.tipo}</TableCell>
                    <TableCell className="font-mono text-xs">{c.comprobante}</TableCell>
                    <TableCell className="text-right font-mono">{fmt(c.monto)}</TableCell>
                    <TableCell>{c.estado}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="cxc_cxp" className="mt-4">
          {dash ? (
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <p className="text-xs text-[#8899B4]">Por cobrar (CXC)</p>
                <p className="font-mono text-2xl text-emerald-400">{fmt(dash.saldoCxc)}</p>
              </div>
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                <p className="text-xs text-[#8899B4]">Por pagar (CXP)</p>
                <p className="font-mono text-2xl text-red-400">{fmt(dash.saldoCxp)}</p>
              </div>
            </div>
          ) : (
            <TabSkeleton />
          )}
        </TabsContent>

        <TabsContent value="caja" className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Glosa</TableHead>
                <TableHead className="text-right">Neto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(dash?.movimientosCajaRecientes ?? []).map((m) => (
                <TableRow key={m.id}>
                  <TableCell>{m.fecha}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{m.glosa}</TableCell>
                  <TableCell className={cn("text-right font-mono", m.neto >= 0 ? "text-emerald-400" : "text-red-400")}>
                    {fmt(m.neto)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
}
