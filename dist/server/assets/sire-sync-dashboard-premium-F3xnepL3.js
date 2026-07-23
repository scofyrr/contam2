import { U as reactExports, L as jsxRuntimeExports } from "./server-BIroHbvu.js";
import { aj as toast } from "./router-BRL0s0LD.js";
import { B as Badge } from "./badge-BjDV6F_B.js";
import { B as Button } from "./button-CAvVOLL8.js";
import { D as Dialog, a as DialogContent, d as DialogHeader, e as DialogTitle, b as DialogDescription, c as DialogFooter } from "./dialog-Cnq_krfY.js";
import { L as Label } from "./label-Dsj3Zaer.js";
import { P as Progress } from "./progress-DofMlWtS.js";
import { S as Skeleton } from "./skeleton-wfCnfyZT.js";
import { S as Switch } from "./switch-yALE-lBo.js";
import { S as Select, c as SelectTrigger, d as SelectValue, a as SelectContent, b as SelectItem } from "./select-BZS9NJ-P.js";
import { T as Table, d as TableHeader, e as TableRow, c as TableHead, a as TableBody, b as TableCell } from "./table-BGymvpwQ.js";
import { C as Collapsible, b as CollapsibleTrigger, a as CollapsibleContent } from "./collapsible-BUzsSm-Z.js";
import { a as cn } from "./utils-8RO4xBwZ.js";
import { d as useSireStructure, c as useSireConsistency, e as useSireSyncErrors, a as useReconcile, u as useMigrateData, b as useResolveSyncError, s as sireSyncService, g as getActiveSireSourceLabel } from "./sire-sync-service-DfmCetMo.js";
import { R as RefreshCw } from "./refresh-cw-CZfG2mto.js";
import { R as RotateCcw } from "./rotate-ccw-N0yITq6i.js";
import { D as Database } from "./database-DEWIpgeQ.js";
import { a as createLucideIcon } from "./index-Do_kSTPt.js";
import { T as TriangleAlert } from "./triangle-alert-B4GeD7-7.js";
import { R as Rocket } from "./rocket-CcRDMiE6.js";
import { R as ResponsiveContainer, B as Bar } from "./generateCategoricalChart-BQLb8jz6.js";
import { B as BarChart } from "./BarChart-C45DkUjM.js";
import { C as ChevronDown } from "./chevron-up-CkMbl0kk.js";
import { C as CircleCheck } from "./circle-check-B2Wi3ps7.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-BsWwNo5R.js";
import "./Combination-BhKuaGUd.js";
import "./index-DcTyhqP8.js";
import "./x-DLQFq3RN.js";
import "./index-Bd_3-P22.js";
import "./index-BBi0WB_M.js";
import "./useQuery-CNpr8Hir.js";
import "./useMutation-DxnWSsR1.js";
const __iconNode = [
  [
    "path",
    {
      d: "M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z",
      key: "zw3jo"
    }
  ],
  [
    "path",
    {
      d: "M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12",
      key: "1wduqc"
    }
  ],
  [
    "path",
    {
      d: "M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17",
      key: "kqbvx6"
    }
  ]
];
const Layers = createLucideIcon("layers", __iconNode);
function MiniSparkline({ data, color }) {
  if (data.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 flex items-center text-xs text-muted-foreground", children: "Sin datos" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BarChart, { data, margin: { top: 0, right: 0, left: 0, bottom: 0 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "count", fill: color, radius: [4, 4, 0, 0] }) }) }) });
}
function MetricCard({
  title,
  value,
  subtitle,
  icon,
  sparkline,
  pulse,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: cn(
        "glass-surface rounded-xl p-6 border border-white/[0.05] bg-white/[0.02]",
        "hover:scale-[1.02] transition-all duration-300 hover-lift",
        pulse && "pulse-glow"
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-premium-gold", children: title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl font-bold tabular-nums text-foreground count-up mt-1", children: value }),
            subtitle && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: subtitle })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl bg-white/[0.04] p-3 text-premium-cyan", children: icon })
        ] }),
        sparkline,
        children
      ]
    }
  );
}
function SeverityBadge({ type }) {
  const variant = type.includes("orphan") || type.includes("missing") ? "destructive" : type.includes("mismatch") ? "warning" : "secondary";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant, className: "rounded-full capitalize border-0 text-[10px]", children: type.replace(/_/g, " ") });
}
function ErrorRow({ error, onResolve }) {
  const [open, setOpen] = reactExports.useState(false);
  const [resolving, startResolve] = reactExports.useTransition();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Collapsible, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "border-white/[0.04] even:bg-white/[0.01] hover:bg-white/[0.05] transition-colors", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs font-mono text-muted-foreground", children: new Date(error.created_at).toLocaleString("es-PE") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SeverityBadge, { type: error.operation_type }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs truncate max-w-[120px]", children: error.record_id ?? "—" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm max-w-[200px] truncate", children: error.error_message }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CollapsibleTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", className: "gap-1", children: [
        "Detalle",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: cn("size-4 transition-transform", open && "rotate-180") })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CollapsibleContent, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 5, className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 py-4 bg-white/[0.02] border-b border-white/[0.05] slide-right", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "text-xs font-mono text-muted-foreground overflow-x-auto rounded-lg bg-black/20 p-4", children: JSON.stringify(error.error_detail ?? {}, null, 2) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          size: "sm",
          className: "mt-3",
          disabled: resolving,
          onClick: () => startResolve(async () => {
            try {
              await onResolve(error.id);
              toast.success("Error marcado como resuelto");
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "No autorizado");
            }
          }),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "size-4 mr-1" }),
            "Marcar como resuelto"
          ]
        }
      )
    ] }) }) }) })
  ] });
}
function DashboardSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 p-6 lg:p-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-12 w-80" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 md:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-44 rounded-xl" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-44 rounded-xl" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-44 rounded-xl" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-64 rounded-xl" })
  ] });
}
function SireSyncDashboardPremium() {
  const structureQ = useSireStructure();
  const consistencyQ = useSireConsistency();
  const errorsQ = useSireSyncErrors(30);
  const reconcileM = useReconcile();
  const migrateM = useMigrateData();
  const resolveM = useResolveSyncError();
  const [lastRefresh, setLastRefresh] = reactExports.useState(Date.now());
  const [secondsAgo, setSecondsAgo] = reactExports.useState(0);
  const [cardPulse, setCardPulse] = reactExports.useState(false);
  const [reconcileOpen, setReconcileOpen] = reactExports.useState(false);
  const [migrateOpen, setMigrateOpen] = reactExports.useState(false);
  const [batchSize, setBatchSize] = reactExports.useState("500");
  const [dryRun, setDryRun] = reactExports.useState(true);
  const [previewFindings, setPreviewFindings] = reactExports.useState([]);
  const [legacySpark, setLegacySpark] = reactExports.useState([]);
  const [normSpark, setNormSpark] = reactExports.useState([]);
  const [migrateProgress, setMigrateProgress] = reactExports.useState(0);
  const [, startUiTransition] = reactExports.useTransition();
  const deferredMetrics = reactExports.useDeferredValue(consistencyQ.data);
  const metrics = deferredMetrics;
  const hasDiscrepancy = (metrics?.discrepancyCount ?? 0) > 0;
  const refreshAll = reactExports.useCallback(() => {
    startUiTransition(() => {
      void consistencyQ.refetch();
      void errorsQ.refetch();
      void structureQ.refetch();
      setLastRefresh(Date.now());
      setCardPulse(true);
      setTimeout(() => setCardPulse(false), 800);
    });
  }, [consistencyQ, errorsQ, structureQ]);
  reactExports.useEffect(() => {
    const id = setInterval(refreshAll, 1e4);
    return () => clearInterval(id);
  }, [refreshAll]);
  reactExports.useEffect(() => {
    const id = setInterval(() => setSecondsAgo(Math.floor((Date.now() - lastRefresh) / 1e3)), 1e3);
    return () => clearInterval(id);
  }, [lastRefresh]);
  reactExports.useEffect(() => {
    void sireSyncService.getLegacyPeriodCounts().then(setLegacySpark);
    void sireSyncService.getNormalizedPeriodCounts().then(setNormSpark);
  }, [metrics?.legacyCount, metrics?.normalizedCount]);
  const syncStatus = reactExports.useMemo(() => {
    if (!metrics) return { label: "CARGANDO", tone: "neutral" };
    if (metrics.inSync) return { label: "SINCRONIZADO", tone: "ok" };
    return { label: "DESINCRONIZADO", tone: "bad" };
  }, [metrics]);
  const handleReconcile = async (dry) => {
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
        sireSyncService.migrate(Number(batchSize), true)
      ]);
      setPreviewFindings(findings.slice(0, 20));
      if (preview.pending !== void 0) {
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
        dryRun
      });
      setMigrateProgress(100);
      if (dryRun) {
        toast.info(`Simulación: ${result.pending ?? 0} registros a migrar`);
      } else {
        toast.success(`Migrados: ${result.migrated ?? 0} | Errores: ${result.errors ?? 0}`, {
          className: (result.errors ?? 0) > 0 ? "border-destructive" : void 0
        });
      }
      setMigrateOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error en migración", {
        className: "border-destructive"
      });
    } finally {
      setTimeout(() => setMigrateProgress(0), 1500);
    }
  };
  if (structureQ.isLoading && !metrics) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardSkeleton, {});
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "min-h-full bg-gradient-to-b from-[#060B14] to-[#0A1628] page-enter",
      style: { minHeight: "100%" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 lg:p-8 max-w-[1400px] mx-auto space-y-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-wrap items-start justify-between gap-4 fade-in", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-3xl font-display font-semibold text-foreground flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  RefreshCw,
                  {
                    className: "size-8 text-premium-gold animate-[spin_8s_linear_infinite]",
                    strokeWidth: 1.5
                  }
                ),
                "Sincronización SIRE"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground mt-2", children: [
                "Puente legacy ↔ normalizado · Fuente cliente:",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "glass-surface px-2 py-0.5 rounded text-xs font-mono", children: getActiveSireSourceLabel() })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground/70 mt-1 flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: cn("size-3", consistencyQ.isFetching && "animate-spin") }),
                "Actualizado hace ",
                secondsAgo,
                "s"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Badge,
              {
                variant: syncStatus.tone === "ok" ? "success" : syncStatus.tone === "bad" ? "destructive" : "secondary",
                className: cn(
                  "text-sm px-4 py-2 rounded-full",
                  syncStatus.tone === "ok" && "pulse-glow"
                ),
                children: syncStatus.label
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 md:grid-cols-2 xl:grid-cols-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              MetricCard,
              {
                title: "Estructura Legacy",
                value: metrics?.legacyCount ?? "—",
                subtitle: metrics?.lastLegacyAt ? `Último: ${new Date(metrics.lastLegacyAt).toLocaleDateString("es-PE")}` : "registros_sire",
                icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Database, { className: "size-5", strokeWidth: 1.5 }),
                sparkline: /* @__PURE__ */ jsxRuntimeExports.jsx(MiniSparkline, { data: legacySpark, color: "#C8A95A" }),
                pulse: cardPulse
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              MetricCard,
              {
                title: "Estructura Normalizada",
                value: metrics?.normalizedCount ?? "—",
                subtitle: `V: ${metrics?.tipoDistribution.VENTA ?? 0} · C: ${metrics?.tipoDistribution.COMPRA ?? 0}`,
                icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { className: "size-5", strokeWidth: 1.5 }),
                sparkline: /* @__PURE__ */ jsxRuntimeExports.jsx(MiniSparkline, { data: normSpark, color: "#00D4FF" }),
                pulse: cardPulse,
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mt-3 flex-wrap", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "text-[10px]", children: [
                    "cabecera ",
                    structureQ.data?.normalizedCabecera ? "✓" : "✗"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "text-[10px]", children: [
                    "montos ",
                    structureQ.data?.normalizedMontos ? "✓" : "✗"
                  ] })
                ] })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              MetricCard,
              {
                title: "Errores de Sync",
                value: metrics?.unresolvedErrors ?? errorsQ.data?.length ?? 0,
                subtitle: `${metrics?.discrepancyCount ?? 0} discrepancias detectadas`,
                icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "size-5", strokeWidth: 1.5 }),
                pulse: (metrics?.unresolvedErrors ?? 0) > 0,
                children: (metrics?.unresolvedErrors ?? 0) > 5 && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "destructive", className: "mt-2 rounded-full", children: "Severidad alta" })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "surface-panel p-6 space-y-4 slide-right", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-foreground", children: "Acciones" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  variant: "outline",
                  className: "border-premium-gold/30 bg-gradient-to-r from-premium-gold/20 to-transparent hover-lift",
                  onClick: () => setReconcileOpen(true),
                  disabled: reconcileM.isPending,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: cn("size-4 mr-2", reconcileM.isPending && "animate-spin") }),
                    "Ejecutar Reconciliación"
                  ]
                }
              ),
              hasDiscrepancy && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  className: "border border-premium-gold/30 bg-premium-gold/10 text-foreground hover-lift",
                  onClick: () => {
                    setMigrateOpen(true);
                    void loadMigratePreview();
                  },
                  disabled: migrateM.isPending,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Rocket, { className: "size-4 mr-2" }),
                    "Migrar Datos"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: refreshAll, children: "Refrescar ahora" })
            ] }),
            (reconcileM.isPending || migrateM.isPending || migrateProgress > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 pt-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs text-muted-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shimmer inline-block px-2", children: migrateM.isPending ? "Migrando registros…" : "Analizando registros…" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "count-up tabular-nums", children: [
                  migrateProgress || 45,
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Progress,
                {
                  value: migrateM.isPending ? migrateProgress || 45 : 100,
                  className: "h-2 bg-white/10 [&>div]:bg-gradient-to-r [&>div]:from-premium-gold [&>div]:to-premium-cyan progress-fill"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "surface-panel overflow-hidden slide-right", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 py-4 border-b border-border/60 sticky top-0 backdrop-blur-md bg-card/80 z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold text-foreground", children: "Errores recientes" }) }),
            errorsQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8 space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-full" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-full" })
            ] }) : (errorsQ.data?.length ?? 0) === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-muted-foreground py-12 text-sm", children: "No hay errores de sincronización activos" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "hover:bg-transparent", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Fecha" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Tipo" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Registro ID" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Error" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Acción" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: errorsQ.data?.map((err) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                ErrorRow,
                {
                  error: err,
                  onResolve: (id) => resolveM.mutateAsync(id)
                },
                err.id
              )) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: reconcileOpen, onOpenChange: setReconcileOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "glass-surface border-white/10 sm:max-w-md", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Reconciliación SIRE" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Compara registros legacy y normalizados. Puede ejecutarse en modo simulación." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 py-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { id: "reconcile-dry", checked: dryRun, onCheckedChange: setDryRun }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "reconcile-dry", children: "Modo simulación (dry run)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setReconcileOpen(false), children: "Cancelar" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => void handleReconcile(dryRun), disabled: reconcileM.isPending, children: reconcileM.isPending ? "Analizando…" : "Confirmar" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: migrateOpen, onOpenChange: setMigrateOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "glass-surface border-white/10 sm:max-w-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Rocket, { className: "size-5 text-premium-gold" }),
              "Migración masiva"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Migra registros legacy faltantes hacia la estructura normalizada." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tamaño de lote" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: batchSize, onValueChange: setBatchSize, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "500", children: "500" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "1000", children: "1,000" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "5000", children: "5,000" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { id: "migrate-dry", checked: dryRun, onCheckedChange: setDryRun }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "migrate-dry", children: "Modo simulación" })
            ] }),
            previewFindings.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-40 overflow-y-auto rounded-lg border border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Tipo" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "ID" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: previewFindings.map((f, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SeverityBadge, { type: f.discrepancy_type }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs truncate max-w-[180px]", children: f.record_id ?? "—" })
              ] }, `${f.record_id}-${i}`)) })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setMigrateOpen(false), children: "Cancelar" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                className: "bg-premium-gold/20 border border-premium-gold/40",
                onClick: () => void handleMigrate(),
                disabled: migrateM.isPending,
                children: migrateM.isPending ? "Procesando…" : "Iniciar Migración"
              }
            )
          ] })
        ] }) })
      ]
    }
  );
}
export {
  SireSyncDashboardPremium as default
};
