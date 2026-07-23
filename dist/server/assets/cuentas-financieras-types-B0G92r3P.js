import { U as reactExports, L as jsxRuntimeExports } from "./server-B74aIV_r.js";
import { I as Input } from "./input-DSRp_ns6.js";
import { L as Label } from "./label-DgVY9oK6.js";
import { ac as supabase } from "./router-CrYSg7RR.js";
import { a as cn } from "./utils-8RO4xBwZ.js";
import { U as User } from "./user-DpXl7XoR.js";
import { S as Search } from "./search-BYzsTB4u.js";
import { L as LoaderCircle } from "./loader-circle-DrYsJpg5.js";
async function searchClientes(query) {
  const needle = query.trim();
  if (needle.length < 2) return [];
  const { data, error } = await supabase.from("contribuyentes").select(
    `
      ruc,
      razon_social,
      estado,
      fichas_ruc (
        estado_contribuyente,
        departamento,
        provincia,
        distrito,
        tipo_via,
        numero
      )
    `
  ).or(`ruc.ilike.%${needle}%,razon_social.ilike.%${needle}%`).order("razon_social", { ascending: true }).limit(30);
  if (error) {
    const { data: fallback, error: fbErr } = await supabase.from("contribuyentes").select("ruc, razon_social, estado").or(`ruc.ilike.%${needle}%,razon_social.ilike.%${needle}%`).order("razon_social", { ascending: true }).limit(30);
    if (fbErr) throw fbErr;
    return (fallback ?? []).map((c) => ({
      ruc: c.ruc,
      razonSocial: c.razon_social,
      estado: c.estado,
      source: "contribuyentes"
    }));
  }
  return (data ?? []).map((row) => {
    const fichaArr = row.fichas_ruc;
    const ficha = Array.isArray(fichaArr) ? fichaArr[0] : fichaArr;
    const parts = [
      ficha?.tipo_via,
      ficha?.numero,
      ficha?.distrito,
      ficha?.provincia,
      ficha?.departamento
    ].filter(Boolean).map(String);
    return {
      ruc: row.ruc,
      razonSocial: row.razon_social,
      estado: ficha?.estado_contribuyente ?? row.estado,
      direccion: parts.length ? parts.join(", ") : null,
      source: "contribuyentes"
    };
  });
}
function ClienteSearchCombobox({
  value,
  onSelect,
  required = false
}) {
  const [query, setQuery] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [results, setResults] = reactExports.useState([]);
  const [open, setOpen] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const rows = await searchClientes(query);
        setResults(rows);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs flex items-center gap-1 mb-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "size-3.5" }),
      "Cliente (RUC o razón social)",
      required ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive ml-0.5", children: "*" }) : null
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          className: "pl-9",
          placeholder: "Consulta en contribuyentes (mín. 2 caracteres)…",
          value: value ? `${value.ruc} — ${value.razonSocial}` : query,
          onChange: (e) => {
            onSelect(null);
            setQuery(e.target.value);
          },
          onFocus: () => {
            if (results.length > 0) setOpen(true);
          }
        }
      ),
      loading && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "absolute right-3 top-1/2 -translate-y-1/2 size-4 animate-spin text-muted-foreground" })
    ] }),
    open && results.length > 0 && !value && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute z-20 mt-1 w-full rounded-md border bg-popover shadow-md max-h-56 overflow-y-auto", children: results.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        className: cn(
          "flex w-full flex-col gap-0.5 px-3 py-2 text-sm hover:bg-accent text-left"
        ),
        onClick: () => {
          onSelect(c);
          setQuery("");
          setOpen(false);
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: c.ruc }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground ml-2", children: c.razonSocial })
          ] }),
          (c.direccion || c.estado) && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground truncate", children: [c.direccion, c.estado].filter(Boolean).join(" · ") })
        ]
      },
      c.ruc
    )) }),
    value && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        className: "text-xs text-muted-foreground mt-1 hover:text-foreground underline",
        onClick: () => onSelect(null),
        children: "Limpiar selección"
      }
    )
  ] });
}
function formatPeriodoInput(value) {
  return value.replace(/\D/g, "").slice(0, 6);
}
function EmpresaPeriodoFilters({
  cliente,
  onClienteChange,
  periodo,
  onPeriodoChange,
  periodoDefault
}) {
  const periodoValue = periodo || periodoDefault || "";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(ClienteSearchCombobox, { required: true, value: cliente, onSelect: onClienteChange }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs", children: [
        "Periodo (AAAAMM) ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          placeholder: "202605",
          value: periodoValue,
          onChange: (e) => onPeriodoChange(formatPeriodoInput(e.target.value))
        }
      )
    ] })
  ] });
}
function RequireRucEmptyState({ context }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-12 px-4 text-center text-sm text-muted-foreground rounded-lg border border-dashed bg-muted/20", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-foreground mb-1", children: "Selecciona un contribuyente (RUC)" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: context })
  ] });
}
const queryKeys = {
  libroDiario: (filters) => ["libro_diario", filters],
  libroCajaBancos: (ruc, periodo) => ["libro_caja_bancos", ruc, periodo ?? ""],
  cxcCxp: (ruc, periodo) => ["cxc_cxp", ruc, periodo ?? ""],
  cuentasFinancieras: (ruc) => ["cuentas_financieras", ruc],
  comprobantesPendientes: (ruc, periodo) => ["comprobantes_pendientes", ruc, periodo]
};
function invalidateLibrosContables(qc) {
  qc.invalidateQueries({ queryKey: ["libro_diario"] });
  qc.invalidateQueries({ queryKey: ["libro_caja_bancos"] });
  qc.invalidateQueries({ queryKey: ["cxc_cxp"] });
  qc.invalidateQueries({ queryKey: ["comprobantes_pendientes"] });
}
const SELECT = "id, ruc, nombre, tipo, cuenta_contable, banco, numero_cuenta, activo, created_at, updated_at";
const DEFAULTS = [
  {
    ruc: "",
    nombre: "Caja Chica Principal",
    tipo: "CAJA_CHICA",
    cuenta_contable: "101101",
    banco: null,
    numero_cuenta: null,
    activo: true
  },
  {
    ruc: "",
    nombre: "BCP — Cuenta Corriente",
    tipo: "BANCO",
    cuenta_contable: "104101",
    banco: "BCP",
    numero_cuenta: null,
    activo: true
  }
];
async function fetchCuentasFinancieras(ruc) {
  const clean = ruc.trim();
  if (!clean) return [];
  const { data, error } = await supabase.from("cuentas_financieras").select(SELECT).eq("ruc", clean).eq("activo", true).order("nombre");
  if (error) {
    if (error.code === "42P01") {
      return DEFAULTS.map((d, i) => ({
        ...d,
        ruc: clean,
        id: `local-${i}`,
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }));
    }
    throw error;
  }
  if ((data ?? []).length === 0) {
    await seedDefaults(clean);
    return fetchCuentasFinancieras(clean);
  }
  return data ?? [];
}
async function seedDefaults(ruc) {
  const rows = DEFAULTS.map((d) => ({ ...d, ruc }));
  const { error } = await supabase.from("cuentas_financieras").insert(rows);
  if (error && error.code !== "42P01") throw error;
}
async function upsertCuentaFinanciera(input) {
  const body = {
    ruc: input.ruc.trim(),
    nombre: input.nombre.trim(),
    tipo: input.tipo,
    cuenta_contable: input.cuenta_contable.trim(),
    banco: input.banco?.trim() || null,
    numero_cuenta: input.numero_cuenta?.trim() || null,
    activo: input.activo ?? true
  };
  if (input.id && !input.id.startsWith("local-")) {
    const { data: data2, error: error2 } = await supabase.from("cuentas_financieras").update(body).eq("id", input.id).select(SELECT).single();
    if (error2) throw error2;
    return data2;
  }
  const { data, error } = await supabase.from("cuentas_financieras").insert(body).select(SELECT).single();
  if (error) throw error;
  return data;
}
async function desactivarCuentaFinanciera(id) {
  const { error } = await supabase.from("cuentas_financieras").update({ activo: false }).eq("id", id);
  if (error) throw error;
}
const cuentasFinancierasService = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  desactivarCuentaFinanciera,
  fetchCuentasFinancieras,
  upsertCuentaFinanciera
}, Symbol.toStringTag, { value: "Module" }));
const MEDIOS_PAGO_SUNAT = [
  { codigo: "001", label: "Depósito en cuenta" },
  { codigo: "002", label: "Giro" },
  { codigo: "003", label: "Transferencia de fondos" },
  { codigo: "004", label: "Orden de pago" },
  { codigo: "005", label: "Tarjeta de débito" },
  { codigo: "006", label: "Tarjeta de crédito emitida en el país" },
  { codigo: "008", label: "Efectivo por operaciones en las que no existe obligación de utilizar medio de pago" },
  { codigo: "009", label: "Efectivo" }
];
export {
  EmpresaPeriodoFilters as E,
  MEDIOS_PAGO_SUNAT as M,
  RequireRucEmptyState as R,
  cuentasFinancierasService as c,
  desactivarCuentaFinanciera as d,
  fetchCuentasFinancieras as f,
  invalidateLibrosContables as i,
  queryKeys as q,
  upsertCuentaFinanciera as u
};
