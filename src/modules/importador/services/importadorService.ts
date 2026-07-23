import { supabase } from "@/integrations/supabase/client";
import { throwIfSupabaseError } from "@/lib/supabase-error";
import type {
  FilaComprobanteImport,
  ImportacionLote,
  ImportacionOrigen,
  ImportacionTipoLote,
  PreflightRowResult,
  ProcesarLoteResult,
} from "@/modules/importador/types/importador";
import {
  filaAsientoToDatosRaw,
  filaComprobanteToDatosRaw,
} from "@/modules/importador/utils/preflightValidator";
import { isFilaComprobante } from "@/modules/importador/types/importador";

type ImportDb = {
  rpc: (fn: string, args?: Record<string, unknown>) => ReturnType<typeof supabase.rpc>;
  from: (table: string) => ReturnType<typeof supabase.from>;
};

const db = supabase as unknown as ImportDb;

function mapLote(row: Record<string, unknown>): ImportacionLote {
  return {
    id: String(row.id),
    contribuyenteId: String(row.contribuyente_id),
    origen: row.origen as ImportacionLote["origen"],
    tipoLote: row.tipo_lote as ImportacionLote["tipoLote"],
    totalRegistros: Number(row.total_registros ?? 0),
    registrosExitosos: Number(row.registros_exitosos ?? 0),
    registrosConError: Number(row.registros_con_error ?? 0),
    estado: row.estado as ImportacionLote["estado"],
    usuarioId: row.usuario_id ? String(row.usuario_id) : null,
    nombreArchivo: row.nombre_archivo ? String(row.nombre_archivo) : null,
    periodoContable: row.periodo_contable ? String(row.periodo_contable) : null,
    createdAt: String(row.created_at),
    procesadoAt: row.procesado_at ? String(row.procesado_at) : null,
  };
}

export async function buscarDuplicadosEnBd(params: {
  contribuyenteId: string;
  tipoLote: ImportacionTipoLote;
  periodo: string;
}): Promise<Set<string>> {
  if (params.tipoLote === "ASIENTOS_MANUALES") return new Set();

  const tipo = params.tipoLote === "COMPRAS" ? "COMPRA" : "VENTA";
  const periodo = params.periodo.replace(/\D/g, "").slice(0, 6);

  const { data, error } = await db
    .from("registros_sire_cabecera")
    .select("cod_tipo_cdp, serie_cdp, nro_cdp_inicial, nro_doc_contraparte")
    .eq("contribuyente_id", params.contribuyenteId)
    .eq("periodo", periodo)
    .eq("tipo", tipo);

  throwIfSupabaseError(error, "Error al verificar duplicados en BD");

  const set = new Set<string>();
  for (const row of data ?? []) {
    const r = row as {
      cod_tipo_cdp: string;
      serie_cdp: string | null;
      nro_cdp_inicial: string;
      nro_doc_contraparte: string | null;
    };
    set.add(`${r.cod_tipo_cdp}|${r.serie_cdp ?? ""}|${r.nro_cdp_inicial}|${(r.nro_doc_contraparte ?? "").replace(/\D/g, "")}`);
  }
  return set;
}

export async function crearLoteImportacion(params: {
  contribuyenteId: string;
  origen: ImportacionOrigen;
  tipoLote: ImportacionTipoLote;
  nombreArchivo: string;
  periodoContable: string;
  filasPreflight: PreflightRowResult[];
}): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: lote, error: loteErr } = await db
    .from("importaciones_lotes")
    .insert({
      contribuyente_id: params.contribuyenteId,
      origen: params.origen,
      tipo_lote: params.tipoLote,
      total_registros: params.filasPreflight.length,
      registros_con_error: params.filasPreflight.filter((f) => f.estado === "ERROR").length,
      estado: "BORRADOR",
      usuario_id: user?.id ?? null,
      nombre_archivo: params.nombreArchivo,
      periodo_contable: params.periodoContable.replace(/\D/g, "").slice(0, 6),
    })
    .select("id")
    .single();

  throwIfSupabaseError(loteErr, "Error al crear lote de importación");

  const loteId = (lote as { id: string }).id;

  const detalles = params.filasPreflight.map((f) => ({
    lote_id: loteId,
    fila_numero: f.filaNumero,
    datos_raw: isFilaComprobante(f.datos)
      ? filaComprobanteToDatosRaw(f.datos as FilaComprobanteImport)
      : filaAsientoToDatosRaw(f.datos as import("@/modules/importador/types/importador").FilaAsientoImport),
    estado_registro: f.estado,
    errores: f.errores,
  }));

  const { error: detErr } = await db.from("importaciones_detalles").insert(detalles);
  throwIfSupabaseError(detErr, "Error al guardar detalles de importación");

  return loteId;
}

export async function procesarLoteImportacion(loteId: string): Promise<ProcesarLoteResult> {
  const { data, error } = await db.rpc("fn_procesar_lote_importacion", {
    p_lote_id: loteId,
  });

  throwIfSupabaseError(error, "Error al procesar lote");

  if (!data) throw new Error("Procesamiento sin respuesta");

  const row = data as Record<string, unknown>;
  return {
    ok: Boolean(row.ok),
    loteId: String(row.lote_id),
    registrosExitosos: Number(row.registros_exitosos ?? 0),
    registrosConError: Number(row.registros_con_error ?? 0),
    estado: String(row.estado) as ProcesarLoteResult["estado"],
  };
}

export async function obtenerLoteImportacion(loteId: string): Promise<ImportacionLote | null> {
  const { data, error } = await db
    .from("importaciones_lotes")
    .select("*")
    .eq("id", loteId)
    .maybeSingle();

  throwIfSupabaseError(error, "Error al obtener lote");
  if (!data) return null;
  return mapLote(data as Record<string, unknown>);
}

export async function fetchContribuyenteIdByRucImport(ruc: string): Promise<string | null> {
  const clean = ruc.replace(/\D/g, "").slice(0, 11);
  const { data, error } = await supabase
    .from("contribuyentes")
    .select("id")
    .eq("ruc", clean)
    .maybeSingle();
  throwIfSupabaseError(error, "Error al buscar contribuyente");
  return data?.id ?? null;
}
