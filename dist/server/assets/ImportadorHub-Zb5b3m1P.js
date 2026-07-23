import { U as reactExports, L as jsxRuntimeExports } from "./server-BIroHbvu.js";
import { B as Badge } from "./badge-BjDV6F_B.js";
import { B as Button } from "./button-CAvVOLL8.js";
import { L as Label } from "./label-Dsj3Zaer.js";
import { P as Progress } from "./progress-DofMlWtS.js";
import { S as Select, c as SelectTrigger, d as SelectValue, a as SelectContent, b as SelectItem } from "./select-BZS9NJ-P.js";
import { T as Table, d as TableHeader, e as TableRow, c as TableHead, a as TableBody, b as TableCell } from "./table-BGymvpwQ.js";
import { b as TooltipProvider, T as Tooltip, c as TooltipTrigger, a as TooltipContent } from "./tooltip-BDZK6R2w.js";
import { u as useQuery } from "./useQuery-CNpr8Hir.js";
import { m as useContribuyentes } from "./use-contribuyentes-CGcEKwfv.js";
import { a as cn } from "./utils-8RO4xBwZ.js";
import { ac as supabase, ad as throwIfSupabaseError, ar as useQueryClient, aj as toast } from "./router-BRL0s0LD.js";
import { read as readSync, utils, write as writeSync, SSF } from "./xlsx-D6h3nj8f.js";
import { u as useMutation } from "./useMutation-DxnWSsR1.js";
import { F as FileSpreadsheet } from "./file-spreadsheet-CREGzpL3.js";
import { U as Upload } from "./upload-B8cCOVxr.js";
import { L as LoaderCircle } from "./loader-circle-OqnuRBje.js";
import { C as CircleAlert } from "./circle-alert-BrgPxe9Y.js";
import { C as CircleCheck } from "./circle-check-B2Wi3ps7.js";
import { C as CircleX } from "./circle-x-DNQpHTOD.js";
import { D as Download } from "./download-BBwbUiAc.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-Do_kSTPt.js";
import "./index-Bd_3-P22.js";
import "./Combination-BhKuaGUd.js";
import "./chevron-up-CkMbl0kk.js";
import "./index-DcTyhqP8.js";
import "./contribuyentes-service-C3l05GhV.js";
import "./http-client-BNGDvc7A.js";
const HEADERS_COMPRAS_VENTAS = [
  "RUC",
  "Razon Social",
  "TipoDoc",
  "Serie",
  "Numero",
  "Fecha",
  "Moneda",
  "Base",
  "IGV",
  "Total"
];
const HEADERS_ASIENTOS = [
  "Fecha",
  "Periodo",
  "Cuenta",
  "Debe",
  "Haber",
  "Glosa",
  "RUC Contraparte",
  "Nombre Contraparte",
  "Serie",
  "Numero"
];
const EJEMPLO_COMPRAS = [
  HEADERS_COMPRAS_VENTAS,
  [
    "20512345678",
    "PROVEEDOR DEMO SAC",
    "01",
    "F001",
    "00001234",
    "2025-01-15",
    "PEN",
    "1000.00",
    "180.00",
    "1180.00"
  ],
  [
    "10456789012",
    "SERVICIOS GENERALES EIRL",
    "03",
    "B001",
    "00000089",
    "2025-01-20",
    "PEN",
    "500.00",
    "90.00",
    "590.00"
  ]
];
const EJEMPLO_VENTAS = [
  HEADERS_COMPRAS_VENTAS,
  [
    "20100070970",
    "CLIENTE CORPORATIVO SA",
    "01",
    "F001",
    "00004567",
    "2025-01-10",
    "PEN",
    "2500.00",
    "450.00",
    "2950.00"
  ]
];
const EJEMPLO_ASIENTOS = [
  HEADERS_ASIENTOS,
  [
    "2025-01-31",
    "202501",
    "601101",
    "850.00",
    "0.00",
    "Compra mercadería importada",
    "20512345678",
    "PROVEEDOR DEMO SAC",
    "F001",
    "1234"
  ],
  [
    "2025-01-31",
    "202501",
    "421201",
    "0.00",
    "850.00",
    "Compra mercadería importada",
    "20512345678",
    "PROVEEDOR DEMO SAC",
    "F001",
    "1234"
  ]
];
function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
function buildStyledWorkbook(data, sheetName) {
  const ws = utils.aoa_to_sheet(data);
  ws["!cols"] = data[0].map((_, colIdx) => ({
    wch: Math.max(12, ...data.map((row) => String(row[colIdx] ?? "").length + 2))
  }));
  const headerRange = utils.decode_range(ws["!ref"] ?? "A1");
  for (let c = headerRange.s.c; c <= headerRange.e.c; c++) {
    const cellRef = utils.encode_cell({ r: 0, c });
    if (ws[cellRef]) {
      ws[cellRef].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "047857" } }
      };
    }
  }
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, sheetName);
  return wb;
}
function descargarPlantillaOficial(tipo) {
  let data;
  let filename;
  let sheetName;
  switch (tipo) {
    case "COMPRAS":
      data = EJEMPLO_COMPRAS;
      filename = "CONTAM_Plantilla_Importacion_COMPRAS.xlsx";
      sheetName = "Compras RCE";
      break;
    case "VENTAS":
      data = EJEMPLO_VENTAS;
      filename = "CONTAM_Plantilla_Importacion_VENTAS.xlsx";
      sheetName = "Ventas RVIE";
      break;
    case "ASIENTOS":
      data = EJEMPLO_ASIENTOS;
      filename = "CONTAM_Plantilla_Importacion_ASIENTOS.xlsx";
      sheetName = "Asientos Manuales";
      break;
  }
  const wb = buildStyledWorkbook(data, sheetName);
  const out = writeSync(wb, { bookType: "xlsx", type: "array" });
  triggerDownload(
    new Blob([out], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    }),
    filename
  );
}
function normalizeHeader(h) {
  return h.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
}
function parseNum(val) {
  if (typeof val === "number") return Math.round(val * 100) / 100;
  const s = String(val ?? "").replace(/,/g, "").trim();
  const n = Number(s);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
}
function parseFechaCell(val) {
  if (val == null || val === "") return "";
  if (typeof val === "number") {
    const parsed = SSF.parse_date_code(val);
    if (parsed) {
      const y = parsed.y;
      const m = String(parsed.m).padStart(2, "0");
      const d = String(parsed.d).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }
  }
  const s = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const slash = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (slash) {
    let [, d, m, y] = slash;
    if (y.length === 2) y = `20${y}`;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return s;
}
function detectTipoPlantilla(headers) {
  const h = headers.map(normalizeHeader);
  if (h.includes("cuenta") && h.includes("debe") && h.includes("haber")) return "ASIENTOS";
  if (h.includes("ruc") && h.includes("tipodoc") && h.includes("base")) {
    return h.some((x) => x.includes("venta")) ? "VENTAS" : "COMPRAS";
  }
  if (h.includes("ruc") && h.includes("serie") && h.includes("total")) return "COMPRAS";
  return null;
}
function rowToComprobante(row, filaNumero) {
  const fecha = parseFechaCell(row.fecha ?? row.Fecha);
  const periodo = fecha ? fecha.replace(/-/g, "").slice(0, 6) : void 0;
  return {
    filaNumero,
    ruc: String(row.ruc ?? row.RUC ?? "").replace(/\D/g, "").slice(0, 11),
    razonSocial: String(row.razonsocial ?? row["Razon Social"] ?? row.razon_social ?? "").trim(),
    tipoDoc: String(row.tipodoc ?? row.TipoDoc ?? "01").replace(/\D/g, "").padStart(2, "0").slice(-2),
    serie: String(row.serie ?? row.Serie ?? "F001").trim().toUpperCase(),
    numero: String(row.numero ?? row.Numero ?? "").trim(),
    fecha,
    moneda: String(row.moneda ?? row.Moneda ?? "PEN").toUpperCase().slice(0, 3),
    base: parseNum(row.base ?? row.Base),
    igv: parseNum(row.igv ?? row.IGV),
    total: parseNum(row.total ?? row.Total),
    periodo,
    tipoCambio: parseNum(row.tipocambio ?? row.tipo_cambio) || 1
  };
}
function rowToAsiento(row, filaNumero) {
  const fechaAsiento = parseFechaCell(row.fecha ?? row.Fecha);
  const periodoRaw = String(row.periodo ?? row.Periodo ?? "").replace(/\D/g, "");
  const periodo = periodoRaw.length === 6 ? periodoRaw : fechaAsiento.replace(/-/g, "").slice(0, 6);
  return {
    filaNumero,
    fechaAsiento,
    periodo,
    cuentaContable: String(row.cuenta ?? row.Cuenta ?? "").replace(/\D/g, "").slice(0, 10),
    debe: parseNum(row.debe ?? row.Debe),
    haber: parseNum(row.haber ?? row.Haber),
    glosa: String(row.glosa ?? row.Glosa ?? "").trim(),
    rucContraparte: String(row.ruccontraparte ?? row["RUC Contraparte"] ?? "").replace(/\D/g, "").slice(0, 11),
    nombreContraparte: String(row.nombrecontraparte ?? row["Nombre Contraparte"] ?? "").trim(),
    serie: String(row.serie ?? row.Serie ?? "").trim(),
    numero: String(row.numero ?? row.Numero ?? "").trim(),
    tipoRegistro: "COMPRA"
  };
}
async function parsearArchivoImportacion(file) {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const origen = ext === "csv" ? "CSV" : ext === "pdf" ? "PDF_OCR" : "EXCEL";
  if (ext === "pdf") {
    throw new Error("Use pdfOcrParser.parsePdfInvoice para archivos PDF");
  }
  const buffer = await file.arrayBuffer();
  const wb = readSync(buffer, { type: "array", cellDates: true });
  const sheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  const json = utils.sheet_to_json(sheet, { defval: "" });
  if (json.length === 0) {
    throw new Error("El archivo no contiene filas de datos");
  }
  const headers = Object.keys(json[0] ?? {});
  const tipoDetectado = detectTipoPlantilla(headers) ?? "COMPRAS";
  const filas = json.map((row, idx) => {
    const filaNumero = idx + 2;
    if (tipoDetectado === "ASIENTOS") {
      return rowToAsiento(row, filaNumero);
    }
    return rowToComprobante(row, filaNumero);
  });
  return { origen, tipoDetectado, filas };
}
function isFilaComprobante(row) {
  return "tipoDoc" in row && "ruc" in row;
}
function isFilaAsiento(row) {
  return "cuentaContable" in row && "debe" in row;
}
const MONTO_TOLERANCIA = 0.05;
const FACTORES_RUC = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
function validarRucModulo11(ruc) {
  const clean = ruc.replace(/\D/g, "");
  if (!/^\d{11}$/.test(clean)) return false;
  if (!/^(10|15|17|20)/.test(clean)) return false;
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(clean[i], 10) * FACTORES_RUC[i];
  }
  let mod = 11 - sum % 11;
  if (mod === 10) mod = 0;
  if (mod === 11) mod = 1;
  return mod === parseInt(clean[10], 10);
}
function validarFechaEnPeriodo(fecha, periodoActivo) {
  if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return { codigo: "FECHA_INVALIDA", mensaje: "Fecha inválida o vacía (use YYYY-MM-DD)", campo: "fecha" };
  }
  const d = /* @__PURE__ */ new Date(`${fecha}T12:00:00`);
  if (Number.isNaN(d.getTime())) {
    return { codigo: "FECHA_INVALIDA", mensaje: "Fecha no parseable", campo: "fecha" };
  }
  if (periodoActivo && periodoActivo.length === 6) {
    const rowPeriodo = fecha.replace(/-/g, "").slice(0, 6);
    if (rowPeriodo !== periodoActivo) {
      return {
        codigo: "FECHA_FUERA_PERIODO",
        mensaje: `Fecha ${fecha} no pertenece al periodo activo ${periodoActivo.slice(0, 4)}-${periodoActivo.slice(4, 6)}`,
        campo: "fecha"
      };
    }
  }
  return null;
}
function validarMontos(base, igv, total) {
  if (base <= 0 && total <= 0) {
    return { codigo: "MONTO_CERO", mensaje: "Base y Total no pueden ser cero", campo: "total" };
  }
  const esperado = Math.round((base + igv) * 100) / 100;
  const diff = Math.abs(esperado - total);
  if (diff > MONTO_TOLERANCIA) {
    return {
      codigo: "DESCUADRE_MONTOS",
      mensaje: `Base (${base}) + IGV (${igv}) = ${esperado} ≠ Total (${total}). Diferencia ${diff.toFixed(2)}`,
      campo: "total"
    };
  }
  return null;
}
function claveComprobanteBd(row) {
  return `${row.tipoDoc}|${row.serie}|${row.numero}|${row.ruc}`;
}
function validarFilaComprobante(row, periodoActivo, duplicadosArchivo, duplicadosBd) {
  const errores = [];
  if (!row.ruc || row.ruc.length !== 11) {
    errores.push({ codigo: "RUC_FORMATO", mensaje: "RUC debe tener 11 dígitos", campo: "ruc" });
  } else if (!validarRucModulo11(row.ruc)) {
    errores.push({
      codigo: "RUC_MODULO11",
      mensaje: `RUC ${row.ruc} no pasa validación Módulo 11 SUNAT`,
      campo: "ruc"
    });
  }
  if (!row.serie?.trim()) {
    errores.push({ codigo: "SERIE_VACIA", mensaje: "Serie es obligatoria", campo: "serie" });
  }
  if (!row.numero?.trim()) {
    errores.push({ codigo: "NUMERO_VACIO", mensaje: "Número es obligatorio", campo: "numero" });
  }
  const fechaErr = validarFechaEnPeriodo(row.fecha, periodoActivo ?? row.periodo ?? null);
  if (fechaErr) errores.push(fechaErr);
  const montosErr = validarMontos(row.base, row.igv, row.total);
  if (montosErr) errores.push(montosErr);
  const clave = claveComprobanteBd(row);
  if (duplicadosArchivo.has(clave)) {
    errores.push({
      codigo: "DUPLICADO_ARCHIVO",
      mensaje: `Comprobante duplicado en archivo: ${row.serie}-${row.numero}`,
      campo: "numero"
    });
  } else {
    duplicadosArchivo.add(clave);
  }
  if (duplicadosBd.has(clave)) {
    errores.push({
      codigo: "DUPLICADO_BD",
      mensaje: `Comprobante ya existe en BD: ${row.serie}-${row.numero}`,
      campo: "numero"
    });
  }
  return errores;
}
function validarFilaAsiento(row, periodoActivo) {
  const errores = [];
  const fechaErr = validarFechaEnPeriodo(row.fechaAsiento, periodoActivo ?? row.periodo);
  if (fechaErr) errores.push(fechaErr);
  if (!row.cuentaContable || row.cuentaContable.length < 2) {
    errores.push({
      codigo: "CUENTA_INVALIDA",
      mensaje: "Cuenta contable PCGE inválida",
      campo: "cuentaContable"
    });
  }
  if (row.debe <= 0 && row.haber <= 0) {
    errores.push({
      codigo: "DEBE_HABER_CERO",
      mensaje: "Debe o Haber debe ser mayor a cero",
      campo: "debe"
    });
  }
  if (row.debe > 0 && row.haber > 0) {
    errores.push({
      codigo: "DEBE_HABER_AMBOS",
      mensaje: "Una línea no puede tener Debe y Haber simultáneamente",
      campo: "haber"
    });
  }
  return errores;
}
function ejecutarPreflightValidacion(params) {
  const duplicadosArchivo = /* @__PURE__ */ new Set();
  const duplicadosBd = params.duplicadosEnBd ?? /* @__PURE__ */ new Set();
  const resultados = [];
  for (const fila of params.filas) {
    let errores = [];
    if (params.tipoLote === "ASIENTOS_MANUALES" && isFilaAsiento(fila)) {
      errores = validarFilaAsiento(fila, params.periodoActivo);
    } else if (isFilaComprobante(fila)) {
      errores = validarFilaComprobante(fila, params.periodoActivo, duplicadosArchivo, duplicadosBd);
    } else {
      errores.push({ codigo: "TIPO_FILA", mensaje: "Tipo de fila no reconocido para el lote" });
    }
    resultados.push({
      filaNumero: fila.filaNumero,
      datos: fila,
      estado: errores.length === 0 ? "VALIDO" : "ERROR",
      errores
    });
  }
  const validos = resultados.filter((r) => r.estado === "VALIDO").length;
  return {
    total: resultados.length,
    validos,
    errores: resultados.length - validos,
    filas: resultados
  };
}
function filaComprobanteToDatosRaw(row) {
  return {
    ruc: row.ruc,
    razon_social: row.razonSocial,
    tipo_doc: row.tipoDoc,
    serie: row.serie,
    numero: row.numero,
    fecha: row.fecha,
    moneda: row.moneda,
    base: row.base,
    igv: row.igv,
    total: row.total,
    periodo: row.periodo,
    tipo_cambio: row.tipoCambio ?? 1
  };
}
function filaAsientoToDatosRaw(row) {
  return {
    fecha_asiento: row.fechaAsiento,
    periodo: row.periodo,
    cuenta_contable: row.cuentaContable,
    debe: row.debe,
    haber: row.haber,
    glosa: row.glosa,
    tipo_registro: row.tipoRegistro ?? "COMPRA",
    ruc_contraparte: row.rucContraparte ?? "",
    nombre_contraparte: row.nombreContraparte ?? "",
    serie: row.serie ?? "",
    numero: row.numero ?? ""
  };
}
const db = supabase;
async function buscarDuplicadosEnBd(params) {
  if (params.tipoLote === "ASIENTOS_MANUALES") return /* @__PURE__ */ new Set();
  const tipo = params.tipoLote === "COMPRAS" ? "COMPRA" : "VENTA";
  const periodo = params.periodo.replace(/\D/g, "").slice(0, 6);
  const { data, error } = await db.from("registros_sire_cabecera").select("cod_tipo_cdp, serie_cdp, nro_cdp_inicial, nro_doc_contraparte").eq("contribuyente_id", params.contribuyenteId).eq("periodo", periodo).eq("tipo", tipo);
  throwIfSupabaseError(error, "Error al verificar duplicados en BD");
  const set = /* @__PURE__ */ new Set();
  for (const row of data ?? []) {
    const r = row;
    set.add(`${r.cod_tipo_cdp}|${r.serie_cdp ?? ""}|${r.nro_cdp_inicial}|${(r.nro_doc_contraparte ?? "").replace(/\D/g, "")}`);
  }
  return set;
}
async function crearLoteImportacion(params) {
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const { data: lote, error: loteErr } = await db.from("importaciones_lotes").insert({
    contribuyente_id: params.contribuyenteId,
    origen: params.origen,
    tipo_lote: params.tipoLote,
    total_registros: params.filasPreflight.length,
    registros_con_error: params.filasPreflight.filter((f) => f.estado === "ERROR").length,
    estado: "BORRADOR",
    usuario_id: user?.id ?? null,
    nombre_archivo: params.nombreArchivo,
    periodo_contable: params.periodoContable.replace(/\D/g, "").slice(0, 6)
  }).select("id").single();
  throwIfSupabaseError(loteErr, "Error al crear lote de importación");
  const loteId = lote.id;
  const detalles = params.filasPreflight.map((f) => ({
    lote_id: loteId,
    fila_numero: f.filaNumero,
    datos_raw: isFilaComprobante(f.datos) ? filaComprobanteToDatosRaw(f.datos) : filaAsientoToDatosRaw(f.datos),
    estado_registro: f.estado,
    errores: f.errores
  }));
  const { error: detErr } = await db.from("importaciones_detalles").insert(detalles);
  throwIfSupabaseError(detErr, "Error al guardar detalles de importación");
  return loteId;
}
async function procesarLoteImportacion(loteId) {
  const { data, error } = await db.rpc("fn_procesar_lote_importacion", {
    p_lote_id: loteId
  });
  throwIfSupabaseError(error, "Error al procesar lote");
  if (!data) throw new Error("Procesamiento sin respuesta");
  const row = data;
  return {
    ok: Boolean(row.ok),
    loteId: String(row.lote_id),
    registrosExitosos: Number(row.registros_exitosos ?? 0),
    registrosConError: Number(row.registros_con_error ?? 0),
    estado: String(row.estado)
  };
}
async function fetchContribuyenteIdByRucImport(ruc) {
  const clean = ruc.replace(/\D/g, "").slice(0, 11);
  const { data, error } = await supabase.from("contribuyentes").select("id").eq("ruc", clean).maybeSingle();
  throwIfSupabaseError(error, "Error al buscar contribuyente");
  return data?.id ?? null;
}
const TIPO_COMPROBANTE_PATTERNS = [
  { pattern: /NOTA\s+DE\s+CR[EÉ]DITO|NOTA\s+CR[EÉ]DITO|tipo\s*:?\s*07/i, tipo: "07" },
  { pattern: /NOTA\s+DE\s+D[EÉ]BITO|NOTA\s+D[EÉ]BITO|tipo\s*:?\s*08/i, tipo: "08" },
  { pattern: /BOLETA\s+DE\s+VENTA|BOLETA|ELECTR[OÓ]NICA\s+BV|tipo\s*:?\s*03/i, tipo: "03" },
  { pattern: /FACTURA\s+ELECTR[OÓ]NICA|FACTURA|tipo\s*:?\s*01/i, tipo: "01" }
];
const RUC_PATTERN = /\b(10|15|17|20)\d{9}\b/g;
const SERIE_PATTERN = /\b([FE][A-Z0-9]{3}|B[A-Z0-9]{3})\b/gi;
const NUMERO_PATTERN = /(?:N[°ºo.]?\s*|NRO\.?\s*|NUMERO\s*:?\s*)(\d{1,8})/gi;
const FECHA_PATTERN = /(?:FECHA\s*(?:DE\s*)?(?:EMISI[OÓ]N|EMISION)?\s*:?\s*)?(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi;
const MONEDA_USD_PATTERN = /USD|D[ÓO]LAR(?:ES)?|\$\s*\d/i;
const SUBTOTAL_PATTERN = /(?:SUB\s*TOTAL|BASE\s*IMPONIBLE|VALOR\s*VENTA|OP\.?\s*GRAVADA)\s*:?\s*(?:S\/\.?\s*)?([\d,]+\.?\d*)/gi;
const IGV_PATTERN = /(?:I\.?G\.?V\.?|IGV)\s*(?:\(?18%?\)?)?\s*:?\s*(?:S\/\.?\s*)?([\d,]+\.?\d*)/gi;
const TOTAL_PATTERN = /(?:IMPORTE\s*TOTAL|TOTAL\s*(?:A\s*PAGAR)?|MONTO\s*TOTAL)\s*:?\s*(?:S\/\.?\s*)?([\d,]+\.?\d*)/gi;
const RAZON_SOCIAL_PATTERN = /(?:RAZ[OÓ]N\s*SOCIAL|NOMBRE\s*(?:O\s*RAZ[OÓ]N\s*SOCIAL)?)\s*:?\s*([A-Z0-9ÁÉÍÓÚÑ\s\.\,&\-]{3,120})/i;
function parseMonto(raw) {
  if (!raw) return 0;
  const clean = raw.replace(/,/g, "").trim();
  const n = Number(clean);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
}
function normalizeFecha(raw) {
  const parts = raw.split(/[\/\-]/);
  if (parts.length !== 3) return raw;
  let [d, m, y] = parts.map((p) => p.trim());
  if (y.length === 2) y = `20${y}`;
  return `${y.padStart(4, "0")}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}
function detectTipoComprobante(text) {
  for (const { pattern, tipo } of TIPO_COMPROBANTE_PATTERNS) {
    if (pattern.test(text)) return tipo;
  }
  return "01";
}
function extractAllMontos(text, pattern) {
  const values = [];
  pattern.lastIndex = 0;
  let m;
  while ((m = pattern.exec(text)) !== null) {
    const val = parseMonto(m[1] ?? m[0]);
    if (val > 0) values.push(val);
  }
  return values;
}
function extractRuc(text) {
  RUC_PATTERN.lastIndex = 0;
  const matches = text.match(RUC_PATTERN);
  if (!matches?.length) return null;
  return matches[0].replace(/\D/g, "").slice(0, 11);
}
function extractSerie(text) {
  SERIE_PATTERN.lastIndex = 0;
  const matches = [...text.matchAll(SERIE_PATTERN)];
  const candidate = matches.find((m) => /^[FEB]/i.test(m[1]))?.[1];
  return candidate?.toUpperCase() ?? "F001";
}
function extractNumero(text) {
  NUMERO_PATTERN.lastIndex = 0;
  const matches = [...text.matchAll(NUMERO_PATTERN)];
  const nums = matches.map((m) => m[1]).filter(Boolean);
  if (nums.length === 0) {
    const fallback = text.match(/\b(\d{6,8})\b/);
    return fallback?.[1] ?? "1";
  }
  return nums.sort((a, b) => b.length - a.length)[0];
}
function extractFecha(text) {
  FECHA_PATTERN.lastIndex = 0;
  const m = FECHA_PATTERN.exec(text);
  if (!m?.[1]) return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  return normalizeFecha(m[1]);
}
function calcularConfianza(invoice) {
  let score = 0;
  if (invoice.rucEmisor.length === 11) score += 2;
  if (invoice.serie && invoice.numero) score += 2;
  if (invoice.total > 0) score += 2;
  if (invoice.baseImponible > 0 && invoice.igv > 0) score += 2;
  if (score >= 7) return "ALTA";
  if (score >= 4) return "MEDIA";
  return "BAJA";
}
async function extractTextFromPdfBuffer(buffer) {
  const pdfjs = await import("./pdf-CgsIjvPo.js");
  if (typeof window !== "undefined") {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();
  }
  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer) });
  const pdf = await loadingTask.promise;
  const pages = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => "str" in item ? item.str : "").join(" ");
    pages.push(pageText);
  }
  return pages.join("\n");
}
function parseInvoiceFromText(text) {
  const normalized = text.replace(/\s+/g, " ").trim();
  const tipoComprobante = detectTipoComprobante(normalized);
  const rucEmisor = extractRuc(normalized) ?? "";
  const serie = extractSerie(normalized);
  const numero = extractNumero(normalized);
  const fechaEmision = extractFecha(normalized);
  const moneda = MONEDA_USD_PATTERN.test(normalized) ? "USD" : "PEN";
  const bases = extractAllMontos(normalized, SUBTOTAL_PATTERN);
  const igvs = extractAllMontos(normalized, IGV_PATTERN);
  const totales = extractAllMontos(normalized, TOTAL_PATTERN);
  let baseImponible = bases.length ? bases[bases.length - 1] : 0;
  let igv = igvs.length ? igvs[igvs.length - 1] : 0;
  let total = totales.length ? totales[totales.length - 1] : 0;
  if (total === 0 && baseImponible > 0 && igv > 0) {
    total = Math.round((baseImponible + igv) * 100) / 100;
  }
  if (baseImponible === 0 && total > 0 && igv > 0) {
    baseImponible = Math.round((total - igv) * 100) / 100;
  }
  if (igv === 0 && baseImponible > 0) {
    igv = Math.round(baseImponible * 0.18 * 100) / 100;
  }
  if (total === 0 && baseImponible > 0) {
    total = Math.round((baseImponible + igv) * 100) / 100;
  }
  const razonMatch = RAZON_SOCIAL_PATTERN.exec(normalized);
  const razonSocialEmisor = razonMatch?.[1]?.trim() ?? null;
  const partial = {
    tipoComprobante,
    rucEmisor,
    razonSocialEmisor,
    serie,
    numero,
    fechaEmision,
    moneda,
    baseImponible,
    igv,
    total
  };
  return {
    ...partial,
    textoExtraido: normalized.slice(0, 4e3),
    confianza: calcularConfianza(partial)
  };
}
async function parsePdfInvoice(file) {
  const buffer = await file.arrayBuffer();
  const text = await extractTextFromPdfBuffer(buffer);
  if (!text.trim()) {
    throw new Error("No se pudo extraer texto del PDF. Verifique que no esté escaneado como imagen pura.");
  }
  return parseInvoiceFromText(text);
}
function parsedPdfToImportRow(invoice, filaNumero) {
  const periodo = invoice.fechaEmision.replace(/-/g, "").slice(0, 6);
  return {
    filaNumero,
    ruc: invoice.rucEmisor,
    razonSocial: invoice.razonSocialEmisor ?? "SIN RAZON SOCIAL",
    tipoDoc: invoice.tipoComprobante,
    serie: invoice.serie,
    numero: invoice.numero,
    fecha: invoice.fechaEmision,
    moneda: invoice.moneda,
    base: invoice.baseImponible,
    igv: invoice.igv,
    total: invoice.total,
    periodo,
    tipoCambio: invoice.moneda === "USD" ? 3.75 : 1
  };
}
const initialState = {
  phase: "idle",
  fileName: null,
  origen: null,
  tipoLote: null,
  preflight: null,
  progress: 0,
  error: null,
  lastResult: null
};
function tipoLoteFromPlantilla(tipo, override) {
  if (override) return override;
  if (tipo === "VENTAS") return "VENTAS";
  if (tipo === "ASIENTOS") return "ASIENTOS_MANUALES";
  return "COMPRAS";
}
function useImportador() {
  const qc = useQueryClient();
  const [state, setState] = reactExports.useState(initialState);
  const reset = reactExports.useCallback(() => setState(initialState), []);
  const parseAndValidate = reactExports.useCallback(
    async (params) => {
      setState((s) => ({
        ...s,
        phase: "parsing",
        fileName: params.file.name,
        progress: 10,
        error: null,
        preflight: null,
        lastResult: null
      }));
      try {
        const ext = params.file.name.split(".").pop()?.toLowerCase() ?? "";
        let filas = [];
        let origen;
        let tipoLote;
        if (ext === "pdf") {
          origen = "PDF_OCR";
          const invoice = await parsePdfInvoice(params.file);
          filas = [parsedPdfToImportRow(invoice, 2)];
          tipoLote = params.tipoLoteOverride ?? "COMPRAS";
        } else {
          const parsed = await parsearArchivoImportacion(params.file);
          origen = parsed.origen;
          filas = parsed.filas;
          tipoLote = tipoLoteFromPlantilla(parsed.tipoDetectado, params.tipoLoteOverride);
        }
        setState((s) => ({ ...s, phase: "validating", progress: 40 }));
        const duplicadosBd = await buscarDuplicadosEnBd({
          contribuyenteId: params.contribuyenteId,
          tipoLote,
          periodo: params.periodoActivo
        });
        const preflight = ejecutarPreflightValidacion({
          filas,
          tipoLote,
          periodoActivo: params.periodoActivo.replace(/\D/g, "").slice(0, 6),
          duplicadosEnBd: duplicadosBd
        });
        setState({
          phase: "ready",
          fileName: params.file.name,
          origen,
          tipoLote,
          preflight,
          progress: 100,
          error: null,
          lastResult: null
        });
        return preflight;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al procesar archivo";
        setState((s) => ({ ...s, phase: "error", error: message, progress: 0 }));
        toast.error(message);
        throw err;
      }
    },
    []
  );
  const confirmImport = useMutation({
    mutationFn: async (params) => {
      if (!state.preflight || !state.origen || !state.tipoLote || !state.fileName) {
        throw new Error("No hay datos validados para importar");
      }
      setState((s) => ({ ...s, phase: "uploading", progress: 20 }));
      const loteId = await crearLoteImportacion({
        contribuyenteId: params.contribuyenteId,
        origen: state.origen,
        tipoLote: state.tipoLote,
        nombreArchivo: state.fileName,
        periodoContable: params.periodoActivo,
        filasPreflight: state.preflight.filas
      });
      setState((s) => ({ ...s, phase: "processing", progress: 60 }));
      const result = await procesarLoteImportacion(loteId);
      setState((s) => ({
        ...s,
        phase: "done",
        progress: 100,
        lastResult: result
      }));
      return result;
    },
    onSuccess: (result) => {
      toast.success(
        `Importación completada: ${result.registrosExitosos} registro(s) procesado(s), ${result.registrosConError} con error`
      );
      void qc.invalidateQueries({ queryKey: ["registros_sire"] });
      void qc.invalidateQueries({ queryKey: ["sire-core"] });
      void qc.invalidateQueries({ queryKey: ["importador"] });
    },
    onError: (err) => {
      setState((s) => ({ ...s, phase: "error", error: err.message }));
      toast.error(err.message);
    }
  });
  return {
    state,
    reset,
    parseAndValidate,
    confirmImport,
    resolveContribuyenteId: fetchContribuyenteIdByRucImport
  };
}
const GLASS = "rounded-2xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-md text-slate-100 shadow-xl shadow-emerald-950/20";
const ACCEPT = ".pdf,.xlsx,.xls,.csv";
function useClientMounted() {
  const [mounted, setMounted] = reactExports.useState(false);
  reactExports.useEffect(() => setMounted(true), []);
  return mounted;
}
function defaultPeriodo() {
  const d = /* @__PURE__ */ new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function formatFileSize(bytes, mounted) {
  if (!mounted) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
function formatSoles(n, mounted) {
  if (!mounted) return "—";
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(n);
}
function PlantillaButton({
  label,
  tipo,
  icon
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Button,
    {
      type: "button",
      variant: "outline",
      className: "border-emerald-600/40 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-500/10",
      onClick: () => descargarPlantillaOficial(tipo),
      children: [
        icon,
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2", children: label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "ml-2 size-4 opacity-60" })
      ]
    }
  );
}
function ImportadorHub() {
  const mounted = useClientMounted();
  const { contribuyentes, loading: loadingContrib } = useContribuyentes();
  const { state, reset, parseAndValidate, confirmImport } = useImportador();
  const [selectedRuc, setSelectedRuc] = reactExports.useState("");
  const [periodo, setPeriodo] = reactExports.useState(defaultPeriodo);
  const [tipoLote, setTipoLote] = reactExports.useState("COMPRAS");
  const [dragOver, setDragOver] = reactExports.useState(false);
  const [pendingFile, setPendingFile] = reactExports.useState(null);
  const contribuyente = reactExports.useMemo(
    () => contribuyentes.find((c) => c.ruc.replace(/\D/g, "") === selectedRuc),
    [contribuyentes, selectedRuc]
  );
  const { data: resolvedId } = useQuery({
    queryKey: ["contribuyente-id-import", selectedRuc],
    queryFn: () => fetchContribuyenteIdByRucImport(selectedRuc),
    enabled: !!selectedRuc && selectedRuc.length === 11,
    staleTime: 5 * 6e4
  });
  const contribuyenteId = contribuyente?.id ?? resolvedId ?? null;
  const periodoClean = periodo.replace(/\D/g, "").slice(0, 6);
  const options = reactExports.useMemo(
    () => contribuyentes.filter((c) => c.ruc?.trim()).map((c) => ({
      ruc: c.ruc.replace(/\D/g, "").slice(0, 11),
      label: `${c.ruc} — ${c.razonSocial || "Sin razón social"}`
    })),
    [contribuyentes]
  );
  const handleFile = reactExports.useCallback(
    async (file) => {
      if (!contribuyenteId) {
        toast.error("Seleccione un contribuyente antes de importar");
        return;
      }
      setPendingFile(file);
      await parseAndValidate({
        file,
        contribuyenteId,
        periodoActivo: periodoClean,
        tipoLoteOverride: tipoLote
      });
    },
    [contribuyenteId, parseAndValidate, periodoClean, tipoLote]
  );
  const onDrop = reactExports.useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) void handleFile(file);
    },
    [handleFile]
  );
  const onFileInput = reactExports.useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (file) void handleFile(file);
      e.target.value = "";
    },
    [handleFile]
  );
  const validos = state.preflight?.validos ?? 0;
  const errores = state.preflight?.errores ?? 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-full space-y-6 p-4 md:p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "Importador Multiformato CONTAM" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "PDF (OCR) · Excel · CSV — Pre-flight validator antes de persistir en SIRE" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn(GLASS, "grid gap-4 p-5 md:grid-cols-3"), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 md:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-slate-400", children: "Contribuyente" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: selectedRuc || void 0, onValueChange: setSelectedRuc, disabled: loadingContrib, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "border-slate-700 bg-slate-950/50", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Seleccione RUC…" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: options.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o.ruc, children: o.label }, o.ruc)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-slate-400", children: "Periodo contable" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: periodoClean, onValueChange: setPeriodo, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "border-slate-700 bg-slate-950/50", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: Array.from({ length: 12 }, (_, i) => {
            const d = /* @__PURE__ */ new Date();
            d.setMonth(d.getMonth() - i);
            const p = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: p, children: [
              p.slice(0, 4),
              "-",
              p.slice(4, 6)
            ] }, p);
          }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 md:col-span-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-slate-400", children: "Tipo de lote" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: tipoLote, onValueChange: (v) => setTipoLote(v), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "border-slate-700 bg-slate-950/50 max-w-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "COMPRAS", children: "Compras (RCE)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "VENTAS", children: "Ventas (RVIE)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "ASIENTOS_MANUALES", children: "Asientos manuales" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn(GLASS, "p-5"), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-3 text-sm font-semibold uppercase tracking-wider text-emerald-400/90", children: "Plantillas oficiales CONTAM" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          PlantillaButton,
          {
            label: "Compras",
            tipo: "COMPRAS",
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(FileSpreadsheet, { className: "size-4" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          PlantillaButton,
          {
            label: "Ventas",
            tipo: "VENTAS",
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(FileSpreadsheet, { className: "size-4" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          PlantillaButton,
          {
            label: "Asientos",
            tipo: "ASIENTOS",
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(FileSpreadsheet, { className: "size-4" })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: cn(
          GLASS,
          "relative border-2 border-dashed p-10 text-center transition-all",
          dragOver ? "border-emerald-400 bg-emerald-500/10 scale-[1.01]" : "border-slate-700 hover:border-emerald-600/50"
        ),
        onDragOver: (e) => {
          e.preventDefault();
          setDragOver(true);
        },
        onDragLeave: () => setDragOver(false),
        onDrop,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "file",
              accept: ACCEPT,
              className: "absolute inset-0 cursor-pointer opacity-0",
              onChange: onFileInput,
              disabled: !contribuyenteId || state.phase === "parsing" || state.phase === "validating"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Upload,
            {
              className: cn(
                "mx-auto mb-4 size-12",
                dragOver ? "text-emerald-400 animate-bounce" : "text-slate-500"
              )
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-medium text-slate-200", children: "Arrastre archivos PDF, Excel o CSV aquí" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-500", children: "Extracción OCR de comprobantes SUNAT · Validación pre-flight automática" }),
          pendingFile && mounted && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-3 text-xs text-emerald-400/80", children: [
            pendingFile.name,
            " · ",
            formatFileSize(pendingFile.size, mounted)
          ] }),
          !contribuyenteId && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-xs text-amber-400", children: "Seleccione un contribuyente para habilitar la carga" })
        ]
      }
    ),
    (state.phase === "parsing" || state.phase === "validating" || state.phase === "uploading" || state.phase === "processing") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn(GLASS, "p-4"), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center gap-2 text-sm text-slate-400", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 animate-spin text-emerald-400" }),
        state.phase === "parsing" && "Extrayendo datos del archivo…",
        state.phase === "validating" && "Ejecutando pre-flight validator…",
        state.phase === "uploading" && "Guardando lote en Supabase…",
        state.phase === "processing" && "Procesando lote (RPC atómica)…"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: state.progress, className: "h-2 [&>div]:bg-emerald-500" })
    ] }),
    state.error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "mt-0.5 size-5 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "Error de importación" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm opacity-90", children: state.error }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "mt-2", onClick: reset, children: "Reintentar" })
      ] })
    ] }),
    state.preflight && state.preflight.filas.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn(GLASS, "overflow-hidden"), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 px-6 py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold", children: "Pre-flight Validation" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-slate-500", children: [
            validos,
            " válido(s) · ",
            errores,
            " con error · ",
            state.preflight.total,
            " total"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "text-slate-400", onClick: reset, children: "Limpiar" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              className: "bg-emerald-600 hover:bg-emerald-500",
              disabled: validos === 0 || !contribuyenteId || confirmImport.isPending || state.phase === "done",
              onClick: () => {
                if (!contribuyenteId) return;
                confirmImport.mutate({
                  contribuyenteId,
                  periodoActivo: periodoClean
                });
              },
              children: [
                confirmImport.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 size-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "mr-2 size-4" }),
                "Importar ",
                validos,
                " registro(s) válido(s)",
                errores > 0 ? ` (${errores} ignorado(s))` : ""
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-[420px] overflow-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "border-slate-800 hover:bg-transparent", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400", children: "#" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400", children: "Estado" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400", children: "Detalle" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400", children: "RUC / Cuenta" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-slate-400", children: "Comprobante" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-right text-slate-400", children: "Total" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: state.preflight.filas.map((fila) => {
          const ok = fila.estado === "VALIDO";
          const comp = isFilaComprobante(fila.datos) ? fila.datos : null;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "border-slate-800/60", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-slate-500", children: fila.filaNumero }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: ok ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "mr-1 size-3" }),
              " Válido"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "cursor-help bg-red-500/20 text-red-300 hover:bg-red-500/20", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "mr-1 size-3" }),
                " Error"
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { side: "left", className: "max-w-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1 text-xs", children: fila.errores.map((e, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                  e.codigo,
                  ":"
                ] }),
                " ",
                e.mensaje
              ] }, i)) }) })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "max-w-[200px] truncate text-slate-400", children: comp?.razonSocial ?? ("glosa" in fila.datos ? fila.datos.glosa : "—") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-xs text-emerald-400/90", children: comp?.ruc ?? ("cuentaContable" in fila.datos ? fila.datos.cuentaContable : "—") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-mono text-sm", children: comp ? `${comp.serie}-${comp.numero}` : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-right text-slate-200", children: comp ? formatSoles(comp.total, mounted) : "debe" in fila.datos ? `D:${fila.datos.debe} H:${fila.datos.haber}` : "—" })
          ] }, fila.filaNumero);
        }) })
      ] }) })
    ] }),
    state.lastResult && state.phase === "done" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "mt-0.5 size-5 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "Importación procesada" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
          state.lastResult.registrosExitosos,
          " exitoso(s) ·",
          " ",
          state.lastResult.registrosConError,
          " error(es) · Estado: ",
          state.lastResult.estado
        ] })
      ] })
    ] })
  ] }) });
}
export {
  ImportadorHub
};
