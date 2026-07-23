import { U as reactExports, L as jsxRuntimeExports } from "./server-BIroHbvu.js";
const AiComposerContext = reactExports.createContext(null);
function AiComposerProvider({ children }) {
  const [registration, setRegistration] = reactExports.useState(null);
  const register = reactExports.useCallback((reg) => {
    setRegistration(reg);
  }, []);
  const unregister = reactExports.useCallback((pageId) => {
    setRegistration((prev) => prev?.pageId === pageId ? null : prev);
  }, []);
  const buildPageContext = reactExports.useCallback(() => {
    if (!registration) return void 0;
    return {
      page_id: registration.pageId,
      route: registration.route,
      ruc: registration.ruc,
      title: registration.title,
      fields: registration.getFields()
    };
  }, [registration]);
  const value = reactExports.useMemo(
    () => ({ registration, register, unregister, buildPageContext }),
    [registration, register, unregister, buildPageContext]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AiComposerContext.Provider, { value, children });
}
function useAiComposer() {
  const ctx = reactExports.useContext(AiComposerContext);
  if (!ctx) throw new Error("useAiComposer debe usarse dentro de AiComposerProvider");
  return ctx;
}
function useRegisterAiComposerPage(reg, enabled) {
  const { register, unregister } = useAiComposer();
  reactExports.useEffect(() => {
    if (!enabled || !reg) {
      if (reg?.pageId) unregister(reg.pageId);
      return;
    }
    register(reg);
    return () => unregister(reg.pageId);
  }, [enabled, reg, register, unregister]);
}
function aiFieldAttrs(fieldPath, label) {
  return {
    "data-ai-field": fieldPath,
    "data-ai-label": label
  };
}
const FICHA_FIELD_LABELS = {
  ruc: "RUC",
  "general.razonSocial": "Razón Social",
  "general.tipoContribuyente": "Tipo de Contribuyente",
  "general.fechaInscripcion": "Fecha de Inscripción",
  "general.fechaInicioActividades": "Fecha de Inicio de Actividades",
  "general.estadoContribuyente": "Estado del Contribuyente",
  "general.dependenciaSunat": "Dependencia SUNAT",
  "general.condicionDomicilioFiscal": "Condición Domicilio Fiscal",
  "general.emisorElectronicoDesde": "Emisor electrónico desde",
  "general.comprobantesElectronicos": "Comprobantes electrónicos",
  "general.fechaBaja": "Fecha de Baja",
  "modificacionContribuyente.nombreComercial": "Nombre Comercial",
  "modificacionContribuyente.tipoRepresentacion": "Tipo de Representación",
  "modificacionContribuyente.actividadEconomicaPrincipal": "Actividad Económica Principal",
  "modificacionContribuyente.actividadEconomicaSecundaria1": "Actividad Económica Secundaria 1",
  "modificacionContribuyente.actividadEconomicaSecundaria2": "Actividad Económica Secundaria 2",
  "modificacionContribuyente.sistemaEmisionComprobantes": "Sistema Emisión Comprobantes",
  "modificacionContribuyente.sistemaContabilidad": "Sistema de Contabilidad",
  "modificacionContribuyente.codigoProfesionOficio": "Código Profesión / Oficio",
  "modificacionContribuyente.actividadComercioExterior": "Actividad Comercio Exterior",
  "modificacionContribuyente.numeroFax": "Número Fax",
  "modificacionContribuyente.telefonoFijo1": "Teléfono Fijo 1",
  "modificacionContribuyente.telefonoFijo2": "Teléfono Fijo 2",
  "modificacionContribuyente.telefonoMovil1": "Teléfono Móvil 1",
  "modificacionContribuyente.telefonoMovil2": "Teléfono Móvil 2",
  "modificacionContribuyente.correoElectronico1": "Correo Electrónico 1",
  "modificacionContribuyente.correoElectronico2": "Correo Electrónico 2",
  "domicilioFiscal.actividadEconomica": "Actividad Económica",
  "domicilioFiscal.departamento": "Departamento",
  "domicilioFiscal.provincia": "Provincia",
  "domicilioFiscal.distrito": "Distrito",
  "domicilioFiscal.tipoNombreZona": "Tipo y Nombre Zona",
  "domicilioFiscal.tipoNombreVia": "Tipo y Nombre Vía",
  "domicilioFiscal.nroKmMzLote": "Nro / Km / Mz / Lote",
  "domicilioFiscal.otrasReferencias": "Otras Referencias",
  "domicilioFiscal.condicionInmueble": "Condición inmueble",
  "domicilioFiscal.licenciaMunicipal": "Licencia Municipal",
  "personaNatural.documentoIdentidad": "Documento de Identidad",
  "personaNatural.fechaNacimientoSucesion": "Fecha Nacimiento / Sucesión",
  "personaNatural.sexo": "Sexo",
  "personaNatural.pasaporte": "Pasaporte",
  "personaNatural.nacionalidad": "Nacionalidad",
  "personaNatural.paisProcedencia": "País Procedencia",
  "personaNatural.condDomiciliado": "Cond. Domiciliado",
  "empresa.fechaInscripcionRrPp": "Fecha Inscripción RR.PP.",
  "empresa.numeroPartidaRegistral": "Número Partida Registral",
  "empresa.tomoFichaFolioAsiento": "Tomo / Ficha / Folio",
  "empresa.origenCapital": "Origen Capital",
  "empresa.paisOrigenCapital": "País Origen Capital"
};
function getNestedValue(obj, path) {
  if (path === "ruc" && "ruc" in obj) return String(obj.ruc ?? "");
  const parts = path.split(".");
  let cur = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") return "";
    cur = cur[p];
  }
  return cur == null ? "" : String(cur);
}
function setNestedValue(obj, path, value) {
  if (path === "ruc") return { ...obj, ruc: value };
  const parts = path.split(".");
  if (parts.length !== 2) return obj;
  const [section, key] = parts;
  const block = { ...obj[section] ?? {}, [key]: value };
  return { ...obj, [section]: block };
}
function buildFichaFieldSnapshots(ficha) {
  const base = ficha;
  return Object.entries(FICHA_FIELD_LABELS).map(([field_path, label]) => ({
    field_path,
    label,
    value: getNestedValue(base, field_path)
  }));
}
function applyFillToFicha(ficha, action) {
  return setNestedValue(
    ficha,
    action.field_path,
    action.value
  );
}
function highlightComposerField(fieldPath, durationMs = 1200) {
  highlightField(fieldPath, "ai-composer-field-active", durationMs);
}
function highlightDebugField(fieldPath, durationMs = 1200) {
  highlightField(fieldPath, "ai-debug-field-active", durationMs);
}
function highlightField(fieldPath, className, durationMs) {
  const el = document.querySelector(`[data-ai-field="${CSS.escape(fieldPath)}"]`);
  if (!el) return;
  const wrap = document.querySelector(`[data-ai-field-wrap="${CSS.escape(fieldPath)}"]`);
  const target = wrap ?? el.parentElement ?? el;
  target.classList.add(className);
  target.scrollIntoView({ behavior: "smooth", block: "nearest" });
  window.setTimeout(() => target.classList.remove(className), durationMs);
}
function sleep(ms) {
  return new Promise((r) => window.setTimeout(r, ms));
}
async function applyFillActionsProgressive(actions, applyOne, onStep, delayMs, highlightFn = highlightComposerField) {
  let applied = 0;
  for (let i = 0; i < actions.length; i++) {
    const action = actions[i];
    onStep(action, i, actions.length);
    applyOne(action);
    highlightFn(action.field_path);
    applied += 1;
    if (i < actions.length - 1 && delayMs > 0) await sleep(delayMs);
  }
  return applied;
}
const COMPOSER_LOADING_STEPS = [
  "Conectando con la base de datos (solo lectura)…",
  "Leyendo tabla fichas_ruc…",
  "Validando Clave SOL vía API SUNAT…",
  "Mapeando campos del formulario…",
  "Preparando plan de relleno seguro…"
];
const DEBUG_LOADING_STEPS = [
  "Revisando campos rellenados por Composer…",
  "Comparando con fichas_ruc (BD read-only)…",
  "Detectando valores incorrectos o vacíos…",
  "Preparando correcciones…"
];
export {
  AiComposerProvider as A,
  COMPOSER_LOADING_STEPS as C,
  DEBUG_LOADING_STEPS as D,
  aiFieldAttrs as a,
  applyFillActionsProgressive as b,
  applyFillToFicha as c,
  buildFichaFieldSnapshots as d,
  useRegisterAiComposerPage as e,
  highlightDebugField as h,
  useAiComposer as u
};
