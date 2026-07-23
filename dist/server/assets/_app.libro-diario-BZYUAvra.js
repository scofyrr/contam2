import { U as reactExports, L as jsxRuntimeExports } from "./server-Bo29azLP.js";
import { u as useQuery } from "./useQuery-BWRVlDqX.js";
import { B as Badge } from "./badge-yaC6QAMb.js";
import { T as Tabs, b as TabsList, c as TabsTrigger, a as TabsContent } from "./tabs-BjHsyqGX.js";
import { ah as tipoAsientoProvision, ac as supabase, M as lineasToAsientosPlanos, O as logSupabaseAsientosInsertError, ak as updateRegistroSireCabecera, ai as toAsientoContableInsert, s as fetchRegistroSireById$1, W as normalizeRegistroSire, y as generarLineasAsiento, u as fetchRegistrosSireRows, a5 as resolverMontosComprobante, ar as useQueryClient, aj as toast, I as idReferenciaLote, L as Link, q as esLineaCentralizacionCaja, d as Route, r as fetchLibroDiario } from "./router-B2fOVgbK.js";
import { u as useMutation } from "./useMutation-BW7ClUbS.js";
import { B as Button } from "./button-OKRTDzrH.js";
import { T as Table, d as TableHeader, e as TableRow, c as TableHead, a as TableBody, b as TableCell } from "./table-B9UO78R2.js";
import { F as FileText } from "./file-text-C6WtH0h-.js";
import { A as Alert, b as AlertTitle, a as AlertDescription } from "./alert-xjHSbjuC.js";
import { I as Input } from "./input-CVw-0GOD.js";
import { a as cn } from "./utils-8RO4xBwZ.js";
import { l as useControllableState, d as Root2$1, o as useId, c as Primitive, e as composeEventHandlers, A as Anchor, i as createPopperScope, P as Portal$1, h as createContextScope, k as hideOthers, R as ReactRemoveScroll, n as useFocusGuards, F as FocusScope, D as DismissableLayer, b as Content, a as Arrow, C as Check } from "./Combination-D4Tn14OX.js";
import { a as createLucideIcon, c as composeRefs, u as useComposedRefs } from "./index-CWutStw1.js";
import { P as Presence } from "./index-Bkm5nwUb.js";
import { e as formatCuentaPcge, d as fetchPcgeCuentasActivas } from "./pcge-service-ByOdw3ht.js";
import { S as Search } from "./search-Jjuvdmyj.js";
import { P as Plus } from "./plus-BZJzn-4g.js";
import { S as Save } from "./save-BH6o-scK.js";
import { T as TriangleAlert } from "./triangle-alert-n38mPMK9.js";
import { T as Trash2 } from "./trash-2-Cab_E9zp.js";
import { i as invalidateLibrosContables, R as RequireRucEmptyState, M as MEDIOS_PAGO_SUNAT, f as fetchCuentasFinancieras, q as queryKeys, E as EmpresaPeriodoFilters } from "./cuentas-financieras-types-38DFugCH.js";
import { L as LoaderCircle } from "./loader-circle-DUOoJQci.js";
import { L as Label } from "./label-DrIl1YMr.js";
import { S as Sheet, a as SheetContent, c as SheetHeader, d as SheetTitle } from "./sheet-B-5wm_pD.js";
import { F as FieldHelper } from "./field-helper-BvfRNaAW.js";
import { D as Dialog, a as DialogContent, d as DialogHeader, e as DialogTitle, b as DialogDescription, c as DialogFooter } from "./dialog-BvZLNj9g.js";
import { fetchMovimientosPorAsientoLote } from "./caja-service-DoK5iLHO.js";
import { W as Wallet } from "./wallet-ipKTTbZm.js";
import AsientoTraceabilityViewerPremium from "./asiento-traceability-viewer-premium-bM7Ldobb.js";
import { E as Eye } from "./eye-C4ug0RW_.js";
import { S as Select, c as SelectTrigger, d as SelectValue, a as SelectContent, b as SelectItem } from "./select-DBf2jt_8.js";
import { r as registrarPagoCobroCaja, f as fetchDeudasPendientes } from "./cxc-cxp-service-BJlTS8CO.js";
import { B as Banknote } from "./banknote-DL70pHNl.js";
import { S as Skeleton } from "./skeleton-BhOkZDr2.js";
import { T as Textarea } from "./textarea-COeedhui.js";
import { B as BookOpen } from "./book-open-DuhpnH3U.js";
import { S as Sparkles } from "./sparkles-DUxBT6bb.js";
import { C as ChevronDown } from "./chevron-up-kSt2_UA7.js";
import { C as ChevronRight } from "./chevron-right-BUCAQpLv.js";
import { E as ExportButtons } from "./export-buttons-Dvk19LPI.js";
import { N as NuevaTareaButton } from "./NuevaTareaButton-DpHA0XFL.js";
import { c as exportLibroPdf, b as exportLibroExcel } from "./export-service-K0gYOsEZ.js";
import { S as StepGuardBanner } from "./StepGuardBanner-j-y1nDSi.js";
import { D as Database } from "./database-DaaekwpJ.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-CG6nsUgb.js";
import "./user-qnZRQgmD.js";
import "./index-M3oW48Eb.js";
import "./x-B5oN35Uv.js";
import "./circle-alert-Cna6VmV6.js";
import "./info-CGwkGZ-6.js";
import "./http-client-B_ATtUrg.js";
import "./dropdown-menu-DeulaLXn.js";
import "./circle-CDAFw6RI.js";
import "./progress-C9Z_U5y-.js";
import "./collapsible-PfIwXi4G.js";
import "./index-Cdaxc1ck.js";
import "./use-ui-preferences-DGbcpeLX.js";
import "./asiento-traceability-service-BA-aKu5e.js";
import "./sire-sync-service-B7QOQYp8.js";
import "./refresh-cw-CZupm7dT.js";
import "./download-BejVGX4c.js";
import "./rotate-ccw-BqqJqpKS.js";
import "./chart-column-D891hKmx.js";
import "./zap-BeO-vqxf.js";
import "./index-DkWXu2TP.js";
import "./upload-DWU6MdPY.js";
import "./file-spreadsheet-XtgtSkqf.js";
import "./FormularioTarea-D6w-BTXX.js";
import "./form-CUh1Vx2p.js";
import "./switch-pNzoGnQj.js";
import "./tareas-service-Co1DUort.js";
import "./ClientOnly-D9gGZLlB.js";
import "./useIsMounted-BB6t-nLN.js";
import "./workflow-CoplcbZr.js";
import "./shield-alert-wDeY6Myf.js";
const __iconNode = [
  ["path", { d: "m7 15 5 5 5-5", key: "1hf1tw" }],
  ["path", { d: "m7 9 5-5 5 5", key: "sgt6xg" }]
];
const ChevronsUpDown = createLucideIcon("chevrons-up-down", __iconNode);
function formatMoney$6(n) {
  return n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function ComprobantesPendientesTable({
  rows,
  loading,
  selectedId,
  onSelect
}) {
  const sorted = reactExports.useMemo(
    () => [...rows].sort((a, b) => b.fecha_emision.localeCompare(a.fecha_emision)),
    [rows]
  );
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground", children: "Cargando comprobantes…" });
  }
  if (sorted.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground", children: "No hay comprobantes pendientes de provisión para este cliente." });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b bg-muted/20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "size-4" }),
        "Comprobantes pendientes (SIRE)"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Selecciona un comprobante individual para generar su asiento de provisión." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Fecha" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Tipo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Comprobante" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Contraparte" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Base" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "IGV" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Total" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Acción" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: sorted.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        TableRow,
        {
          className: selectedId === r.id ? "bg-primary/5" : void 0,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: r.fecha_emision }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: r.tipo === "VENTA" ? "default" : "secondary", children: r.tipo }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "font-mono text-xs", children: [
              r.cod_tipo_cdp,
              "-",
              r.serie_cdp,
              "-",
              r.nro_cdp_inicial
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "max-w-[180px] truncate text-xs", children: r.nombre_contraparte ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right font-mono text-xs", children: formatMoney$6(Number(r.mto_bi_gravada ?? r.bi_grav ?? 0)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right font-mono text-xs", children: formatMoney$6(Number(r.mto_igv_ipe ?? r.igv_grav ?? 0)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right font-mono text-xs", children: formatMoney$6(Number(r.mto_total_cp ?? r.importe_total ?? 0)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "sm",
                variant: selectedId === r.id ? "default" : "outline",
                onClick: () => onSelect(r),
                children: "Generar asiento"
              }
            ) })
          ]
        },
        r.id
      )) })
    ] })
  ] });
}
// @__NO_SIDE_EFFECTS__
function createSlot(ownerName) {
  const SlotClone = /* @__PURE__ */ createSlotClone(ownerName);
  const Slot2 = reactExports.forwardRef((props, forwardedRef) => {
    const { children, ...slotProps } = props;
    const childrenArray = reactExports.Children.toArray(children);
    const slottable = childrenArray.find(isSlottable);
    if (slottable) {
      const newElement = slottable.props.children;
      const newChildren = childrenArray.map((child) => {
        if (child === slottable) {
          if (reactExports.Children.count(newElement) > 1) return reactExports.Children.only(null);
          return reactExports.isValidElement(newElement) ? newElement.props.children : null;
        } else {
          return child;
        }
      });
      return /* @__PURE__ */ jsxRuntimeExports.jsx(SlotClone, { ...slotProps, ref: forwardedRef, children: reactExports.isValidElement(newElement) ? reactExports.cloneElement(newElement, void 0, newChildren) : null });
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx(SlotClone, { ...slotProps, ref: forwardedRef, children });
  });
  Slot2.displayName = `${ownerName}.Slot`;
  return Slot2;
}
// @__NO_SIDE_EFFECTS__
function createSlotClone(ownerName) {
  const SlotClone = reactExports.forwardRef((props, forwardedRef) => {
    const { children, ...slotProps } = props;
    if (reactExports.isValidElement(children)) {
      const childrenRef = getElementRef(children);
      const props2 = mergeProps(slotProps, children.props);
      if (children.type !== reactExports.Fragment) {
        props2.ref = forwardedRef ? composeRefs(forwardedRef, childrenRef) : childrenRef;
      }
      return reactExports.cloneElement(children, props2);
    }
    return reactExports.Children.count(children) > 1 ? reactExports.Children.only(null) : null;
  });
  SlotClone.displayName = `${ownerName}.SlotClone`;
  return SlotClone;
}
var SLOTTABLE_IDENTIFIER = /* @__PURE__ */ Symbol("radix.slottable");
function isSlottable(child) {
  return reactExports.isValidElement(child) && typeof child.type === "function" && "__radixId" in child.type && child.type.__radixId === SLOTTABLE_IDENTIFIER;
}
function mergeProps(slotProps, childProps) {
  const overrideProps = { ...childProps };
  for (const propName in childProps) {
    const slotPropValue = slotProps[propName];
    const childPropValue = childProps[propName];
    const isHandler = /^on[A-Z]/.test(propName);
    if (isHandler) {
      if (slotPropValue && childPropValue) {
        overrideProps[propName] = (...args) => {
          const result = childPropValue(...args);
          slotPropValue(...args);
          return result;
        };
      } else if (slotPropValue) {
        overrideProps[propName] = slotPropValue;
      }
    } else if (propName === "style") {
      overrideProps[propName] = { ...slotPropValue, ...childPropValue };
    } else if (propName === "className") {
      overrideProps[propName] = [slotPropValue, childPropValue].filter(Boolean).join(" ");
    }
  }
  return { ...slotProps, ...overrideProps };
}
function getElementRef(element) {
  let getter = Object.getOwnPropertyDescriptor(element.props, "ref")?.get;
  let mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    return element.ref;
  }
  getter = Object.getOwnPropertyDescriptor(element, "ref")?.get;
  mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    return element.props.ref;
  }
  return element.props.ref || element.ref;
}
var POPOVER_NAME = "Popover";
var [createPopoverContext] = createContextScope(POPOVER_NAME, [
  createPopperScope
]);
var usePopperScope = createPopperScope();
var [PopoverProvider, usePopoverContext] = createPopoverContext(POPOVER_NAME);
var Popover$1 = (props) => {
  const {
    __scopePopover,
    children,
    open: openProp,
    defaultOpen,
    onOpenChange,
    modal = false
  } = props;
  const popperScope = usePopperScope(__scopePopover);
  const triggerRef = reactExports.useRef(null);
  const [hasCustomAnchor, setHasCustomAnchor] = reactExports.useState(false);
  const [open, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen ?? false,
    onChange: onOpenChange,
    caller: POPOVER_NAME
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Root2$1, { ...popperScope, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    PopoverProvider,
    {
      scope: __scopePopover,
      contentId: useId(),
      triggerRef,
      open,
      onOpenChange: setOpen,
      onOpenToggle: reactExports.useCallback(() => setOpen((prevOpen) => !prevOpen), [setOpen]),
      hasCustomAnchor,
      onCustomAnchorAdd: reactExports.useCallback(() => setHasCustomAnchor(true), []),
      onCustomAnchorRemove: reactExports.useCallback(() => setHasCustomAnchor(false), []),
      modal,
      children
    }
  ) });
};
Popover$1.displayName = POPOVER_NAME;
var ANCHOR_NAME = "PopoverAnchor";
var PopoverAnchor = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopePopover, ...anchorProps } = props;
    const context = usePopoverContext(ANCHOR_NAME, __scopePopover);
    const popperScope = usePopperScope(__scopePopover);
    const { onCustomAnchorAdd, onCustomAnchorRemove } = context;
    reactExports.useEffect(() => {
      onCustomAnchorAdd();
      return () => onCustomAnchorRemove();
    }, [onCustomAnchorAdd, onCustomAnchorRemove]);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Anchor, { ...popperScope, ...anchorProps, ref: forwardedRef });
  }
);
PopoverAnchor.displayName = ANCHOR_NAME;
var TRIGGER_NAME = "PopoverTrigger";
var PopoverTrigger$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopePopover, ...triggerProps } = props;
    const context = usePopoverContext(TRIGGER_NAME, __scopePopover);
    const popperScope = usePopperScope(__scopePopover);
    const composedTriggerRef = useComposedRefs(forwardedRef, context.triggerRef);
    const trigger = /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.button,
      {
        type: "button",
        "aria-haspopup": "dialog",
        "aria-expanded": context.open,
        "aria-controls": context.contentId,
        "data-state": getState(context.open),
        ...triggerProps,
        ref: composedTriggerRef,
        onClick: composeEventHandlers(props.onClick, context.onOpenToggle)
      }
    );
    return context.hasCustomAnchor ? trigger : /* @__PURE__ */ jsxRuntimeExports.jsx(Anchor, { asChild: true, ...popperScope, children: trigger });
  }
);
PopoverTrigger$1.displayName = TRIGGER_NAME;
var PORTAL_NAME = "PopoverPortal";
var [PortalProvider, usePortalContext] = createPopoverContext(PORTAL_NAME, {
  forceMount: void 0
});
var PopoverPortal = (props) => {
  const { __scopePopover, forceMount, children, container } = props;
  const context = usePopoverContext(PORTAL_NAME, __scopePopover);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(PortalProvider, { scope: __scopePopover, forceMount, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || context.open, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Portal$1, { asChild: true, container, children }) }) });
};
PopoverPortal.displayName = PORTAL_NAME;
var CONTENT_NAME = "PopoverContent";
var PopoverContent$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const portalContext = usePortalContext(CONTENT_NAME, props.__scopePopover);
    const { forceMount = portalContext.forceMount, ...contentProps } = props;
    const context = usePopoverContext(CONTENT_NAME, props.__scopePopover);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || context.open, children: context.modal ? /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverContentModal, { ...contentProps, ref: forwardedRef }) : /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverContentNonModal, { ...contentProps, ref: forwardedRef }) });
  }
);
PopoverContent$1.displayName = CONTENT_NAME;
var Slot = /* @__PURE__ */ createSlot("PopoverContent.RemoveScroll");
var PopoverContentModal = reactExports.forwardRef(
  (props, forwardedRef) => {
    const context = usePopoverContext(CONTENT_NAME, props.__scopePopover);
    const contentRef = reactExports.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, contentRef);
    const isRightClickOutsideRef = reactExports.useRef(false);
    reactExports.useEffect(() => {
      const content = contentRef.current;
      if (content) return hideOthers(content);
    }, []);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(ReactRemoveScroll, { as: Slot, allowPinchZoom: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      PopoverContentImpl,
      {
        ...props,
        ref: composedRefs,
        trapFocus: context.open,
        disableOutsidePointerEvents: true,
        onCloseAutoFocus: composeEventHandlers(props.onCloseAutoFocus, (event) => {
          event.preventDefault();
          if (!isRightClickOutsideRef.current) context.triggerRef.current?.focus();
        }),
        onPointerDownOutside: composeEventHandlers(
          props.onPointerDownOutside,
          (event) => {
            const originalEvent = event.detail.originalEvent;
            const ctrlLeftClick = originalEvent.button === 0 && originalEvent.ctrlKey === true;
            const isRightClick = originalEvent.button === 2 || ctrlLeftClick;
            isRightClickOutsideRef.current = isRightClick;
          },
          { checkForDefaultPrevented: false }
        ),
        onFocusOutside: composeEventHandlers(
          props.onFocusOutside,
          (event) => event.preventDefault(),
          { checkForDefaultPrevented: false }
        )
      }
    ) });
  }
);
var PopoverContentNonModal = reactExports.forwardRef(
  (props, forwardedRef) => {
    const context = usePopoverContext(CONTENT_NAME, props.__scopePopover);
    const hasInteractedOutsideRef = reactExports.useRef(false);
    const hasPointerDownOutsideRef = reactExports.useRef(false);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      PopoverContentImpl,
      {
        ...props,
        ref: forwardedRef,
        trapFocus: false,
        disableOutsidePointerEvents: false,
        onCloseAutoFocus: (event) => {
          props.onCloseAutoFocus?.(event);
          if (!event.defaultPrevented) {
            if (!hasInteractedOutsideRef.current) context.triggerRef.current?.focus();
            event.preventDefault();
          }
          hasInteractedOutsideRef.current = false;
          hasPointerDownOutsideRef.current = false;
        },
        onInteractOutside: (event) => {
          props.onInteractOutside?.(event);
          if (!event.defaultPrevented) {
            hasInteractedOutsideRef.current = true;
            if (event.detail.originalEvent.type === "pointerdown") {
              hasPointerDownOutsideRef.current = true;
            }
          }
          const target = event.target;
          const targetIsTrigger = context.triggerRef.current?.contains(target);
          if (targetIsTrigger) event.preventDefault();
          if (event.detail.originalEvent.type === "focusin" && hasPointerDownOutsideRef.current) {
            event.preventDefault();
          }
        }
      }
    );
  }
);
var PopoverContentImpl = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopePopover,
      trapFocus,
      onOpenAutoFocus,
      onCloseAutoFocus,
      disableOutsidePointerEvents,
      onEscapeKeyDown,
      onPointerDownOutside,
      onFocusOutside,
      onInteractOutside,
      ...contentProps
    } = props;
    const context = usePopoverContext(CONTENT_NAME, __scopePopover);
    const popperScope = usePopperScope(__scopePopover);
    useFocusGuards();
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      FocusScope,
      {
        asChild: true,
        loop: true,
        trapped: trapFocus,
        onMountAutoFocus: onOpenAutoFocus,
        onUnmountAutoFocus: onCloseAutoFocus,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          DismissableLayer,
          {
            asChild: true,
            disableOutsidePointerEvents,
            onInteractOutside,
            onEscapeKeyDown,
            onPointerDownOutside,
            onFocusOutside,
            onDismiss: () => context.onOpenChange(false),
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Content,
              {
                "data-state": getState(context.open),
                role: "dialog",
                id: context.contentId,
                ...popperScope,
                ...contentProps,
                ref: forwardedRef,
                style: {
                  ...contentProps.style,
                  // re-namespace exposed content custom properties
                  ...{
                    "--radix-popover-content-transform-origin": "var(--radix-popper-transform-origin)",
                    "--radix-popover-content-available-width": "var(--radix-popper-available-width)",
                    "--radix-popover-content-available-height": "var(--radix-popper-available-height)",
                    "--radix-popover-trigger-width": "var(--radix-popper-anchor-width)",
                    "--radix-popover-trigger-height": "var(--radix-popper-anchor-height)"
                  }
                }
              }
            )
          }
        )
      }
    );
  }
);
var CLOSE_NAME = "PopoverClose";
var PopoverClose = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopePopover, ...closeProps } = props;
    const context = usePopoverContext(CLOSE_NAME, __scopePopover);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.button,
      {
        type: "button",
        ...closeProps,
        ref: forwardedRef,
        onClick: composeEventHandlers(props.onClick, () => context.onOpenChange(false))
      }
    );
  }
);
PopoverClose.displayName = CLOSE_NAME;
var ARROW_NAME = "PopoverArrow";
var PopoverArrow = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopePopover, ...arrowProps } = props;
    const popperScope = usePopperScope(__scopePopover);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Arrow, { ...popperScope, ...arrowProps, ref: forwardedRef });
  }
);
PopoverArrow.displayName = ARROW_NAME;
function getState(open) {
  return open ? "open" : "closed";
}
var Root2 = Popover$1;
var Trigger = PopoverTrigger$1;
var Portal = PopoverPortal;
var Content2 = PopoverContent$1;
const Popover = Root2;
const PopoverTrigger = Trigger;
const PopoverContent = reactExports.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Portal, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
  Content2,
  {
    ref,
    align,
    sideOffset,
    className: cn(
      "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-popover-content-transform-origin)",
      className
    ),
    ...props
  }
) }));
PopoverContent.displayName = Content2.displayName;
function CuentaPcgeCombobox({
  value,
  onChange,
  cuentas,
  disabled
}) {
  const [open, setOpen] = reactExports.useState(false);
  const [q, setQ] = reactExports.useState("");
  const selected = cuentas.find((c) => c.codigo_cuenta === value);
  const filtered = reactExports.useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return cuentas.slice(0, 80);
    return cuentas.filter(
      (c) => `${c.codigo_cuenta} ${c.nombre_cuenta}`.toLowerCase().includes(needle)
    ).slice(0, 80);
  }, [cuentas, q]);
  reactExports.useEffect(() => {
    if (!open) setQ("");
  }, [open]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Button,
      {
        variant: "outline",
        role: "combobox",
        "aria-expanded": open,
        disabled,
        className: "w-full justify-between font-mono h-8 text-xs",
        children: [
          selected ? formatCuentaPcge(selected) : value ? `[${value}]` : "Cuenta…",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronsUpDown, { className: "ml-2 size-3 shrink-0 opacity-50" })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(PopoverContent, { className: "w-[360px] p-0", align: "start", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center border-b px-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "mr-2 size-4 shrink-0 opacity-50" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "Buscar cuenta PCGE…",
            value: q,
            onChange: (e) => setQ(e.target.value),
            className: "border-0 shadow-none focus-visible:ring-0 h-8"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-56 overflow-y-auto p-1", children: filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-4 text-center text-xs text-muted-foreground", children: "Sin resultados" }) : filtered.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          className: cn(
            "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-xs hover:bg-accent",
            value === c.codigo_cuenta && "bg-accent"
          ),
          onClick: () => {
            onChange(c.codigo_cuenta);
            setOpen(false);
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Check,
              {
                className: cn("size-3", value === c.codigo_cuenta ? "opacity-100" : "opacity-0")
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: formatCuentaPcge(c) })
          ]
        },
        c.codigo_cuenta
      )) })
    ] })
  ] });
}
function round2$1(n) {
  return Math.round(n * 100) / 100;
}
function sumDebe(lineas) {
  return round2$1(lineas.reduce((s, l) => s + Number(l.debe ?? 0), 0));
}
function sumHaber(lineas) {
  return round2$1(lineas.reduce((s, l) => s + Number(l.haber ?? 0), 0));
}
function isAsientoCuadrado(lineas, tolerance = 1e-3) {
  return Math.abs(sumDebe(lineas) - sumHaber(lineas)) <= tolerance;
}
function toEditableLineas(lineas) {
  return lineas.map((l, i) => ({
    ...l,
    key: `linea-${l.orden}-${i}`
  }));
}
const TIPOS_PROVISION = ["principal"];
async function fetchComprobantesPendientes(params) {
  const rows = await fetchRegistrosSireRows({
    ruc: params.ruc,
    periodo: params.periodo,
    limit: 200
  });
  const registros = rows.map((row) => normalizeRegistroSire(row)).filter(
    (r) => !r.estado_validacion || r.estado_validacion === "pendiente" || r.estado_validacion === "ia_sugerido"
  );
  if (registros.length === 0) return [];
  const ids = registros.map((r) => r.id);
  const { data: asientos } = await supabase.from("asientos_contables").select("sire_registro_id, tipo_asiento").in("sire_registro_id", ids).in("tipo_asiento", [...TIPOS_PROVISION]);
  const conProvision = new Set(
    (asientos ?? []).map((a) => a.sire_registro_id).filter(Boolean)
  );
  return registros.filter((r) => !conProvision.has(r.id)).map((r) => ({ ...r, tieneAsiento: false }));
}
async function fetchRegistroSireById(id) {
  const row = await fetchRegistroSireById$1(id);
  return normalizeRegistroSire(row);
}
function proponerLineasAsiento(registro, cuentas) {
  return toEditableLineas(generarLineasAsiento(registro, cuentas));
}
async function guardarAsientoProvision(params) {
  if (!isAsientoCuadrado(params.lineas)) {
    throw new Error("El asiento está descuadrado. Debe y Haber deben ser iguales.");
  }
  const registro = await fetchRegistroSireById(params.registroId);
  const tipoAsiento = tipoAsientoProvision(registro.tipo);
  const { data: existente } = await supabase.from("asientos_contables").select("id").eq("sire_registro_id", params.registroId).in("tipo_asiento", [...TIPOS_PROVISION]).limit(1).maybeSingle();
  if (existente?.id) {
    throw new Error("Este comprobante ya tiene un asiento de provisión registrado.");
  }
  const filas = lineasToAsientosPlanos({
    registro,
    registroId: params.registroId,
    lineas: params.lineas,
    tipoAsiento
  });
  const { data: insertados, error: insertErr } = await supabase.from("asientos_contables").insert(filas).select("id");
  if (insertErr) {
    logSupabaseAsientosInsertError(insertErr, filas, "guardarAsientoProvision");
    throw insertErr;
  }
  const ids = (insertados ?? []).map((r) => r.id);
  if (ids.length === 0) {
    throw new Error("No se insertaron líneas en asientos_contables.");
  }
  await updateRegistroSireCabecera(params.registroId, { estado_validacion: "validado" });
  return { asientoId: ids[0] };
}
async function guardarAsientoManual(params) {
  if (!isAsientoCuadrado(params.lineas)) {
    throw new Error("El asiento manual está descuadrado. Debe y Haber deben ser iguales.");
  }
  const filas = params.lineas.map((l) => {
    const debe = round2$1(Number(l.debe ?? 0));
    const haber = round2$1(Number(l.haber ?? 0));
    return toAsientoContableInsert({
      sire_registro_id: null,
      periodo: params.periodo,
      tipo_asiento: "principal",
      tipo_libro: "DIARIO_MANUAL",
      fecha_asiento: params.fecha,
      cuenta_contable: l.cuenta,
      glosa: l.glosa?.trim() || params.glosa,
      debe,
      haber,
      tipo_registro: "COMPRA",
      ruc_contraparte: params.ruc.trim(),
      nombre_contraparte: null,
      serie_cdp: null,
      nro_cdp_inicial: null
    });
  });
  const { error } = await supabase.from("asientos_contables").insert(filas);
  if (error) {
    logSupabaseAsientosInsertError(error, filas, "guardarAsientoManual");
    throw error;
  }
}
function formatMoney$5(n) {
  return n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function AsientoEditorGrid({
  registro,
  lineas,
  onChange,
  cuentasPcge,
  onSave,
  saving,
  saveDisabled = false
}) {
  const montos = reactExports.useMemo(() => resolverMontosComprobante(registro), [registro]);
  const totalDebe = sumDebe(lineas);
  const totalHaber = sumHaber(lineas);
  const diff = round2$1(Math.abs(totalDebe - totalHaber));
  const cuadrado = isAsientoCuadrado(lineas);
  const updateLinea = (key, patch) => {
    onChange(lineas.map((l) => l.key === key ? { ...l, ...patch } : l));
  };
  const addLinea = () => {
    const orden = lineas.length + 1;
    onChange([
      ...lineas,
      {
        key: `linea-new-${Date.now()}`,
        orden,
        cuenta: cuentasPcge[0]?.codigo_cuenta ?? "101",
        glosa: "",
        debe: 0,
        haber: 0
      }
    ]);
  };
  const removeLinea = (key) => {
    if (lineas.length <= 2) return;
    onChange(
      lineas.filter((l) => l.key !== key).map((l, i) => ({ ...l, orden: i + 1 }))
    );
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b bg-muted/20 flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: "Asiento propuesto (editable)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
          registro.tipo,
          " · ",
          registro.cod_tipo_cdp,
          "-",
          registro.serie_cdp,
          "-",
          registro.nro_cdp_inicial,
          " · Base S/ ",
          formatMoney$5(montos.base),
          " · IGV S/ ",
          formatMoney$5(montos.igv),
          " · Total S/",
          " ",
          formatMoney$5(montos.total)
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: addLinea, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4 mr-1" }),
          " Línea"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", disabled: saveDisabled || !cuadrado || saving, onClick: onSave, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "size-4 mr-1" }),
          saving ? "Guardando…" : "Confirmar asiento"
        ] })
      ] })
    ] }),
    !cuadrado && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { variant: "destructive", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "size-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTitle, { children: "Asiento descuadrado" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDescription, { children: [
        "Debe S/ ",
        formatMoney$5(totalDebe),
        " ≠ Haber S/ ",
        formatMoney$5(totalHaber),
        " (diferencia S/",
        " ",
        formatMoney$5(diff),
        "). Ajusta los montos antes de guardar."
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-12", children: "#" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-48", children: "Cuenta PCGE" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Glosa" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-28 text-right", children: "Debe" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-28 text-right", children: "Haber" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-12" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableBody, { children: [
        lineas.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: l.orden }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            CuentaPcgeCombobox,
            {
              value: l.cuenta,
              onChange: (cuenta) => updateLinea(l.key, { cuenta }),
              cuentas: cuentasPcge
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: l.glosa,
              onChange: (e) => updateLinea(l.key, { glosa: e.target.value }),
              className: "h-8 text-xs"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "number",
              step: "0.01",
              value: l.debe || "",
              onChange: (e) => updateLinea(l.key, {
                debe: round2$1(Number(e.target.value) || 0),
                haber: Number(e.target.value) > 0 ? 0 : l.haber
              }),
              className: "h-8 font-mono text-right text-xs"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "number",
              step: "0.01",
              value: l.haber || "",
              onChange: (e) => updateLinea(l.key, {
                haber: round2$1(Number(e.target.value) || 0),
                debe: Number(e.target.value) > 0 ? 0 : l.debe
              }),
              className: "h-8 font-mono text-right text-xs"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "icon",
              variant: "ghost",
              className: "size-8",
              disabled: lineas.length <= 2,
              onClick: () => removeLinea(l.key),
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-4 text-destructive" })
            }
          ) })
        ] }, l.key)),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-muted/30 font-medium", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { colSpan: 3, className: "text-right", children: "Totales" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right font-mono", children: formatMoney$5(totalDebe) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right font-mono", children: formatMoney$5(totalHaber) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, {})
        ] })
      ] })
    ] })
  ] });
}
function ProvisionesSirePanel({
  ruc,
  periodo
}) {
  const qc = useQueryClient();
  const [selectedComprobante, setSelectedComprobante] = reactExports.useState(null);
  const [lineas, setLineas] = reactExports.useState([]);
  const pcgeQuery = useQuery({
    queryKey: ["pcge", "activas"],
    queryFn: fetchPcgeCuentasActivas
  });
  const pendientesQuery = useQuery({
    queryKey: ["comprobantes_pendientes", ruc, periodo],
    queryFn: () => fetchComprobantesPendientes({
      ruc,
      periodo: periodo.trim() || void 0
    }),
    enabled: !!ruc
  });
  const saveMutation = useMutation({
    mutationFn: () => guardarAsientoProvision({
      registroId: selectedComprobante.id,
      lineas: lineas.map(({ key: _k, ...l }) => l)
    }),
    onSuccess: () => {
      toast.success("Provisión registrada en Libro Diario");
      setSelectedComprobante(null);
      setLineas([]);
      invalidateLibrosContables(qc);
    },
    onError: (e) => toast.error(e.message)
  });
  const handleSelect = (row) => {
    setSelectedComprobante(row);
    setLineas(proponerLineasAsiento(row));
  };
  const cuentasPcge = reactExports.useMemo(() => pcgeQuery.data ?? [], [pcgeQuery.data]);
  if (!ruc) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(RequireRucEmptyState, { context: "Elige el contribuyente para importar comprobantes SIRE pendientes de provisión." });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card p-4 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-medium text-sm", children: "Bandeja de comprobantes pendientes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Comprobantes SIRE sin asiento de provisión · Clase 6/7, IGV 40111, 421201 / 121201" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        ComprobantesPendientesTable,
        {
          rows: pendientesQuery.data ?? [],
          loading: pendientesQuery.isLoading,
          selectedId: selectedComprobante?.id ?? null,
          onSelect: handleSelect
        }
      )
    ] }),
    pcgeQuery.isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-3 animate-spin" }),
      "Cargando plan de cuentas…"
    ] }),
    selectedComprobante && lineas.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
      AsientoEditorGrid,
      {
        registro: selectedComprobante,
        lineas,
        onChange: setLineas,
        cuentasPcge,
        saving: saveMutation.isPending,
        onSave: () => saveMutation.mutate()
      }
    )
  ] });
}
function formatMoney$4(n) {
  return n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function LoteCajaAuditDialog({
  linea,
  open,
  onOpenChange
}) {
  const loteId = linea ? idReferenciaLote(linea) : "";
  const movimientosQuery = useQuery({
    queryKey: ["caja", "lote", loteId],
    queryFn: () => fetchMovimientosPorAsientoLote(loteId),
    enabled: open && !!loteId
  });
  const movs = movimientosQuery.data ?? [];
  const totalDebe = movs.reduce((s, m) => s + Number(m.debe ?? 0), 0);
  const totalHaber = movs.reduce((s, m) => s + Number(m.haber ?? 0), 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-3xl max-h-[85vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "size-5" }),
        "Lote de centralización (Libro Caja)"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Consulta los movimientos de caja vinculados al asiento consolidado del Libro Diario." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(FieldHelper, { variant: "info", children: "Este diálogo muestra la trazabilidad entre el lote centralizado en Libro Diario y sus movimientos origen en Libro Caja. Verifique que Debe y Haber cuadren antes de cerrar el periodo." }),
    linea && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm space-y-1 rounded-md border bg-muted/30 p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Referencia lote:" }),
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs", children: loteId })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Periodo:" }),
        " ",
        linea.periodo,
        " · RUC",
        " ",
        linea.ruc
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-xs", children: linea.glosa })
    ] }),
    movimientosQuery.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-8 flex justify-center text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-5 animate-spin mr-2" }),
      "Cargando movimientos del lote…"
    ] }) : movs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground py-6 text-center", children: [
      "No hay movimientos con ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "text-xs", children: "asiento_id" }),
      " igual a esta referencia. Verifique que el lote fue centralizado correctamente."
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Fecha" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Glosa" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Cuenta" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Debe" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Haber" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Origen" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: movs.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: m.fecha_operacion ?? m.fecha }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: m.glosa }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono", children: m.cuenta_contable }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right font-mono", children: formatMoney$4(Number(m.debe)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right font-mono", children: formatMoney$4(Number(m.haber)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-xs", children: m.origen }) })
        ] }, m.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground text-right", children: [
        "Total Debe ",
        formatMoney$4(totalDebe),
        " · Haber ",
        formatMoney$4(totalHaber),
        " ·",
        " ",
        movs.length,
        " movimiento(s)"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      linea?.ruc && linea?.periodo ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/libro-caja", search: { tab: "movimientos" }, children: "Abrir Libro Caja" }) }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => onOpenChange(false), children: "Cerrar" })
    ] })
  ] }) });
}
function formatMoney$3(n) {
  return n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function labelCpe(row) {
  return `${row.cod_tipo_cdp ?? ""}-${row.serie_cdp ?? ""}-${row.nro_cdp_inicial ?? ""}`.replace(
    /^-|-$/g,
    ""
  );
}
function LibroDiarioGeneralPanel({
  rows,
  loading,
  periodoDefault
}) {
  const [filters, setFilters] = reactExports.useState({
    cpe: "",
    rucRazon: "",
    periodo: periodoDefault,
    cuenta: ""
  });
  const [auditLote, setAuditLote] = reactExports.useState(null);
  const [traceSireId, setTraceSireId] = reactExports.useState(null);
  const filtered = reactExports.useMemo(() => {
    const cpeQ = filters.cpe.trim().toLowerCase();
    const rucQ = filters.rucRazon.trim().toLowerCase();
    const periodoQ = filters.periodo.trim();
    const cuentaQ = filters.cuenta.trim().toLowerCase();
    return rows.filter((r) => {
      if (periodoQ && r.periodo !== periodoQ) return false;
      if (cuentaQ && !r.cuenta_contable.toLowerCase().includes(cuentaQ)) return false;
      if (cpeQ && !labelCpe(r).toLowerCase().includes(cpeQ)) return false;
      if (rucQ) {
        const haystack = `${r.ruc ?? ""} ${r.razon_social ?? ""} ${r.glosa ?? ""}`.toLowerCase();
        if (!haystack.includes(rucQ)) return false;
      }
      return true;
    });
  }, [rows, filters]);
  const totales = reactExports.useMemo(() => {
    const debe = filtered.reduce((s, r) => s + Number(r.debe ?? 0), 0);
    const haber = filtered.reduce((s, r) => s + Number(r.haber ?? 0), 0);
    return { debe, haber };
  }, [filtered]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card p-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "filtro-cpe", className: "text-xs", children: "CPE (Serie-Número)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "filtro-cpe",
            placeholder: "01-F001-123",
            value: filters.cpe,
            onChange: (e) => setFilters((f) => ({ ...f, cpe: e.target.value }))
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "filtro-ruc", className: "text-xs", children: "RUC / Razón social" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "filtro-ruc",
            placeholder: "20100066603 o ACME SAC",
            value: filters.rucRazon,
            onChange: (e) => setFilters((f) => ({ ...f, rucRazon: e.target.value }))
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "filtro-periodo", className: "text-xs", children: "Periodo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "filtro-periodo",
            placeholder: "202606",
            value: filters.periodo,
            onChange: (e) => setFilters((f) => ({ ...f, periodo: e.target.value }))
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "filtro-cuenta", className: "text-xs", children: "Cuenta contable" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "filtro-cuenta",
            placeholder: "601101",
            value: filters.cuenta,
            onChange: (e) => setFilters((f) => ({ ...f, cuenta: e.target.value }))
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card overflow-x-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b flex flex-wrap items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-medium", children: "Libro Diario General" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Todos los asientos del periodo · provisiones, manuales y referencias a caja" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground tabular-nums", children: [
          "Debe S/ ",
          formatMoney$3(totales.debe),
          " · Haber S/ ",
          formatMoney$3(totales.haber)
        ] })
      ] }),
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-8 text-center text-muted-foreground text-sm", children: "Cargando asientos…" }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-8 text-center text-muted-foreground text-sm", children: "No hay asientos que coincidan con los filtros." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Fecha" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Periodo" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "CPE" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Cuenta" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Glosa" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Debe" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Haber" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Libro" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-24 text-center", children: "Trazab." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-28 text-right", children: "Caja" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: filtered.map((row) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: row.fecha_asiento }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: row.periodo }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs font-mono", children: labelCpe(row) || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: row.cuenta_contable }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "max-w-xs truncate", title: row.glosa ?? "", children: row.glosa }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums", children: row.debe > 0 ? formatMoney$3(row.debe) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums", children: row.haber > 0 ? formatMoney$3(row.haber) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px] font-normal", children: row.tipo_libro ?? row.origen }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-center", children: row.sire_registro_id ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "ghost",
              size: "sm",
              className: "h-8",
              title: "Ver trazabilidad contable",
              onClick: () => setTraceSireId(row.sire_registro_id),
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "size-4" })
            }
          ) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: esLineaCentralizacionCaja(row) ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", className: "h-8", onClick: () => setAuditLote(row), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "size-4 mr-1" }),
            "Ver"
          ] }) : "—" })
        ] }, row.id)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      LoteCajaAuditDialog,
      {
        linea: auditLote,
        open: !!auditLote,
        onOpenChange: (v) => !v && setAuditLote(null)
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Sheet, { open: !!traceSireId, onOpenChange: (v) => !v && setTraceSireId(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetContent, { side: "right", className: "w-full sm:max-w-4xl p-0 overflow-y-auto bg-[#070C1B] border-white/10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SheetHeader, { className: "p-4 border-b border-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SheetTitle, { className: "text-[#E8EDF5]", children: "Trazabilidad contable" }) }),
      traceSireId ? /* @__PURE__ */ jsxRuntimeExports.jsx(AsientoTraceabilityViewerPremium, { sireRegistroId: traceSireId, compact: true }) : null
    ] }) })
  ] });
}
function formatMoney$2(n) {
  return n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function AsientoManualForm({
  ruc,
  periodo
}) {
  const qc = useQueryClient();
  const [fecha, setFecha] = reactExports.useState((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
  const [glosa, setGlosa] = reactExports.useState("");
  const [lineas, setLineas] = reactExports.useState(
    toEditableLineas([
      { orden: 1, cuenta: "601101", glosa: "", debe: 0, haber: 0 },
      { orden: 2, cuenta: "421201", glosa: "", debe: 0, haber: 0 }
    ])
  );
  const pcgeQuery = useQuery({
    queryKey: ["pcge", "activas"],
    queryFn: fetchPcgeCuentasActivas
  });
  const saveMutation = useMutation({
    mutationFn: () => guardarAsientoManual({
      ruc,
      periodo: periodo.trim(),
      fecha,
      glosa,
      lineas: lineas.map(({ key: _k, ...l }) => l)
    }),
    onSuccess: () => {
      toast.success("Asiento manual registrado (DIARIO_MANUAL)");
      setGlosa("");
      setLineas(
        toEditableLineas([
          { orden: 1, cuenta: "601101", glosa: "", debe: 0, haber: 0 },
          { orden: 2, cuenta: "421201", glosa: "", debe: 0, haber: 0 }
        ])
      );
      invalidateLibrosContables(qc);
    },
    onError: (e) => toast.error(e.message)
  });
  const cuadrado = isAsientoCuadrado(lineas);
  const cuentas = pcgeQuery.data ?? [];
  const addLinea = () => {
    setLineas((prev) => [
      ...prev,
      {
        key: `linea-${prev.length + 1}`,
        orden: prev.length + 1,
        cuenta: "",
        glosa,
        debe: 0,
        haber: 0
      }
    ]);
  };
  const updateLinea = (key, patch) => {
    setLineas((prev) => prev.map((l) => l.key === key ? { ...l, ...patch } : l));
  };
  const removeLinea = (key) => {
    setLineas((prev) => prev.filter((l) => l.key !== key));
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card p-4 space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium text-sm", children: "Asiento libre / ajuste manual" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Planillas, apertura, reclasificaciones · tipo_libro = DIARIO_MANUAL" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-3 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Fecha" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: fecha, onChange: (e) => setFecha(e.target.value) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FieldHelper, { children: "Fecha contable del asiento dentro del periodo filtrado." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 sm:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Glosa general" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "Apertura del ejercicio, planilla mes…",
            value: glosa,
            onChange: (e) => setGlosa(e.target.value)
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FieldHelper, { children: "Descripción del motivo del asiento (apertura, reclasificación, planilla, etc.)." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(FieldHelper, { variant: "info", children: "Cada línea debe tener cuenta PCGE y solo Debe o Haber (no ambos). El total Debe debe igualar el total Haber." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Cuenta" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Glosa" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-28 text-right", children: "Debe" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-28 text-right", children: "Haber" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "w-12" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: lineas.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          CuentaPcgeCombobox,
          {
            value: l.cuenta,
            onChange: (v) => updateLinea(l.key, { cuenta: v }),
            cuentas
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: l.glosa,
            onChange: (e) => updateLinea(l.key, { glosa: e.target.value })
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "number",
            min: 0,
            step: 0.01,
            className: "text-right",
            value: l.debe || "",
            onChange: (e) => updateLinea(l.key, { debe: Number(e.target.value), haber: 0 })
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "number",
            min: 0,
            step: 0.01,
            className: "text-right",
            value: l.haber || "",
            onChange: (e) => updateLinea(l.key, { haber: Number(e.target.value), debe: 0 })
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "ghost",
            size: "icon",
            className: "size-8",
            onClick: () => removeLinea(l.key),
            disabled: lineas.length <= 2,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-4" })
          }
        ) })
      ] }, l.key)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: addLinea, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4 mr-1" }),
        "Línea"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm tabular-nums text-muted-foreground", children: [
        "Debe S/ ",
        formatMoney$2(sumDebe(lineas)),
        " · Haber S/ ",
        formatMoney$2(sumHaber(lineas))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          size: "sm",
          disabled: !cuadrado || !glosa.trim() || !periodo.trim() || saveMutation.isPending,
          onClick: () => saveMutation.mutate(),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "size-4 mr-1" }),
            "Confirmar asiento manual"
          ]
        }
      )
    ] }),
    !cuadrado && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { variant: "destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDescription, { children: "El asiento está descuadrado. Ajuste Debe y Haber hasta que ambos totales coincidan." }) })
  ] });
}
function formatMoney$1(n) {
  return n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function RegistrarPagoCobroModal({
  deuda,
  ruc,
  open,
  onOpenChange
}) {
  const qc = useQueryClient();
  const [fechaPago, setFechaPago] = reactExports.useState((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
  const [medioPago, setMedioPago] = reactExports.useState(MEDIOS_PAGO_SUNAT[0].codigo);
  const [cuentaFinId, setCuentaFinId] = reactExports.useState("");
  const [monto, setMonto] = reactExports.useState("");
  const cuentasQuery = useQuery({
    queryKey: queryKeys.cuentasFinancieras(ruc),
    queryFn: () => fetchCuentasFinancieras(ruc),
    enabled: open && !!ruc
  });
  reactExports.useEffect(() => {
    if (deuda) {
      setMonto(String(deuda.saldoPendiente));
      setFechaPago((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
    }
  }, [deuda]);
  reactExports.useEffect(() => {
    const list = cuentasQuery.data ?? [];
    if (list.length && !cuentaFinId) setCuentaFinId(list[0].id);
  }, [cuentasQuery.data, cuentaFinId]);
  const cuentaSel = (cuentasQuery.data ?? []).find((c) => c.id === cuentaFinId);
  const mutation = useMutation({
    mutationFn: async () => {
      if (!deuda || !cuentaSel) throw new Error("Complete los datos del formulario.");
      await registrarPagoCobroCaja({
        deuda,
        ruc,
        fechaPago,
        medioPago,
        cuentaFinanciera: cuentaSel.cuenta_contable,
        monto: Number(monto)
      });
    },
    onSuccess: () => {
      toast.success(
        deuda?.tipo === "COMPRA" ? "Pago registrado en Libro Caja (CAJA_BANCOS)" : "Cobro registrado en Libro Caja (CAJA_BANCOS)"
      );
      onOpenChange(false);
      invalidateLibrosContables(qc);
    },
    onError: (e) => toast.error(e.message)
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: deuda?.tipo === "COMPRA" ? "Registrar pago a proveedor" : "Registrar cobro de cliente" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
        deuda?.comprobante,
        " · Saldo S/ ",
        formatMoney$1(deuda?.saldoPendiente ?? 0)
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Fecha de pago / cobro" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: fechaPago, onChange: (e) => setFechaPago(e.target.value) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FieldHelper, { children: "Fecha efectiva del movimiento de caja. Debe corresponder al periodo contable abierto." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Medio de pago (SUNAT)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: medioPago, onValueChange: setMedioPago, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: MEDIOS_PAGO_SUNAT.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: m.codigo, children: [
            m.codigo,
            " — ",
            m.label
          ] }, m.codigo)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FieldHelper, { children: "Código de medio de pago según catálogo SUNAT (Tabla 01). Requerido para el Libro Caja electrónico." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cuenta financiera (Clase 10)" }),
        cuentasQuery.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 animate-spin" }),
          "Cargando cajas y bancos…"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: cuentaFinId, onValueChange: setCuentaFinId, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Seleccione caja o banco" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: (cuentasQuery.data ?? []).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: c.id, children: [
            c.nombre,
            " (",
            c.cuenta_contable,
            ")"
          ] }, c.id)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FieldHelper, { children: "Seleccione la caja o cuenta bancaria (PCGE Clase 10) desde donde se realiza el pago o cobro." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Monto" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "number",
            min: 0.01,
            step: 0.01,
            value: monto,
            onChange: (e) => setMonto(e.target.value)
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FieldHelper, { children: "Monto en soles (PEN). No puede superar el saldo pendiente del comprobante ni ser cero." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => onOpenChange(false), children: "Cancelar" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          disabled: mutation.isPending || !cuentaSel || Number(monto) <= 0,
          onClick: () => mutation.mutate(),
          children: [
            mutation.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 mr-2 animate-spin" }),
            "Confirmar ",
            deuda?.tipo === "COMPRA" ? "pago" : "cobro"
          ]
        }
      )
    ] })
  ] }) });
}
function formatMoney(n) {
  return n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function CxcCxpBandeja({
  ruc,
  periodo
}) {
  const [modalDeuda, setModalDeuda] = reactExports.useState(null);
  const deudasQuery = useQuery({
    queryKey: queryKeys.cxcCxp(ruc, periodo.trim() || null),
    queryFn: () => fetchDeudasPendientes({
      ruc,
      periodo: periodo.trim() || void 0
    }),
    enabled: !!ruc
  });
  if (!ruc) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(RequireRucEmptyState, { context: "Selecciona el contribuyente para calcular saldos 421201 / 121201 pendientes." });
  }
  const rows = deudasQuery.data ?? [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-medium flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Banknote, { className: "size-5 text-primary" }),
            "Cuentas por pagar y cobrar"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Provisiones sin cancelación en Libro Caja · El botón extra genera asientos CAJA_BANCOS" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", children: [
          rows.length,
          " pendientes"
        ] })
      ] }),
      deudasQuery.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-8 flex justify-center text-muted-foreground text-sm gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 animate-spin" }),
        "Calculando saldos…"
      ] }) : rows.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground py-6 text-center", children: "No hay deudas pendientes en 421201 / 121201 para este periodo." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Tipo" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Comprobante" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Contraparte" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Cuenta" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Total" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Cancelado" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Saldo" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right w-40", children: "Acción" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: rows.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: d.tipo === "COMPRA" ? "destructive" : "default", children: d.tipo === "COMPRA" ? "CxP" : "CxC" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: d.comprobante }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "max-w-[180px] truncate", title: d.nombreContraparte ?? "", children: d.nombreContraparte ?? d.rucContraparte ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: d.cuentaComercial }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums", children: formatMoney(d.montoTotal) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right tabular-nums text-muted-foreground", children: formatMoney(d.montoCancelado) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "text-right tabular-nums font-semibold", children: [
            "S/ ",
            formatMoney(d.saldoPendiente)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: () => setModalDeuda(d), children: "Registrar Pago / Cobro" }) })
        ] }, d.sireRegistroId)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      RegistrarPagoCobroModal,
      {
        deuda: modalDeuda,
        ruc,
        open: !!modalDeuda,
        onOpenChange: (v) => !v && setModalDeuda(null)
      }
    )
  ] });
}
const round2 = (n) => Math.round(n * 100) / 100;
function pNum(params, id) {
  const v = params[id];
  const n = typeof v === "number" ? v : Number(String(v ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}
function pStr(params, id) {
  return String(params[id] ?? "").trim();
}
function resolverFormulaMonto(formula, params) {
  switch (formula.tipo) {
    case "VALOR_FIJO":
      return round2(formula.valor);
    case "PARAMETRO":
      return round2(pNum(params, formula.paramId));
    case "PORCENTAJE":
      return round2(pNum(params, formula.paramId) * formula.porcentaje / 100);
    case "SUMA":
      return round2(formula.formulas.reduce((s, f) => s + resolverFormulaMonto(f, params), 0));
    case "RESTA":
      return round2(resolverFormulaMonto(formula.a, params) - resolverFormulaMonto(formula.b, params));
    case "MULTIPLICACION":
      return round2(resolverFormulaMonto(formula.a, params) * resolverFormulaMonto(formula.b, params));
    case "DIVISION": {
      const b = resolverFormulaMonto(formula.b, params);
      if (Math.abs(b) < 1e-4) return 0;
      return round2(resolverFormulaMonto(formula.a, params) / b);
    }
    case "TIPO_CAMBIO": {
      const me = pNum(params, formula.montoParamId);
      const tc = pNum(params, "tipoCambioActual") || pNum(params, "tipoCambio");
      return round2(me * tc);
    }
    default:
      return 0;
  }
}
function resolverCuenta(cuenta, params) {
  if (typeof cuenta === "string") return cuenta;
  if (cuenta.tipo === "FIJO") return cuenta.codigo;
  return pStr(params, cuenta.paramId) || cuenta.codigo;
}
function resolverTexto(texto, params) {
  if (!texto) return "";
  if (typeof texto === "string") return texto;
  if (texto.tipo === "FIJO") return texto.texto;
  if (texto.tipo === "PARAMETRO") return pStr(params, texto.paramId);
  if (texto.tipo === "FECHA_ACTUAL") return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  return "";
}
function evaluarCondicion(cond, params) {
  switch (cond.tipo) {
    case "MAYOR_QUE":
      return pNum(params, cond.paramId) > cond.valor;
    case "MENOR_QUE":
      return pNum(params, cond.paramId) < cond.valor;
    case "IGUAL":
      return pStr(params, cond.paramId) === String(cond.valor);
    case "EXISTE":
      return params[cond.paramId] != null && pStr(params, cond.paramId) !== "";
    case "AND":
      return cond.condiciones.every((c) => evaluarCondicion(c, params));
    case "OR":
      return cond.condiciones.some((c) => evaluarCondicion(c, params));
    case "NOT":
      return !evaluarCondicion(cond.condicion, params);
    default:
      return true;
  }
}
function validarParametros(template, params) {
  const errores = [];
  for (const p of template.parametros) {
    if (!p.requerido) continue;
    const v = params[p.id];
    if (v == null || String(v).trim() === "") {
      errores.push(`Parámetro requerido: ${p.nombre}`);
    }
    if (p.tipo === "MONTO" || p.tipo === "PORCENTAJE") {
      const n = pNum(params, p.id);
      if (p.validacion?.min != null && n < p.validacion.min) {
        errores.push(p.validacion.customMessage ?? `${p.nombre} debe ser >= ${p.validacion.min}`);
      }
    }
  }
  return errores;
}
function evaluarLinea(linea, params) {
  if (linea.condicion && !evaluarCondicion(linea.condicion, params)) return null;
  const monto = typeof linea.monto === "number" ? round2(linea.monto) : round2(resolverFormulaMonto(linea.monto, params));
  if (monto <= 0) return null;
  const cuenta = resolverCuenta(linea.cuenta, params);
  const glosa = resolverTexto(linea.glosaLinea, params) || linea.denominacionSugerida || "";
  return {
    cuentaContable: cuenta,
    denominacion: linea.denominacionSugerida ?? cuenta,
    debe: linea.naturaleza === "D" ? monto : 0,
    haber: linea.naturaleza === "A" ? monto : 0,
    naturaleza: linea.naturaleza,
    glosaLinea: glosa,
    centroCosto: linea.centroCosto
  };
}
const PLANTILLAS_PREDEFINIDAS = [
  {
    id: "tpl-planilla-mensual",
    nombre: "Provisión de Planilla Mensual",
    descripcion: "Sueldos, ESSALUD y ONP",
    categoria: "PLANILLA",
    tipoLibro: "DIARIO_MANUAL",
    parametros: [
      { id: "sueldoBruto", nombre: "Sueldo bruto", descripcion: "Total planilla", tipo: "MONTO", requerido: true },
      { id: "porcentajeESSALUD", nombre: "% ESSALUD", tipo: "PORCENTAJE", requerido: false, valorDefault: 9 },
      { id: "porcentajeONP", nombre: "% ONP", tipo: "PORCENTAJE", requerido: false, valorDefault: 13 },
      { id: "cuentaGasto", nombre: "Cuenta gasto", tipo: "CUENTA_PCGE", requerido: false, valorDefault: "621101" },
      { id: "cuentaRemuneraciones", nombre: "Remuneraciones por pagar", tipo: "CUENTA_PCGE", requerido: false, valorDefault: "411101" },
      { id: "cuentaESSALUD", nombre: "ESSALUD por pagar", tipo: "CUENTA_PCGE", requerido: false, valorDefault: "403101" },
      { id: "cuentaONP", nombre: "ONP por pagar", tipo: "CUENTA_PCGE", requerido: false, valorDefault: "403102" },
      { id: "periodo", nombre: "Período", tipo: "PERIODO", requerido: true }
    ],
    lineas: [
      { id: "l1", cuenta: { tipo: "PARAMETRO", paramId: "cuentaGasto" }, naturaleza: "D", monto: { tipo: "PARAMETRO", paramId: "sueldoBruto" }, glosaLinea: { tipo: "FIJO", texto: "Gasto de personal" }, denominacionSugerida: "Gasto de Personal" },
      { id: "l2", cuenta: { tipo: "PARAMETRO", paramId: "cuentaRemuneraciones" }, naturaleza: "A", monto: { tipo: "RESTA", a: { tipo: "PARAMETRO", paramId: "sueldoBruto" }, b: { tipo: "SUMA", formulas: [{ tipo: "PORCENTAJE", paramId: "sueldoBruto", porcentaje: 9 }, { tipo: "PORCENTAJE", paramId: "sueldoBruto", porcentaje: 13 }] } }, glosaLinea: { tipo: "FIJO", texto: "Remuneraciones por pagar" } },
      { id: "l3", cuenta: { tipo: "PARAMETRO", paramId: "cuentaESSALUD" }, naturaleza: "A", monto: { tipo: "PORCENTAJE", paramId: "sueldoBruto", porcentaje: 9 }, glosaLinea: { tipo: "FIJO", texto: "ESSALUD por pagar" } },
      { id: "l4", cuenta: { tipo: "PARAMETRO", paramId: "cuentaONP" }, naturaleza: "A", monto: { tipo: "PORCENTAJE", paramId: "sueldoBruto", porcentaje: 13 }, glosaLinea: { tipo: "FIJO", texto: "ONP por pagar" } }
    ],
    metadata: { version: "1.0", autor: "CONTAM", fechaCreacion: "2026-01-01", tags: ["planilla", "rrhh"], usoCount: 0 }
  },
  {
    id: "tpl-gratificaciones",
    nombre: "Provisión de Gratificaciones",
    categoria: "PROVISION",
    descripcion: "Julio / Diciembre",
    tipoLibro: "DIARIO_MANUAL",
    parametros: [
      { id: "sueldoBase", nombre: "Sueldo base", tipo: "MONTO", requerido: true },
      { id: "mesesTrabajados", nombre: "Meses trabajados", tipo: "MONTO", requerido: true, valorDefault: 6 },
      { id: "cuentaGasto", nombre: "Cuenta gasto", tipo: "CUENTA_PCGE", requerido: false, valorDefault: "621102" },
      { id: "cuentaProvision", nombre: "Provisión", tipo: "CUENTA_PCGE", requerido: false, valorDefault: "411102" }
    ],
    lineas: [
      { id: "g1", cuenta: { tipo: "PARAMETRO", paramId: "cuentaGasto" }, naturaleza: "D", monto: { tipo: "DIVISION", a: { tipo: "MULTIPLICACION", a: { tipo: "PARAMETRO", paramId: "sueldoBase" }, b: { tipo: "PARAMETRO", paramId: "mesesTrabajados" } }, b: { tipo: "VALOR_FIJO", valor: 6 } }, glosaLinea: { tipo: "FIJO", texto: "Gratificación devengada" } },
      { id: "g2", cuenta: { tipo: "PARAMETRO", paramId: "cuentaProvision" }, naturaleza: "A", monto: { tipo: "DIVISION", a: { tipo: "MULTIPLICACION", a: { tipo: "PARAMETRO", paramId: "sueldoBase" }, b: { tipo: "PARAMETRO", paramId: "mesesTrabajados" } }, b: { tipo: "VALOR_FIJO", valor: 6 } }, glosaLinea: { tipo: "FIJO", texto: "Provisión gratificaciones" } }
    ],
    metadata: { version: "1.0", autor: "CONTAM", fechaCreacion: "2026-01-01", tags: ["gratificacion"], usoCount: 0 }
  },
  {
    id: "tpl-cts",
    nombre: "Provisión de CTS",
    categoria: "PROVISION",
    descripcion: "Mayo / Noviembre",
    tipoLibro: "DIARIO_MANUAL",
    parametros: [
      { id: "sueldoBase", nombre: "Sueldo base", tipo: "MONTO", requerido: true },
      { id: "mesesTrabajados", nombre: "Meses", tipo: "MONTO", requerido: true, valorDefault: 12 },
      { id: "asignacionFamiliar", nombre: "Asignación familiar", tipo: "MONTO", requerido: false, valorDefault: 0 },
      { id: "cuentaGasto", nombre: "Gasto", tipo: "CUENTA_PCGE", requerido: false, valorDefault: "621103" },
      { id: "cuentaProvision", nombre: "Provisión CTS", tipo: "CUENTA_PCGE", requerido: false, valorDefault: "411103" }
    ],
    lineas: [
      { id: "c1", cuenta: { tipo: "PARAMETRO", paramId: "cuentaGasto" }, naturaleza: "D", monto: { tipo: "DIVISION", a: { tipo: "MULTIPLICACION", a: { tipo: "SUMA", formulas: [{ tipo: "PARAMETRO", paramId: "sueldoBase" }, { tipo: "PARAMETRO", paramId: "asignacionFamiliar" }] }, b: { tipo: "PARAMETRO", paramId: "mesesTrabajados" } }, b: { tipo: "VALOR_FIJO", valor: 12 } }, glosaLinea: { tipo: "FIJO", texto: "CTS devengada" } },
      { id: "c2", cuenta: { tipo: "PARAMETRO", paramId: "cuentaProvision" }, naturaleza: "A", monto: { tipo: "DIVISION", a: { tipo: "MULTIPLICACION", a: { tipo: "SUMA", formulas: [{ tipo: "PARAMETRO", paramId: "sueldoBase" }, { tipo: "PARAMETRO", paramId: "asignacionFamiliar" }] }, b: { tipo: "PARAMETRO", paramId: "mesesTrabajados" } }, b: { tipo: "VALOR_FIJO", valor: 12 } }, glosaLinea: { tipo: "FIJO", texto: "Provisión CTS" } }
    ],
    metadata: { version: "1.0", autor: "CONTAM", fechaCreacion: "2026-01-01", tags: ["cts"], usoCount: 0 }
  },
  {
    id: "tpl-depreciacion",
    nombre: "Depreciación Mensual (Línea Recta)",
    categoria: "DEPRECIACION",
    descripcion: "Activo fijo",
    tipoLibro: "DIARIO_MANUAL",
    parametros: [
      { id: "valorActivo", nombre: "Valor activo", tipo: "MONTO", requerido: true },
      { id: "vidaUtilMeses", nombre: "Vida útil (meses)", tipo: "MONTO", requerido: true },
      { id: "cuentaGasto", nombre: "Gasto depreciación", tipo: "CUENTA_PCGE", requerido: false, valorDefault: "681101" },
      { id: "cuentaDepreciacion", nombre: "Depreciación acumulada", tipo: "CUENTA_PCGE", requerido: false, valorDefault: "391101" }
    ],
    lineas: [
      { id: "d1", cuenta: { tipo: "PARAMETRO", paramId: "cuentaGasto" }, naturaleza: "D", monto: { tipo: "DIVISION", a: { tipo: "PARAMETRO", paramId: "valorActivo" }, b: { tipo: "PARAMETRO", paramId: "vidaUtilMeses" } }, glosaLinea: { tipo: "FIJO", texto: "Depreciación del mes" } },
      { id: "d2", cuenta: { tipo: "PARAMETRO", paramId: "cuentaDepreciacion" }, naturaleza: "A", monto: { tipo: "DIVISION", a: { tipo: "PARAMETRO", paramId: "valorActivo" }, b: { tipo: "PARAMETRO", paramId: "vidaUtilMeses" } }, glosaLinea: { tipo: "FIJO", texto: "Depreciación acumulada" } }
    ],
    metadata: { version: "1.0", autor: "CONTAM", fechaCreacion: "2026-01-01", tags: ["activo"], usoCount: 0 }
  },
  {
    id: "tpl-intereses",
    nombre: "Devengado de Intereses",
    categoria: "DEVENGADO",
    descripcion: "Préstamo mensual",
    tipoLibro: "DIARIO_MANUAL",
    parametros: [
      { id: "saldoPrestamo", nombre: "Saldo préstamo", tipo: "MONTO", requerido: true },
      { id: "tasaInteresAnual", nombre: "Tasa anual %", tipo: "PORCENTAJE", requerido: true },
      { id: "cuentaGasto", nombre: "Gasto financiero", tipo: "CUENTA_PCGE", requerido: false, valorDefault: "671101" },
      { id: "cuentaIntereses", nombre: "Intereses por pagar", tipo: "CUENTA_PCGE", requerido: false, valorDefault: "469101" }
    ],
    lineas: [
      { id: "i1", cuenta: { tipo: "PARAMETRO", paramId: "cuentaGasto" }, naturaleza: "D", monto: { tipo: "DIVISION", a: { tipo: "MULTIPLICACION", a: { tipo: "PARAMETRO", paramId: "saldoPrestamo" }, b: { tipo: "PORCENTAJE", paramId: "tasaInteresAnual", porcentaje: 1 } }, b: { tipo: "VALOR_FIJO", valor: 12 } }, glosaLinea: { tipo: "FIJO", texto: "Intereses devengados" } },
      { id: "i2", cuenta: { tipo: "PARAMETRO", paramId: "cuentaIntereses" }, naturaleza: "A", monto: { tipo: "DIVISION", a: { tipo: "MULTIPLICACION", a: { tipo: "PARAMETRO", paramId: "saldoPrestamo" }, b: { tipo: "PORCENTAJE", paramId: "tasaInteresAnual", porcentaje: 1 } }, b: { tipo: "VALOR_FIJO", valor: 12 } }, glosaLinea: { tipo: "FIJO", texto: "Intereses por pagar" } }
    ],
    metadata: { version: "1.0", autor: "CONTAM", fechaCreacion: "2026-01-01", tags: ["financiero"], usoCount: 0 }
  },
  {
    id: "tpl-ir-anual",
    nombre: "Provisión Impuesto a la Renta",
    categoria: "IMPUESTO",
    descripcion: "Cierre anual",
    tipoLibro: "DIARIO_MANUAL",
    parametros: [
      { id: "utilidadContable", nombre: "Utilidad contable", tipo: "MONTO", requerido: true },
      { id: "tasaIR", nombre: "Tasa IR %", tipo: "PORCENTAJE", requerido: false, valorDefault: 29.5 }
    ],
    lineas: [
      { id: "ir1", cuenta: { tipo: "FIJO", codigo: "881101" }, naturaleza: "D", monto: { tipo: "PORCENTAJE", paramId: "utilidadContable", porcentaje: 29.5 }, glosaLinea: { tipo: "FIJO", texto: "Impuesto a la renta" } },
      { id: "ir2", cuenta: { tipo: "FIJO", codigo: "401721" }, naturaleza: "A", monto: { tipo: "PORCENTAJE", paramId: "utilidadContable", porcentaje: 29.5 }, glosaLinea: { tipo: "FIJO", texto: "IR por pagar" } }
    ],
    metadata: { version: "1.0", autor: "CONTAM", fechaCreacion: "2026-01-01", tags: ["impuesto"], usoCount: 0 }
  },
  {
    id: "tpl-vacaciones",
    nombre: "Provisión de Vacaciones",
    categoria: "PROVISION",
    descripcion: "Devengo mensual",
    tipoLibro: "DIARIO_MANUAL",
    parametros: [
      { id: "sueldoMensual", nombre: "Sueldo mensual", tipo: "MONTO", requerido: true },
      { id: "mesesDevengados", nombre: "Meses devengados", tipo: "MONTO", requerido: true, valorDefault: 12 },
      { id: "cuentaGasto", nombre: "Gasto", tipo: "CUENTA_PCGE", requerido: false, valorDefault: "621104" },
      { id: "cuentaProvision", nombre: "Provisión", tipo: "CUENTA_PCGE", requerido: false, valorDefault: "411104" }
    ],
    lineas: [
      { id: "v1", cuenta: { tipo: "PARAMETRO", paramId: "cuentaGasto" }, naturaleza: "D", monto: { tipo: "DIVISION", a: { tipo: "MULTIPLICACION", a: { tipo: "PARAMETRO", paramId: "sueldoMensual" }, b: { tipo: "PARAMETRO", paramId: "mesesDevengados" } }, b: { tipo: "VALOR_FIJO", valor: 12 } }, glosaLinea: { tipo: "FIJO", texto: "Vacaciones devengadas" } },
      { id: "v2", cuenta: { tipo: "PARAMETRO", paramId: "cuentaProvision" }, naturaleza: "A", monto: { tipo: "DIVISION", a: { tipo: "MULTIPLICACION", a: { tipo: "PARAMETRO", paramId: "sueldoMensual" }, b: { tipo: "PARAMETRO", paramId: "mesesDevengados" } }, b: { tipo: "VALOR_FIJO", valor: 12 } }, glosaLinea: { tipo: "FIJO", texto: "Provisión vacaciones" } }
    ],
    metadata: { version: "1.0", autor: "CONTAM", fechaCreacion: "2026-01-01", tags: ["vacaciones"], usoCount: 0 }
  },
  {
    id: "tpl-castigo",
    nombre: "Castigo Cuentas Incobrables",
    categoria: "AJUSTE",
    descripcion: "CXC incobrable",
    tipoLibro: "DIARIO_MANUAL",
    parametros: [
      { id: "montoCastigo", nombre: "Monto castigo", tipo: "MONTO", requerido: true },
      { id: "cuentaCobranzaDudosa", nombre: "CXC", tipo: "CUENTA_PCGE", requerido: false, valorDefault: "121201" },
      { id: "cuentaGasto", nombre: "Gasto castigo", tipo: "CUENTA_PCGE", requerido: false, valorDefault: "681201" }
    ],
    lineas: [
      { id: "ci1", cuenta: { tipo: "PARAMETRO", paramId: "cuentaGasto" }, naturaleza: "D", monto: { tipo: "PARAMETRO", paramId: "montoCastigo" }, glosaLinea: { tipo: "FIJO", texto: "Castigo incobrable" } },
      { id: "ci2", cuenta: { tipo: "PARAMETRO", paramId: "cuentaCobranzaDudosa" }, naturaleza: "A", monto: { tipo: "PARAMETRO", paramId: "montoCastigo" }, glosaLinea: { tipo: "FIJO", texto: "Baja CXC" } }
    ],
    metadata: { version: "1.0", autor: "CONTAM", fechaCreacion: "2026-01-01", tags: ["cxc"], usoCount: 0 }
  },
  {
    id: "tpl-costo-ventas",
    nombre: "Consumo de Inventario",
    categoria: "AJUSTE",
    descripcion: "Costo de ventas",
    tipoLibro: "DIARIO_MANUAL",
    parametros: [
      { id: "inventarioInicial", nombre: "Inv. inicial", tipo: "MONTO", requerido: true },
      { id: "compras", nombre: "Compras", tipo: "MONTO", requerido: true },
      { id: "inventarioFinal", nombre: "Inv. final", tipo: "MONTO", requerido: true },
      { id: "cuentaCosto", nombre: "Costo ventas", tipo: "CUENTA_PCGE", requerido: false, valorDefault: "691101" },
      { id: "cuentaInventario", nombre: "Inventario", tipo: "CUENTA_PCGE", requerido: false, valorDefault: "201101" }
    ],
    lineas: [
      { id: "cv1", cuenta: { tipo: "PARAMETRO", paramId: "cuentaCosto" }, naturaleza: "D", monto: { tipo: "RESTA", a: { tipo: "SUMA", formulas: [{ tipo: "PARAMETRO", paramId: "inventarioInicial" }, { tipo: "PARAMETRO", paramId: "compras" }] }, b: { tipo: "PARAMETRO", paramId: "inventarioFinal" } }, glosaLinea: { tipo: "FIJO", texto: "Costo de ventas" } },
      { id: "cv2", cuenta: { tipo: "PARAMETRO", paramId: "cuentaInventario" }, naturaleza: "A", monto: { tipo: "RESTA", a: { tipo: "SUMA", formulas: [{ tipo: "PARAMETRO", paramId: "inventarioInicial" }, { tipo: "PARAMETRO", paramId: "compras" }] }, b: { tipo: "PARAMETRO", paramId: "inventarioFinal" } }, glosaLinea: { tipo: "FIJO", texto: "Salida inventario" } }
    ],
    metadata: { version: "1.0", autor: "CONTAM", fechaCreacion: "2026-01-01", tags: ["inventario"], usoCount: 0 }
  },
  {
    id: "tpl-diferencia-cambio",
    nombre: "Diferencia de Cambio",
    categoria: "AJUSTE",
    descripcion: "Ajuste por variación TC",
    tipoLibro: "DIARIO_MANUAL",
    parametros: [
      { id: "montoUSD", nombre: "Monto USD", tipo: "MONTO", requerido: true },
      { id: "tipoCambioAnterior", nombre: "TC anterior", tipo: "TIPO_CAMBIO", requerido: true },
      { id: "tipoCambioActual", nombre: "TC actual", tipo: "TIPO_CAMBIO", requerido: true },
      { id: "cuentaActivo", nombre: "Cuenta ME", tipo: "CUENTA_PCGE", requerido: false, valorDefault: "121201" },
      { id: "cuentaGanancia", nombre: "Ganancia DC", tipo: "CUENTA_PCGE", requerido: false, valorDefault: "776101" },
      { id: "cuentaPerdida", nombre: "Pérdida DC", tipo: "CUENTA_PCGE", requerido: false, valorDefault: "676101" }
    ],
    lineas: [
      { id: "dc1", cuenta: { tipo: "PARAMETRO", paramId: "cuentaActivo" }, naturaleza: "D", monto: { tipo: "MULTIPLICACION", a: { tipo: "PARAMETRO", paramId: "montoUSD" }, b: { tipo: "RESTA", a: { tipo: "PARAMETRO", paramId: "tipoCambioActual" }, b: { tipo: "PARAMETRO", paramId: "tipoCambioAnterior" } } }, condicion: { tipo: "MAYOR_QUE", paramId: "tipoCambioActual", valor: 0 }, glosaLinea: { tipo: "FIJO", texto: "Ajuste activo ME" } },
      { id: "dc2", cuenta: { tipo: "PARAMETRO", paramId: "cuentaGanancia" }, naturaleza: "A", monto: { tipo: "MULTIPLICACION", a: { tipo: "PARAMETRO", paramId: "montoUSD" }, b: { tipo: "RESTA", a: { tipo: "PARAMETRO", paramId: "tipoCambioActual" }, b: { tipo: "PARAMETRO", paramId: "tipoCambioAnterior" } } }, glosaLinea: { tipo: "FIJO", texto: "Ganancia diferencia de cambio" } }
    ],
    metadata: { version: "1.0", autor: "CONTAM", fechaCreacion: "2026-01-01", tags: ["moneda"], usoCount: 0 }
  }
];
class AsientoTemplateEngine {
  templates;
  constructor(extra = []) {
    this.templates = new Map([...PLANTILLAS_PREDEFINIDAS, ...extra].map((t) => [t.id, t]));
  }
  listarPlantillas() {
    return [...this.templates.values()];
  }
  obtenerPlantilla(id) {
    return this.templates.get(id);
  }
  evaluarTemplate(templateId, parametros) {
    const template = this.templates.get(templateId);
    if (!template) {
      return {
        templateId,
        parametrosUsados: parametros,
        lineasGeneradas: [],
        totalDebe: 0,
        totalHaber: 0,
        cuadra: false,
        diferencia: 0,
        warnings: [],
        errores: [`Plantilla no encontrada: ${templateId}`]
      };
    }
    const merged = { ...Object.fromEntries(template.parametros.map((p) => [p.id, p.valorDefault])), ...parametros };
    const errores = validarParametros(template, merged);
    const warnings = [];
    const lineasGeneradas = [];
    for (const linea of template.lineas) {
      const gen = evaluarLinea(linea, merged);
      if (gen) lineasGeneradas.push(gen);
    }
    const totalDebe = round2(lineasGeneradas.reduce((s, l) => s + l.debe, 0));
    const totalHaber = round2(lineasGeneradas.reduce((s, l) => s + l.haber, 0));
    const diferencia = round2(totalDebe - totalHaber);
    if (Math.abs(diferencia) > 0.01) {
      errores.push(`Partida doble descuadrada: diferencia S/ ${diferencia.toFixed(2)}`);
    }
    return {
      templateId,
      parametrosUsados: merged,
      lineasGeneradas,
      totalDebe,
      totalHaber,
      cuadra: Math.abs(diferencia) <= 0.01,
      diferencia,
      warnings,
      errores
    };
  }
  previsualizarAsiento(templateId, parametros) {
    return this.evaluarTemplate(templateId, parametros);
  }
  aLineasAsiento(evaluacion, glosaBase) {
    return evaluacion.lineasGeneradas.map((l, i) => ({
      orden: i + 1,
      cuenta: l.cuentaContable,
      glosa: l.glosaLinea || glosaBase || "",
      debe: l.debe,
      haber: l.haber
    }));
  }
}
const asientoTemplateEngine = new AsientoTemplateEngine();
function seededTc(fecha, moneda) {
  const seed = parseInt(fecha.replace(/\D/g, "").slice(-6), 10) || 202606;
  const base = moneda === "EUR" ? 4.05 : 3.72;
  const varPct = (seed % 21 - 10) / 1e3;
  return Math.round((base + varPct) * 1e4) / 1e4;
}
async function obtenerTipoCambioSBS(fecha, moneda = "USD") {
  await new Promise((r) => setTimeout(r, 300 + Math.random() * 500));
  const venta = seededTc(fecha, moneda);
  return { fecha, moneda, compra: venta - 0.02, venta, fuente: "SBS" };
}
async function getTipoCambio(fecha, moneda) {
  const { data } = await supabase.from("tipos_cambio").select("venta").eq("moneda", moneda).lte("fecha", fecha).order("fecha", { ascending: false }).limit(1).maybeSingle();
  if (data?.venta) return Number(data.venta);
  const sbs = await obtenerTipoCambioSBS(fecha, moneda);
  return sbs.venta;
}
async function identificarPartidasME(ruc, moneda = "USD") {
  const partidas = [];
  const rows = await fetchRegistrosSireRows({ ruc, limit: 500 });
  const deudas = await fetchDeudasPendientes({ ruc }).catch(() => []);
  for (const d of deudas) {
    const row = rows.find((r) => r.id === d.sireRegistroId);
    const codMon = String(row?.cod_moneda ?? "PEN").toUpperCase();
    if (codMon !== moneda && codMon !== "PEN") {
      const tc = Number(row?.tipo_cambio ?? 3.75);
      const me = d.saldoPendiente / tc;
      partidas.push({
        id: d.sireRegistroId,
        tipo: d.tipo === "VENTA" ? "CXC" : "CXP",
        sireRegistroId: d.sireRegistroId,
        descripcion: d.comprobante,
        montoOriginal: me,
        monedaOrigen: codMon,
        tipoCambioOriginal: tc,
        montoSolesOriginal: d.saldoPendiente,
        fechaOriginal: String(row?.fecha_emision ?? "").slice(0, 10),
        saldoPendienteME: me,
        cuentaContableME: d.cuentaComercial
      });
    }
  }
  for (const r of rows) {
    const codMon = String(r.cod_moneda ?? "PEN").toUpperCase();
    if (codMon === moneda && codMon !== "PEN") {
      const tc = Number(r.tipo_cambio ?? 3.75);
      const total = Number(r.mto_total_cp ?? r.importe_total ?? 0);
      const me = tc > 0 ? total / tc : total;
      if (!partidas.some((p) => p.sireRegistroId === r.id)) {
        partidas.push({
          id: String(r.id),
          tipo: r.tipo === "VENTA" ? "CXC" : "CXP",
          sireRegistroId: String(r.id),
          descripcion: `${r.cod_tipo_cdp}-${r.serie_cdp}-${r.nro_cdp_inicial}`,
          montoOriginal: me,
          monedaOrigen: codMon,
          tipoCambioOriginal: tc,
          montoSolesOriginal: total,
          fechaOriginal: String(r.fecha_emision ?? "").slice(0, 10),
          saldoPendienteME: me,
          cuentaContableME: r.tipo === "VENTA" ? "121201" : "421201"
        });
      }
    }
  }
  return partidas;
}
async function calcularDiferenciasCambio(ruc, moneda = "USD", fechaCorte) {
  const fecha = fechaCorte ?? (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const tcActual = await getTipoCambio(fecha, moneda);
  const partidas = await identificarPartidasME(ruc, moneda);
  const calculos = [];
  for (const p of partidas) {
    const montoActualSoles = Math.round(p.saldoPendienteME * tcActual * 100) / 100;
    const diff = Math.round((montoActualSoles - p.montoSolesOriginal) * 100) / 100;
    const esActivo = p.tipo === "CXC" || p.tipo === "BANCO_USD" || p.tipo === "CAJA_USD";
    const tipoDiferencia = diff === 0 ? "GANANCIA" : esActivo ? diff > 0 ? "GANANCIA" : "PERDIDA" : diff > 0 ? "PERDIDA" : "GANANCIA";
    calculos.push({
      partidaId: p.id,
      tipo: p.tipo,
      descripcion: p.descripcion,
      moneda: p.monedaOrigen,
      saldoME: p.saldoPendienteME,
      tcOriginal: p.tipoCambioOriginal,
      tcActual,
      variacionTC: Math.round((tcActual - p.tipoCambioOriginal) * 1e4) / 1e4,
      montoOriginalSoles: p.montoSolesOriginal,
      montoActualSoles,
      diferenciaCambio: diff,
      tipoDiferencia
    });
  }
  const totalGanancia = calculos.filter((c) => c.diferenciaCambio > 0).reduce((s, c) => s + c.diferenciaCambio, 0);
  const totalPerdida = calculos.filter((c) => c.diferenciaCambio < 0).reduce((s, c) => s + Math.abs(c.diferenciaCambio), 0);
  return {
    fecha,
    moneda,
    tipoCambioUsado: tcActual,
    partidasEvaluadas: calculos.length,
    totalGanancia: Math.round(totalGanancia * 100) / 100,
    totalPerdida: Math.round(totalPerdida * 100) / 100,
    neto: Math.round((totalGanancia - totalPerdida) * 100) / 100,
    partidas: calculos
  };
}
async function generarAsientoDiferenciaCambio(params) {
  const lineas = [];
  let orden = 1;
  for (const p of params.resumen.partidas) {
    if (Math.abs(p.diferenciaCambio) < 0.01) continue;
    const abs = Math.abs(p.diferenciaCambio);
    const esGanancia = p.tipoDiferencia === "GANANCIA" && p.diferenciaCambio > 0;
    if (p.tipo === "CXC") {
      lineas.push({ orden: orden++, cuenta: "121201", glosa: `Ajuste ME ${p.descripcion}`, debe: p.diferenciaCambio > 0 ? abs : 0, haber: p.diferenciaCambio < 0 ? abs : 0 });
      lineas.push({ orden: orden++, cuenta: esGanancia ? "776101" : "676101", glosa: "Diferencia de cambio", debe: p.diferenciaCambio < 0 ? abs : 0, haber: p.diferenciaCambio > 0 ? abs : 0 });
    } else {
      lineas.push({ orden: orden++, cuenta: "421201", glosa: `Ajuste ME ${p.descripcion}`, debe: p.diferenciaCambio < 0 ? abs : 0, haber: p.diferenciaCambio > 0 ? abs : 0 });
      lineas.push({ orden: orden++, cuenta: esGanancia ? "776101" : "676101", glosa: "Diferencia de cambio", debe: p.diferenciaCambio > 0 ? abs : 0, haber: p.diferenciaCambio < 0 ? abs : 0 });
    }
  }
  if (lineas.length === 0) return null;
  const filas = lineas.map(
    (l) => toAsientoContableInsert({
      sire_registro_id: null,
      periodo: params.periodo,
      tipo_asiento: "principal",
      tipo_libro: "DIARIO_MANUAL",
      fecha_asiento: params.resumen.fecha,
      cuenta_contable: l.cuenta,
      glosa: `Ajuste diferencia de cambio ${params.resumen.moneda} — ${l.glosa}`,
      debe: l.debe,
      haber: l.haber,
      naturaleza: l.debe > 0 ? "debe" : "haber",
      tipo_registro: "COMPRA",
      ruc_contraparte: params.ruc,
      nombre_contraparte: null,
      serie_cdp: null,
      nro_cdp_inicial: null
    })
  );
  const { data, error } = await supabase.from("asientos_contables").insert(filas).select("id");
  if (error) throw error;
  return data?.[0]?.id ?? null;
}
function usePlantillasAsiento() {
  return useQuery({
    queryKey: ["diario", "plantillas"],
    queryFn: () => asientoTemplateEngine.listarPlantillas(),
    staleTime: Infinity
  });
}
function useDiferenciasCambio(ruc, moneda = "USD") {
  return useQuery({
    queryKey: ["diario", "diferencia-cambio", ruc, moneda],
    queryFn: () => calcularDiferenciasCambio(ruc, moneda),
    enabled: !!ruc?.trim(),
    staleTime: 12e4
  });
}
function useGenerarAsientoDC() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params) => generarAsientoDiferenciaCambio(params),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["libro_diario"] });
    }
  });
}
function useGuardarAsientoDesdePlantilla() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params) => {
      const evaluacion = asientoTemplateEngine.evaluarTemplate(params.templateId, params.parametros);
      if (!evaluacion.cuadra) throw new Error(evaluacion.errores.join("; "));
      const lineas = asientoTemplateEngine.aLineasAsiento(evaluacion, params.glosa);
      await guardarAsientoManual({
        ruc: params.ruc,
        periodo: params.periodo,
        fecha: params.fecha,
        glosa: params.glosa,
        lineas
      });
      return evaluacion;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["libro_diario"] });
    }
  });
}
const LIBRO_COLORS = {
  DIARIO_COMPRAS: "#00C8FF",
  DIARIO_VENTAS: "#00C897",
  CAJA_BANCOS: "#9B87F5",
  DIARIO_MANUAL: "#8899B4"
};
function fmt(n) {
  return n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function groupKey(row) {
  if (row.sire_registro_id) return `sire:${row.sire_registro_id}`;
  return `grp:${row.fecha_asiento}|${(row.glosa ?? "").slice(0, 40)}|${row.tipo_libro ?? row.origen}`;
}
function KpiCard({ label, value, sub, tone }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-4 hover:scale-[1.02] transition-transform", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[#8899B4]", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-2xl font-semibold text-[#E8EDF5] mt-1", style: { color: tone }, children: value }),
    sub ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-[#8899B4] mt-1", children: sub }) : null
  ] });
}
function AsientoCard({
  grupo,
  onTrace
}) {
  const cuadra = Math.abs(grupo.totalDebe - grupo.totalHaber) < 0.01;
  const border = LIBRO_COLORS[grupo.tipoLibro ?? ""] ?? "#8899B4";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden",
      style: { borderLeftWidth: 4, borderLeftColor: border },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.04]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px]", style: { borderColor: `${border}66`, color: border }, children: grupo.tipoLibro ?? "ASIENTO" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-[#8899B4]", children: grupo.fecha }),
              grupo.sireId ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px] border-cyan-500/40 text-cyan-400", children: "SIRE" }) : null
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-[#E8EDF5] mt-1", children: grupo.glosa })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Badge,
            {
              variant: "outline",
              className: cn(
                cuadra ? "border-emerald-500/40 text-emerald-400" : "border-red-500/40 text-red-400 animate-pulse"
              ),
              children: cuadra ? "✅ CUADRA" : `❌ DIF. ${fmt(Math.abs(grupo.totalDebe - grupo.totalHaber))}`
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-white/[0.03]", children: grupo.lineas.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[80px_1fr_100px_100px] gap-2 px-4 py-2 text-xs hover:bg-white/[0.03]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[#C8A44D]", children: l.cuenta_contable }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-[#E8EDF5]", children: l.glosa }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-right text-[#00C897]", children: l.debe > 0 ? fmt(l.debe) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-right text-[#FF5E7A]", children: l.haber > 0 ? fmt(l.haber) : "—" })
        ] }, l.id)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-2 flex justify-between items-center bg-white/[0.02] text-xs font-mono", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#8899B4]", children: "TOTALES" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#00C897]", children: fmt(grupo.totalDebe) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#FF5E7A]", children: fmt(grupo.totalHaber) })
          ] })
        ] }),
        grupo.sireId ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "ghost", className: "h-7 text-xs", onClick: () => onTrace(grupo.sireId), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "size-3 mr-1" }),
          " Ver trazabilidad"
        ] }) }) : null
      ]
    }
  );
}
function LibroDiarioPremium({
  ruc,
  periodo,
  rows,
  loading
}) {
  const [filtroLibro, setFiltroLibro] = reactExports.useState("TODOS");
  const [buscar, setBuscar] = reactExports.useState("");
  const [cxcOpen, setCxcOpen] = reactExports.useState(true);
  const [traceSireId, setTraceSireId] = reactExports.useState(null);
  const [tplOpen, setTplOpen] = reactExports.useState(false);
  const [tplId, setTplId] = reactExports.useState("");
  const [tplParams, setTplParams] = reactExports.useState({});
  const [glosaTpl, setGlosaTpl] = reactExports.useState("");
  const plantillas = usePlantillasAsiento();
  const dcQuery = useDiferenciasCambio(ruc);
  const genDC = useGenerarAsientoDC();
  const saveTpl = useGuardarAsientoDesdePlantilla();
  const grupos = reactExports.useMemo(() => {
    const map = /* @__PURE__ */ new Map();
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
        totalHaber: 0
      };
      prev.lineas.push(row);
      prev.totalDebe += Number(row.debe ?? 0);
      prev.totalHaber += Number(row.haber ?? 0);
      map.set(key, prev);
    }
    return [...map.values()].sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [rows]);
  const filtered = reactExports.useMemo(() => {
    const q = buscar.trim().toLowerCase();
    return grupos.filter((g) => {
      if (filtroLibro !== "TODOS" && g.tipoLibro !== filtroLibro) return false;
      if (!q) return true;
      const hay = `${g.glosa} ${g.lineas.map((l) => l.cuenta_contable).join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }, [grupos, filtroLibro, buscar]);
  const kpis = reactExports.useMemo(() => {
    const debe = rows.reduce((s, r) => s + Number(r.debe ?? 0), 0);
    const haber = rows.reduce((s, r) => s + Number(r.haber ?? 0), 0);
    const errores = grupos.filter((g) => Math.abs(g.totalDebe - g.totalHaber) > 0.01).length;
    return { asientos: grupos.length, debe, haber, errores };
  }, [rows, grupos]);
  const tpl = plantillas.data?.find((t) => t.id === tplId);
  const preview = tplId ? asientoTemplateEngine.evaluarTemplate(tplId, Object.fromEntries(Object.entries(tplParams).map(([k, v]) => [k, Number.isFinite(Number(v)) ? Number(v) : v]))) : null;
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
        fecha: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
        glosa: glosaTpl || tpl?.nombre || "Asiento desde plantilla",
        templateId: tplId,
        parametros: Object.fromEntries(Object.entries(tplParams).map(([k, v]) => [k, Number(v) || v]))
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
    { id: "DIARIO_MANUAL", label: "Manual" }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "rounded-2xl border border-[#1A2740]/50 p-4 md:p-6 space-y-4",
      style: { background: "linear-gradient(180deg, #060B14 0%, #080E1E 100%)" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-semibold flex items-center gap-2 text-[#C8A44D]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "size-5" }),
            " Libro Diario Premium"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "border-[#C8A44D]/40", onClick: () => setTplOpen(true), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-4 mr-1" }),
              " Plantilla"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "ghost", onClick: () => setCxcOpen((v) => !v), children: [
              cxcOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "size-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "size-4" }),
              "CXC/CXP"
            ] })
          ] })
        ] }),
        dcQuery.data && dcQuery.data.partidasEvaluadas > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 flex flex-wrap items-center justify-between gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2 text-amber-200", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "size-4" }),
            dcQuery.data.partidasEvaluadas,
            " partida(s) en ",
            dcQuery.data.moneda,
            " — TC ",
            dcQuery.data.tipoCambioUsado
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", disabled: genDC.isPending, onClick: () => void handleGenerarDC(), children: [
            genDC.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 animate-spin" }) : null,
            "Generar ajuste DC"
          ] })
        ] }) : null,
        loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-4 gap-3", children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-24 bg-white/5" }, i)) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { label: "Asientos", value: String(kpis.asientos) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { label: "Total Debe", value: `S/ ${fmt(kpis.debe)}`, tone: "#00C897" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { label: "Total Haber", value: `S/ ${fmt(kpis.haber)}`, tone: "#FF5E7A" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { label: "Descuadres", value: String(kpis.errores), tone: kpis.errores ? "#FF5E7A" : "#00C897" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 items-center", children: [
          tabs.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "sm",
              variant: filtroLibro === t.id ? "default" : "ghost",
              className: "h-8 text-xs",
              onClick: () => setFiltroLibro(t.id),
              children: t.label
            },
            t.id
          )),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: "Buscar glosa o cuenta…",
              value: buscar,
              onChange: (e) => setBuscar(e.target.value),
              className: "max-w-xs ml-auto bg-white/[0.03] border-white/[0.08] h-8"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("grid gap-4", cxcOpen ? "lg:grid-cols-[1fr_320px]" : ""), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3 max-h-[640px] overflow-y-auto pr-1", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-40 bg-white/5" }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-[#8899B4] py-12", children: "Sin asientos en el período" }) : filtered.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsx(AsientoCard, { grupo: g, onTrace: setTraceSireId }, g.key)) }),
          cxcOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 overflow-auto max-h-[640px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CxcCxpBandeja, { ruc, periodo }) }) : null
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: tplOpen, onOpenChange: setTplOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "glass-surface border-white/10 sm:max-w-lg max-h-[90vh] overflow-y-auto", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Usar plantilla contable" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Plantilla" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  className: "w-full mt-1 rounded-md border bg-background px-3 py-2 text-sm",
                  value: tplId,
                  onChange: (e) => {
                    setTplId(e.target.value);
                    setTplParams({});
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Seleccionar…" }),
                    (plantillas.data ?? []).map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: t.id, children: t.nombre }, t.id))
                  ]
                }
              )
            ] }),
            tpl?.parametros.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: p.nombre }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: p.tipo === "MONTO" || p.tipo === "PORCENTAJE" ? "number" : "text",
                  defaultValue: String(p.valorDefault ?? ""),
                  onChange: (e) => setTplParams((prev) => ({ ...prev, [p.id]: e.target.value })),
                  className: "mt-1"
                }
              )
            ] }, p.id)),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Glosa del asiento" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: glosaTpl, onChange: (e) => setGlosaTpl(e.target.value), rows: 2, className: "mt-1" })
            ] }),
            preview ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-3 text-xs space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  "Cuadra: ",
                  preview.cuadra ? "✅" : "❌"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono", children: [
                  "D ",
                  fmt(preview.totalDebe),
                  " / H ",
                  fmt(preview.totalHaber)
                ] })
              ] }),
              preview.lineasGeneradas.map((l, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-4 gap-1 font-mono", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: l.cuentaContable }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "col-span-2 truncate", children: l.glosaLinea }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-right", children: l.debe ? fmt(l.debe) : fmt(l.haber) })
              ] }, i)),
              preview.errores.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-400", children: e }, e))
            ] }) : null
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setTplOpen(false), children: "Cancelar" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { disabled: !preview?.cuadra || saveTpl.isPending, onClick: () => void handleSaveTpl(), children: [
              saveTpl.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4" }),
              "Generar asiento"
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sheet, { open: !!traceSireId, onOpenChange: (v) => !v && setTraceSireId(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetContent, { side: "right", className: "w-full sm:max-w-4xl p-0 overflow-y-auto bg-[#070C1B] border-white/10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SheetHeader, { className: "p-4 border-b border-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SheetTitle, { className: "text-[#E8EDF5]", children: "Trazabilidad" }) }),
          traceSireId ? /* @__PURE__ */ jsxRuntimeExports.jsx(AsientoTraceabilityViewerPremium, { sireRegistroId: traceSireId, compact: true }) : null
        ] }) })
      ]
    }
  );
}
function defaultPeriodo() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 7).replace("-", "");
}
function LibroDiarioPage() {
  const {
    tab
  } = Route.useSearch();
  const [periodo, setPeriodo] = reactExports.useState(defaultPeriodo);
  const [cliente, setCliente] = reactExports.useState(null);
  const rucSelected = cliente?.ruc?.trim() ?? "";
  const libroFilters = reactExports.useMemo(() => ({
    ruc: rucSelected || void 0,
    periodo: periodo.trim() || void 0
  }), [rucSelected, periodo]);
  const lineasQuery = useQuery({
    queryKey: ["libro_diario", libroFilters],
    queryFn: () => fetchLibroDiario(libroFilters),
    enabled: !!rucSelected
  });
  const contribuyenteIdQuery = useQuery({
    queryKey: ["libro-diario", "contribuyente-id", rucSelected],
    queryFn: async () => {
      const {
        supabase: supabase2
      } = await import("./router-B2fOVgbK.js").then((n) => n.k);
      const {
        data
      } = await supabase2.from("contribuyentes").select("id").eq("ruc", rucSelected).maybeSingle();
      return data?.id ?? null;
    },
    enabled: rucSelected.length === 11,
    staleTime: 12e4
  });
  const rows = lineasQuery.data ?? [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 max-w-[1600px] mx-auto space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-wrap items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-display text-3xl font-semibold flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "size-8 text-primary" }),
          "Libro Diario"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground mt-1 text-sm flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Database, { className: "size-3.5" }),
          "Tabla unificada asientos_contables · DIARIO_* y puente a CAJA_BANCOS"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row items-stretch sm:items-end gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(NuevaTareaButton, { moduloOrigen: "asientos", ruc: rucSelected || void 0, entidad: "Libro Diario", tramite: "Revisión de asientos contables" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "self-start sm:self-auto", children: "RUC obligatorio" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ExportButtons, { prominent: true, compact: true, disabled: !rucSelected || rows.length === 0, onExportExcel: () => exportLibroExcel(rows, periodo.trim() || void 0), onExportPdf: () => exportLibroPdf(rows, periodo.trim() || void 0) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(StepGuardBanner, { contribuyenteId: contribuyenteIdQuery.data ?? null, periodo: periodo.trim(), vista: "libro-diario" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(EmpresaPeriodoFilters, { cliente, onClienteChange: setCliente, periodo, onPeriodoChange: setPeriodo, periodoDefault: defaultPeriodo() }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: tab, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "flex flex-wrap h-auto gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "premium", children: "★ Premium" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "provisiones", children: "A · Provisiones SIRE" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "general", children: "B · Libro Diario General" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "cxp", children: "C · CxP / CxC" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "premium", className: "mt-4", children: !rucSelected ? /* @__PURE__ */ jsxRuntimeExports.jsx(RequireRucEmptyState, { context: "Selecciona el contribuyente para el libro diario premium." }) : /* @__PURE__ */ jsxRuntimeExports.jsx(LibroDiarioPremium, { ruc: rucSelected, periodo: periodo.trim(), rows, loading: lineasQuery.isLoading }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "provisiones", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ProvisionesSirePanel, { ruc: rucSelected, periodo }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "general", className: "mt-4 space-y-4", children: !rucSelected ? /* @__PURE__ */ jsxRuntimeExports.jsx(RequireRucEmptyState, { context: "Selecciona el contribuyente para ver el libro diario completo." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LibroDiarioGeneralPanel, { rows, loading: lineasQuery.isLoading, periodoDefault: periodo.trim() }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AsientoManualForm, { ruc: rucSelected, periodo })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "cxp", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CxcCxpBandeja, { ruc: rucSelected, periodo }) })
    ] })
  ] });
}
export {
  LibroDiarioPage as component
};
