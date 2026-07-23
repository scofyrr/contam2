import { L as jsxRuntimeExports, U as reactExports } from "./server-BIroHbvu.js";
import { u as useQuery } from "./useQuery-CNpr8Hir.js";
import { B as Badge } from "./badge-BjDV6F_B.js";
import { B as Button } from "./button-CAvVOLL8.js";
import { I as Input } from "./input-Buvw7UNv.js";
import { L as Label } from "./label-Dsj3Zaer.js";
import { S as Select, c as SelectTrigger, d as SelectValue, a as SelectContent, b as SelectItem } from "./select-BZS9NJ-P.js";
import { m as useContribuyentes } from "./use-contribuyentes-CGcEKwfv.js";
import { u as useIsMounted } from "./useIsMounted-4vSd_CfI.js";
import { a as cn } from "./utils-8RO4xBwZ.js";
import { L as Link } from "./router-BRL0s0LD.js";
import { S as Sheet, a as SheetContent, c as SheetHeader, d as SheetTitle, b as SheetDescription } from "./sheet-Npd8OXVL.js";
import { u as useWorkflowWizard, P as PASO_ESTADO_COLORS, a as ArrowRight, A as ALERTA_SEVERIDAD_COLORS } from "./workflow-X-Usbfc9.js";
import { L as LoaderCircle } from "./loader-circle-OqnuRBje.js";
import { R as RefreshCw } from "./refresh-cw-CZfG2mto.js";
import { X } from "./x-DLQFq3RN.js";
import { C as CircleCheck } from "./circle-check-B2Wi3ps7.js";
import { L as Lock } from "./lock-CvUyHCSL.js";
import { C as Circle } from "./circle-Ctx_vbDr.js";
import { T as TriangleAlert } from "./triangle-alert-B4GeD7-7.js";
import { G as GitBranch } from "./git-branch-vuHYm8BZ.js";
import { a as createLucideIcon } from "./index-Do_kSTPt.js";
import { S as Sparkles } from "./sparkles-Cqd5ml8U.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-Bd_3-P22.js";
import "./Combination-BhKuaGUd.js";
import "./chevron-up-CkMbl0kk.js";
import "./contribuyentes-service-C3l05GhV.js";
import "./http-client-BNGDvc7A.js";
import "./index-BsWwNo5R.js";
import "./index-DcTyhqP8.js";
import "./useMutation-DxnWSsR1.js";
const __iconNode = [
  ["rect", { width: "8", height: "4", x: "8", y: "2", rx: "1", ry: "1", key: "tgr4d6" }],
  [
    "path",
    {
      d: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",
      key: "116196"
    }
  ],
  ["path", { d: "m9 14 2 2 4-4", key: "df797q" }]
];
const ClipboardCheck = createLucideIcon("clipboard-check", __iconNode);
const GLASS_ITEM = "rounded-xl border border-slate-800/70 bg-slate-900/60 backdrop-blur-sm";
function ChecklistIcon({ estado }) {
  if (estado === "COMPLETADO") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "size-5 text-emerald-400 shrink-0" });
  }
  if (estado === "BLOQUEADO") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "size-4 text-slate-500 shrink-0" });
  }
  if (estado === "EN_PROGRESO") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-4 rounded-full border-2 border-yellow-400 bg-yellow-400/20 shrink-0 animate-pulse" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Circle, { className: "size-4 text-slate-500 shrink-0" });
}
function WorkflowChecklistModal({
  open,
  onOpenChange,
  contribuyenteId,
  periodo,
  contribuyenteLabel
}) {
  const mounted = useIsMounted();
  const { estado, isLoading, isFetching, refetch, marcarPaso, isMarcandoPaso } = useWorkflowWizard(contribuyenteId, periodo, open);
  const porcentaje = mounted && estado ? Math.min(100, Math.max(0, estado.porcentajeAvance)) : 0;
  async function handleTogglePaso(pasoNumero, completado) {
    if (!contribuyenteId || !periodo) return;
    await marcarPaso({ paso: pasoNumero, completado: !completado });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Sheet, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    SheetContent,
    {
      side: "right",
      className: "w-full sm:max-w-lg bg-slate-950/95 border-slate-800 text-slate-100 overflow-y-auto",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetHeader, { className: "text-left space-y-2 pb-4 border-b border-slate-800", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetTitle, { className: "text-emerald-300 flex items-center gap-2", children: [
            "Checklist de cierre",
            (isLoading || isFetching) && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 animate-spin text-slate-400" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetDescription, { className: "text-slate-400", children: [
            contribuyenteLabel ? `${contribuyenteLabel} · ` : "",
            "Periodo",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-slate-300", children: periodo?.replace(/\D/g, "").slice(0, 6) || "—" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-4 space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-400", children: "Progreso del mes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-emerald-300 tabular-nums", children: mounted ? `${Math.round(porcentaje)}%` : "—%" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 rounded-full bg-slate-800 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: cn(
                  "h-full bg-gradient-to-r from-emerald-600 to-teal-400",
                  mounted && "transition-all duration-500"
                ),
                style: { width: mounted ? `${porcentaje}%` : "0%" }
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "outline",
              size: "sm",
              className: "w-full border-slate-700 text-slate-300",
              onClick: () => void refetch(),
              disabled: isLoading,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: cn("size-4 mr-2", isFetching && "animate-spin") }),
                "Actualizar diagnóstico"
              ]
            }
          ),
          isLoading && !estado ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center py-12 text-slate-400 gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-5 animate-spin" }),
            "Analizando periodo…"
          ] }) : estado ? /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-3", children: estado.pasos.map((paso) => {
            const manualOk = paso.pasoNumero === 1 ? estado.periodoCierre.paso1RucOk : paso.pasoNumero === 2 ? estado.periodoCierre.paso2SireOk : paso.pasoNumero === 3 ? estado.periodoCierre.paso3ProvisionOk : paso.pasoNumero === 4 ? estado.periodoCierre.paso4CajaOk : estado.periodoCierre.paso5LibrosCerrados;
            const alertasPaso = estado.alertas.filter(
              (a) => a.pasoRelacionado === paso.pasoNumero && a.severidad !== "INFO"
            );
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: cn(GLASS_ITEM, "p-4 space-y-3"), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ChecklistIcon, { estado: paso.estado }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm text-slate-100", children: paso.titulo }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Badge,
                      {
                        variant: "outline",
                        className: cn("text-[10px]", PASO_ESTADO_COLORS[paso.estado]),
                        children: paso.estado.replace("_", " ")
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-400 mt-1", children: paso.descripcion })
                ] })
              ] }),
              alertasPaso.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1.5 pl-8", children: alertasPaso.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "text-xs text-amber-200/90 flex gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-500", children: "•" }),
                a.mensaje
              ] }, a.id)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 pl-8", children: [
                paso.estado !== "BLOQUEADO" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    asChild: true,
                    size: "sm",
                    variant: "secondary",
                    className: "h-8 text-xs bg-slate-800 hover:bg-slate-700",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: paso.rutaModulo, children: [
                      "Ir al módulo",
                      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "size-3 ml-1" })
                    ] })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    size: "sm",
                    variant: "outline",
                    className: "h-8 text-xs border-slate-600",
                    disabled: isMarcandoPaso || paso.estado === "BLOQUEADO",
                    onClick: () => void handleTogglePaso(paso.pasoNumero, manualOk),
                    children: manualOk ? "Marcar pendiente" : "Marcar completado"
                  }
                )
              ] })
            ] }, paso.pasoNumero);
          }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-500 text-center py-8", children: "Seleccione contribuyente y periodo para ver el checklist." }),
          estado && !estado.diarioCuadrado && estado.metricas.totalAsientosDiario > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-red-500/40 bg-red-950/30 p-3 text-xs text-red-200", children: [
            "Libro Diario descuadrado: Debe S/ ",
            estado.metricas.sumaDebe.toFixed(2),
            " ≠ Haber S/",
            " ",
            estado.metricas.sumaHaber.toFixed(2)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sticky bottom-0 pt-3 pb-1 bg-slate-950/95 border-t border-slate-800", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "ghost",
            className: "w-full text-slate-400",
            onClick: () => onOpenChange(false),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-4 mr-2" }),
              "Cerrar checklist"
            ]
          }
        ) })
      ]
    }
  ) });
}
const GLASS$1 = "rounded-2xl border border-slate-800/80 bg-slate-900/70 backdrop-blur-md shadow-xl shadow-emerald-950/20";
function PasoIcon({ estado }) {
  if (estado === "COMPLETADO") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "size-5 text-emerald-400 shrink-0", "aria-hidden": true });
  }
  if (estado === "EN_PROGRESO") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "span",
      {
        className: "size-3 rounded-full bg-yellow-400 shrink-0 animate-pulse shadow-[0_0_8px_rgba(250,204,21,0.8)]",
        "aria-hidden": true
      }
    );
  }
  if (estado === "BLOQUEADO") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "size-4 text-slate-500 shrink-0", "aria-hidden": true });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Circle, { className: "size-4 text-slate-500 shrink-0", "aria-hidden": true });
}
function pasoTieneAtencion(pasoNumero, estado, alertas) {
  if (estado === "EN_PROGRESO") return true;
  return alertas.some(
    (a) => a.pasoRelacionado === pasoNumero && (a.severidad === "BLOQUEANTE" || a.severidad === "ADVERTENCIA")
  );
}
function WorkflowStepperBar({
  estado,
  isLoading = false,
  className,
  compact = false
}) {
  const mounted = useIsMounted();
  const porcentaje = mounted && estado ? Math.min(100, Math.max(0, estado.porcentajeAvance)) : 0;
  if (isLoading && !estado) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn(GLASS$1, "p-4 flex items-center gap-3", className), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-5 animate-spin text-emerald-400" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-slate-400", children: "Calculando progreso del ciclo contable…" })
    ] });
  }
  if (!estado) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn(GLASS$1, "p-4 space-y-4", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-wider text-slate-500 font-medium", children: "Ciclo contable mensual" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-slate-300", children: [
          "Periodo",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-emerald-300", children: estado.periodo }),
          " · ",
          "Paso sugerido",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-yellow-300", children: [
            estado.pasoSugerido,
            "/5"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold tabular-nums text-emerald-300", children: mounted ? `${Math.round(porcentaje)}%` : "—%" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500", children: "avance global" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative h-2.5 rounded-full bg-slate-800/80 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: cn(
          "absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-teal-300",
          mounted && "transition-all duration-700 ease-out"
        ),
        style: { width: mounted ? `${porcentaje}%` : "0%" },
        role: "progressbar",
        "aria-valuenow": Math.round(porcentaje),
        "aria-valuemin": 0,
        "aria-valuemax": 100,
        "aria-label": "Progreso del ciclo contable"
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: cn(
          "grid gap-2",
          compact ? "grid-cols-1 sm:grid-cols-5" : "grid-cols-1 md:grid-cols-5"
        ),
        children: estado.pasos.map((paso) => {
          const atencion = pasoTieneAtencion(paso.pasoNumero, paso.estado, estado.alertas);
          const colorClass = atencion && paso.estado !== "COMPLETADO" && paso.estado !== "BLOQUEADO" ? "border-red-500/60 bg-red-950/30 text-red-200 shadow-[0_0_10px_rgba(239,68,68,0.2)]" : PASO_ESTADO_COLORS[paso.estado];
          const content = /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: cn(
                "rounded-xl border p-3 flex flex-col gap-1.5 min-h-[88px] transition-colors",
                colorClass,
                paso.estado !== "BLOQUEADO" && "hover:brightness-110 cursor-pointer"
              ),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-mono opacity-70", children: paso.pasoNumero }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(PasoIcon, { estado: paso.estado }),
                  atencion && paso.estado !== "COMPLETADO" ? /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "size-3.5 text-red-400 ml-auto shrink-0" }) : null
                ] }),
                !compact && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold leading-tight", children: paso.titulo }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] opacity-75 line-clamp-2 leading-snug", children: paso.descripcion })
                ] }),
                compact && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-medium leading-tight", children: paso.titulo })
              ]
            }
          );
          if (paso.estado === "BLOQUEADO") {
            return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { title: paso.titulo, children: content }, paso.pasoNumero);
          }
          return /* @__PURE__ */ jsxRuntimeExports.jsx(
            Link,
            {
              to: paso.rutaModulo,
              className: "block focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xl",
              title: paso.descripcion,
              children: content
            },
            paso.pasoNumero
          );
        })
      }
    )
  ] });
}
const GLASS = "rounded-2xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-md text-slate-100 shadow-xl shadow-emerald-950/20";
function defaultPeriodo() {
  const d = /* @__PURE__ */ new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
}
async function resolveContribuyenteId(ruc) {
  const { supabase } = await import("./router-BRL0s0LD.js").then((n) => n.k);
  const { data, error } = await supabase.from("contribuyentes").select("id").eq("ruc", ruc).maybeSingle();
  if (error) return null;
  return data?.id ?? null;
}
function WorkflowWizardHub() {
  const mounted = useIsMounted();
  const { contribuyentes, loading: loadingContrib } = useContribuyentes();
  const [selectedRuc, setSelectedRuc] = reactExports.useState("");
  const [periodo, setPeriodo] = reactExports.useState(defaultPeriodo);
  const [checklistOpen, setChecklistOpen] = reactExports.useState(false);
  const options = reactExports.useMemo(
    () => contribuyentes.filter((c) => c.ruc?.trim()).map((c) => ({
      ruc: c.ruc.replace(/\D/g, "").slice(0, 11),
      label: `${c.ruc} — ${c.razonSocial || "Sin razón social"}`
    })),
    [contribuyentes]
  );
  reactExports.useEffect(() => {
    if (!selectedRuc && options.length > 0) setSelectedRuc(options[0].ruc);
  }, [options, selectedRuc]);
  const contribuyente = reactExports.useMemo(
    () => contribuyentes.find((c) => c.ruc.replace(/\D/g, "") === selectedRuc),
    [contribuyentes, selectedRuc]
  );
  const { data: resolvedId } = useQuery({
    queryKey: ["workflow", "contribuyente-id", selectedRuc],
    queryFn: () => resolveContribuyenteId(selectedRuc),
    enabled: !!selectedRuc && selectedRuc.length === 11,
    staleTime: 12e4
  });
  const contribuyenteId = contribuyente?.id ?? resolvedId ?? null;
  const periodoClean = periodo.replace(/\D/g, "").slice(0, 6);
  const { estado, isLoading, isFetching, refetch } = useWorkflowWizard(
    contribuyenteId,
    periodoClean
  );
  const alertasVisibles = estado?.alertas.filter((a) => a.severidad !== "INFO") ?? [];
  const bloqueantes = alertasVisibles.filter((a) => a.severidad === "BLOQUEANTE").length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-full space-y-6 p-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-wrap items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GitBranch, { className: "size-6 text-emerald-400" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight text-slate-100", children: "Asistente de Flujo Contable" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-400", children: "Piloto automático del ciclo mensual — 5 pasos hasta el cierre fiscal" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          onClick: () => setChecklistOpen(true),
          disabled: !contribuyenteId,
          className: "bg-emerald-600 hover:bg-emerald-500 gap-2",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardCheck, { className: "size-4" }),
            "Checklist de cierre"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn(GLASS, "p-4 flex flex-wrap gap-4 items-end"), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 min-w-[240px] lg:flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-slate-400 text-xs", children: "Contribuyente" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Select,
          {
            value: selectedRuc || void 0,
            onValueChange: setSelectedRuc,
            disabled: loadingContrib,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "bg-slate-800/50 border-slate-700", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Seleccione RUC…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { className: "bg-slate-900 border-slate-700", children: options.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o.ruc, children: o.label }, o.ruc)) })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-slate-400 text-xs", children: "Periodo (YYYYMM)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: periodo,
            onChange: (e) => setPeriodo(e.target.value.replace(/\D/g, "").slice(0, 6)),
            className: "w-32 bg-slate-800/50 border-slate-700 font-mono",
            placeholder: "202607"
          }
        )
      ] }),
      estado && mounted && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 items-center ml-auto", children: [
        bloqueantes > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "destructive", className: "text-xs", children: [
          bloqueantes,
          " bloqueante(s)"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "border-emerald-600/40 text-emerald-300 text-xs", children: [
          "Diario ",
          estado.diarioCuadrado ? "cuadrado" : "descuadrado"
        ] }),
        (isLoading || isFetching) && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 animate-spin text-slate-400" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(WorkflowStepperBar, { estado, isLoading: isLoading && !estado }),
    estado && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: cn(GLASS, "p-5 space-y-3"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-sm font-semibold text-emerald-300 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-4" }),
          "Métricas del periodo"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("dl", { className: "grid grid-cols-2 gap-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-3 !rounded-lg", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-slate-500 text-xs", children: "RCE sin provisionar" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "font-mono text-lg text-amber-300", children: estado.metricas.rcePendientesProvision })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-3 !rounded-lg", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-slate-500 text-xs", children: "RVIE sin provisionar" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "font-mono text-lg text-amber-300", children: estado.metricas.rviePendientesProvision })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-3 !rounded-lg", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-slate-500 text-xs", children: "Pendientes tesorería" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "font-mono text-lg text-sky-300", children: estado.metricas.comprasPendientesTesoreria + estado.metricas.ventasPendientesTesoreria })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-card p-3 !rounded-lg", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-slate-500 text-xs", children: "Asientos diario" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "font-mono text-lg text-slate-200", children: estado.metricas.totalAsientosDiario })
          ] }),
          estado.metricas.regimenTributario && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 glass-card p-3 !rounded-lg", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-slate-500 text-xs", children: "Régimen tributario" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "font-semibold text-emerald-300", children: estado.metricas.regimenTributario })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: cn(GLASS, "p-5 space-y-3"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold text-emerald-300", children: "Alertas activas" }),
        alertasVisibles.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-400", children: "Sin alertas críticas. El periodo avanza según lo esperado." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: alertasVisibles.map((alerta) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "li",
          {
            className: cn(
              "rounded-lg border p-3 text-sm",
              ALERTA_SEVERIDAD_COLORS[alerta.severidad]
            ),
            children: alerta.mensaje
          },
          alerta.id
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            size: "sm",
            className: "border-slate-600 text-slate-300",
            onClick: () => void refetch(),
            children: "Recalcular diagnóstico"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      WorkflowChecklistModal,
      {
        open: checklistOpen,
        onOpenChange: setChecklistOpen,
        contribuyenteId,
        periodo: periodoClean,
        contribuyenteLabel: contribuyente?.razonSocial
      }
    )
  ] });
}
export {
  WorkflowWizardHub
};
