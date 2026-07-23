import { U as reactExports, L as jsxRuntimeExports } from "./server-BOhk-Jwv.js";
import { u as useQuery } from "./useQuery-GwWd8T8C.js";
import { B as Badge } from "./badge-R7vlE0zl.js";
import { B as Button } from "./button-D82ZRVfS.js";
import { I as Input } from "./input-Dd5Cl0P5.js";
import { L as Label } from "./label-RwV7o-pk.js";
import { P as Progress } from "./progress-CZqzYq6n.js";
import { S as Select, c as SelectTrigger, d as SelectValue, a as SelectContent, b as SelectItem } from "./select-BAtobcg4.js";
import { T as Table, d as TableHeader, e as TableRow, c as TableHead, a as TableBody, b as TableCell } from "./table-D2g8SVZq.js";
import { T as Tabs, b as TabsList, c as TabsTrigger, a as TabsContent } from "./tabs-C5yJfdlB.js";
import { T as Textarea } from "./textarea-DrawpDgB.js";
import { m as useContribuyentes } from "./use-contribuyentes-CgGZLenc.js";
import { a as cn } from "./utils-8RO4xBwZ.js";
import { ab as supabase, ac as throwIfSupabaseError, aq as useQueryClient, ai as toast } from "./router-B2oVQHub.js";
import { u as useMutation } from "./useMutation-DD5rBZOv.js";
import { S as Scale } from "./scale-CDGgGODT.js";
import { P as Plus } from "./plus-C29oSYCs.js";
import { L as LoaderCircle } from "./loader-circle-D9KbOhZE.js";
import { S as ShieldAlert } from "./shield-alert-D2lRuoSc.js";
import { T as TriangleAlert } from "./triangle-alert-C9v1hrNU.js";
import { F as FileText } from "./file-text-CB40SY06.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-CE2u8TBR.js";
import "./index-CRO2D6uM.js";
import "./Combination-zo30HTiN.js";
import "./chevron-up-CdlYVDxF.js";
import "./index-D5JWF47-.js";
import "./index-CLwIwY0T.js";
import "./contribuyentes-service-DhFtq9J9.js";
import "./http-client-BVL7nK2k.js";
const db = supabase;
function parseLibrosAfectados(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const o = item;
    return {
      codigoLibroTabla8: String(o.codigoLibroTabla8 ?? o.codigo_libro_tabla8 ?? ""),
      nombreLibro: String(o.nombreLibro ?? o.nombre_libro ?? ""),
      foliosAfectados: o.foliosAfectados ? String(o.foliosAfectados) : o.folios_afectados ? String(o.folios_afectados) : void 0,
      observaciones: o.observaciones ? String(o.observaciones) : void 0
    };
  });
}
function mapContingencia(row) {
  return {
    id: row.id,
    contribuyenteId: row.contribuyente_id,
    fechaOcurrencia: row.fecha_ocurrencia,
    fechaDenunciaPolicial: row.fecha_denuncia_policial,
    numeroDenunciaPolicial: row.numero_denuncia_policial,
    comisaria: row.comisaria,
    motivo: row.motivo,
    librosAfectados: parseLibrosAfectados(row.libros_afectados),
    fechaLimiteComunicacion15d: row.fecha_limite_comunicacion_15d,
    fechaComunicacionSunat: row.fecha_comunicacion_sunat,
    numeroExpedienteSunat: row.numero_expediente_sunat,
    fechaLimiteReconstruccion60d: row.fecha_limite_reconstruccion_60d,
    fechaFinalizacionReconstruccion: row.fecha_finalizacion_reconstruccion,
    prorrogaSolicitada: row.prorroga_solicitada,
    fechaSolicitudProrroga: row.fecha_solicitud_prorroga,
    estadoContingencia: row.estado_contingencia,
    observaciones: row.observaciones,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
async function countFoliosUtilizados(legalizacionId) {
  const { count, error } = await db.from("control_folios").select("id", { count: "exact", head: true }).eq("legalizacion_id", legalizacionId).in("estado_folio", ["IMPRESO", "ANULADO", "RESERVADO"]);
  throwIfSupabaseError(error, "Error al contar folios");
  return count ?? 0;
}
function mapLegalizacion(row, foliosUtilizados) {
  const totalFolios = row.folios_hasta - row.folios_desde + 1;
  const porcentaje = totalFolios > 0 ? Math.round(foliosUtilizados / totalFolios * 1e4) / 100 : 0;
  return {
    id: row.id,
    contribuyenteId: row.contribuyente_id,
    codigoLibroTabla8: row.codigo_libro_tabla8,
    nombreLibro: row.nombre_libro,
    numeroLegalizacion: row.numero_legalizacion,
    notariaJuzgado: row.notaria_juzgado,
    fechaLegalizacion: row.fecha_legalizacion,
    foliosDesde: row.folios_desde,
    foliosHasta: row.folios_hasta,
    tipoLlevado: row.tipo_llevado,
    estado: row.estado,
    totalFolios,
    foliosUtilizados,
    porcentajeUtilizado: porcentaje,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
async function fetchLegalizaciones(contribuyenteId) {
  const { data, error } = await db.from("legalizaciones_notariales").select("*").eq("contribuyente_id", contribuyenteId).order("fecha_legalizacion", { ascending: false });
  throwIfSupabaseError(error, "Error al cargar legalizaciones");
  const rows = data ?? [];
  const result = [];
  for (const row of rows) {
    const utilizados = await countFoliosUtilizados(row.id);
    result.push(mapLegalizacion(row, utilizados));
  }
  return result;
}
async function registrarLegalizacionNotarial(legalizacion) {
  const row = {
    contribuyente_id: legalizacion.contribuyenteId,
    codigo_libro_tabla8: legalizacion.codigoLibroTabla8,
    nombre_libro: legalizacion.nombreLibro,
    numero_legalizacion: legalizacion.numeroLegalizacion,
    notaria_juzgado: legalizacion.notariaJuzgado,
    fecha_legalizacion: legalizacion.fechaLegalizacion,
    folios_desde: legalizacion.foliosDesde,
    folios_hasta: legalizacion.foliosHasta,
    tipo_llevado: legalizacion.tipoLlevado ?? "HOJAS_SUELTAS",
    estado: legalizacion.estado ?? "ACTIVO"
  };
  const { data, error } = await db.from("legalizaciones_notariales").insert(row).select("*").single();
  throwIfSupabaseError(error, "Error al registrar legalización");
  const inserted = data;
  return mapLegalizacion(inserted, 0);
}
async function fetchContingencias(contribuyenteId) {
  const { data, error } = await db.from("contingencias_libros").select("*").eq("contribuyente_id", contribuyenteId).order("fecha_ocurrencia", { ascending: false });
  throwIfSupabaseError(error, "Error al cargar contingencias");
  return (data ?? []).map(mapContingencia);
}
async function registrarContingencia(payload) {
  const librosJson = payload.librosAfectados.map((l) => ({
    codigo_libro_tabla8: l.codigoLibroTabla8,
    nombre_libro: l.nombreLibro,
    folios_afectados: l.foliosAfectados ?? null,
    observaciones: l.observaciones ?? null
  }));
  const { data, error } = await db.rpc("fn_registrar_contingencia_libro", {
    p_contribuyente_id: payload.contribuyenteId,
    p_fecha_ocurrencia: payload.fechaOcurrencia,
    p_motivo: payload.motivo,
    p_libros_afectados: librosJson,
    p_num_denuncia: payload.numeroDenunciaPolicial ?? null,
    p_comisaria: payload.comisaria ?? null
  });
  throwIfSupabaseError(error, "Error al registrar contingencia");
  if (!data) throw new Error("Sin respuesta al registrar contingencia");
  const row = data;
  if (payload.observaciones && row.contingencia_id) {
    await db.from("contingencias_libros").update({ observaciones: payload.observaciones }).eq("id", String(row.contingencia_id));
  }
  return {
    ok: Boolean(row.ok),
    contingenciaId: String(row.contingencia_id),
    fechaLimiteComunicacion15d: String(row.fecha_limite_comunicacion_15d),
    fechaLimiteReconstruccion60d: String(row.fecha_limite_reconstruccion_60d),
    estadoContingencia: String(row.estado_contingencia)
  };
}
function mapSemaforoAlerta(raw) {
  return {
    contingenciaId: String(raw.contingencia_id),
    motivo: String(raw.motivo),
    estado: String(raw.estado),
    fechaOcurrencia: String(raw.fecha_ocurrencia),
    fechaLimiteComunicacion: String(raw.fecha_limite_comunicacion),
    fechaLimiteReconstruccion: String(raw.fecha_limite_reconstruccion),
    fechaComunicacionSunat: raw.fecha_comunicacion_sunat ? String(raw.fecha_comunicacion_sunat) : null,
    fechaFinalizacionReconstruccion: raw.fecha_finalizacion_reconstruccion ? String(raw.fecha_finalizacion_reconstruccion) : null,
    numeroDenunciaPolicial: raw.numero_denuncia_policial ? String(raw.numero_denuncia_policial) : null,
    librosAfectados: parseLibrosAfectados(raw.libros_afectados),
    diasHabilesTranscurridos: raw.dias_habiles_transcurridos != null ? Number(raw.dias_habiles_transcurridos) : null,
    diasRestantesComunicacion: raw.dias_restantes_comunicacion != null ? Number(raw.dias_restantes_comunicacion) : null,
    diasRestantesReconstruccion: raw.dias_restantes_reconstruccion != null ? Number(raw.dias_restantes_reconstruccion) : null,
    semaforo: String(raw.semaforo),
    fechaLimite: String(raw.fecha_limite)
  };
}
async function fetchSemaforoContingencias(contribuyenteId) {
  const { data, error } = await db.rpc("fn_obtener_semaforo_contingencias", {
    p_contribuyente_id: contribuyenteId
  });
  throwIfSupabaseError(error, "Error al obtener semáforo");
  if (!data) throw new Error("Semáforo vacío");
  const row = data;
  const resumenRaw = row.resumen ?? {};
  const alertasRaw = row.alertas ?? [];
  return {
    contribuyenteId: String(row.contribuyente_id),
    fechaEvaluacion: String(row.fecha_evaluacion),
    resumen: {
      totalActivas: Number(resumenRaw.total_activas ?? 0),
      rojas: Number(resumenRaw.rojas ?? 0),
      amarillas: Number(resumenRaw.amarillas ?? 0),
      verdes: Number(resumenRaw.verdes ?? 0)
    },
    alertas: alertasRaw.map(mapSemaforoAlerta)
  };
}
async function fetchContribuyenteIdByRucCf(ruc) {
  const clean = ruc.replace(/\D/g, "").slice(0, 11);
  const { data, error } = await supabase.from("contribuyentes").select("id").eq("ruc", clean).maybeSingle();
  throwIfSupabaseError(error, "Error al buscar contribuyente");
  return data?.id ?? null;
}
const controlFormalQueryKeys = {
  all: ["control-formal"],
  legalizaciones: (contribuyenteId) => ["control-formal", "legalizaciones", contribuyenteId],
  contingencias: (contribuyenteId) => ["control-formal", "contingencias", contribuyenteId],
  semaforo: (contribuyenteId) => ["control-formal", "semaforo", contribuyenteId]
};
function useLegalizaciones(contribuyenteId, enabled = true) {
  return useQuery({
    queryKey: controlFormalQueryKeys.legalizaciones(contribuyenteId),
    queryFn: () => fetchLegalizaciones(contribuyenteId),
    enabled: enabled && !!contribuyenteId,
    staleTime: 3e4,
    refetchOnWindowFocus: true
  });
}
function useContingencias(contribuyenteId, enabled = true) {
  return useQuery({
    queryKey: controlFormalQueryKeys.contingencias(contribuyenteId),
    queryFn: () => fetchContingencias(contribuyenteId),
    enabled: enabled && !!contribuyenteId,
    staleTime: 2e4,
    refetchOnWindowFocus: true
  });
}
function useSemaforoContingencias(contribuyenteId, enabled = true) {
  return useQuery({
    queryKey: controlFormalQueryKeys.semaforo(contribuyenteId),
    queryFn: () => fetchSemaforoContingencias(contribuyenteId),
    enabled: enabled && !!contribuyenteId,
    staleTime: 15e3,
    refetchInterval: 6e4,
    refetchOnWindowFocus: true
  });
}
function useRegistrarLegalizacion(contribuyenteId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (legalizacion) => registrarLegalizacionNotarial(legalizacion),
    onSuccess: async () => {
      toast.success("Legalización notarial registrada");
      await qc.invalidateQueries({ queryKey: controlFormalQueryKeys.legalizaciones(contribuyenteId) });
    },
    onError: (error) => {
      toast.error(error.message || "Error al registrar legalización");
    }
  });
}
function useRegistrarContingencia(contribuyenteId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => registrarContingencia(payload),
    onSuccess: async (result) => {
      toast.success(
        `Contingencia registrada. Comunicar SUNAT antes del ${result.fechaLimiteComunicacion15d}`
      );
      await qc.invalidateQueries({ queryKey: controlFormalQueryKeys.all });
    },
    onError: (error) => {
      toast.error(error.message || "Error al registrar contingencia");
    }
  });
}
const TIPO_LLEVADO_LABELS = {
  MANUAL: "Manual",
  HOJAS_SUELTAS: "Hojas sueltas",
  HOJAS_CONTINUAS: "Hojas continuas",
  ELECTRONICO_SIRE: "Electrónico SIRE"
};
const MOTIVO_CONTINGENCIA_LABELS = {
  PERDIDA: "Pérdida",
  DESTRUCCION: "Destrucción",
  SINIESTRO: "Siniestro",
  ASALTO: "Asalto / Robo",
  OTRO: "Otro"
};
const ESTADO_CONTINGENCIA_LABELS = {
  PENDIENTE_DENUNCIAR: "Pendiente denunciar",
  DENUNCIADO_POLICIA: "Denunciado en comisaría",
  COMUNICADO_SUNAT: "Comunicado a SUNAT",
  EN_RECONSTRUCCION: "En reconstrucción",
  RECONSTRUIDO: "Reconstruido"
};
const SEMAFORO_COLORS = {
  VERDE: "border-emerald-500/50 bg-emerald-500/15 text-emerald-300",
  AMARILLO: "border-amber-500/50 bg-amber-500/15 text-amber-300",
  ROJO: "border-red-500/50 bg-red-500/15 text-red-300"
};
const LIBROS_TABLA8_COMUNES = [
  { codigo: "010100", nombre: "Libro Caja y Bancos" },
  { codigo: "050100", nombre: "Libro Diario" },
  { codigo: "050200", nombre: "Libro Diario Simplificado" },
  { codigo: "130400", nombre: "Registro de Compras" },
  { codigo: "140400", nombre: "Registro de Ventas" },
  { codigo: "080100", nombre: "Libro de Inventarios y Balances" }
];
const FERIADOS_NACIONALES_PE = [
  // 2024
  "2024-01-01",
  "2024-03-28",
  "2024-03-29",
  "2024-05-01",
  "2024-06-07",
  "2024-06-29",
  "2024-07-23",
  "2024-07-28",
  "2024-07-29",
  "2024-08-06",
  "2024-08-30",
  "2024-10-08",
  "2024-11-01",
  "2024-12-08",
  "2024-12-25",
  // 2025
  "2025-01-01",
  "2025-04-17",
  "2025-04-18",
  "2025-05-01",
  "2025-06-07",
  "2025-06-29",
  "2025-07-23",
  "2025-07-28",
  "2025-07-29",
  "2025-08-06",
  "2025-08-30",
  "2025-10-08",
  "2025-11-01",
  "2025-12-08",
  "2025-12-25",
  // 2026
  "2026-01-01",
  "2026-04-02",
  "2026-04-03",
  "2026-05-01",
  "2026-06-07",
  "2026-06-29",
  "2026-07-23",
  "2026-07-28",
  "2026-07-29",
  "2026-08-06",
  "2026-08-30",
  "2026-10-08",
  "2026-11-01",
  "2026-12-08",
  "2026-12-25",
  // 2027
  "2027-01-01",
  "2027-03-25",
  "2027-03-26",
  "2027-05-01",
  "2027-06-07",
  "2027-06-29",
  "2027-07-23",
  "2027-07-28",
  "2027-07-29",
  "2027-08-06",
  "2027-08-30",
  "2027-10-08",
  "2027-11-01",
  "2027-12-08",
  "2027-12-25"
];
const feriadosSet = new Set(FERIADOS_NACIONALES_PE);
function toDateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function esDiaHabilPeru(fecha) {
  const dow = fecha.getDay();
  if (dow === 0 || dow === 6) return false;
  return !feriadosSet.has(toDateKey(fecha));
}
function calcular15DiasHabilesPeru(fechaInicio) {
  const result = new Date(fechaInicio);
  let contador = 0;
  while (contador < 15) {
    result.setDate(result.getDate() + 1);
    if (esDiaHabilPeru(result)) {
      contador += 1;
    }
  }
  return result;
}
function calcular60DiasCalendario(fechaInicio) {
  const result = new Date(fechaInicio);
  result.setDate(result.getDate() + 60);
  return result;
}
function diasHabilesRestantes(fechaLimite, hoy = /* @__PURE__ */ new Date()) {
  const limite = new Date(fechaLimite);
  limite.setHours(0, 0, 0, 0);
  const actual = new Date(hoy);
  actual.setHours(0, 0, 0, 0);
  if (limite <= actual) return 0;
  let count = 0;
  const cursor = new Date(actual);
  while (cursor < limite) {
    cursor.setDate(cursor.getDate() + 1);
    if (esDiaHabilPeru(cursor)) count += 1;
  }
  return count;
}
function diasCalendarioRestantes(fechaLimite, hoy = /* @__PURE__ */ new Date()) {
  const limite = new Date(fechaLimite);
  limite.setHours(0, 0, 0, 0);
  const actual = new Date(hoy);
  actual.setHours(0, 0, 0, 0);
  const diff = Math.ceil((limite.getTime() - actual.getTime()) / (1e3 * 60 * 60 * 24));
  return Math.max(diff, 0);
}
function formatFechaPeru(fecha) {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(fecha);
}
function calcularPlazosContingencia(fechaOcurrencia, hoy = /* @__PURE__ */ new Date()) {
  const limite15 = calcular15DiasHabilesPeru(fechaOcurrencia);
  const limite60 = calcular60DiasCalendario(fechaOcurrencia);
  return {
    fechaLimiteComunicacion15d: limite15,
    fechaLimiteReconstruccion60d: limite60,
    diasRestantesComunicacion: diasHabilesRestantes(limite15, hoy),
    diasRestantesReconstruccion: diasCalendarioRestantes(limite60, hoy)
  };
}
function mapContribuyenteCarta(c, fichaDomicilio) {
  return {
    ruc: c.ruc,
    razonSocial: c.razonSocial,
    domicilioFiscal: "Domicilio fiscal registrado en SUNAT",
    representanteLegal: c.razonSocial
  };
}
function generarCartaComunicacionPerdida(contribuyente, contingencia) {
  const fechaOcurrencia = formatFechaPeru(/* @__PURE__ */ new Date(contingencia.fechaOcurrencia + "T12:00:00"));
  const fechaLimiteCom = formatFechaPeru(/* @__PURE__ */ new Date(contingencia.fechaLimiteComunicacion15d + "T12:00:00"));
  const motivoLabel = MOTIVO_CONTINGENCIA_LABELS[contingencia.motivo] ?? contingencia.motivo;
  const librosTexto = contingencia.librosAfectados.map(
    (l, i) => `${i + 1}. ${l.nombreLibro} (Código Tabla 8: ${l.codigoLibroTabla8})${l.foliosAfectados ? ` — Folios: ${l.foliosAfectados}` : ""}`
  ).join("\n");
  const cuerpoTexto = `
${contribuyente.razonSocial.toUpperCase()}
RUC N° ${contribuyente.ruc}
${contribuyente.domicilioFiscal ?? ""}

Lima, ${formatFechaPeru(/* @__PURE__ */ new Date())}

Señores
SUPERINTENDENCIA NACIONAL DE ADUANAS Y DE ADMINISTRACIÓN TRIBUTARIA — SUNAT
Mesa de Partes

ASUNTO: Comunicación de ${motivoLabel.toUpperCase()} de Libros y Registros Contables
REFERENCIA: Artículo 87° del Texto Único Ordenado del Código Tributario — Decreto Legislativo N° 830

De nuestra consideración:

Por medio de la presente, ${contribuyente.razonSocial}, identificado con RUC N° ${contribuyente.ruc}, cumple con comunicar a esa Entidad Recaudadora la ${motivoLabel.toLowerCase()} de los libros y/o registros contables detallados a continuación, ocurrida el ${fechaOcurrencia}, conforme a lo dispuesto por el Código Tributario peruano.

DETALLE DE LIBROS AFECTADOS:
${librosTexto}

DENUNCIA POLICIAL:
${contingencia.numeroDenunciaPolicial ? `N° ${contingencia.numeroDenunciaPolicial}${contingencia.comisaria ? ` — ${contingencia.comisaria}` : ""}` : "Adjuntamos copia certificada de la denuncia policial correspondiente."}

PLAZOS LEGALES:
- Comunicación a SUNAT (15 días hábiles): fecha límite ${fechaLimiteCom}
- Reconstrucción contable (60 días calendario): fecha límite ${formatFechaPeru(/* @__PURE__ */ new Date(contingencia.fechaLimiteReconstruccion60d + "T12:00:00"))}

Adjuntamos:
1. Copia certificada expedida por la Autoridad Policial de la denuncia por ${motivoLabel.toLowerCase()} de libros contables.
2. Relación detallada de libros y folios afectados.

Nos comprometemos a iniciar la reconstrucción de los registros contables dentro del plazo legal, solicitando prórroga si fuera necesario.

Atentamente,

_________________________________
${contribuyente.representanteLegal ?? contribuyente.razonSocial}
Representante Legal / Gerente General
RUC: ${contribuyente.ruc}
`.trim();
  const librosHtml = contingencia.librosAfectados.map(
    (l) => `<li><strong>${l.nombreLibro}</strong> (Tabla 8: ${l.codigoLibroTabla8})${l.foliosAfectados ? ` — Folios: ${l.foliosAfectados}` : ""}</li>`
  ).join("");
  const cuerpoHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Comunicación SUNAT — ${motivoLabel}</title>
  <style>
    body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; max-width: 800px; margin: 40px auto; color: #111; }
    .header { text-align: center; margin-bottom: 24px; }
    .header h1 { font-size: 13pt; margin: 0; }
    .fecha { text-align: right; margin: 24px 0; }
    .destinatario { margin: 24px 0; }
    .asunto { margin: 16px 0; font-weight: bold; }
    .cuerpo p { text-align: justify; margin: 12px 0; }
    ul { margin: 8px 0 16px 20px; }
    .firma { margin-top: 48px; }
    .anexos { margin-top: 24px; font-size: 11pt; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${contribuyente.razonSocial.toUpperCase()}</h1>
    <p>RUC N° ${contribuyente.ruc}</p>
    <p>${contribuyente.domicilioFiscal ?? ""}</p>
  </div>
  <div class="fecha">Lima, ${formatFechaPeru(/* @__PURE__ */ new Date())}</div>
  <div class="destinatario">
    <p><strong>Señores</strong><br/>
    SUPERINTENDENCIA NACIONAL DE ADUANAS Y DE ADMINISTRACIÓN TRIBUTARIA — SUNAT<br/>
    Mesa de Partes</p>
  </div>
  <div class="asunto">
    <p>ASUNTO: Comunicación de ${motivoLabel.toUpperCase()} de Libros y Registros Contables</p>
    <p>REFERENCIA: Art. 87° TUO Código Tributario — D.L. N° 830</p>
  </div>
  <div class="cuerpo">
    <p>De nuestra consideración:</p>
    <p>Por medio de la presente, <strong>${contribuyente.razonSocial}</strong>, identificado con RUC N° <strong>${contribuyente.ruc}</strong>, comunica a esa Entidad Recaudadora la <strong>${motivoLabel.toLowerCase()}</strong> de los libros y/o registros contables detallados, ocurrida el <strong>${fechaOcurrencia}</strong>, conforme al Código Tributario peruano.</p>
    <p><strong>Detalle de libros afectados:</strong></p>
    <ul>${librosHtml}</ul>
    <p><strong>Denuncia policial:</strong> ${contingencia.numeroDenunciaPolicial ? `N° ${contingencia.numeroDenunciaPolicial}${contingencia.comisaria ? ` — ${contingencia.comisaria}` : ""}` : "Se adjunta copia certificada de la denuncia policial."}</p>
    <p><strong>Plazos legales:</strong></p>
    <ul>
      <li>Comunicación SUNAT (15 días hábiles): <strong>${fechaLimiteCom}</strong></li>
      <li>Reconstrucción contable (60 días calendario): <strong>${formatFechaPeru(/* @__PURE__ */ new Date(contingencia.fechaLimiteReconstruccion60d + "T12:00:00"))}</strong></li>
    </ul>
    <p>Nos comprometemos a iniciar la reconstrucción de los registros contables dentro del plazo legal.</p>
  </div>
  <div class="firma">
    <p>Atentamente,</p>
    <br/><br/>
    <p>_________________________________<br/>
    ${contribuyente.representanteLegal ?? contribuyente.razonSocial}<br/>
    Representante Legal / Gerente General<br/>
    RUC: ${contribuyente.ruc}</p>
  </div>
  <div class="anexos">
    <p><strong>Anexos:</strong></p>
    <ol>
      <li>Copia certificada de denuncia policial</li>
      <li>Relación de libros y folios afectados</li>
    </ol>
  </div>
</body>
</html>`;
  return {
    titulo: `Comunicación SUNAT — ${motivoLabel} de libros contables`,
    cuerpoTexto,
    cuerpoHtml,
    fechaGeneracion: (/* @__PURE__ */ new Date()).toISOString()
  };
}
function descargarCartaHtml(plantilla, filename) {
  const blob = new Blob([plantilla.cuerpoHtml], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename ?? `carta-sunat-${Date.now()}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
const GLASS = "rounded-2xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-md text-slate-100 shadow-xl shadow-emerald-950/20";
function useClientMounted() {
  const [mounted, setMounted] = reactExports.useState(false);
  reactExports.useEffect(() => setMounted(true), []);
  return mounted;
}
function formatFecha(fecha, mounted) {
  if (!fecha || !mounted) return "—";
  try {
    return new Intl.DateTimeFormat("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(new Date(fecha.includes("T") ? fecha : `${fecha}T12:00:00`));
  } catch {
    return fecha;
  }
}
function padFolio(n) {
  return String(n).padStart(4, "0");
}
function SemaforoWidget({
  alertas,
  resumen,
  mounted,
  loading
}) {
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn(GLASS, "p-6 flex items-center justify-center text-slate-400"), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-5 animate-spin mr-2" }),
      "Evaluando plazos SUNAT…"
    ] });
  }
  if (resumen.totalActivas === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(GLASS, "p-6 border-emerald-500/30"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "size-8 text-emerald-400" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-emerald-300", children: "Sin contingencias activas" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-400", children: "No hay alertas de pérdida o destrucción de libros pendientes." })
      ] })
    ] }) });
  }
  const alertaPrincipal = alertas.find((a) => a.semaforo === "ROJO") ?? alertas[0];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: cn(
          GLASS,
          "p-6",
          alertaPrincipal && SEMAFORO_COLORS[alertaPrincipal.semaforo]
        ),
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-start justify-between gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "size-10 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold", children: "Semáforo de Contingencias SUNAT" }),
              alertaPrincipal && mounted ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mt-1 opacity-90", children: alertaPrincipal.fechaComunicacionSunat == null && alertaPrincipal.diasRestantesComunicacion != null ? alertaPrincipal.diasRestantesComunicacion <= 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "🔴 Plazo de comunicación SUNAT vencido" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Quedan",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: alertaPrincipal.diasRestantesComunicacion }),
                " días hábiles para comunicar a SUNAT (límite:",
                " ",
                formatFecha(alertaPrincipal.fechaLimiteComunicacion, mounted),
                ")"
              ] }) : alertaPrincipal.diasRestantesReconstruccion != null ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Reconstrucción contable:",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: alertaPrincipal.diasRestantesReconstruccion }),
                " días calendario restantes"
              ] }) : "Monitoreo de plazos activo" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mt-1", children: "—" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "border-red-500/50 text-red-300", children: [
              "🔴 ",
              resumen.rojas
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "border-amber-500/50 text-amber-300", children: [
              "🟡 ",
              resumen.amarillas
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "border-emerald-500/50 text-emerald-300", children: [
              "🟢 ",
              resumen.verdes
            ] })
          ] })
        ] })
      }
    ),
    alertas.length > 1 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2", children: alertas.slice(0, 4).map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: cn("rounded-xl border p-3 text-sm", SEMAFORO_COLORS[a.semaforo]),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: MOTIVO_CONTINGENCIA_LABELS[a.motivo] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs opacity-80 mt-1", children: [
            "Ocurrencia: ",
            formatFecha(a.fechaOcurrencia, mounted)
          ] }),
          a.diasRestantesComunicacion != null && !a.fechaComunicacionSunat ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs mt-1", children: [
            "Comunicación: ",
            a.diasRestantesComunicacion,
            " días hábiles"
          ] }) : null
        ]
      },
      a.contingenciaId
    )) }) : null
  ] });
}
function FormularioLegalizacion({
  contribuyenteId,
  onSuccess
}) {
  const mutation = useRegistrarLegalizacion(contribuyenteId);
  const [codigoLibro, setCodigoLibro] = reactExports.useState("050100");
  const [nombreLibro, setNombreLibro] = reactExports.useState("Libro Diario");
  const [numeroLegalizacion, setNumeroLegalizacion] = reactExports.useState("");
  const [notaria, setNotaria] = reactExports.useState("");
  const [fecha, setFecha] = reactExports.useState((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
  const [foliosDesde, setFoliosDesde] = reactExports.useState("1");
  const [foliosHasta, setFoliosHasta] = reactExports.useState("500");
  const [tipoLlevado, setTipoLlevado] = reactExports.useState("HOJAS_SUELTAS");
  const handleLibroChange = (codigo) => {
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
        tipoLlevado
      },
      { onSuccess: () => onSuccess() }
    );
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn(GLASS, "p-4 space-y-4"), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold uppercase tracking-wider text-slate-400", children: "Nueva legalización notarial" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-slate-400", children: "Libro (Tabla 8)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: codigoLibro, onValueChange: handleLibroChange, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "bg-slate-800/50 border-slate-700", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { className: "bg-slate-900 border-slate-700", children: LIBROS_TABLA8_COMUNES.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: l.codigo, children: [
            l.codigo,
            " — ",
            l.nombre
          ] }, l.codigo)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-slate-400", children: "N° legalización" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: numeroLegalizacion,
            onChange: (e) => setNumeroLegalizacion(e.target.value),
            className: "bg-slate-800/50 border-slate-700"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 sm:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-slate-400", children: "Notaría / Juzgado" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: notaria,
            onChange: (e) => setNotaria(e.target.value),
            className: "bg-slate-800/50 border-slate-700"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-slate-400", children: "Fecha legalización" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "date",
            value: fecha,
            onChange: (e) => setFecha(e.target.value),
            className: "bg-slate-800/50 border-slate-700"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-slate-400", children: "Tipo llevado" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: tipoLlevado, onValueChange: (v) => setTipoLlevado(v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "bg-slate-800/50 border-slate-700", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { className: "bg-slate-900 border-slate-700", children: Object.keys(TIPO_LLEVADO_LABELS).map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: k, children: TIPO_LLEVADO_LABELS[k] }, k)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-slate-400", children: "Folios desde" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "number",
            min: 1,
            value: foliosDesde,
            onChange: (e) => setFoliosDesde(e.target.value),
            className: "bg-slate-800/50 border-slate-700"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-slate-400", children: "Folios hasta" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "number",
            min: 1,
            value: foliosHasta,
            onChange: (e) => setFoliosHasta(e.target.value),
            className: "bg-slate-800/50 border-slate-700"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Button,
      {
        onClick: handleSubmit,
        disabled: mutation.isPending || !numeroLegalizacion || !notaria,
        className: "bg-emerald-600 hover:bg-emerald-500",
        children: [
          mutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 animate-spin mr-2" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4 mr-2" }),
          "Registrar legalización"
        ]
      }
    )
  ] });
}
function FormularioContingencia({
  contribuyenteId,
  contribuyenteRuc,
  contribuyenteRazon,
  contingencias,
  mounted
}) {
  const mutation = useRegistrarContingencia();
  const [fechaOcurrencia, setFechaOcurrencia] = reactExports.useState((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
  const [motivo, setMotivo] = reactExports.useState("PERDIDA");
  const [numDenuncia, setNumDenuncia] = reactExports.useState("");
  const [comisaria, setComisaria] = reactExports.useState("");
  const [observaciones, setObservaciones] = reactExports.useState("");
  const [libroCodigo, setLibroCodigo] = reactExports.useState("050100");
  const [libroNombre, setLibroNombre] = reactExports.useState("Libro Diario");
  const [foliosAfectados, setFoliosAfectados] = reactExports.useState("");
  const [librosExtra, setLibrosExtra] = reactExports.useState([]);
  const plazosPreview = mounted ? calcularPlazosContingencia(/* @__PURE__ */ new Date(fechaOcurrencia + "T12:00:00")) : null;
  const agregarLibro = () => {
    if (!libroCodigo || !libroNombre) return;
    setLibrosExtra((prev) => [
      ...prev,
      { codigoLibroTabla8: libroCodigo, nombreLibro: libroNombre, foliosAfectados: foliosAfectados || void 0 }
    ]);
    setFoliosAfectados("");
  };
  const handleSubmit = () => {
    const libros = librosExtra.length > 0 ? librosExtra : [{ codigoLibroTabla8: libroCodigo, nombreLibro: libroNombre, foliosAfectados: foliosAfectados || void 0 }];
    mutation.mutate({
      contribuyenteId,
      fechaOcurrencia,
      motivo,
      librosAfectados: libros,
      numeroDenunciaPolicial: numDenuncia || void 0,
      comisaria: comisaria || void 0,
      observaciones: observaciones || void 0
    });
  };
  const generarCarta = (contingencia) => {
    const carta = generarCartaComunicacionPerdida(
      mapContribuyenteCarta({ ruc: contribuyenteRuc, razonSocial: contribuyenteRazon }),
      contingencia
    );
    descargarCartaHtml(carta, `carta-sunat-${contribuyenteRuc}-${contingencia.id.slice(0, 8)}.html`);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn(GLASS, "p-4 space-y-4"), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold uppercase tracking-wider text-slate-400", children: "Registrar pérdida / destrucción" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-slate-400", children: "Fecha ocurrencia" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "date",
              value: fechaOcurrencia,
              onChange: (e) => setFechaOcurrencia(e.target.value),
              className: "bg-slate-800/50 border-slate-700"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-slate-400", children: "Motivo" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: motivo, onValueChange: (v) => setMotivo(v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "bg-slate-800/50 border-slate-700", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { className: "bg-slate-900 border-slate-700", children: Object.keys(MOTIVO_CONTINGENCIA_LABELS).map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: k, children: MOTIVO_CONTINGENCIA_LABELS[k] }, k)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-slate-400", children: "N° denuncia policial" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: numDenuncia,
              onChange: (e) => setNumDenuncia(e.target.value),
              className: "bg-slate-800/50 border-slate-700",
              placeholder: "Opcional al registrar"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-slate-400", children: "Comisaría" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: comisaria,
              onChange: (e) => setComisaria(e.target.value),
              className: "bg-slate-800/50 border-slate-700"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-slate-800 pt-4 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-slate-400", children: "Libros afectados" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: libroCodigo,
              onValueChange: (v) => {
                setLibroCodigo(v);
                const f = LIBROS_TABLA8_COMUNES.find((l) => l.codigo === v);
                if (f) setLibroNombre(f.nombre);
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "bg-slate-800/50 border-slate-700", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { className: "bg-slate-900 border-slate-700", children: LIBROS_TABLA8_COMUNES.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: l.codigo, children: [
                  l.codigo,
                  " — ",
                  l.nombre
                ] }, l.codigo)) })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: foliosAfectados,
              onChange: (e) => setFoliosAfectados(e.target.value),
              placeholder: "Folios afectados (ej. 001-150)",
              className: "bg-slate-800/50 border-slate-700"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: agregarLibro, className: "border-slate-600", children: "+ Agregar libro" })
        ] }),
        librosExtra.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "text-xs text-slate-400 space-y-1", children: librosExtra.map((l, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
          l.codigoLibroTabla8,
          " — ",
          l.nombreLibro,
          l.foliosAfectados ? ` (${l.foliosAfectados})` : ""
        ] }, i)) }) : null
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-slate-400", children: "Observaciones" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Textarea,
          {
            value: observaciones,
            onChange: (e) => setObservaciones(e.target.value),
            className: "bg-slate-800/50 border-slate-700 min-h-[60px]"
          }
        )
      ] }),
      plazosPreview && mounted ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "📅 Límite comunicación SUNAT (15 días hábiles):",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: formatFecha(plazosPreview.fechaLimiteComunicacion15d.toISOString().slice(0, 10), mounted) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "📅 Límite reconstrucción (60 días calendario):",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: formatFecha(plazosPreview.fechaLimiteReconstruccion60d.toISOString().slice(0, 10), mounted) })
        ] })
      ] }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          onClick: handleSubmit,
          disabled: mutation.isPending,
          className: "bg-red-600/90 hover:bg-red-500",
          children: [
            mutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 animate-spin mr-2" }) : null,
            "Registrar contingencia"
          ]
        }
      )
    ] }),
    contingencias.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn(GLASS, "p-4"), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4", children: "Contingencias registradas" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: contingencias.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800 p-3",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium text-sm", children: [
                MOTIVO_CONTINGENCIA_LABELS[c.motivo],
                " — ",
                formatFecha(c.fechaOcurrencia, mounted)
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-slate-500", children: [
                ESTADO_CONTINGENCIA_LABELS[c.estadoContingencia],
                " · Comunicar antes:",
                " ",
                formatFecha(c.fechaLimiteComunicacion15d, mounted)
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "sm",
                variant: "outline",
                className: "border-slate-600 gap-2",
                onClick: () => generarCarta(c),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "size-4" }),
                  "Generar carta SUNAT"
                ]
              }
            )
          ]
        },
        c.id
      )) })
    ] }) : null
  ] });
}
function ControlFormalHub() {
  const mounted = useClientMounted();
  const { contribuyentes, loading: loadingContrib } = useContribuyentes();
  const [selectedRuc, setSelectedRuc] = reactExports.useState("");
  const [tab, setTab] = reactExports.useState("legalizaciones");
  const [showFormLegalizacion, setShowFormLegalizacion] = reactExports.useState(false);
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
    queryKey: ["contribuyente-id-cf", selectedRuc],
    queryFn: () => fetchContribuyenteIdByRucCf(selectedRuc),
    enabled: !!selectedRuc && selectedRuc.length === 11,
    staleTime: 5 * 6e4
  });
  const contribuyenteId = contribuyente?.id ?? resolvedId ?? null;
  const legalizacionesQuery = useLegalizaciones(contribuyenteId);
  const semaforoQuery = useSemaforoContingencias(contribuyenteId);
  const contingenciasQuery = useContingencias(contribuyenteId, tab === "contingencias");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-full space-y-6 p-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "space-y-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Scale, { className: "size-6 text-emerald-400" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight text-slate-100", children: "Control Formal & Contingencias" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-400", children: "Legalizaciones notariales · Foliación · Alertas SUNAT 15 días hábiles / 60 días calendario" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn(GLASS, "p-4"), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-slate-400 text-xs", children: "Contribuyente" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Select,
        {
          value: selectedRuc || void 0,
          onValueChange: setSelectedRuc,
          disabled: loadingContrib,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1.5 bg-slate-800/50 border-slate-700 max-w-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Seleccione RUC…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { className: "bg-slate-900 border-slate-700", children: options.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o.ruc, children: o.label }, o.ruc)) })
          ]
        }
      )
    ] }),
    contribuyenteId ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      SemaforoWidget,
      {
        alertas: semaforoQuery.data?.alertas ?? [],
        resumen: semaforoQuery.data?.resumen ?? { totalActivas: 0, rojas: 0, amarillas: 0, verdes: 0 },
        mounted,
        loading: semaforoQuery.isLoading
      }
    ) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: tab, onValueChange: (v) => setTab(v), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "bg-slate-800/60 border border-slate-700/80", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TabsTrigger,
          {
            value: "legalizaciones",
            className: "data-[state=active]:bg-emerald-600/20 data-[state=active]:text-emerald-300",
            children: "Legalizaciones & Folios"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TabsTrigger,
          {
            value: "contingencias",
            className: "data-[state=active]:bg-red-600/20 data-[state=active]:text-red-300",
            children: "Contingencias & Denuncias"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "legalizaciones", className: "mt-4 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            className: "border-slate-600",
            onClick: () => setShowFormLegalizacion((s) => !s),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4 mr-2" }),
              showFormLegalizacion ? "Ocultar formulario" : "Nueva legalización"
            ]
          }
        ) }),
        showFormLegalizacion && contribuyenteId ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          FormularioLegalizacion,
          {
            contribuyenteId,
            onSuccess: () => setShowFormLegalizacion(false)
          }
        ) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(GLASS, "p-4"), children: legalizacionesQuery.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-12 text-slate-400", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-5 animate-spin" }) }) : (legalizacionesQuery.data ?? []).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-slate-500 text-sm py-12", children: "No hay legalizaciones registradas. Registre la constancia notarial del primer folio." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "border-slate-800 hover:bg-transparent", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400", children: "Libro" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400", children: "N° Legalización" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400", children: "Notaría" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400", children: "Fecha" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400", children: "Folios" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400", children: "Utilización" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400", children: "Tipo" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: (legalizacionesQuery.data ?? []).map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "border-slate-800/60", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: l.nombreLibro }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500 font-mono", children: l.codigoLibroTabla8 })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs", children: l.numeroLegalizacion }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm max-w-[140px] truncate", title: l.notariaJuzgado, children: l.notariaJuzgado }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm", children: formatFecha(l.fechaLegalizacion, mounted) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "font-mono text-xs", children: [
              padFolio(l.foliosDesde),
              " — ",
              padFolio(l.foliosHasta)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "min-w-[120px]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: l.porcentajeUtilizado, className: "h-2 flex-1" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs tabular-nums w-10", children: [
                  l.porcentajeUtilizado,
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-slate-500 mt-0.5", children: [
                l.foliosUtilizados,
                "/",
                l.totalFolios,
                " folios"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px]", children: TIPO_LLEVADO_LABELS[l.tipoLlevado] }) })
          ] }, l.id)) })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "contingencias", className: "mt-4", children: contribuyenteId && contribuyente ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        FormularioContingencia,
        {
          contribuyenteId,
          contribuyenteRuc: contribuyente.ruc,
          contribuyenteRazon: contribuyente.razonSocial,
          contingencias: contingenciasQuery.data ?? [],
          mounted
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-500 text-sm py-8 text-center", children: "Seleccione un contribuyente." }) })
    ] })
  ] });
}
export {
  ControlFormalHub
};
