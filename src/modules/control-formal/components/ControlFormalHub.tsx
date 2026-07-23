import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  FileText,
  Loader2,
  Plus,
  Scale,
  ShieldAlert,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useContribuyentes } from "@/hooks/use-contribuyentes";
import { cn } from "@/lib/utils";
import {
  useContingencias,
  useLegalizaciones,
  useRegistrarContingencia,
  useRegistrarLegalizacion,
  useSemaforoContingencias,
} from "@/modules/control-formal/hooks/useControlFormal";
import { fetchContribuyenteIdByRucCf } from "@/modules/control-formal/services/controlFormalService";
import type {
  ContingenciaLibro,
  LibroAfectado,
  MotivoContingencia,
  SemaforoAlerta,
  TipoLlevadoLibro,
} from "@/modules/control-formal/types/controlFormal";
import {
  ESTADO_CONTINGENCIA_LABELS,
  LIBROS_TABLA8_COMUNES,
  MOTIVO_CONTINGENCIA_LABELS,
  SEMAFORO_COLORS,
  TIPO_LLEVADO_LABELS,
} from "@/modules/control-formal/types/controlFormal";
import { calcularPlazosContingencia } from "@/modules/control-formal/utils/sunatDeadlineCalculator";
import {
  descargarCartaHtml,
  generarCartaComunicacionPerdida,
  mapContribuyenteCarta,
} from "@/modules/control-formal/utils/sunatLetterTemplate";

const GLASS =
  "rounded-2xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-md text-slate-100 shadow-xl shadow-emerald-950/20";

function useClientMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

function formatFecha(fecha: string | null, mounted: boolean): string {
  if (!fecha || !mounted) return "—";
  try {
    return new Intl.DateTimeFormat("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(fecha.includes("T") ? fecha : `${fecha}T12:00:00`));
  } catch {
    return fecha;
  }
}

function padFolio(n: number): string {
  return String(n).padStart(4, "0");
}

function SemaforoWidget({
  alertas,
  resumen,
  mounted,
  loading,
}: {
  alertas: SemaforoAlerta[];
  resumen: { totalActivas: number; rojas: number; amarillas: number; verdes: number };
  mounted: boolean;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className={cn(GLASS, "p-6 flex items-center justify-center text-slate-400")}>
        <Loader2 className="size-5 animate-spin mr-2" />
        Evaluando plazos SUNAT…
      </div>
    );
  }

  if (resumen.totalActivas === 0) {
    return (
      <div className={cn(GLASS, "p-6 border-emerald-500/30")}>
        <div className="flex items-center gap-3">
          <ShieldAlert className="size-8 text-emerald-400" />
          <div>
            <p className="font-semibold text-emerald-300">Sin contingencias activas</p>
            <p className="text-sm text-slate-400">No hay alertas de pérdida o destrucción de libros pendientes.</p>
          </div>
        </div>
      </div>
    );
  }

  const alertaPrincipal = alertas.find((a) => a.semaforo === "ROJO") ?? alertas[0];

  return (
    <div className="space-y-4">
      <div
        className={cn(
          GLASS,
          "p-6",
          alertaPrincipal && SEMAFORO_COLORS[alertaPrincipal.semaforo],
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="size-10 shrink-0" />
            <div>
              <p className="text-lg font-bold">Semáforo de Contingencias SUNAT</p>
              {alertaPrincipal && mounted ? (
                <p className="text-sm mt-1 opacity-90">
                  {alertaPrincipal.fechaComunicacionSunat == null &&
                  alertaPrincipal.diasRestantesComunicacion != null ? (
                    alertaPrincipal.diasRestantesComunicacion <= 0 ? (
                      <span className="font-semibold">🔴 Plazo de comunicación SUNAT vencido</span>
                    ) : (
                      <span>
                        Quedan{" "}
                        <strong>{alertaPrincipal.diasRestantesComunicacion}</strong> días hábiles
                        para comunicar a SUNAT (límite:{" "}
                        {formatFecha(alertaPrincipal.fechaLimiteComunicacion, mounted)})
                      </span>
                    )
                  ) : alertaPrincipal.diasRestantesReconstruccion != null ? (
                    <span>
                      Reconstrucción contable:{" "}
                      <strong>{alertaPrincipal.diasRestantesReconstruccion}</strong> días calendario
                      restantes
                    </span>
                  ) : (
                    "Monitoreo de plazos activo"
                  )}
                </p>
              ) : (
                <p className="text-sm mt-1">—</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="border-red-500/50 text-red-300">
              🔴 {resumen.rojas}
            </Badge>
            <Badge variant="outline" className="border-amber-500/50 text-amber-300">
              🟡 {resumen.amarillas}
            </Badge>
            <Badge variant="outline" className="border-emerald-500/50 text-emerald-300">
              🟢 {resumen.verdes}
            </Badge>
          </div>
        </div>
      </div>

      {alertas.length > 1 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {alertas.slice(0, 4).map((a) => (
            <div
              key={a.contingenciaId}
              className={cn("rounded-xl border p-3 text-sm", SEMAFORO_COLORS[a.semaforo])}
            >
              <p className="font-medium">{MOTIVO_CONTINGENCIA_LABELS[a.motivo]}</p>
              <p className="text-xs opacity-80 mt-1">
                Ocurrencia: {formatFecha(a.fechaOcurrencia, mounted)}
              </p>
              {a.diasRestantesComunicacion != null && !a.fechaComunicacionSunat ? (
                <p className="text-xs mt-1">
                  Comunicación: {a.diasRestantesComunicacion} días hábiles
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function FormularioLegalizacion({
  contribuyenteId,
  onSuccess,
}: {
  contribuyenteId: string;
  onSuccess: () => void;
}) {
  const mutation = useRegistrarLegalizacion(contribuyenteId);
  const [codigoLibro, setCodigoLibro] = useState("050100");
  const [nombreLibro, setNombreLibro] = useState("Libro Diario");
  const [numeroLegalizacion, setNumeroLegalizacion] = useState("");
  const [notaria, setNotaria] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [foliosDesde, setFoliosDesde] = useState("1");
  const [foliosHasta, setFoliosHasta] = useState("500");
  const [tipoLlevado, setTipoLlevado] = useState<TipoLlevadoLibro>("HOJAS_SUELTAS");

  const handleLibroChange = (codigo: string) => {
    setCodigoLibro(codigo);
    const found = LIBROS_TABLA8_COMUNES.find((l) => l.codigo === codigo);
    if (found) setNombreLibro(found.nombre);
  };

  const handleSubmit = () => {
    mutation.mutate(
      {
        contribuyenteId,
        codigoLibroTabla8: codigoLibro,
        nombreLibro,
        numeroLegalizacion,
        notariaJuzgado: notaria,
        fechaLegalizacion: fecha,
        foliosDesde: Number(foliosDesde),
        foliosHasta: Number(foliosHasta),
        tipoLlevado,
      },
      { onSuccess: () => onSuccess() },
    );
  };

  return (
    <div className={cn(GLASS, "p-4 space-y-4")}>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
        Nueva legalización notarial
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-400">Libro (Tabla 8)</Label>
          <Select value={codigoLibro} onValueChange={handleLibroChange}>
            <SelectTrigger className="bg-slate-800/50 border-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              {LIBROS_TABLA8_COMUNES.map((l) => (
                <SelectItem key={l.codigo} value={l.codigo}>
                  {l.codigo} — {l.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-400">N° legalización</Label>
          <Input
            value={numeroLegalizacion}
            onChange={(e) => setNumeroLegalizacion(e.target.value)}
            className="bg-slate-800/50 border-slate-700"
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs text-slate-400">Notaría / Juzgado</Label>
          <Input
            value={notaria}
            onChange={(e) => setNotaria(e.target.value)}
            className="bg-slate-800/50 border-slate-700"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-400">Fecha legalización</Label>
          <Input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="bg-slate-800/50 border-slate-700"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-400">Tipo llevado</Label>
          <Select value={tipoLlevado} onValueChange={(v) => setTipoLlevado(v as TipoLlevadoLibro)}>
            <SelectTrigger className="bg-slate-800/50 border-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              {(Object.keys(TIPO_LLEVADO_LABELS) as TipoLlevadoLibro[]).map((k) => (
                <SelectItem key={k} value={k}>
                  {TIPO_LLEVADO_LABELS[k]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-400">Folios desde</Label>
          <Input
            type="number"
            min={1}
            value={foliosDesde}
            onChange={(e) => setFoliosDesde(e.target.value)}
            className="bg-slate-800/50 border-slate-700"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-400">Folios hasta</Label>
          <Input
            type="number"
            min={1}
            value={foliosHasta}
            onChange={(e) => setFoliosHasta(e.target.value)}
            className="bg-slate-800/50 border-slate-700"
          />
        </div>
      </div>
      <Button
        onClick={handleSubmit}
        disabled={mutation.isPending || !numeroLegalizacion || !notaria}
        className="bg-emerald-600 hover:bg-emerald-500"
      >
        {mutation.isPending ? <Loader2 className="size-4 animate-spin mr-2" /> : <Plus className="size-4 mr-2" />}
        Registrar legalización
      </Button>
    </div>
  );
}

function FormularioContingencia({
  contribuyenteId,
  contribuyenteRuc,
  contribuyenteRazon,
  contingencias,
  mounted,
}: {
  contribuyenteId: string;
  contribuyenteRuc: string;
  contribuyenteRazon: string;
  contingencias: ContingenciaLibro[];
  mounted: boolean;
}) {
  const mutation = useRegistrarContingencia(contribuyenteId);
  const [fechaOcurrencia, setFechaOcurrencia] = useState(new Date().toISOString().slice(0, 10));
  const [motivo, setMotivo] = useState<MotivoContingencia>("PERDIDA");
  const [numDenuncia, setNumDenuncia] = useState("");
  const [comisaria, setComisaria] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [libroCodigo, setLibroCodigo] = useState("050100");
  const [libroNombre, setLibroNombre] = useState("Libro Diario");
  const [foliosAfectados, setFoliosAfectados] = useState("");
  const [librosExtra, setLibrosExtra] = useState<LibroAfectado[]>([]);

  const plazosPreview = mounted
    ? calcularPlazosContingencia(new Date(fechaOcurrencia + "T12:00:00"))
    : null;

  const agregarLibro = () => {
    if (!libroCodigo || !libroNombre) return;
    setLibrosExtra((prev) => [
      ...prev,
      { codigoLibroTabla8: libroCodigo, nombreLibro: libroNombre, foliosAfectados: foliosAfectados || undefined },
    ]);
    setFoliosAfectados("");
  };

  const handleSubmit = () => {
    const libros: LibroAfectado[] =
      librosExtra.length > 0
        ? librosExtra
        : [{ codigoLibroTabla8: libroCodigo, nombreLibro: libroNombre, foliosAfectados: foliosAfectados || undefined }];

    mutation.mutate({
      contribuyenteId,
      fechaOcurrencia,
      motivo,
      librosAfectados: libros,
      numeroDenunciaPolicial: numDenuncia || undefined,
      comisaria: comisaria || undefined,
      observaciones: observaciones || undefined,
    });
  };

  const generarCarta = (contingencia: ContingenciaLibro) => {
    const carta = generarCartaComunicacionPerdida(
      mapContribuyenteCarta({ ruc: contribuyenteRuc, razonSocial: contribuyenteRazon }),
      contingencia,
    );
    descargarCartaHtml(carta, `carta-sunat-${contribuyenteRuc}-${contingencia.id.slice(0, 8)}.html`);
  };

  return (
    <div className="space-y-6">
      <div className={cn(GLASS, "p-4 space-y-4")}>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Registrar pérdida / destrucción
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-400">Fecha ocurrencia</Label>
            <Input
              type="date"
              value={fechaOcurrencia}
              onChange={(e) => setFechaOcurrencia(e.target.value)}
              className="bg-slate-800/50 border-slate-700"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-400">Motivo</Label>
            <Select value={motivo} onValueChange={(v) => setMotivo(v as MotivoContingencia)}>
              <SelectTrigger className="bg-slate-800/50 border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                {(Object.keys(MOTIVO_CONTINGENCIA_LABELS) as MotivoContingencia[]).map((k) => (
                  <SelectItem key={k} value={k}>
                    {MOTIVO_CONTINGENCIA_LABELS[k]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-400">N° denuncia policial</Label>
            <Input
              value={numDenuncia}
              onChange={(e) => setNumDenuncia(e.target.value)}
              className="bg-slate-800/50 border-slate-700"
              placeholder="Opcional al registrar"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-400">Comisaría</Label>
            <Input
              value={comisaria}
              onChange={(e) => setComisaria(e.target.value)}
              className="bg-slate-800/50 border-slate-700"
            />
          </div>
        </div>

        <div className="border-t border-slate-800 pt-4 space-y-3">
          <Label className="text-xs text-slate-400">Libros afectados</Label>
          <div className="grid gap-3 sm:grid-cols-3">
            <Select
              value={libroCodigo}
              onValueChange={(v) => {
                setLibroCodigo(v);
                const f = LIBROS_TABLA8_COMUNES.find((l) => l.codigo === v);
                if (f) setLibroNombre(f.nombre);
              }}
            >
              <SelectTrigger className="bg-slate-800/50 border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                {LIBROS_TABLA8_COMUNES.map((l) => (
                  <SelectItem key={l.codigo} value={l.codigo}>
                    {l.codigo} — {l.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={foliosAfectados}
              onChange={(e) => setFoliosAfectados(e.target.value)}
              placeholder="Folios afectados (ej. 001-150)"
              className="bg-slate-800/50 border-slate-700"
            />
            <Button type="button" variant="outline" onClick={agregarLibro} className="border-slate-600">
              + Agregar libro
            </Button>
          </div>
          {librosExtra.length > 0 ? (
            <ul className="text-xs text-slate-400 space-y-1">
              {librosExtra.map((l, i) => (
                <li key={i}>
                  {l.codigoLibroTabla8} — {l.nombreLibro}
                  {l.foliosAfectados ? ` (${l.foliosAfectados})` : ""}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-slate-400">Observaciones</Label>
          <Textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            className="bg-slate-800/50 border-slate-700 min-h-[60px]"
          />
        </div>

        {plazosPreview && mounted ? (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs space-y-1">
            <p>
              📅 Límite comunicación SUNAT (15 días hábiles):{" "}
              <strong>{formatFecha(plazosPreview.fechaLimiteComunicacion15d.toISOString().slice(0, 10), mounted)}</strong>
            </p>
            <p>
              📅 Límite reconstrucción (60 días calendario):{" "}
              <strong>{formatFecha(plazosPreview.fechaLimiteReconstruccion60d.toISOString().slice(0, 10), mounted)}</strong>
            </p>
          </div>
        ) : null}

        <Button
          onClick={handleSubmit}
          disabled={mutation.isPending}
          className="bg-red-600/90 hover:bg-red-500"
        >
          {mutation.isPending ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
          Registrar contingencia
        </Button>
      </div>

      {contingencias.length > 0 ? (
        <div className={cn(GLASS, "p-4")}>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
            Contingencias registradas
          </h3>
          <div className="space-y-3">
            {contingencias.map((c) => (
              <div
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800 p-3"
              >
                <div>
                  <p className="font-medium text-sm">
                    {MOTIVO_CONTINGENCIA_LABELS[c.motivo]} — {formatFecha(c.fechaOcurrencia, mounted)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {ESTADO_CONTINGENCIA_LABELS[c.estadoContingencia]} · Comunicar antes:{" "}
                    {formatFecha(c.fechaLimiteComunicacion15d, mounted)}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-slate-600 gap-2"
                  onClick={() => generarCarta(c)}
                >
                  <FileText className="size-4" />
                  Generar carta SUNAT
                </Button>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function ControlFormalHub() {
  const mounted = useClientMounted();
  const { contribuyentes, loading: loadingContrib } = useContribuyentes();
  const [selectedRuc, setSelectedRuc] = useState("");
  const [tab, setTab] = useState<"legalizaciones" | "contingencias">("legalizaciones");
  const [showFormLegalizacion, setShowFormLegalizacion] = useState(false);

  const options = useMemo(
    () =>
      contribuyentes
        .filter((c) => c.ruc?.trim())
        .map((c) => ({
          ruc: c.ruc.replace(/\D/g, "").slice(0, 11),
          label: `${c.ruc} — ${c.razonSocial || "Sin razón social"}`,
        })),
    [contribuyentes],
  );

  useEffect(() => {
    if (!selectedRuc && options.length > 0) setSelectedRuc(options[0].ruc);
  }, [options, selectedRuc]);

  const contribuyente = useMemo(
    () => contribuyentes.find((c) => c.ruc.replace(/\D/g, "") === selectedRuc),
    [contribuyentes, selectedRuc],
  );

  const { data: resolvedId } = useQuery({
    queryKey: ["contribuyente-id-cf", selectedRuc],
    queryFn: () => fetchContribuyenteIdByRucCf(selectedRuc),
    enabled: !!selectedRuc && selectedRuc.length === 11,
    staleTime: 5 * 60_000,
  });

  const contribuyenteId = contribuyente?.id ?? resolvedId ?? null;

  const legalizacionesQuery = useLegalizaciones(contribuyenteId);
  const semaforoQuery = useSemaforoContingencias(contribuyenteId);
  const contingenciasQuery = useContingencias(contribuyenteId, tab === "contingencias");

  return (
    <div className="min-h-full space-y-6 p-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <header className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5">
            <Scale className="size-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">
              Control Formal & Contingencias
            </h1>
            <p className="text-sm text-slate-400">
              Legalizaciones notariales · Foliación · Alertas SUNAT 15 días hábiles / 60 días calendario
            </p>
          </div>
        </div>
      </header>

      <div className={cn(GLASS, "p-4")}>
        <Label className="text-slate-400 text-xs">Contribuyente</Label>
        <Select
          value={selectedRuc || undefined}
          onValueChange={setSelectedRuc}
          disabled={loadingContrib}
        >
          <SelectTrigger className="mt-1.5 bg-slate-800/50 border-slate-700 max-w-xl">
            <SelectValue placeholder="Seleccione RUC…" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-700">
            {options.map((o) => (
              <SelectItem key={o.ruc} value={o.ruc}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {contribuyenteId ? (
        <SemaforoWidget
          alertas={semaforoQuery.data?.alertas ?? []}
          resumen={
            semaforoQuery.data?.resumen ?? { totalActivas: 0, rojas: 0, amarillas: 0, verdes: 0 }
          }
          mounted={mounted}
          loading={semaforoQuery.isLoading}
        />
      ) : null}

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList className="bg-slate-800/60 border border-slate-700/80">
          <TabsTrigger
            value="legalizaciones"
            className="data-[state=active]:bg-emerald-600/20 data-[state=active]:text-emerald-300"
          >
            Legalizaciones & Folios
          </TabsTrigger>
          <TabsTrigger
            value="contingencias"
            className="data-[state=active]:bg-red-600/20 data-[state=active]:text-red-300"
          >
            Contingencias & Denuncias
          </TabsTrigger>
        </TabsList>

        <TabsContent value="legalizaciones" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              className="border-slate-600"
              onClick={() => setShowFormLegalizacion((s) => !s)}
            >
              <Plus className="size-4 mr-2" />
              {showFormLegalizacion ? "Ocultar formulario" : "Nueva legalización"}
            </Button>
          </div>

          {showFormLegalizacion && contribuyenteId ? (
            <FormularioLegalizacion
              contribuyenteId={contribuyenteId}
              onSuccess={() => setShowFormLegalizacion(false)}
            />
          ) : null}

          <div className={cn(GLASS, "p-4")}>
            {legalizacionesQuery.isLoading ? (
              <div className="flex justify-center py-12 text-slate-400">
                <Loader2 className="size-5 animate-spin" />
              </div>
            ) : (legalizacionesQuery.data ?? []).length === 0 ? (
              <p className="text-center text-slate-500 text-sm py-12">
                No hay legalizaciones registradas. Registre la constancia notarial del primer folio.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      <TableHead className="text-slate-400">Libro</TableHead>
                      <TableHead className="text-slate-400">N° Legalización</TableHead>
                      <TableHead className="text-slate-400">Notaría</TableHead>
                      <TableHead className="text-slate-400">Fecha</TableHead>
                      <TableHead className="text-slate-400">Folios</TableHead>
                      <TableHead className="text-slate-400">Utilización</TableHead>
                      <TableHead className="text-slate-400">Tipo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(legalizacionesQuery.data ?? []).map((l) => (
                      <TableRow key={l.id} className="border-slate-800/60">
                        <TableCell>
                          <p className="text-sm font-medium">{l.nombreLibro}</p>
                          <p className="text-xs text-slate-500 font-mono">{l.codigoLibroTabla8}</p>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{l.numeroLegalizacion}</TableCell>
                        <TableCell className="text-sm max-w-[140px] truncate" title={l.notariaJuzgado}>
                          {l.notariaJuzgado}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatFecha(l.fechaLegalizacion, mounted)}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {padFolio(l.foliosDesde)} — {padFolio(l.foliosHasta)}
                        </TableCell>
                        <TableCell className="min-w-[120px]">
                          <div className="flex items-center gap-2">
                            <Progress value={l.porcentajeUtilizado} className="h-2 flex-1" />
                            <span className="text-xs tabular-nums w-10">{l.porcentajeUtilizado}%</span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {l.foliosUtilizados}/{l.totalFolios} folios
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            {TIPO_LLEVADO_LABELS[l.tipoLlevado]}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="contingencias" className="mt-4">
          {contribuyenteId && contribuyente ? (
            <FormularioContingencia
              contribuyenteId={contribuyenteId}
              contribuyenteRuc={contribuyente.ruc}
              contribuyenteRazon={contribuyente.razonSocial}
              contingencias={contingenciasQuery.data ?? []}
              mounted={mounted}
            />
          ) : (
            <p className="text-slate-500 text-sm py-8 text-center">Seleccione un contribuyente.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
