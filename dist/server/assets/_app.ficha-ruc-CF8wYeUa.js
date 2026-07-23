import { L as jsxRuntimeExports, U as reactExports } from "./server-BtEtmoed.js";
import { f as emptyTributoAfecto, d as emptyRepresentante, c as emptyPersonaVinculada, a as emptyEstablecimiento, i as fetchFichaByRuc, b as emptyFichaRuc, j as fichaToDbRow, l as upsertFichaRuc, t as tributosToDb, r as representantesToDb, g as establecimientosToDb, u as uid, h as fetchAllFichas, m as useContribuyentes, v as validateFichaRequired, k as formatRequestError } from "./use-contribuyentes-VbWbyhxv.js";
import { I as Input } from "./input-D7gh_qkE.js";
import { S as Select, c as SelectTrigger, d as SelectValue, a as SelectContent, b as SelectItem } from "./select-D8PPOTXl.js";
import { B as Button } from "./button-CUz5JvIg.js";
import { a as cn } from "./utils-8RO4xBwZ.js";
import { F as FieldHelper } from "./field-helper-B6n6-iJ-.js";
import { P as Plus } from "./plus-Du5GJvsn.js";
import { T as Trash2 } from "./trash-2-0yvLyvOU.js";
import { T as Tabs, b as TabsList, c as TabsTrigger, a as TabsContent } from "./tabs-Bus4Hdpw.js";
import { a as aiFieldAttrs, c as applyFillToFicha, d as buildFichaFieldSnapshots, e as useRegisterAiComposerPage } from "./ai-composer-fill-uo2WCCAf.js";
import { E as ExportButtons } from "./export-buttons-CIMm_skJ.js";
import { g as getDataSourceLabel } from "./http-client-h7UKjZ8s.js";
import { L as Label } from "./label-E-JJzORI.js";
import { B as Badge } from "./badge-DnmwkqA1.js";
import { ab as supabase, u as fetchRegistrosSireRows, aq as useQueryClient, ai as toast, am as useNavigate, f as Route } from "./router-DdOnzL1Y.js";
import { S as Skeleton } from "./skeleton-DUGbHj_6.js";
import { T as Table, d as TableHeader, e as TableRow, c as TableHead, a as TableBody, b as TableCell } from "./table-CwkkZ3JC.js";
import { u as useQuery } from "./useQuery-yGnE4xdj.js";
import { u as useMutation } from "./useMutation-CF5vIByn.js";
import { fetchMovimientosCaja } from "./caja-service-BJmR-66Y.js";
import { f as fetchDeudasPendientes } from "./cxc-cxp-service-DZ0D8BeU.js";
import { B as Building2 } from "./building-2-IqsAOsxf.js";
import { L as LoaderCircle } from "./loader-circle-CFK0bbWm.js";
import { R as RefreshCw } from "./refresh-cw-B5B5xT1n.js";
import { P as Pencil } from "./pencil-ZRiVDMD5.js";
import { D as Download } from "./download-DCtvzmuW.js";
import { R as ResponsiveContainer, X as XAxis, Y as YAxis, g as Tooltip, B as Bar, a as Cell } from "./generateCategoricalChart-CXYoKBQ-.js";
import { B as BarChart } from "./BarChart-Bbh9Wapn.js";
import { a as PieChart, P as Pie } from "./PieChart-MnwDOu-h.js";
import { U as User } from "./user-DqaqRvT1.js";
import { L as LineChart } from "./LineChart-Db-l72yv.js";
import { L as Line } from "./Line-yFhjZWFG.js";
import { S as Search } from "./search-BZAd-x8H.js";
import { a as createLucideIcon } from "./index-CwvZaaA2.js";
import { F as FileText } from "./file-text-B5QbIu7E.js";
import { S as Save } from "./save-iMNAbqol.js";
import { L as LayoutDashboard } from "./layout-dashboard-DYbqh3DA.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./contribuyentes-service-D2dNpwbB.js";
import "./index-BmgwMWsz.js";
import "./Combination-Cm3gVzC7.js";
import "./chevron-up-CZXHkJii.js";
import "./circle-alert-CEx3h_yK.js";
import "./info-CrkvcwAw.js";
import "./index-RFvs7CSY.js";
import "./index-q8D09Twd.js";
import "./dropdown-menu-C_iMwrB5.js";
import "./chevron-right-Cqijn6N5.js";
import "./circle-DwaP9kA5.js";
import "./upload-DM1u59F7.js";
import "./file-spreadsheet-CVLAhsJX.js";
const __iconNode = [
  ["circle", { cx: "18", cy: "18", r: "3", key: "1xkwt0" }],
  ["circle", { cx: "6", cy: "6", r: "3", key: "1lh9wr" }],
  ["path", { d: "M13 6h3a2 2 0 0 1 2 2v7", key: "1yeb86" }],
  ["path", { d: "M11 18H8a2 2 0 0 1-2-2V9", key: "19pyzm" }]
];
const GitCompare = createLucideIcon("git-compare", __iconNode);
function SectionHeader({
  title,
  subtitle,
  children,
  className
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: cn(
        "rounded-t-lg border border-b-0 border-blue-200/80 bg-gradient-to-r from-blue-50 to-slate-50 px-4 py-3 dark:from-blue-950/40 dark:to-slate-900/40 dark:border-blue-900/50",
        className
      ),
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-blue-900 dark:text-blue-100", children: title }),
          subtitle && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: subtitle })
        ] }),
        children
      ] })
    }
  );
}
function SectionBody({ children, className }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: cn(
        "rounded-b-lg border border-t-0 border-blue-200/80 bg-card p-4 mb-6 dark:border-blue-900/50",
        className
      ),
      children
    }
  );
}
function FormGrid({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children });
}
function Field({
  label,
  required,
  help,
  children,
  className,
  aiFieldPath
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className, ...aiFieldPath ? { "data-ai-field-wrap": aiFieldPath } : {}, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs font-medium text-foreground/80 mb-1.5 block", children: [
      label,
      required && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-600 ml-0.5", children: "*" })
    ] }),
    children,
    help ? /* @__PURE__ */ jsxRuntimeExports.jsx(FieldHelper, { className: "mt-1", children: help }) : null
  ] });
}
function DynamicArrayBlock({
  title,
  items,
  onAdd,
  onRemove,
  renderItem,
  emptyHint = "Presione + para agregar un registro"
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { title, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", size: "sm", onClick: onAdd, className: "bg-blue-700 hover:bg-blue-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4 mr-1" }),
      "Agregar"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SectionBody, { children: items.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-center py-4", children: emptyHint }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: items.map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "relative rounded-lg border bg-muted/20 p-4 pt-8",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              variant: "ghost",
              size: "icon",
              className: "absolute top-2 right-2 text-red-600 hover:text-red-700 hover:bg-red-50",
              onClick: () => onRemove(index),
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-4" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "absolute top-2 left-3 text-xs font-semibold text-blue-700", children: [
            "#",
            index + 1
          ] }),
          renderItem(item, index)
        ]
      },
      index
    )) }) })
  ] });
}
const TIPOS_CONTRIBUYENTE = [
  "PERSONA NATURAL",
  "PERSONA JURÍDICA",
  "SUcesión Indivisa",
  "Otros"
];
function FichaRucForm({ ficha, onChange }) {
  const patch = (partial) => onChange({ ...ficha, ...partial });
  const patchGeneral = (key, value) => onChange({ ...ficha, general: { ...ficha.general, [key]: value } });
  const patchMod = (key, value) => onChange({
    ...ficha,
    modificacionContribuyente: { ...ficha.modificacionContribuyente, [key]: value }
  });
  const patchDom = (key, value) => onChange({ ...ficha, domicilioFiscal: { ...ficha.domicilioFiscal, [key]: value } });
  const patchPn = (key, value) => onChange({ ...ficha, personaNatural: { ...ficha.personaNatural, [key]: value } });
  const patchEmp = (key, value) => onChange({ ...ficha, empresa: { ...ficha.empresa, [key]: value } });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "general", className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "flex flex-wrap h-auto gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "general", children: "Datos generales" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "tributos", children: "Tributos" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "representantes", children: "Representantes" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "vinculados", children: "Vinculados" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "establecimientos", children: "Establecimientos" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "general", className: "space-y-0 mt-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          SectionHeader,
          {
            title: "Sección A — Información General del Contribuyente",
            subtitle: "Bloque visual fijo (estilo SUNAT)"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionBody, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(FormGrid, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Apellidos y Nombres o Razón Social", required: true, aiFieldPath: "general.razonSocial", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              ...aiFieldAttrs("general.razonSocial", "Razón Social"),
              value: ficha.general.razonSocial,
              onChange: (e) => patchGeneral("razonSocial", e.target.value)
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Tipo de Contribuyente", required: true, aiFieldPath: "general.tipoContribuyente", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: ficha.general.tipoContribuyente || void 0,
              onValueChange: (v) => patchGeneral("tipoContribuyente", v),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { ...aiFieldAttrs("general.tipoContribuyente", "Tipo de Contribuyente"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Seleccionar…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: TIPOS_CONTRIBUYENTE.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t)) })
              ]
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Fecha de Inscripción", required: true, aiFieldPath: "general.fechaInscripcion", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "date",
              ...aiFieldAttrs("general.fechaInscripcion", "Fecha de Inscripción"),
              value: ficha.general.fechaInscripcion,
              onChange: (e) => patchGeneral("fechaInscripcion", e.target.value)
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Fecha de Inicio de Actividades", aiFieldPath: "general.fechaInicioActividades", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "date",
              ...aiFieldAttrs("general.fechaInicioActividades", "Fecha de Inicio de Actividades"),
              value: ficha.general.fechaInicioActividades,
              onChange: (e) => patchGeneral("fechaInicioActividades", e.target.value)
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Estado del Contribuyente", aiFieldPath: "general.estadoContribuyente", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              ...aiFieldAttrs("general.estadoContribuyente", "Estado del Contribuyente"),
              value: ficha.general.estadoContribuyente,
              onChange: (e) => patchGeneral("estadoContribuyente", e.target.value)
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Dependencia SUNAT", aiFieldPath: "general.dependenciaSunat", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              ...aiFieldAttrs("general.dependenciaSunat", "Dependencia SUNAT"),
              value: ficha.general.dependenciaSunat,
              onChange: (e) => patchGeneral("dependenciaSunat", e.target.value)
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Condición de Domicilio Fiscal", aiFieldPath: "general.condicionDomicilioFiscal", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              ...aiFieldAttrs("general.condicionDomicilioFiscal", "Condición Domicilio Fiscal"),
              value: ficha.general.condicionDomicilioFiscal,
              onChange: (e) => patchGeneral("condicionDomicilioFiscal", e.target.value)
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Emisor electrónico desde", aiFieldPath: "general.emisorElectronicoDesde", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "date",
              ...aiFieldAttrs("general.emisorElectronicoDesde", "Emisor electrónico desde"),
              value: ficha.general.emisorElectronicoDesde,
              onChange: (e) => patchGeneral("emisorElectronicoDesde", e.target.value)
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Comprobantes electrónicos", aiFieldPath: "general.comprobantesElectronicos", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              ...aiFieldAttrs("general.comprobantesElectronicos", "Comprobantes electrónicos"),
              value: ficha.general.comprobantesElectronicos,
              onChange: (e) => patchGeneral("comprobantesElectronicos", e.target.value)
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Fecha de Baja", aiFieldPath: "general.fechaBaja", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "date",
              ...aiFieldAttrs("general.fechaBaja", "Fecha de Baja"),
              value: ficha.general.fechaBaja,
              onChange: (e) => patchGeneral("fechaBaja", e.target.value)
            }
          ) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { title: "Sección B — Para modificar los datos del Contribuyente" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionBody, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(FormGrid, { children: [
          ["nombreComercial", "Nombre Comercial"],
          ["tipoRepresentacion", "Tipo de Representación"],
          ["actividadEconomicaPrincipal", "Actividad Económica Principal"],
          ["actividadEconomicaSecundaria1", "Actividad Económica Secundaria 1"],
          ["actividadEconomicaSecundaria2", "Actividad Económica Secundaria 2"],
          ["sistemaEmisionComprobantes", "Sistema Emisión Comprobantes de Pago"],
          ["sistemaContabilidad", "Sistema de Contabilidad"],
          ["codigoProfesionOficio", "Código de Profesión / Oficio"],
          ["actividadComercioExterior", "Actividad de Comercio Exterior"],
          ["numeroFax", "Número Fax"],
          ["telefonoFijo1", "Teléfono Fijo 1"],
          ["telefonoFijo2", "Teléfono Fijo 2"],
          ["telefonoMovil1", "Teléfono Móvil 1"],
          ["telefonoMovil2", "Teléfono Móvil 2"],
          ["correoElectronico1", "Correo Electrónico 1"],
          ["correoElectronico2", "Correo Electrónico 2"]
        ].map(([key, label]) => /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label, aiFieldPath: `modificacionContribuyente.${key}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            ...aiFieldAttrs(`modificacionContribuyente.${key}`, label),
            value: ficha.modificacionContribuyente[key],
            onChange: (e) => patchMod(key, e.target.value)
          }
        ) }, key)) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { title: "Sección C — Para modificar los datos de Domicilio Fiscal" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionBody, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(FormGrid, { children: [
          ["actividadEconomica", "Actividad Económica"],
          ["departamento", "Departamento"],
          ["provincia", "Provincia"],
          ["distrito", "Distrito"],
          ["tipoNombreZona", "Tipo y Nombre Zona"],
          ["tipoNombreVia", "Tipo y Nombre Vía"],
          ["nroKmMzLote", "Nro / Km / Mz / Lote / Dpto / Interior"],
          ["otrasReferencias", "Otras Referencias"],
          ["condicionInmueble", "Condición del inmueble (Domicilio Fiscal)"],
          ["licenciaMunicipal", "Licencia Municipal"]
        ].map(([key, label]) => /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label, aiFieldPath: `domicilioFiscal.${key}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            ...aiFieldAttrs(`domicilioFiscal.${key}`, label),
            value: ficha.domicilioFiscal[key],
            onChange: (e) => patchDom(key, e.target.value)
          }
        ) }, key)) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { title: "Sección D — Para modificar los datos de la Persona Natural" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionBody, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(FormGrid, { children: [
          ["documentoIdentidad", "Documento de Identidad"],
          ["fechaNacimientoSucesion", "Fecha de Nacimiento o Inicio Sucesión"],
          ["sexo", "Sexo"],
          ["pasaporte", "Pasaporte"],
          ["nacionalidad", "Nacionalidad"],
          ["paisProcedencia", "País de Procedencia"],
          ["condDomiciliado", "Cond. Domiciliado"]
        ].map(([key, label]) => /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label, aiFieldPath: `personaNatural.${key}`, children: key === "fechaNacimientoSucesion" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "date",
            ...aiFieldAttrs(`personaNatural.${key}`, label),
            value: ficha.personaNatural[key],
            onChange: (e) => patchPn(key, e.target.value)
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            ...aiFieldAttrs(`personaNatural.${key}`, label),
            value: ficha.personaNatural[key],
            onChange: (e) => patchPn(key, e.target.value)
          }
        ) }, key)) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionHeader, { title: "Sección E — Para modificar los datos de la Empresa" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionBody, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(FormGrid, { children: [
          ["fechaInscripcionRrPp", "Fecha Inscripción RR.PP"],
          ["numeroPartidaRegistral", "Número de Partida Registral"],
          ["tomoFichaFolioAsiento", "Tomo / Ficha / Folio / Asiento"],
          ["origenCapital", "Origen del Capital"],
          ["paisOrigenCapital", "País de Origen del Capital"]
        ].map(([key, label]) => /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label, aiFieldPath: `empresa.${key}`, children: key === "fechaInscripcionRrPp" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "date",
            ...aiFieldAttrs(`empresa.${key}`, label),
            value: ficha.empresa[key],
            onChange: (e) => patchEmp(key, e.target.value)
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            ...aiFieldAttrs(`empresa.${key}`, label),
            value: ficha.empresa[key],
            onChange: (e) => patchEmp(key, e.target.value)
          }
        ) }, key)) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "tributos", className: "mt-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      DynamicArrayBlock,
      {
        title: "Tributo Afecto",
        items: ficha.tributosAfectos,
        onAdd: () => patch({ tributosAfectos: [...ficha.tributosAfectos, emptyTributoAfecto()] }),
        onRemove: (i) => patch({
          tributosAfectos: ficha.tributosAfectos.filter((_, idx) => idx !== i)
        }),
        renderItem: (row, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(FormGrid, { children: [
          ["tributo", "Tributo"],
          ["fechaAlta", "Fecha de alta"],
          ["afectoDesde", "Afecto desde"],
          ["marcaExoneracion", "Marca de Exoneración"],
          ["exoneracionDesde", "Exoneración desde"],
          ["hasta", "Hasta"],
          ["modificacion", "Modificación"]
        ].map(([key, label]) => /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: key.includes("fecha") || key === "hasta" ? "date" : "text",
            value: row[key],
            onChange: (e) => {
              const list = [...ficha.tributosAfectos];
              list[i] = { ...list[i], [key]: e.target.value };
              patch({ tributosAfectos: list });
            }
          }
        ) }, key)) })
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "representantes", className: "mt-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      DynamicArrayBlock,
      {
        title: "Representante Legal",
        items: ficha.representantesLegales,
        onAdd: () => patch({
          representantesLegales: [...ficha.representantesLegales, emptyRepresentante()]
        }),
        onRemove: (i) => patch({
          representantesLegales: ficha.representantesLegales.filter((_, idx) => idx !== i)
        }),
        renderItem: (row, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(FormGrid, { children: [
          ["tipoNroDoc", "Tipo y Nro.Doc."],
          ["apellidosNombres", "Apellidos y Nombres"],
          ["fechaNacimiento", "Fecha de Nacimiento"],
          ["cargo", "Cargo"],
          ["fechaDesde", "Fecha Desde"],
          ["nroOrdenRepresentacion", "Nro. Orden de Representación"]
        ].map(([key, label]) => /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: key.includes("fecha") ? "date" : "text",
            value: row[key],
            onChange: (e) => {
              const list = [...ficha.representantesLegales];
              list[i] = { ...list[i], [key]: e.target.value };
              patch({ representantesLegales: list });
            }
          }
        ) }, key)) })
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "vinculados", className: "mt-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      DynamicArrayBlock,
      {
        title: "Otras Personas Vinculadas",
        items: ficha.personasVinculadas,
        onAdd: () => patch({
          personasVinculadas: [...ficha.personasVinculadas, emptyPersonaVinculada()]
        }),
        onRemove: (i) => patch({
          personasVinculadas: ficha.personasVinculadas.filter((_, idx) => idx !== i)
        }),
        renderItem: (row, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(FormGrid, { children: [
          ["tipoNroDoc", "Tipo y Nro.Doc."],
          ["apellidosNombres", "Apellidos y Nombres"],
          ["fechaNacimiento", "Fecha de Nacimiento"],
          ["vinculo", "Vínculo"],
          ["fechaDesde", "Fecha Desde"],
          ["residencia", "Residencia"],
          ["porcentaje", "Porcentaje"]
        ].map(([key, label]) => /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: key.includes("fecha") ? "date" : "text",
            value: row[key],
            onChange: (e) => {
              const list = [...ficha.personasVinculadas];
              list[i] = { ...list[i], [key]: e.target.value };
              patch({ personasVinculadas: list });
            }
          }
        ) }, key)) })
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "establecimientos", className: "mt-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      DynamicArrayBlock,
      {
        title: "Establecimientos Anexos",
        items: ficha.establecimientosAnexos,
        onAdd: () => patch({
          establecimientosAnexos: [
            ...ficha.establecimientosAnexos,
            emptyEstablecimiento()
          ]
        }),
        onRemove: (i) => patch({
          establecimientosAnexos: ficha.establecimientosAnexos.filter(
            (_, idx) => idx !== i
          )
        }),
        renderItem: (row, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(FormGrid, { children: [
          ["codigo", "Código"],
          ["tipo", "Tipo"],
          ["denominacion", "Denominación"],
          ["ubigeo", "Ubigeo"],
          ["domicilio", "Domicilio"],
          ["otrasReferencias", "Otras Referencias"],
          ["condLegal", "Cond.Legal"],
          ["licenciaMunicipal", "Licencia Municipal"],
          ["actEcon", "Act. Econ."],
          ["modificacion", "Modificación"]
        ].map(([key, label]) => /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: row[key],
            onChange: (e) => {
              const list = [...ficha.establecimientosAnexos];
              list[i] = { ...list[i], [key]: e.target.value };
              patch({ establecimientosAnexos: list });
            }
          }
        ) }, key)) })
      }
    ) })
  ] });
}
const CACHE_PREFIX = "sunat_cache_";
const RATE_KEY = "sunat_rate_limit";
const MAX_PER_MINUTE = 10;
const FACTORES = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
const NOMBRES = ["JUAN", "MARIA", "JOSE", "CARMEN", "LUIS", "ANA", "CARLOS", "ROSA", "JORGE", "GLORIA"];
const APELLIDOS = ["GARCIA", "RODRIGUEZ", "LOPEZ", "MARTINEZ", "HERNANDEZ", "DIAZ", "TORRES", "RAMIREZ", "FLORES", "MORALES"];
const FANTASIAS = ["ANDINO", "PACIFICO", "CONTINENTAL", "UNIVERSAL", "ATLANTICO", "CORDILLERA", "AMAZONAS", "SOL", "ESTRELLA", "CONDOR"];
const ACTIVIDADES = [
  { codigo: "4711", descripcion: "VENTA AL POR MENOR EN COMERCIOS NO ESPECIALIZADOS" },
  { codigo: "5610", descripcion: "ACTIVIDADES DE RESTAURANTES Y DE SERVICIO MOVIL DE COMIDAS" },
  { codigo: "6201", descripcion: "PROGRAMACION INFORMATICA" },
  { codigo: "7020", descripcion: "ACTIVIDADES DE CONSULTORIA DE GESTION" },
  { codigo: "4520", descripcion: "MANTENIMIENTO Y REPARACION DE VEHICULOS AUTOMOTORES" },
  { codigo: "4110", descripcion: "CONSTRUCCION DE EDIFICIOS" },
  { codigo: "4923", descripcion: "TRANSPORTE DE CARGA POR CARRETERA" },
  { codigo: "6910", descripcion: "ACTIVIDADES JURIDICAS" },
  { codigo: "6920", descripcion: "ACTIVIDADES DE CONTABILIDAD, TENEDURIA DE LIBROS Y AUDITORIA" },
  { codigo: "7310", descripcion: "PUBLICIDAD" }
];
const DEPARTAMENTOS = {
  LIMA: {
    provincias: ["LIMA", "CALLAO", "CAÑETE", "HUARAL"],
    distritos: ["MIRAFLORES", "SAN ISIDRO", "SURCO", "LA MOLINA", "SAN BORJA", "BARRANCO", "MAGDALENA", "LINCE"]
  },
  AREQUIPA: {
    provincias: ["AREQUIPA", "CAYLLOMA", "ISLAY"],
    distritos: ["CERCADO", "YANAHUARA", "CAYMA", "SACHACA"]
  },
  CUSCO: {
    provincias: ["CUSCO", "URUBAMBA"],
    distritos: ["CUSCO", "WANCHAQ", "SANTIAGO"]
  }
};
function seeded(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = s * 16807 % 2147483647;
    return (s - 1) / 2147483646;
  };
}
function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}
function calcularDigitoVerificador(ruc10) {
  const digits = ruc10.split("").map(Number);
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += digits[i] * FACTORES[i];
  }
  const resto = sum % 11;
  if (resto === 0) return 0;
  if (resto === 1) return 1;
  return 11 - resto;
}
function validarRuc(ruc) {
  const clean = ruc.replace(/\D/g, "").slice(0, 11);
  const errores = [];
  const warnings = [];
  if (clean.length !== 11) errores.push("El RUC debe tener exactamente 11 dígitos numéricos.");
  if (!/^\d+$/.test(clean)) errores.push("El RUC solo puede contener números.");
  const prefix = clean.slice(0, 2);
  const validPrefixes = ["10", "15", "16", "17", "20"];
  if (clean.length === 11 && !validPrefixes.includes(prefix)) {
    warnings.push(`Prefijo ${prefix} no es un tipo SUNAT habitual (10, 15, 16, 17, 20).`);
  }
  let digitoCalculado = 0;
  let digito = 0;
  if (clean.length === 11) {
    digito = Number(clean[10]);
    if (prefix === "10" || prefix === "20") {
      digitoCalculado = calcularDigitoVerificador(clean.slice(0, 10));
      if (digito !== digitoCalculado) {
        errores.push(
          `Dígito verificador incorrecto (esperado ${digitoCalculado}, recibido ${digito}).`
        );
      }
    } else {
      warnings.push("Validación de dígito verificador omitida para este tipo de RUC.");
    }
  }
  return {
    esValido: errores.length === 0 && clean.length === 11,
    ruc: clean,
    digitoVerificador: digito,
    digitoVerificadorCalculado: digitoCalculado,
    errores,
    warnings
  };
}
function cacheGet(ruc) {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${ruc}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function cacheSet(ruc, data) {
  localStorage.setItem(
    `${CACHE_PREFIX}${ruc}`,
    JSON.stringify({ data, ts: Date.now(), estado: data.estadoContribuyente })
  );
}
function checkRateLimit() {
  const now = Date.now();
  const windowMs = 6e4;
  let bucket;
  try {
    bucket = JSON.parse(localStorage.getItem(RATE_KEY) ?? '{"ts":0,"count":0}');
  } catch {
    bucket = { ts: now, count: 0 };
  }
  if (now - bucket.ts > windowMs) bucket = { ts: now, count: 0 };
  if (bucket.count >= MAX_PER_MINUTE) {
    return { ok: false, restantes: 0, waitMs: windowMs - (now - bucket.ts) };
  }
  bucket.count += 1;
  localStorage.setItem(RATE_KEY, JSON.stringify(bucket));
  return { ok: true, restantes: MAX_PER_MINUTE - bucket.count, waitMs: 0 };
}
function generarDatosSimulados(ruc, razonSocialExistente) {
  const seed = parseInt(ruc, 10) || 20100000001;
  const rng = seeded(seed);
  const tipo = ruc.slice(0, 2);
  const act = pick(rng, ACTIVIDADES);
  const deptKey = pick(rng, Object.keys(DEPARTAMENTOS));
  const dept = DEPARTAMENTOS[deptKey];
  const prov = pick(rng, dept.provincias);
  const dist = pick(rng, dept.distritos);
  let razonSocial;
  if (razonSocialExistente) {
    razonSocial = razonSocialExistente;
  } else if (tipo === "10") {
    const ap = pick(rng, APELLIDOS);
    const nom = pick(rng, NOMBRES);
    razonSocial = rng() > 0.5 ? `${ap} ${nom}, ${pick(rng, NOMBRES)}` : `${ap} ${nom}`;
  } else {
    const fant = pick(rng, FANTASIAS);
    razonSocial = pick(rng, [
      `${fant} SERVICIOS GENERALES S.A.C.`,
      `${fant} COMERCIAL S.R.L.`,
      `INVERSIONES ${fant} E.I.R.L.`,
      `CORPORACION ${fant} S.A.`
    ]).replace("{NOMBRE_FANTASIA}", fant);
  }
  const year = 2005 + Math.floor(rng() * 18);
  const mes = 1 + Math.floor(rng() * 12);
  const dia = 1 + Math.floor(rng() * 28);
  const fechaInscripcion = `${year}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
  const estados = ["ACTIVO", "ACTIVO", "ACTIVO", "SUSPENSION_TEMPORAL", "BAJA_DEFINITIVA"];
  const estado = estados[Math.floor(rng() * estados.length)];
  return {
    ruc,
    razonSocial,
    nombreComercial: rng() > 0.35 ? `${pick(rng, FANTASIAS)} GROUP` : void 0,
    tipoContribuyente: tipo === "10" ? "PERSONA_NATURAL" : tipo === "20" ? "SOCIEDAD_ANONIMA" : "OTRO",
    estadoContribuyente: estado,
    fechaInscripcion,
    fechaInicioActividades: fechaInscripcion,
    actividadEconomicaPrincipal: act,
    actividadesEconomicasSecundarias: rng() > 0.5 ? [pick(rng, ACTIVIDADES)] : [],
    domicilioFiscal: {
      direccion: `AV. ${pick(rng, FANTASIAS)} ${100 + Math.floor(rng() * 900)}`,
      departamento: deptKey,
      provincia: prov,
      distrito: dist,
      ubigeo: String(150100 + Math.floor(rng() * 50)).padStart(6, "0")
    },
    representantesLegales: tipo !== "10" ? [
      {
        nombre: `${pick(rng, APELLIDOS)} ${pick(rng, NOMBRES)} ${pick(rng, APELLIDOS)}`,
        cargo: "GERENTE GENERAL",
        fechaDesde: fechaInscripcion,
        tipoDocumento: "DNI",
        numeroDocumento: String(1e7 + Math.floor(rng() * 89999999))
      }
    ] : [],
    tributosAfectos: [
      { codigo: "1000", descripcion: "IGV", desde: fechaInscripcion },
      { codigo: "2000", descripcion: "RENTA", desde: fechaInscripcion }
    ],
    establecimientos: [
      {
        codigo: "0000",
        tipo: "DOMICILIO FISCAL",
        direccion: `AV. ${pick(rng, FANTASIAS)} ${100 + Math.floor(rng() * 900)}`,
        departamento: deptKey,
        provincia: prov,
        distrito: dist
      }
    ],
    fechaActualizacion: (/* @__PURE__ */ new Date()).toISOString()
  };
}
async function fetchFromDb(ruc) {
  const { data } = await supabase.from("fichas_ruc").select("*").eq("ruc", ruc).maybeSingle();
  if (!data?.razon_social) return null;
  const row = data;
  return {
    ruc,
    razonSocial: String(row.razon_social ?? ""),
    nombreComercial: row.nombre_comercial ? String(row.nombre_comercial) : void 0,
    tipoContribuyente: "OTRO",
    estadoContribuyente: mapEstado(String(row.estado_contribuyente ?? "ACTIVO")),
    fechaInscripcion: String(row.fecha_inscripcion ?? "").slice(0, 10) || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
    fechaInicioActividades: String(row.fecha_inicio_actividades ?? row.fecha_inscripcion ?? "").slice(0, 10),
    actividadEconomicaPrincipal: {
      codigo: "0000",
      descripcion: String(row.actividad_economica_principal ?? row.actividad_economica ?? "")
    },
    actividadesEconomicasSecundarias: [],
    domicilioFiscal: {
      direccion: String(row.tipo_via ?? ""),
      departamento: String(row.departamento ?? ""),
      provincia: String(row.provincia ?? ""),
      distrito: String(row.distrito ?? ""),
      ubigeo: ""
    },
    representantesLegales: [],
    tributosAfectos: [],
    establecimientos: [],
    fechaActualizacion: String(row.ultima_actualizacion ?? row.updated_at ?? (/* @__PURE__ */ new Date()).toISOString())
  };
}
function mapEstado(e) {
  const u = e.toUpperCase();
  if (u.includes("SUSP")) return "SUSPENSION_TEMPORAL";
  if (u.includes("BAJA")) return "BAJA_DEFINITIVA";
  if (u.includes("NO")) return "NO_HALLADO";
  return "ACTIVO";
}
function cacheTtl(estado) {
  return estado === "BAJA_DEFINITIVA" ? 7 * 24 * 36e5 : 24 * 36e5;
}
function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
function mapDecolectaToSunatRucData(d) {
  const principalAct = d.actividad_economica || d.actividadEconomica || "";
  let actCod = "0000";
  let actDesc = principalAct;
  const digits = principalAct.match(/\d+/);
  if (digits) {
    actCod = digits[0];
  }
  const parseDate = (val) => {
    if (!val) return "";
    const cleanVal = String(val).trim();
    if (cleanVal.includes("/")) {
      const parts = cleanVal.split("/");
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
      }
    }
    return cleanVal;
  };
  const mapTipoContribuyente = (val) => {
    const u = String(val || "").toUpperCase();
    if (u.includes("NATURAL")) return "PERSONA_NATURAL";
    if (u.includes("ANONIMA") || u.includes("S.A.")) return "SOCIEDAD_ANONIMA";
    if (u.includes("COMERCIAL") || u.includes("S.R.L.")) return "SOCIEDAD_COMERCIAL";
    return "OTRO";
  };
  return {
    ruc: d.numero_documento || d.numeroDocumento || d.ruc || "",
    razonSocial: (d.razon_social || d.razonSocial || "").trim().toUpperCase(),
    nombreComercial: d.nombre_comercial || d.nombreComercial || void 0,
    tipoContribuyente: mapTipoContribuyente(d.tipo || d.tipo_contribuyente || d.tipoContribuyente || ""),
    estadoContribuyente: mapEstado(d.estado || d.estado_contribuyente || "ACTIVO"),
    condicionDomicilioFiscal: d.condicion || d.condicion_domicilio_fiscal || "HABIDO",
    fechaInscripcion: parseDate(d.fecha_inscripcion || d.fechaInscripcion),
    fechaInicioActividades: parseDate(d.fecha_inicio_actividades || d.fechaInicioActividades || d.fecha_inicio_actividad),
    actividadEconomicaPrincipal: {
      codigo: actCod,
      descripcion: actDesc
    },
    actividadesEconomicasSecundarias: [],
    domicilioFiscal: {
      direccion: d.direccion || d.otras_referencias || "",
      departamento: d.departamento || "",
      provincia: d.provincia || "",
      distrito: d.distrito || "",
      ubigeo: d.ubigeo || ""
    },
    representantesLegales: (d.representantes_legales || d.representantes || []).map((r) => ({
      nombre: r.nombre || r.apellidos_nombres || "",
      cargo: r.cargo || "",
      fechaDesde: parseDate(r.desde || r.fecha_desde),
      tipoDocumento: r.tipoDocumento || r.tipo_documento || "DNI",
      numeroDocumento: r.numero || r.numero_documento || ""
    })),
    tributosAfectos: (d.tributos_afectos || d.tributos || []).map((t) => ({
      codigo: t.codigo || "0000",
      descripcion: t.descripcion || t.tributo || "",
      desde: parseDate(t.fecha || t.fecha_alta)
    })),
    establecimientos: (d.locales_anexos || d.establecimientos || []).map((e, idx) => ({
      codigo: e.codigo || String(idx).padStart(4, "0"),
      tipo: e.tipo || "ESTABLECIMIENTO",
      direccion: e.direccion || e.domicilio || "",
      departamento: e.departamento || "",
      provincia: e.provincia || "",
      distrito: e.distrito || ""
    })),
    fechaActualizacion: (/* @__PURE__ */ new Date()).toISOString()
  };
}
async function consultarRucSunat(ruc, options) {
  const validation = validarRuc(ruc);
  if (!validation.esValido) {
    return {
      success: false,
      error: validation.errores.join(" "),
      metadata: { timestamp: (/* @__PURE__ */ new Date()).toISOString(), source: "DATOS_SIMULADOS" }
    };
  }
  const clean = validation.ruc;
  if (!options?.forzarActualizacion) {
    const cached = cacheGet(clean);
    if (cached) {
      const age = Date.now() - cached.ts;
      if (age < cacheTtl(cached.estado)) {
        return {
          success: true,
          data: cached.data,
          metadata: {
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            source: "CACHE_LOCAL",
            cacheAge: Math.round(age / 1e3)
          }
        };
      }
    }
    const dbData = await fetchFromDb(clean);
    if (dbData?.razonSocial && dbData.fechaInscripcion) {
      cacheSet(clean, dbData);
      return {
        success: true,
        data: dbData,
        metadata: { timestamp: (/* @__PURE__ */ new Date()).toISOString(), source: "DATOS_SIRE" }
      };
    }
  }
  let rate = checkRateLimit();
  if (!rate.ok) {
    await delay(Math.min(rate.waitMs, 5e3));
    rate = checkRateLimit();
    if (!rate.ok) {
      return {
        success: false,
        error: "Límite de consultas alcanzado. Intente en un minuto.",
        metadata: {
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          source: "DATOS_SIMULADOS",
          consultasRestantes: 0
        }
      };
    }
  }
  try {
    const { data: resData, error: fnError } = await supabase.functions.invoke("consultar-ruc", {
      body: { ruc: clean }
    });
    if (fnError) throw fnError;
    if (resData && resData.data) {
      const mappedData = mapDecolectaToSunatRucData(resData.data);
      cacheSet(clean, mappedData);
      return {
        success: true,
        data: mappedData,
        metadata: {
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          source: "API_SUNAT",
          consultasRestantes: rate.restantes
        }
      };
    }
  } catch (err) {
    console.warn("No se pudo obtener datos de la API real, usando simulación local:", err);
  }
  await delay(1e3 + Math.floor(Math.random() * 2e3));
  let razonSocialExistente;
  try {
    const { data: dbContribuyente } = await supabase.from("contribuyentes").select("razon_social").eq("ruc", clean).maybeSingle();
    if (dbContribuyente?.razon_social) {
      razonSocialExistente = dbContribuyente.razon_social;
    }
  } catch {
  }
  const data = generarDatosSimulados(clean, razonSocialExistente);
  cacheSet(clean, data);
  return {
    success: true,
    data,
    metadata: {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      source: "DATOS_SIMULADOS",
      consultasRestantes: rate.restantes
    }
  };
}
function getEstadoActualizacionBadge(ultimaActualizacion) {
  if (!ultimaActualizacion) return "NUNCA_ACTUALIZADA";
  const days = (Date.now() - new Date(ultimaActualizacion).getTime()) / 864e5;
  if (days > 90) return "DESACTUALIZADA_90_DIAS";
  if (days > 30) return "DESACTUALIZADA_30_DIAS";
  return "ACTUALIZADA";
}
function mergeSunatIntoFicha(ficha, sunat) {
  const actPrincipal = `${sunat.actividadEconomicaPrincipal.codigo} - ${sunat.actividadEconomicaPrincipal.descripcion}`;
  return {
    ...ficha,
    general: {
      ...ficha.general,
      razonSocial: sunat.razonSocial || ficha.general.razonSocial,
      tipoContribuyente: mapTipoSunat(sunat.tipoContribuyente),
      estadoContribuyente: sunat.estadoContribuyente.replace(/_/g, " "),
      condicionDomicilioFiscal: sunat.condicionDomicilioFiscal || ficha.general.condicionDomicilioFiscal,
      fechaInscripcion: sunat.fechaInscripcion || ficha.general.fechaInscripcion,
      fechaInicioActividades: sunat.fechaInicioActividades || ficha.general.fechaInicioActividades
    },
    modificacionContribuyente: {
      ...ficha.modificacionContribuyente,
      nombreComercial: sunat.nombreComercial ?? ficha.modificacionContribuyente.nombreComercial,
      actividadEconomicaPrincipal: actPrincipal,
      actividadEconomicaSecundaria1: sunat.actividadesEconomicasSecundarias[0] ? `${sunat.actividadesEconomicasSecundarias[0].codigo} - ${sunat.actividadesEconomicasSecundarias[0].descripcion}` : ficha.modificacionContribuyente.actividadEconomicaSecundaria1
    },
    domicilioFiscal: {
      ...ficha.domicilioFiscal,
      departamento: sunat.domicilioFiscal.departamento,
      provincia: sunat.domicilioFiscal.provincia,
      distrito: sunat.domicilioFiscal.distrito,
      tipoNombreVia: sunat.domicilioFiscal.direccion,
      actividadEconomica: actPrincipal
    },
    tributosAfectos: sunat.tributosAfectos.map((t) => ({
      id: uid(),
      tributo: `${t.codigo} - ${t.descripcion}`,
      fechaAlta: "",
      afectoDesde: t.desde,
      marcaExoneracion: "NO",
      exoneracionDesde: "",
      hasta: "",
      modificacion: ""
    })),
    representantesLegales: sunat.representantesLegales.map((r) => ({
      id: uid(),
      tipoNroDoc: `${r.tipoDocumento} - ${r.numeroDocumento}`,
      apellidosNombres: r.nombre,
      fechaNacimiento: "",
      cargo: r.cargo,
      fechaDesde: r.fechaDesde,
      nroOrdenRepresentacion: "1"
    })),
    establecimientosAnexos: sunat.establecimientos.map((e) => ({
      id: uid(),
      codigo: e.codigo,
      tipo: e.tipo,
      denominacion: e.tipo,
      ubigeo: "",
      domicilio: e.direccion,
      otrasReferencias: `${e.distrito}, ${e.provincia}`,
      condLegal: "",
      licenciaMunicipal: "",
      actEcon: "",
      modificacion: ""
    }))
  };
}
function mapTipoSunat(t) {
  const map = {
    PERSONA_NATURAL: "PERSONA NATURAL CON NEGOCIO",
    SOCIEDAD_ANONIMA: "PERSONA JURIDICA",
    SOCIEDAD_COMERCIAL: "PERSONA JURIDICA",
    OTRO: "OTROS"
  };
  return map[t] ?? t;
}
async function obtenerFichaCompleta(ruc) {
  const ficha = await fetchFichaByRuc(ruc);
  const meta = await obtenerMetaFicha(ruc);
  return { ficha, meta };
}
async function obtenerMetaFicha(ruc) {
  const { data } = await supabase.from("fichas_ruc").select("*").eq("ruc", ruc).maybeSingle();
  if (!data) return {};
  const row = data;
  const ultima = String(row.ultima_actualizacion ?? row.updated_at ?? "");
  return {
    datosIncompletos: Boolean(row.datos_incompletos),
    fuenteDatos: String(row.fuente_datos ?? "MANUAL"),
    ultimaActualizacion: ultima || null,
    ultimaActividad: row.ultima_actividad ? String(row.ultima_actividad) : null,
    cantidadComprobantes: Number(row.cantidad_comprobantes ?? 0),
    totalCompras12m: Number(row.total_compras_12m ?? 0),
    totalVentas12m: Number(row.total_ventas_12m ?? 0),
    estadoActualizacion: getEstadoActualizacionBadge(ultima)
  };
}
async function actualizarFichaDesdeSunat(ruc, forzar = false) {
  const res = await consultarRucSunat(ruc, { forzarActualizacion: forzar });
  if (!res.success || !res.data) throw new Error(res.error ?? "Consulta SUNAT fallida");
  const existing = await fetchFichaByRuc(ruc) ?? emptyFichaRuc(ruc, res.data.razonSocial);
  const merged = mergeSunatIntoFicha(existing, res.data);
  const row = {
    ...fichaToDbRow(merged),
    fuente_datos: res.metadata.source === "DATOS_SIMULADOS" ? "SUNAT_SIMULADO" : "SUNAT",
    datos_incompletos: false,
    ultima_actualizacion: (/* @__PURE__ */ new Date()).toISOString()
  };
  const saved = await upsertFichaRuc(merged);
  try {
    await supabase.from("fichas_ruc").update(row).eq("ruc", ruc.replace(/\D/g, "").slice(0, 11));
    if (res.data.tributosAfectos.length) {
      await supabase.from("tributos_afectos").delete().eq("ruc", ruc);
      await supabase.from("tributos_afectos").insert(tributosToDb(ruc, merged.tributosAfectos));
    }
    if (res.data.representantesLegales.length) {
      await supabase.from("representantes_legales").delete().eq("ruc", ruc);
      await supabase.from("representantes_legales").insert(representantesToDb(ruc, merged.representantesLegales));
    }
    if (res.data.establecimientos.length) {
      await supabase.from("establecimientos_anexos").delete().eq("ruc", ruc);
      await supabase.from("establecimientos_anexos").insert(establecimientosToDb(ruc, merged.establecimientosAnexos));
    }
  } catch {
  }
  return saved;
}
async function obtenerEstadisticasContribuyente(ruc, periodo) {
  const year = periodo?.slice(0, 4) ?? (/* @__PURE__ */ new Date()).getFullYear().toString();
  const rows = await fetchRegistrosSireRows({ ruc, limit: 5e3 });
  const yearRows = rows.filter((r) => String(r.periodo ?? "").startsWith(year));
  let compras = 0;
  let ventas = 0;
  let nCompras = 0;
  let nVentas = 0;
  for (const r of yearRows) {
    const monto = Number(r.mto_total_cp ?? r.importe_total ?? 0);
    if (r.tipo === "COMPRA") {
      compras += monto;
      nCompras += 1;
    } else if (r.tipo === "VENTA") {
      ventas += monto;
      nVentas += 1;
    }
  }
  return { compras, ventas, nCompras, nVentas, year };
}
async function obtenerDashboard360(ruc, periodo) {
  const year = periodo?.slice(0, 4) ?? (/* @__PURE__ */ new Date()).getFullYear().toString();
  const periodoFilter = periodo ?? `${year}12`;
  const [stats, rows, deudas, movs, tareasRes] = await Promise.all([
    obtenerEstadisticasContribuyente(ruc, periodoFilter),
    fetchRegistrosSireRows({ ruc, limit: 500 }),
    fetchDeudasPendientes({ ruc }).catch(() => []),
    fetchMovimientosCaja({ ruc, periodo: periodoFilter }).catch(() => []),
    supabase.from("tareas_pendientes").select("id", { count: "exact", head: true }).eq("ruc", ruc).in("estado", ["pendiente", "en_progreso"])
  ]);
  const ratio = stats.compras > 0 ? stats.ventas / stats.compras : stats.ventas > 0 ? 99 : 0;
  const ratioSalud = ratio >= 1.5 ? "SALUDABLE" : ratio >= 0.8 ? "ATENCION" : "RIESGOSO";
  const byMonth = /* @__PURE__ */ new Map();
  for (let m = 1; m <= 12; m++) {
    byMonth.set(String(m).padStart(2, "0"), { compras: 0, ventas: 0 });
  }
  for (const r of rows) {
    const p = String(r.periodo ?? "");
    if (!p.startsWith(year)) continue;
    const mes = p.slice(4, 6);
    const prev = byMonth.get(mes) ?? { compras: 0, ventas: 0 };
    const monto = Number(r.mto_total_cp ?? r.importe_total ?? 0);
    if (r.tipo === "COMPRA") prev.compras += monto;
    else prev.ventas += monto;
    byMonth.set(mes, prev);
  }
  const actividadMensual = [...byMonth.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([mes, v]) => ({ mes, ...v }));
  const sparklineCompras = actividadMensual.map((x) => x.compras);
  const sparklineVentas = actividadMensual.map((x) => x.ventas);
  const ultimosComprobantes = rows.slice(0, 50).map((r) => ({
    id: String(r.id ?? ""),
    fecha: String(r.fecha_emision ?? "").slice(0, 10),
    tipo: String(r.tipo ?? ""),
    comprobante: `${r.cod_tipo_cdp ?? ""}-${r.serie_cdp ?? ""}-${r.nro_cdp_inicial ?? ""}`,
    monto: Number(r.mto_total_cp ?? r.importe_total ?? 0),
    estado: String(r.estado_validacion ?? r.estado_cobro ?? r.estado_pago ?? "—")
  }));
  let saldoCxc = 0;
  let saldoCxp = 0;
  for (const d of deudas) {
    if (d.tipo === "VENTA") saldoCxc += d.saldoPendiente;
    else saldoCxp += d.saldoPendiente;
  }
  return {
    ruc,
    periodo: periodoFilter,
    comprasAnio: Math.round(stats.compras * 100) / 100,
    ventasAnio: Math.round(stats.ventas * 100) / 100,
    comprobantesCompra: stats.nCompras,
    comprobantesVenta: stats.nVentas,
    ratioComercial: Math.round(ratio * 100) / 100,
    ratioSalud,
    sparklineCompras,
    sparklineVentas,
    tendenciaComprasPct: 0,
    tendenciaVentasPct: 0,
    ultimosComprobantes,
    actividadMensual,
    saldoCxc: Math.round(saldoCxc * 100) / 100,
    saldoCxp: Math.round(saldoCxp * 100) / 100,
    movimientosCajaRecientes: movs.slice(-10).map((m) => ({
      id: m.id,
      fecha: String(m.fecha_operacion ?? m.fecha ?? "").slice(0, 10),
      glosa: m.glosa,
      neto: Number(m.haber ?? 0) - Number(m.debe ?? 0)
    })),
    tareasPendientes: tareasRes.count ?? 0
  };
}
async function buscarContribuyentes(termino) {
  const t = termino.trim();
  if (t.length < 2) return [];
  const digits = t.replace(/\D/g, "");
  let q = supabase.from("fichas_ruc").select("ruc, razon_social, estado_contribuyente, fuente_datos").limit(20);
  if (digits.length >= 2) {
    q = q.ilike("ruc", `${digits}%`);
  } else {
    q = q.ilike("razon_social", `%${t}%`);
  }
  const { data, error } = await q;
  if (error || !data?.length) {
    const fichas = await fetchAllFichas();
    return Object.values(fichas).filter(
      (f) => f.ruc.includes(digits) || f.general.razonSocial.toUpperCase().includes(t.toUpperCase())
    ).slice(0, 20).map((f) => ({
      ruc: f.ruc,
      razonSocial: f.general.razonSocial,
      estadoContribuyente: f.general.estadoContribuyente,
      fuenteDatos: "MANUAL"
    }));
  }
  return data.map((r) => ({
    ruc: String(r.ruc),
    razonSocial: String(r.razon_social ?? r.ruc),
    estadoContribuyente: String(r.estado_contribuyente ?? "ACTIVO"),
    fuenteDatos: String(r.fuente_datos ?? "MANUAL")
  }));
}
async function compararContribuyentes(ruc1, ruc2) {
  const [ficha1, ficha2, dashboard1, dashboard2] = await Promise.all([
    fetchFichaByRuc(ruc1),
    fetchFichaByRuc(ruc2),
    obtenerDashboard360(ruc1).catch(() => null),
    obtenerDashboard360(ruc2).catch(() => null)
  ]);
  const campos = [
    { campo: "Razón social", v1: ficha1?.general.razonSocial ?? "—", v2: ficha2?.general.razonSocial ?? "—" },
    { campo: "Estado", v1: ficha1?.general.estadoContribuyente ?? "—", v2: ficha2?.general.estadoContribuyente ?? "—" },
    { campo: "Departamento", v1: ficha1?.domicilioFiscal.departamento ?? "—", v2: ficha2?.domicilioFiscal.departamento ?? "—" },
    { campo: "Compras año", v1: String(dashboard1?.comprasAnio ?? 0), v2: String(dashboard2?.comprasAnio ?? 0) },
    { campo: "Ventas año", v1: String(dashboard1?.ventasAnio ?? 0), v2: String(dashboard2?.ventasAnio ?? 0) },
    { campo: "CXC", v1: String(dashboard1?.saldoCxc ?? 0), v2: String(dashboard2?.saldoCxc ?? 0) },
    { campo: "CXP", v1: String(dashboard1?.saldoCxp ?? 0), v2: String(dashboard2?.saldoCxp ?? 0) }
  ];
  const diferencias = campos.filter((c) => c.v1 !== c.v2).map((c) => ({ campo: c.campo, valor1: c.v1, valor2: c.v2 }));
  return { ruc1, ruc2, ficha1, ficha2, dashboard1, dashboard2, diferencias };
}
function useFichaCompleta(ruc) {
  return useQuery({
    queryKey: ["ficha-ruc", "completa", ruc],
    queryFn: () => obtenerFichaCompleta(ruc.trim()),
    enabled: !!ruc?.trim(),
    staleTime: 30 * 6e4
  });
}
function useConsultarSunat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ruc, forzar }) => actualizarFichaDesdeSunat(ruc, forzar ?? false),
    onSuccess: async (_, { ruc }) => {
      await qc.invalidateQueries({ queryKey: ["ficha-ruc"] });
      await qc.invalidateQueries({ queryKey: ["contribuyentes"] });
      await qc.invalidateQueries({ queryKey: ["ficha-ruc", "completa", ruc] });
    }
  });
}
function useDashboard360(ruc, periodo, enabled = true) {
  return useQuery({
    queryKey: ["ficha-ruc", "dashboard360", ruc, periodo ?? null],
    queryFn: () => obtenerDashboard360(ruc.trim(), periodo?.trim() ?? void 0),
    enabled: enabled && !!ruc?.trim(),
    staleTime: 5 * 6e4
  });
}
function useBuscarContribuyentes(termino) {
  return useQuery({
    queryKey: ["ficha-ruc", "buscar", termino],
    queryFn: () => buscarContribuyentes(termino),
    enabled: termino.trim().length >= 2,
    staleTime: 6e4
  });
}
function useCompararContribuyentes(ruc1, ruc2) {
  return useQuery({
    queryKey: ["ficha-ruc", "comparar", ruc1, ruc2],
    queryFn: () => compararContribuyentes(ruc1, ruc2),
    enabled: !!ruc1?.trim() && !!ruc2?.trim() && ruc1 !== ruc2
  });
}
function fmt$1(n) {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN", maximumFractionDigits: 0 }).format(n);
}
function EstadoBadge({ estado }) {
  const u = estado.toUpperCase();
  const cls = u.includes("ACTIVO") && !u.includes("INACTIV") ? "bg-[#00C897]/20 text-[#00C897] border-[#00C897]/40" : u.includes("SUSP") ? "bg-[#F0A500]/20 text-[#F0A500] border-[#F0A500]/40" : "bg-[#FF5E7A]/20 text-[#FF5E7A] border-[#FF5E7A]/40";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: cn("font-medium", cls), children: u.includes("ACTIVO") && !u.includes("INACTIV") ? "🟢 ACTIVO" : u.includes("SUSP") ? "🟡 SUSPENSIÓN" : "🔴 " + estado });
}
function FuenteBadge({ fuente, meta }) {
  const f = fuente ?? meta?.fuenteDatos ?? "MANUAL";
  if (f.includes("SUNAT")) return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "border-emerald-500/40 text-emerald-400", children: "SUNAT ✓" });
  if (f.includes("SIRE")) return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "border-amber-500/40 text-amber-400", children: "SIRE ⚠" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "border-red-500/40 text-red-400", children: "MANUAL" });
}
function KpiCard({
  label,
  value,
  sub,
  spark,
  tone
}) {
  const data = spark.map((v, i) => ({ i, v }));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-4 hover:scale-[1.02] transition-transform", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[#8899B4]", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-2xl font-semibold mt-1 text-[#E8EDF5]", children: value }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LineChart, { data, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { type: "monotone", dataKey: "v", stroke: tone, strokeWidth: 1.5, dot: false }) }) }) }),
    sub ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-[#8899B4] mt-1", children: sub }) : null
  ] });
}
function TabSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-48 rounded-xl bg-white/5" });
}
function Contribuyente360ViewPremium({
  ruc,
  periodo,
  onEdit
}) {
  const [tab, setTab] = reactExports.useState("dashboard");
  const { data: completa, isLoading: loadingFicha } = useFichaCompleta(ruc);
  const consultar = useConsultarSunat();
  const dashEnabled = tab === "dashboard" || tab === "comprobantes" || tab === "cxc_cxp" || tab === "caja";
  const { data: dash, isLoading: loadingDash } = useDashboard360(ruc, periodo ?? null, dashEnabled);
  const ficha = completa?.ficha;
  const meta = completa?.meta;
  const direccion = reactExports.useMemo(() => {
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
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-40 rounded-2xl bg-white/5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-28 bg-white/5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-28 bg-white/5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-28 bg-white/5" })
      ] })
    ] });
  }
  const desactualizada = meta?.estadoActualizacion?.includes("DESACTUALIZADA");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "rounded-2xl border border-[#1A2740]/50 p-4 md:p-6 space-y-4",
      style: { background: "linear-gradient(180deg, #060B14 0%, #080E1E 100%)" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs tracking-widest text-[#8899B4]", children: "📋 EXPEDIENTE DEL CONTRIBUYENTE" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-[#1A2740]/50 bg-[#0D1525]/80 backdrop-blur-xl p-5 grid md:grid-cols-[1fr_auto] gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl md:text-2xl font-bold text-[#C8A44D]", children: ficha?.general.razonSocial || ruc }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-[#E8EDF5]", children: [
                "RUC: ",
                ruc
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(EstadoBadge, { estado: ficha?.general.estadoContribuyente ?? "ACTIVO" }),
              desactualizada ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "border-amber-500/50 text-amber-400 text-[10px]", children: "Desactualizada" }) : null
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-[#8899B4] flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "size-3" }),
              " ",
              direccion
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-[#8899B4]", children: [
              "🏭 ",
              actividad
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-[#8899B4]", children: [
              "📅 Última actividad: ",
              meta?.ultimaActividad ? new Date(meta.ultimaActividad).toLocaleDateString("es-PE") : "—",
              " · ",
              "📊 ",
              meta?.cantidadComprobantes ?? dash?.comprobantesCompra ?? 0,
              " comprobantes"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2 items-end", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FuenteBadge, { meta }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-[#8899B4]", children: [
              "Actualizado: ",
              meta?.ultimaActualizacion ? new Date(meta.ultimaActualizacion).toLocaleString("es-PE") : "Nunca"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 justify-end", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  size: "sm",
                  variant: "outline",
                  className: "border-[#00C897]/40 text-[#00C897]",
                  disabled: consultar.isPending,
                  onClick: () => void handleSunat(),
                  children: [
                    consultar.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "size-4" }),
                    "SUNAT"
                  ]
                }
              ),
              onEdit ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "ghost", onClick: onEdit, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "size-4" }),
                " Editar"
              ] }) : null,
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "size-4" }) })
            ] })
          ] })
        ] }),
        loadingDash ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabSkeleton, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabSkeleton, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabSkeleton, {})
        ] }) : dash ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-3 motion-safe:animate-in motion-safe:fade-in", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            KpiCard,
            {
              label: `💰 Compras ${periodo?.slice(0, 4) ?? (/* @__PURE__ */ new Date()).getFullYear()}`,
              value: fmt$1(dash.comprasAnio),
              sub: `${dash.comprobantesCompra} comprobantes`,
              spark: dash.sparklineCompras,
              tone: "#00C8FF"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            KpiCard,
            {
              label: `💵 Ventas ${periodo?.slice(0, 4) ?? (/* @__PURE__ */ new Date()).getFullYear()}`,
              value: fmt$1(dash.ventasAnio),
              sub: `${dash.comprobantesVenta} comprobantes`,
              spark: dash.sparklineVentas,
              tone: "#9B87F5"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            KpiCard,
            {
              label: "📈 Ratio Ventas/Compras",
              value: `${dash.ratioComercial}x`,
              sub: dash.ratioSalud === "SALUDABLE" ? "🟢 Saludable" : dash.ratioSalud === "ATENCION" ? "🟡 A revisar" : "🔴 Riesgoso",
              spark: dash.sparklineVentas.map((v, i) => dash.sparklineCompras[i] ? v / dash.sparklineCompras[i] : 0),
              tone: "#C8A44D"
            }
          )
        ] }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: tab, onValueChange: (v) => setTab(v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "flex flex-wrap h-auto gap-1 bg-white/[0.03]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "dashboard", children: "📊 Dashboard" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "sunat", children: "📋 Datos SUNAT" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "representantes", children: "👤 Representantes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "establecimientos", children: "🏢 Establecimientos" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "comprobantes", children: "📄 Comprobantes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "cxc_cxp", children: "💰 CXC/CXP" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "caja", children: "💳 Caja" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "dashboard", className: "mt-4 motion-safe:animate-in motion-safe:slide-in-from-right-2", children: loadingDash || !dash ? /* @__PURE__ */ jsxRuntimeExports.jsx(TabSkeleton, {}) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/[0.06] bg-white/[0.02] p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold mb-3", children: "Actividad mensual" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-48", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: dash.actividadMensual, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "mes", tick: { fontSize: 10 } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: { fontSize: 10 } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, {}),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "compras", fill: "#00C8FF", name: "Compras" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "ventas", fill: "#9B87F5", name: "Ventas" })
              ] }) }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/[0.06] bg-white/[0.02] p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold mb-3", children: "Distribución" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-48", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Pie,
                  {
                    data: [
                      { name: "Compras", value: dash.comprasAnio },
                      { name: "Ventas", value: dash.ventasAnio }
                    ],
                    dataKey: "value",
                    innerRadius: 40,
                    outerRadius: 70,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: "#00C8FF" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: "#9B87F5" })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v) => fmt$1(v) })
              ] }) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 mt-2 text-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-white/[0.03] p-2", children: [
                  "CXC: ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: fmt$1(dash.saldoCxc) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-white/[0.03] p-2", children: [
                  "CXP: ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: fmt$1(dash.saldoCxp) })
                ] })
              ] })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "sunat", className: "mt-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid md:grid-cols-2 gap-3 text-sm", children: [
              ["Razón social", ficha?.general.razonSocial],
              ["Tipo", ficha?.general.tipoContribuyente],
              ["Estado", ficha?.general.estadoContribuyente],
              ["Inscripción", ficha?.general.fechaInscripcion],
              ["Inicio actividades", ficha?.general.fechaInicioActividades],
              ["Nombre comercial", ficha?.modificacionContribuyente.nombreComercial],
              ["Actividad principal", actividad],
              ["Departamento", ficha?.domicilioFiscal.departamento],
              ["Provincia", ficha?.domicilioFiscal.provincia],
              ["Distrito", ficha?.domicilioFiscal.distrito]
            ].map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-[#8899B4]", children: k }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[#E8EDF5]", children: v || "—" })
            ] }, String(k))) }),
            ficha?.tributosAfectos.length ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { className: "mt-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Tributo" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Desde" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: ficha.tributosAfectos.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: t.tributo }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: t.afectoDesde || "—" })
              ] }, t.id)) })
            ] }) : null
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "representantes", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid sm:grid-cols-2 gap-3", children: (ficha?.representantesLegales ?? []).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[#8899B4]", children: "Sin representantes registrados" }) : ficha.representantesLegales.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 flex gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "size-8 text-[#C8A44D] shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-[#E8EDF5]", children: r.apellidosNombres }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[#8899B4]", children: r.cargo }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-mono text-[#8899B4]", children: r.tipoNroDoc }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-[#8899B4]", children: [
                "Desde ",
                r.fechaDesde || "—"
              ] })
            ] })
          ] }, r.id)) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "establecimientos", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid sm:grid-cols-2 gap-3", children: (ficha?.establecimientosAnexos ?? []).map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-white/[0.06] bg-white/[0.02] p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs text-[#00C8FF]", children: e.codigo }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-[#8899B4]", children: e.tipo })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mt-2 text-[#E8EDF5]", children: e.domicilio || e.denominacion }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-[#8899B4]", children: e.otrasReferencias })
          ] }, e.id)) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "comprobantes", className: "mt-4", children: loadingDash ? /* @__PURE__ */ jsxRuntimeExports.jsx(TabSkeleton, {}) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Fecha" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Tipo" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Comprobante" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Monto" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Estado" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: (dash?.ultimosComprobantes ?? []).slice(0, 50).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "hover:bg-white/[0.03]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: c.fecha }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: c.tipo }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: c.comprobante }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right font-mono", children: fmt$1(c.monto) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: c.estado })
            ] }, c.id)) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "cxc_cxp", className: "mt-4", children: dash ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[#8899B4]", children: "Por cobrar (CXC)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-2xl text-emerald-400", children: fmt$1(dash.saldoCxc) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-red-500/20 bg-red-500/5 p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[#8899B4]", children: "Por pagar (CXP)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-2xl text-red-400", children: fmt$1(dash.saldoCxp) })
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TabSkeleton, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "caja", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Fecha" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Glosa" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right", children: "Neto" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: (dash?.movimientosCajaRecientes ?? []).map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: m.fecha }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "max-w-[200px] truncate", children: m.glosa }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: cn("text-right font-mono", m.neto >= 0 ? "text-emerald-400" : "text-red-400"), children: fmt$1(m.neto) })
            ] }, m.id)) })
          ] }) })
        ] })
      ]
    }
  );
}
function fmt(n) {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN", maximumFractionDigits: 0 }).format(n);
}
function RucSearchComparePremium({
  onSelectRuc,
  initialRuc
}) {
  const navigate = useNavigate();
  const inputRef = reactExports.useRef(null);
  const [termino, setTermino] = reactExports.useState("");
  const [debounced, setDebounced] = reactExports.useState("");
  const [compareA, setCompareA] = reactExports.useState(initialRuc ?? "");
  const [compareB, setCompareB] = reactExports.useState("");
  const [showCompare, setShowCompare] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const t = setTimeout(() => setDebounced(termino), 400);
    return () => clearTimeout(t);
  }, [termino]);
  reactExports.useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "r") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  const { data: resultados, isLoading } = useBuscarContribuyentes(debounced);
  const { data: comparacion, isLoading: loadingCmp } = useCompararContribuyentes(
    showCompare ? compareA : null,
    showCompare ? compareB : null
  );
  const validation = reactExports.useMemo(() => {
    const digits = termino.replace(/\D/g, "");
    if (digits.length === 11) return validarRuc(digits);
    return null;
  }, [termino]);
  const goToFicha = (ruc) => {
    if (onSelectRuc) onSelectRuc(ruc);
    else void navigate({ to: "/ficha-ruc", search: { ruc, tab: "360" } });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "rounded-2xl border border-[#1A2740]/50 p-4 md:p-6 space-y-6",
      style: { background: "linear-gradient(180deg, #060B14 0%, #080E1E 100%)" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-lg font-semibold text-[#C8A44D] flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "size-5" }),
            " Búsqueda inteligente de RUC"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[#8899B4] mt-1", children: "Ctrl+Shift+R para enfocar · Autocompletado con debounce 400ms" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8899B4]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              ref: inputRef,
              value: termino,
              onChange: (e) => setTermino(e.target.value),
              placeholder: "Buscar por RUC o razón social…",
              className: "pl-10 bg-white/[0.03] border-white/[0.08] text-[#E8EDF5] placeholder:text-[#8899B4]",
              "aria-label": "Buscar contribuyente por RUC o razón social"
            }
          ),
          validation && !validation.esValido && termino.replace(/\D/g, "").length === 11 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-400 mt-1", children: validation.errores[0] }) : null
        ] }),
        isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-32 rounded-xl bg-white/5" }) : debounced.length >= 2 && resultados?.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "rounded-xl border border-white/[0.06] overflow-hidden divide-y divide-white/[0.04]", role: "listbox", children: resultados.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            role: "option",
            className: "w-full text-left px-4 py-3 hover:bg-cyan-500/5 transition-colors flex justify-between items-center gap-2",
            onClick: () => goToFicha(r.ruc),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-sm text-[#E8EDF5]", children: r.ruc }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[#8899B4] truncate", children: r.razonSocial })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "shrink-0 text-[10px]", children: r.estadoContribuyente || "ACTIVO" })
            ]
          }
        ) }, r.ruc)) }) : debounced.length >= 2 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[#8899B4] text-center py-6", children: "Sin coincidencias" }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-white/[0.06] pt-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "text-sm font-semibold flex items-center gap-2 text-[#E8EDF5] mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(GitCompare, { className: "size-4 text-[#C8A44D]" }),
            " Comparar contribuyentes"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 gap-3 mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: compareA,
                onChange: (e) => setCompareA(e.target.value.replace(/\D/g, "").slice(0, 11)),
                placeholder: "RUC 1",
                className: "font-mono bg-white/[0.03] border-white/[0.08]",
                "aria-label": "Primer RUC a comparar"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: compareB,
                onChange: (e) => setCompareB(e.target.value.replace(/\D/g, "").slice(0, 11)),
                placeholder: "RUC 2",
                className: "font-mono bg-white/[0.03] border-white/[0.08]",
                "aria-label": "Segundo RUC a comparar"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "sm",
              disabled: compareA.length !== 11 || compareB.length !== 11 || compareA === compareB,
              onClick: () => setShowCompare(true),
              children: "Comparar"
            }
          ),
          showCompare && loadingCmp ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-6 animate-spin mt-4 text-[#8899B4]" }) : comparacion ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 gap-3 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-white/[0.02] p-3 border border-white/[0.04]", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[#00C8FF]", children: comparacion.ruc1 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[#8899B4]", children: comparacion.ficha1?.general.razonSocial }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-mono mt-2", children: [
                  "Compras: ",
                  fmt(comparacion.dashboard1?.comprasAnio ?? 0)
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-mono", children: [
                  "Ventas: ",
                  fmt(comparacion.dashboard1?.ventasAnio ?? 0)
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-white/[0.02] p-3 border border-white/[0.04]", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[#9B87F5]", children: comparacion.ruc2 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[#8899B4]", children: comparacion.ficha2?.general.razonSocial }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-mono mt-2", children: [
                  "Compras: ",
                  fmt(comparacion.dashboard2?.comprasAnio ?? 0)
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-mono", children: [
                  "Ventas: ",
                  fmt(comparacion.dashboard2?.ventasAnio ?? 0)
                ] })
              ] })
            ] }),
            comparacion.diferencias.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Campo" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: comparacion.ruc1 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: comparacion.ruc2 })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: comparacion.diferencias.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium", children: d.campo }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: cn("text-[#00C8FF]"), children: d.valor1 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: cn("text-[#9B87F5]"), children: d.valor2 })
              ] }, d.campo)) })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[#8899B4]", children: "Los campos comparados son idénticos" })
          ] }) : null
        ] })
      ]
    }
  );
}
async function exportFichaPdf(ficha) {
  const {
    jsPDF
  } = await import("./jspdf.es.min-Deg6Vxwk.js").then((n) => n.j);
  const autoTable = (await import("./jspdf.plugin.autotable-Do1qGbTG.js")).default;
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(`Ficha RUC — ${ficha.ruc}`, 14, 16);
  autoTable(doc, {
    startY: 24,
    head: [["Campo", "Valor"]],
    body: [["Razón social", ficha.general.razonSocial], ["Tipo contribuyente", ficha.general.tipoContribuyente], ["Fecha inscripción", ficha.general.fechaInscripcion], ["Estado", ficha.general.estadoContribuyente], ["Departamento", ficha.domicilioFiscal.departamento], ["Provincia", ficha.domicilioFiscal.provincia], ["Distrito", ficha.domicilioFiscal.distrito], ["Domicilio", ficha.domicilioFiscal.tipoNombreVia]],
    styles: {
      fontSize: 9
    }
  });
  doc.save(`CONTAM_Ficha_RUC_${ficha.ruc}.pdf`);
}
function defaultPeriodo() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 7).replace("-", "");
}
function FichaRucPage() {
  const {
    tab: searchTab,
    ruc: searchRuc
  } = Route.useSearch();
  const {
    contribuyentes,
    getFicha,
    saveFicha,
    refresh
  } = useContribuyentes();
  const [pageTab, setPageTab] = reactExports.useState(searchTab);
  const [selectedRuc, setSelectedRuc] = reactExports.useState(searchRuc ?? "");
  const [draft, setDraft] = reactExports.useState(null);
  const [saving, setSaving] = reactExports.useState(false);
  const periodo = defaultPeriodo();
  const options = reactExports.useMemo(() => [...contribuyentes].sort((a, b) => a.razonSocial.localeCompare(b.razonSocial)), [contribuyentes]);
  reactExports.useEffect(() => {
    if (searchRuc) setSelectedRuc(searchRuc);
  }, [searchRuc]);
  reactExports.useEffect(() => {
    setPageTab(searchTab);
  }, [searchTab]);
  reactExports.useEffect(() => {
    if (!selectedRuc && options.length > 0) {
      setSelectedRuc(options[0].ruc);
    }
  }, [options, selectedRuc]);
  reactExports.useEffect(() => {
    if (!selectedRuc) {
      setDraft(null);
      return;
    }
    const existing = getFicha(selectedRuc);
    const c = contribuyentes.find((x) => x.ruc === selectedRuc);
    if (existing) {
      setDraft(structuredClone(existing));
    } else {
      setDraft(emptyFichaRuc(selectedRuc, c?.razonSocial ?? ""));
    }
  }, [selectedRuc, getFicha, contribuyentes]);
  const draftRef = reactExports.useRef(draft);
  draftRef.current = draft;
  const applyComposerFill = reactExports.useCallback((action) => {
    setDraft((prev) => prev ? applyFillToFicha(prev, action) : prev);
  }, []);
  const composerRegistration = reactExports.useMemo(() => {
    if (!draft || pageTab !== "editor") return null;
    return {
      pageId: "ficha-ruc",
      ruc: draft.ruc,
      title: "Ficha RUC — Editor",
      route: "/ficha-ruc",
      getFields: () => buildFichaFieldSnapshots(draftRef.current),
      applyFill: applyComposerFill
    };
  }, [draft, pageTab, applyComposerFill]);
  useRegisterAiComposerPage(composerRegistration, pageTab === "editor" && !!draft);
  const handleSave = async () => {
    if (!draft) return;
    const err = validateFichaRequired(draft);
    if (err) {
      toast.error(err);
      return;
    }
    setSaving(true);
    try {
      await saveFicha(draft);
      await refresh();
      toast.success(`Ficha RUC guardada (${getDataSourceLabel()})`);
    } catch (e) {
      toast.error(formatRequestError(e, "No se pudo guardar la ficha RUC"));
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 max-w-[1400px] mx-auto space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-wrap items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-display text-3xl font-semibold flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "size-8 text-primary" }),
          "Ficha RUC Premium"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-1 text-sm", children: "Expediente 360° · Consulta SUNAT · Enriquecimiento SIRE" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "mt-2 border-blue-500/50", children: getDataSourceLabel() })
      ] }),
      pageTab === "editor" && draft ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ExportButtons, { compact: true, onExportPdf: async () => exportFichaPdf(draft) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "lg", className: "bg-blue-700 hover:bg-blue-800", disabled: saving, onClick: () => void handleSave(), children: [
          saving ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 mr-2 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "size-4 mr-2" }),
          "Guardar ficha"
        ] })
      ] }) : null
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: pageTab, onValueChange: (v) => setPageTab(v), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "360", className: "gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutDashboard, { className: "size-4" }),
          " Vista 360°"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "editor", className: "gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "size-4" }),
          " Editor"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "buscar", className: "gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "size-4" }),
          " Buscar / Comparar"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card p-4 mt-4 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: "Contribuyente (RUC)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: selectedRuc || void 0, onValueChange: setSelectedRuc, disabled: options.length === 0, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-2 max-w-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Seleccione un RUC…" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: options.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: c.ruc, children: [
            c.ruc,
            " — ",
            c.razonSocial
          ] }, c.ruc)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "360", className: "mt-4", children: selectedRuc ? /* @__PURE__ */ jsxRuntimeExports.jsx(Contribuyente360ViewPremium, { ruc: selectedRuc, periodo, onEdit: () => setPageTab("editor") }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-muted-foreground py-12", children: "Seleccione un RUC para ver el expediente 360°." }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "editor", className: "mt-4", children: draft ? /* @__PURE__ */ jsxRuntimeExports.jsx(FichaRucForm, { ficha: draft, onChange: setDraft }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-muted-foreground py-12", children: "Seleccione un RUC para editar la ficha." }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "buscar", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RucSearchComparePremium, { initialRuc: selectedRuc, onSelectRuc: setSelectedRuc }) })
    ] })
  ] });
}
export {
  FichaRucPage as component
};
