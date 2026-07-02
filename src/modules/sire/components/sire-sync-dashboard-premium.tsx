import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import {
  RefreshCw,
  Database,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Rocket,
  ChevronDown,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { Bar, BarChart, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import {
  sireSyncService,
  useMigrateData,
  useReconcile,
  useResolveSyncError,
  useSireConsistency,
  useSireStructure,
  useSireSyncErrors,
  getActiveSireSourceLabel,
} from "@/modules/sire/services/sire-sync-service";
import type { ReconcileFinding, SireSyncError } from "@/modules/sire/types/sire-sync";

function MiniSparkline({ data, color }: { data: { periodo: string; count: number }[]; color: string }) {
  if (data.length === 0) {
    return <div className="h-12 flex items-center text-xs text-muted-foreground">Sin datos</div>;
  }
  return (
    <div className="h-12 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <Bar dataKey="count" fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  sparkline,
  pulse,
  children,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  sparkline?: ReactNode;
  pulse?: boolean;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "glass-surface rounded-xl p-6 border border-white/[0.05] bg-white/[0.02]",
        "hover:scale-[1.02] transition-all duration-300 hover-lift",
        pulse && "pulse-glow",
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-sm font-medium text-premium-gold">{title}</p>
          <p className="text-3xl font-bold tabular-nums text-foreground count-up mt-1">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className="rounded-xl bg-white/[0.04] p-3 text-premium-cyan">{icon}</div>
      </div>
      {sparkline}
      {children}
    </div>
  );
}

function SeverityBadge({ type }: { type: string }) {
  const variant =
    type.includes("orphan") || type.includes("missing")
      ? "destructive"
      : type.includes("mismatch")
        ? "warning"
        : "secondary";
  return (
    <Badge variant={variant} className="rounded-full capitalize border-0 text-[10px]">
      {type.replace(/_/g, " ")}
    </Badge>
  );
}

function ErrorRow({ error, onResolve }: { error: SireSyncError; onResolve: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [resolving, startResolve] = useTransition();

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <TableRow className="border-white/[0.04] even:bg-white/[0.01] hover:bg-white/[0.05] transition-colors">
        <TableCell className="text-xs font-mono text-muted-foreground">
          {new Date(error.created_at).toLocaleString("es-PE")}
        </TableCell>
        <TableCell>
          <SeverityBadge type={error.operation_type} />
        </TableCell>
        <TableCell className="font-mono text-xs truncate max-w-[120px]">
          {error.record_id ?? "—"}
        </TableCell>
        <TableCell className="text-sm max-w-[200px] truncate">{error.error_message}</TableCell>
        <TableCell className="text-right">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1">
              Detalle
              <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
            </Button>
          </CollapsibleTrigger>
        </TableCell>
      </TableRow>
      <CollapsibleContent asChild>
        <tr>
          <td colSpan={5} className="p-0">
            <div className="px-6 py-4 bg-white/[0.02] border-b border-white/[0.05] slide-right">
              <pre className="text-xs font-mono text-muted-foreground overflow-x-auto rounded-lg bg-black/20 p-4">
                {JSON.stringify(error.error_detail ?? {}, null, 2)}
              </pre>
              <Button
                size="sm"
                className="mt-3"
                disabled={resolving}
                onClick={() =>
                  startResolve(async () => {
                    try {
                      await onResolve(error.id);
                      toast.success("Error marcado como resuelto");
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : "No autorizado");
                    }
                  })
                }
              >
                <CheckCircle2 className="size-4 mr-1" />
                Marcar como resuelto
              </Button>
            </div>
          </td>
        </tr>
      </CollapsibleContent>
    </Collapsible>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6 lg:p-8">
      <Skeleton className="h-12 w-80" />
      <div className="grid gap-6 md:grid-cols-3">
        <Skeleton className="h-44 rounded-xl" />
        <Skeleton className="h-44 rounded-xl" />
        <Skeleton className="h-44 rounded-xl" />
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

export default function SireSyncDashboardPremium() {
  const structureQ = useSireStructure();
  const consistencyQ = useSireConsistency();
  const errorsQ = useSireSyncErrors(30);
  const reconcileM = useReconcile();
  const migrateM = useMigrateData();
  const resolveM = useResolveSyncError();

  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [cardPulse, setCardPulse] = useState(false);

  const [reconcileOpen, setReconcileOpen] = useState(false);
  const [migrateOpen, setMigrateOpen] = useState(false);
  const [batchSize, setBatchSize] = useState("500");
  const [dryRun, setDryRun] = useState(true);
  const [previewFindings, setPreviewFindings] = useState<ReconcileFinding[]>([]);
  const [legacySpark, setLegacySpark] = useState<{ periodo: string; count: number }[]>([]);
  const [normSpark, setNormSpark] = useState<{ periodo: string; count: number }[]>([]);
  const [migrateProgress, setMigrateProgress] = useState(0);

  const [, startUiTransition] = useTransition();
  const deferredMetrics = useDeferredValue(consistencyQ.data);

  const metrics = deferredMetrics;
  const hasDiscrepancy = (metrics?.discrepancyCount ?? 0) > 0;

  const refreshAll = useCallback(() => {
    startUiTransition(() => {
      void consistencyQ.refetch();
      void errorsQ.refetch();
      void structureQ.refetch();
      setLastRefresh(Date.now());
      setCardPulse(true);
      setTimeout(() => setCardPulse(false), 800);
    });
  }, [consistencyQ, errorsQ, structureQ]);

  useEffect(() => {
    const id = setInterval(refreshAll, 10_000);
    return () => clearInterval(id);
  }, [refreshAll]);

  useEffect(() => {
    const id = setInterval(() => setSecondsAgo(Math.floor((Date.now() - lastRefresh) / 1000)), 1000);
    return () => clearInterval(id);
  }, [lastRefresh]);

  useEffect(() => {
    void sireSyncService.getLegacyPeriodCounts().then(setLegacySpark);
    void sireSyncService.getNormalizedPeriodCounts().then(setNormSpark);
  }, [metrics?.legacyCount, metrics?.normalizedCount]);

  const syncStatus = useMemo(() => {
    if (!metrics) return { label: "CARGANDO", tone: "neutral" as const };
    if (metrics.inSync) return { label: "SINCRONIZADO", tone: "ok" as const };
    return { label: "DESINCRONIZADO", tone: "bad" as const };
  }, [metrics]);

  const handleReconcile = async (dry: boolean) => {
    try {
      const findings = await reconcileM.mutateAsync({ dryRun: dry });
      if (dry) {
        toast.success(`Reconciliación simulada: ${findings.length} hallazgos`);
      } else {
        toast.success(`Reconciliación ejecutada: ${findings.length} discrepancias registradas`);
      }
      setReconcileOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error en reconciliación");
    }
  };

  const loadMigratePreview = async () => {
    try {
      const [findings, preview] = await Promise.all([
        sireSyncService.reconcile(true),
        sireSyncService.migrate(Number(batchSize), true),
      ]);
      setPreviewFindings(findings.slice(0, 20));
      if (preview.pending !== undefined) {
        toast.info(`${preview.pending} registros pendientes de migrar`);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al cargar preview");
    }
  };

  const handleMigrate = async () => {
    setMigrateProgress(10);
    try {
      const result = await migrateM.mutateAsync({
        batchSize: Number(batchSize),
        dryRun,
      });
      setMigrateProgress(100);
      if (dryRun) {
        toast.info(`Simulación: ${result.pending ?? 0} registros a migrar`);
      } else {
        toast.success(`Migrados: ${result.migrated ?? 0} | Errores: ${result.errors ?? 0}`, {
          className: (result.errors ?? 0) > 0 ? "border-destructive" : undefined,
        });
      }
      setMigrateOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error en migración", {
        className: "border-destructive",
      });
    } finally {
      setTimeout(() => setMigrateProgress(0), 1500);
    }
  };

  if (structureQ.isLoading && !metrics) {
    return <DashboardSkeleton />;
  }

  return (
    <div
      className="min-h-full bg-gradient-to-b from-[#060B14] to-[#0A1628] page-enter"
      style={{ minHeight: "100%" }}
    >
      <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-wrap items-start justify-between gap-4 fade-in">
          <div>
            <h1 className="text-3xl font-display font-semibold text-foreground flex items-center gap-3">
              <RefreshCw
                className="size-8 text-premium-gold animate-[spin_8s_linear_infinite]"
                strokeWidth={1.5}
              />
              Sincronización SIRE
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Puente legacy ↔ normalizado · Fuente cliente:{" "}
              <code className="glass-surface px-2 py-0.5 rounded text-xs font-mono">
                {getActiveSireSourceLabel()}
              </code>
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1 flex items-center gap-1">
              <RotateCcw className={cn("size-3", consistencyQ.isFetching && "animate-spin")} />
              Actualizado hace {secondsAgo}s
            </p>
          </div>

          <Badge
            variant={syncStatus.tone === "ok" ? "success" : syncStatus.tone === "bad" ? "destructive" : "secondary"}
            className={cn(
              "text-sm px-4 py-2 rounded-full",
              syncStatus.tone === "ok" && "pulse-glow",
            )}
          >
            {syncStatus.label}
          </Badge>
        </header>

        {/* Grid métricas */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <MetricCard
            title="Estructura Legacy"
            value={metrics?.legacyCount ?? "—"}
            subtitle={
              metrics?.lastLegacyAt
                ? `Último: ${new Date(metrics.lastLegacyAt).toLocaleDateString("es-PE")}`
                : "registros_sire"
            }
            icon={<Database className="size-5" strokeWidth={1.5} />}
            sparkline={<MiniSparkline data={legacySpark} color="#C8A95A" />}
            pulse={cardPulse}
          />
          <MetricCard
            title="Estructura Normalizada"
            value={metrics?.normalizedCount ?? "—"}
            subtitle={`V: ${metrics?.tipoDistribution.VENTA ?? 0} · C: ${metrics?.tipoDistribution.COMPRA ?? 0}`}
            icon={<Layers className="size-5" strokeWidth={1.5} />}
            sparkline={<MiniSparkline data={normSpark} color="#00D4FF" />}
            pulse={cardPulse}
          >
            <div className="flex gap-2 mt-3 flex-wrap">
              <Badge variant="outline" className="text-[10px]">
                cabecera {structureQ.data?.normalizedCabecera ? "✓" : "✗"}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                montos {structureQ.data?.normalizedMontos ? "✓" : "✗"}
              </Badge>
            </div>
          </MetricCard>
          <MetricCard
            title="Errores de Sync"
            value={metrics?.unresolvedErrors ?? errorsQ.data?.length ?? 0}
            subtitle={`${metrics?.discrepancyCount ?? 0} discrepancias detectadas`}
            icon={<AlertTriangle className="size-5" strokeWidth={1.5} />}
            pulse={(metrics?.unresolvedErrors ?? 0) > 0}
          >
            {(metrics?.unresolvedErrors ?? 0) > 5 && (
              <Badge variant="destructive" className="mt-2 rounded-full">
                Severidad alta
              </Badge>
            )}
          </MetricCard>
        </div>

        {/* Acciones */}
        <section className="surface-panel p-6 space-y-4 slide-right">
          <h2 className="text-lg font-semibold text-foreground">Acciones</h2>
          <div className="flex flex-wrap gap-4">
            <Button
              variant="outline"
              className="border-premium-gold/30 bg-gradient-to-r from-premium-gold/20 to-transparent hover-lift"
              onClick={() => setReconcileOpen(true)}
              disabled={reconcileM.isPending}
            >
              <RefreshCw className={cn("size-4 mr-2", reconcileM.isPending && "animate-spin")} />
              Ejecutar Reconciliación
            </Button>

            {hasDiscrepancy && (
              <Button
                className="border border-premium-gold/30 bg-premium-gold/10 text-foreground hover-lift"
                onClick={() => {
                  setMigrateOpen(true);
                  void loadMigratePreview();
                }}
                disabled={migrateM.isPending}
              >
                <Rocket className="size-4 mr-2" />
                Migrar Datos
              </Button>
            )}

            <Button variant="ghost" size="sm" onClick={refreshAll}>
              Refrescar ahora
            </Button>
          </div>

          {(reconcileM.isPending || migrateM.isPending || migrateProgress > 0) && (
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="shimmer inline-block px-2">
                  {migrateM.isPending ? "Migrando registros…" : "Analizando registros…"}
                </span>
                <span className="count-up tabular-nums">{migrateProgress || 45}%</span>
              </div>
              <Progress
                value={migrateM.isPending ? migrateProgress || 45 : 100}
                className="h-2 bg-white/10 [&>div]:bg-gradient-to-r [&>div]:from-premium-gold [&>div]:to-premium-cyan progress-fill"
              />
            </div>
          )}
        </section>

        {/* Tabla errores */}
        <section className="surface-panel overflow-hidden slide-right">
          <div className="px-6 py-4 border-b border-border/60 sticky top-0 backdrop-blur-md bg-card/80 z-10">
            <h2 className="font-semibold text-foreground">Errores recientes</h2>
          </div>
          {errorsQ.isLoading ? (
            <div className="p-8 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (errorsQ.data?.length ?? 0) === 0 ? (
            <p className="text-center text-muted-foreground py-12 text-sm">
              No hay errores de sincronización activos
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Registro ID</TableHead>
                  <TableHead>Error</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {errorsQ.data?.map((err) => (
                  <ErrorRow
                    key={err.id}
                    error={err}
                    onResolve={(id) => resolveM.mutateAsync(id)}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </section>
      </div>

      {/* Modal reconciliación */}
      <Dialog open={reconcileOpen} onOpenChange={setReconcileOpen}>
        <DialogContent className="glass-surface border-white/10 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reconciliación SIRE</DialogTitle>
            <DialogDescription>
              Compara registros legacy y normalizados. Puede ejecutarse en modo simulación.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 py-2">
            <Switch id="reconcile-dry" checked={dryRun} onCheckedChange={setDryRun} />
            <Label htmlFor="reconcile-dry">Modo simulación (dry run)</Label>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setReconcileOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => void handleReconcile(dryRun)} disabled={reconcileM.isPending}>
              {reconcileM.isPending ? "Analizando…" : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal migración */}
      <Dialog open={migrateOpen} onOpenChange={setMigrateOpen}>
        <DialogContent className="glass-surface border-white/10 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Rocket className="size-5 text-premium-gold" />
              Migración masiva
            </DialogTitle>
            <DialogDescription>
              Migra registros legacy faltantes hacia la estructura normalizada.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Tamaño de lote</Label>
              <Select value={batchSize} onValueChange={setBatchSize}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="500">500</SelectItem>
                  <SelectItem value="1000">1,000</SelectItem>
                  <SelectItem value="5000">5,000</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <Switch id="migrate-dry" checked={dryRun} onCheckedChange={setDryRun} />
              <Label htmlFor="migrate-dry">Modo simulación</Label>
            </div>

            {previewFindings.length > 0 && (
              <div className="max-h-40 overflow-y-auto rounded-lg border border-border/60">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewFindings.map((f, i) => (
                      <TableRow key={`${f.record_id}-${i}`}>
                        <TableCell>
                          <SeverityBadge type={f.discrepancy_type} />
                        </TableCell>
                        <TableCell className="font-mono text-xs truncate max-w-[180px]">
                          {f.record_id ?? "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setMigrateOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-premium-gold/20 border border-premium-gold/40"
              onClick={() => void handleMigrate()}
              disabled={migrateM.isPending}
            >
              {migrateM.isPending ? "Procesando…" : "Iniciar Migración"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
