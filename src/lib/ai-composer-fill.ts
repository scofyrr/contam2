import type { FichaRuc } from "@/lib/contribuyentes-types";
import type { AiFillAction, AiPageFieldSnapshot } from "@/lib/ai-chat-api";

/** Atributos data-ai-* para marcar campos rellenables por Composer. */
export function aiFieldAttrs(fieldPath: string, label: string) {
  return {
    "data-ai-field": fieldPath,
    "data-ai-label": label,
  } as const;
}

const FICHA_FIELD_LABELS: Record<string, string> = {
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
  "empresa.paisOrigenCapital": "País Origen Capital",
};

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  if (path === "ruc" && "ruc" in obj) return String(obj.ruc ?? "");
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") return "";
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur == null ? "" : String(cur);
}

function setNestedValue<T extends Record<string, unknown>>(obj: T, path: string, value: string): T {
  if (path === "ruc") return { ...obj, ruc: value } as T;
  const parts = path.split(".");
  if (parts.length !== 2) return obj;
  const [section, key] = parts as [string, string];
  const block = { ...((obj[section] as Record<string, string>) ?? {}), [key]: value };
  return { ...obj, [section]: block } as T;
}

export function buildFichaFieldSnapshots(ficha: FichaRuc): AiPageFieldSnapshot[] {
  const base = ficha as unknown as Record<string, unknown>;
  return Object.entries(FICHA_FIELD_LABELS).map(([field_path, label]) => ({
    field_path,
    label,
    value: getNestedValue(base, field_path),
  }));
}

export function applyFillToFicha(ficha: FichaRuc, action: AiFillAction): FichaRuc {
  return setNestedValue(
    ficha as unknown as Record<string, unknown>,
    action.field_path,
    action.value,
  ) as unknown as FichaRuc;
}

export function highlightComposerField(fieldPath: string, durationMs = 1200): void {
  highlightField(fieldPath, "ai-composer-field-active", durationMs);
}

export function highlightDebugField(fieldPath: string, durationMs = 1200): void {
  highlightField(fieldPath, "ai-debug-field-active", durationMs);
}

function highlightField(fieldPath: string, className: string, durationMs: number): void {
  const el = document.querySelector(`[data-ai-field="${CSS.escape(fieldPath)}"]`);
  if (!el) return;
  const wrap = document.querySelector(`[data-ai-field-wrap="${CSS.escape(fieldPath)}"]`);
  const target = (wrap ?? (el as HTMLElement).parentElement ?? el) as HTMLElement;
  target.classList.add(className);
  target.scrollIntoView({ behavior: "smooth", block: "nearest" });
  window.setTimeout(() => target.classList.remove(className), durationMs);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => window.setTimeout(r, ms));
}

/** Relleno/corrección progresiva con callback por campo. */
export async function applyFillActionsProgressive(
  actions: AiFillAction[],
  applyOne: (action: AiFillAction) => void,
  onStep: (action: AiFillAction, index: number, total: number) => void,
  delayMs: number,
  highlightFn: (fieldPath: string) => void = highlightComposerField,
): Promise<number> {
  let applied = 0;
  for (let i = 0; i < actions.length; i++) {
    const action = actions[i]!;
    onStep(action, i, actions.length);
    applyOne(action);
    highlightFn(action.field_path);
    applied += 1;
    if (i < actions.length - 1 && delayMs > 0) await sleep(delayMs);
  }
  return applied;
}

export const COMPOSER_LOADING_STEPS = [
  "Conectando con la base de datos (solo lectura)…",
  "Leyendo tabla fichas_ruc…",
  "Validando Clave SOL vía API SUNAT…",
  "Mapeando campos del formulario…",
  "Preparando plan de relleno seguro…",
] as const;

export const DEBUG_LOADING_STEPS = [
  "Revisando campos rellenados por Composer…",
  "Comparando con fichas_ruc (BD read-only)…",
  "Detectando valores incorrectos o vacíos…",
  "Preparando correcciones…",
] as const;
