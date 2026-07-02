import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Loader2,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { CxcCxpBandeja } from "@/components/libro-diario/cxc-cxp-bandeja";
import {
  useDiferenciasCambio,
  useGenerarAsientoDC,
  useGuardarAsientoDesdePlantilla,
  usePlantillasAsiento,
} from "@/hooks/use-libro-diario-premium";
import type { LibroDiarioLinea } from "@/lib/sire-types";
import { cn } from "@/lib/utils";
import { asientoTemplateEngine } from "@/modules/contabilidad/diario/services/asiento-template-engine";
import AsientoTraceabilityViewerPremium from "@/modules/contabilidad/asientos/components/asiento-traceability-viewer-premium";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const LIBRO_COLORS: Record<string, string> = {
  DIARIO_COMPRAS: "#00C8FF",
  DIARIO_VENTAS: "#00C897",
  CAJA_BANCOS: "#9B87F5",
  DIARIO_MANUAL: "#8899B4",
};

function fmt(n: number) {
  return n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function groupKey(row: LibroDiarioLinea) {
  if (row.sire_registro_id) return `sire:${row.sire_registro_id}`;
  return `grp:${row.fecha_asiento}|${(row.glosa ?? "").slice(0, 40)}|${row.tipo_libro ?? row.origen}`;
}

type AsientoGrupo = {
  key: string;
  glosa: string;
  fecha: string;
  tipoLibro: string;
  sireId: string | null;
  lineas: LibroDiarioLinea[];
  totalDebe: number;
  totalHaber: number;
};

function KpiCard({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-4 hover:scale-[1.02] transition-transform">
      <p className="text-xs text-[#8899B4]">{label}</p>
      <p className="font-mono text-2xl font-semibold text-[#E8EDF5] mt-1" style={{ color: tone }}>
        {value}
      </p>
      {sub ? <p className="text-[10px] text-[#8899B4] mt-1">{sub}</p> : null}
    </div>
  );
}

function AsientoCard({
  grupo,
  onTrace,
}: {
  grupo: AsientoGrupo;
  onTrace: (sireId: string) => void;
}) {
  const cuadra = Math.abs(grupo.totalDebe - grupo.totalHaber) < 0.01;
  const border = LIBRO_COLORS[grupo.tipoLibro ?? ""] ?? "#8899B4";

  return (
    <div
      className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
      style={{ borderLeftWidth: 4, borderLeftColor: border }}
    >
      <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.04]">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-[10px]" style={{ borderColor: `${border}66`, color: border }}>
              {grupo.tipoLibro ?? "ASIENTO"}
            </Badge>
            <span className="text-xs text-[#8899B4]">{grupo.fecha}</span>
            {grupo.sireId ? (
              <Badge variant="outline" className="text-[10px] border-cyan-500/40 text-cyan-400">
                SIRE
              </Badge>
            ) : null}
          </div>
          <p className="text-sm font-medium text-[#E8EDF5] mt-1">{grupo.glosa}</p>
        </div>
        <Badge
          variant="outline"
          className={cn(
            cuadra ? "border-emerald-500/40 text-emerald-400" : "border-red-500/40 text-red-400 animate-pulse",
          )}
        >
          {cuadra ? "✅ CUADRA" : `❌ DIF. ${fmt(Math.abs(grupo.totalDebe - grupo.totalHaber))}`}
        </Badge>
      </div>
      <div className="divide-y divide-white/[0.03]">
        {grupo.lineas.map((l) => (
          <div key={l.id} className="grid grid-cols-[80px_1fr_100px_100px] gap-2 px-4 py-2 text-xs hover:bg-white/[0.03]">
            <span className="font-mono text-[#C8A44D]">{l.cuenta_contable}</span>
            <span className="truncate text-[#E8EDF5]">{l.glosa}</span>
            <span className="font-mono text-right text-[#00C897]">{l.debe > 0 ? fmt(l.debe) : "—"}</span>
            <span className="font-mono text-right text-[#FF5E7A]">{l.haber > 0 ? fmt(l.haber) : "—"}</span>
          </div>
        ))}
      </div>
      <div className="px-4 py-2 flex justify-between items-center bg-white/[0.02] text-xs font-mono">
        <span className="text-[#8899B4]">TOTALES</span>
        <div className="flex gap-4">
          <span className="text-[#00C897]">{fmt(grupo.totalDebe)}</span>
          <span className="text-[#FF5E7A]">{fmt(grupo.totalHaber)}</span>
        </div>
      </div>
      {grupo.sireId ? (
        <div className="px-4 pb-3">
          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => onTrace(grupo.sireId!)}>
            <Search className="size-3 mr-1" /> Ver trazabilidad
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export function LibroDiarioPremium({
  ruc,
  periodo,
  rows,
  loading,
}: {
  ruc: string;
  periodo: string;
  rows: LibroDiarioLinea[];
  loading: boolean;
}) {
  const [filtroLibro, setFiltroLibro] = useState<string>("TODOS");
  const [buscar, setBuscar] = useState("");
  const [cxcOpen, setCxcOpen] = useState(true);
  const [traceSireId, setTraceSireId] = useState<string | null>(null);
  const [tplOpen, setTplOpen] = useState(false);
  const [tplId, setTplId] = useState("");
  const [tplParams, setTplParams] = useState<Record<string, string>>({});
  const [glosaTpl, setGlosaTpl] = useState("");

  const plantillas = usePlantillasAsiento();
  const dcQuery = useDiferenciasCambio(ruc);
  const genDC = useGenerarAsientoDC();
  const saveTpl = useGuardarAsientoDesdePlantilla();

  const grupos = useMemo(() => {
    const map = new Map<string, AsientoGrupo>();
    for (const row of rows) {
      const key = groupKey(row);
      const prev = map.get(key) ?? {
        key,
        glosa: row.glosa ?? "—",
        fecha: row.fecha_asiento,
        tipoLibro: row.tipo_libro ?? row.origen ?? "DIARIO_MANUAL",
        sireId: row.sire_registro_id,
        lineas: [],
        totalDebe: 0,
        totalHaber: 0,
      };
      prev.lineas.push(row);
      prev.totalDebe += Number(row.debe ?? 0);
      prev.totalHaber += Number(row.haber ?? 0);
      map.set(key, prev);
    }
    return [...map.values()].sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [rows]);

  const filtered = useMemo(() => {
    const q = buscar.trim().toLowerCase();
    return grupos.filter((g) => {
      if (filtroLibro !== "TODOS" && g.tipoLibro !== filtroLibro) return false;
      if (!q) return true;
      const hay = `${g.glosa} ${g.lineas.map((l) => l.cuenta_contable).join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }, [grupos, filtroLibro, buscar]);

  const kpis = useMemo(() => {
    const debe = rows.reduce((s, r) => s + Number(r.debe ?? 0), 0);
    const haber = rows.reduce((s, r) => s + Number(r.haber ?? 0), 0);
    const errores = grupos.filter((g) => Math.abs(g.totalDebe - g.totalHaber) > 0.01).length;
    return { asientos: grupos.length, debe, haber, errores };
  }, [rows, grupos]);

  const tpl = plantillas.data?.find((t) => t.id === tplId);
  const preview = tplId
    ? asientoTemplateEngine.evaluarTemplate(tplId, Object.fromEntries(Object.entries(tplParams).map(([k, v]) => [k, Number.isFinite(Number(v)) ? Number(v) : v])))
    : null;

  const handleGenerarDC = async () => {
    if (!dcQuery.data) return;
    try {
      await genDC.mutateAsync({ ruc, periodo, resumen: dcQuery.data });
      toast.success("Asiento de diferencia de cambio generado");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al generar ajuste");
    }
  };

  const handleSaveTpl = async () => {
    if (!tplId) return;
    try {
      await saveTpl.mutateAsync({
        ruc,
        periodo,
        fecha: new Date().toISOString().slice(0, 10),
        glosa: glosaTpl || tpl?.nombre || "Asiento desde plantilla",
        templateId: tplId,
        parametros: Object.fromEntries(Object.entries(tplParams).map(([k, v]) => [k, Number(v) || v])),
      });
      toast.success("Asiento guardado desde plantilla");
      setTplOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al guardar");
    }
  };

  const tabs = [
    { id: "TODOS", label: "Todos" },
    { id: "DIARIO_COMPRAS", label: "Compras" },
    { id: "DIARIO_VENTAS", label: "Ventas" },
    { id: "CAJA_BANCOS", label: "Caja" },
    { id: "DIARIO_MANUAL", label: "Manual" },
  ];

  return (
    <div
      className="rounded-2xl border border-[#1A2740]/50 p-4 md:p-6 space-y-4"
      style={{ background: "linear-gradient(180deg, #060B14 0%, #080E1E 100%)" }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-[#C8A44D]">
          <BookOpen className="size-5" /> Libro Diario Premium
        </h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="border-[#C8A44D]/40" onClick={() => setTplOpen(true)}>
            <Sparkles className="size-4 mr-1" /> Plantilla
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setCxcOpen((v) => !v)}>
            {cxcOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
            CXC/CXP
          </Button>
        </div>
      </div>

      {dcQuery.data && dcQuery.data.partidasEvaluadas > 0 ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="flex items-center gap-2 text-amber-200">
            <AlertTriangle className="size-4" />
            {dcQuery.data.partidasEvaluadas} partida(s) en {dcQuery.data.moneda} — TC {dcQuery.data.tipoCambioUsado}
          </span>
          <Button size="sm" disabled={genDC.isPending} onClick={() => void handleGenerarDC()}>
            {genDC.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Generar ajuste DC
          </Button>
        </div>
      ) : null}

      {loading ? (
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 bg-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard label="Asientos" value={String(kpis.asientos)} />
          <KpiCard label="Total Debe" value={`S/ ${fmt(kpis.debe)}`} tone="#00C897" />
          <KpiCard label="Total Haber" value={`S/ ${fmt(kpis.haber)}`} tone="#FF5E7A" />
          <KpiCard label="Descuadres" value={String(kpis.errores)} tone={kpis.errores ? "#FF5E7A" : "#00C897"} />
        </div>
      )}

      <div className="flex flex-wrap gap-2 items-center">
        {tabs.map((t) => (
          <Button
            key={t.id}
            size="sm"
            variant={filtroLibro === t.id ? "default" : "ghost"}
            className="h-8 text-xs"
            onClick={() => setFiltroLibro(t.id)}
          >
            {t.label}
          </Button>
        ))}
        <Input
          placeholder="Buscar glosa o cuenta…"
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          className="max-w-xs ml-auto bg-white/[0.03] border-white/[0.08] h-8"
        />
      </div>

      <div className={cn("grid gap-4", cxcOpen ? "lg:grid-cols-[1fr_320px]" : "")}>
        <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
          {loading ? (
            <Skeleton className="h-40 bg-white/5" />
          ) : filtered.length === 0 ? (
            <p className="text-center text-[#8899B4] py-12">Sin asientos en el período</p>
          ) : (
            filtered.map((g) => <AsientoCard key={g.key} grupo={g} onTrace={setTraceSireId} />)
          )}
        </div>
        {cxcOpen ? (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 overflow-auto max-h-[640px]">
            <CxcCxpBandeja ruc={ruc} periodo={periodo} />
          </div>
        ) : null}
      </div>

      <Dialog open={tplOpen} onOpenChange={setTplOpen}>
        <DialogContent className="glass-surface border-white/10 sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Usar plantilla contable</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Plantilla</Label>
              <select
                className="w-full mt-1 rounded-md border bg-background px-3 py-2 text-sm"
                value={tplId}
                onChange={(e) => {
                  setTplId(e.target.value);
                  setTplParams({});
                }}
              >
                <option value="">Seleccionar…</option>
                {(plantillas.data ?? []).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            </div>
            {tpl?.parametros.map((p) => (
              <div key={p.id}>
                <Label>{p.nombre}</Label>
                <Input
                  type={p.tipo === "MONTO" || p.tipo === "PORCENTAJE" ? "number" : "text"}
                  defaultValue={String(p.valorDefault ?? "")}
                  onChange={(e) => setTplParams((prev) => ({ ...prev, [p.id]: e.target.value }))}
                  className="mt-1"
                />
              </div>
            ))}
            <div>
              <Label>Glosa del asiento</Label>
              <Textarea value={glosaTpl} onChange={(e) => setGlosaTpl(e.target.value)} rows={2} className="mt-1" />
            </div>
            {preview ? (
              <div className="rounded-lg border p-3 text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Cuadra: {preview.cuadra ? "✅" : "❌"}</span>
                  <span className="font-mono">D {fmt(preview.totalDebe)} / H {fmt(preview.totalHaber)}</span>
                </div>
                {preview.lineasGeneradas.map((l, i) => (
                  <div key={i} className="grid grid-cols-4 gap-1 font-mono">
                    <span>{l.cuentaContable}</span>
                    <span className="col-span-2 truncate">{l.glosaLinea}</span>
                    <span className="text-right">{l.debe ? fmt(l.debe) : fmt(l.haber)}</span>
                  </div>
                ))}
                {preview.errores.map((e) => (
                  <p key={e} className="text-red-400">
                    {e}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setTplOpen(false)}>
              Cancelar
            </Button>
            <Button disabled={!preview?.cuadra || saveTpl.isPending} onClick={() => void handleSaveTpl()}>
              {saveTpl.isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              Generar asiento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={!!traceSireId} onOpenChange={(v) => !v && setTraceSireId(null)}>
        <SheetContent side="right" className="w-full sm:max-w-4xl p-0 overflow-y-auto bg-[#070C1B] border-white/10">
          <SheetHeader className="p-4 border-b border-white/10">
            <SheetTitle className="text-[#E8EDF5]">Trazabilidad</SheetTitle>
          </SheetHeader>
          {traceSireId ? <AsientoTraceabilityViewerPremium sireRegistroId={traceSireId} compact /> : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
