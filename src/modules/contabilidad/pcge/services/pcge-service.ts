import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  computeNivelFromCodigo,
  computePadreCodigo,
  formatCuentaPcge,
  normalizePcgeCode,
  validatePcgeCode,
} from "@/modules/contabilidad/pcge/utils/pcge-codigo";
import {
  getColorNivel,
  getNivelFromCodigo,
  getNivelNombre,
  validatePCGEHierarchy,
} from "@/modules/contabilidad/pcge/services/pcge-validator";
import { sanitizePayload, throwIfSupabaseError } from "@/lib/supabase-error";
import type {
  ActualizarCuentaPcgeDTO,
  CrearCuentaPcgeDTO,
  PcgeJerarquico,
  PcgeTreeNode,
  PlanContableCuenta,
} from "@/types/pcge";

export type { PlanContableCuenta as PcgeCuenta, PlanContableCuenta as CuentaPCGE };
export {
  formatCuentaPcge,
  normalizePcgeCode,
  computeNivelFromCodigo,
  getNivelFromCodigo,
  getNivelNombre,
  getColorNivel,
  validatePCGEHierarchy,
};

const PCGE_COLUMNS =
  "id, codigo_cuenta, nombre_cuenta, tipo_cuenta, nivel, naturaleza, aplica_para, palabras_clave, activo, padre_codigo, es_agrupador, created_at, updated_at" as const;

const PCGE_QUERY_KEY = ["pcge"] as const;
const PCGE_CUENTAS_KEY = ["pcge", "cuentas"] as const;
const PCGE_ARBOL_KEY = ["pcge", "arbol"] as const;

export type PcgeFiltros = {
  activo?: boolean;
  soloOperativas?: boolean;
  nivel?: number;
};

export type PcgeCuentaDetalle = PlanContableCuenta & {
  nombre_padre?: string | null;
  hijos_directos: PlanContableCuenta[];
  estadisticas: {
    asientos_mes: number;
    asientos_total: number;
    ultimo_movimiento: string | null;
    actividad_mensual: { mes: string; count: number }[];
  };
};

export type PcgeEstadisticas = {
  total: number;
  por_nivel: Record<number, number>;
  operativas: number;
  agrupadoras: number;
  mas_usadas: { codigo_cuenta: string; nombre_cuenta: string; usos: number }[];
};

function arrayToText(value: unknown): string | null {
  if (value == null) return null;
  if (Array.isArray(value)) {
    const items = value.map((x) => String(x).trim()).filter(Boolean);
    return items.length ? items.join(", ") : null;
  }
  const text = String(value).trim();
  return text || null;
}

function textToArray(value: string | null | undefined): string[] | null {
  const text = (value ?? "").trim();
  if (!text) return null;
  return text.split(",").map((x) => x.trim()).filter(Boolean);
}

function mapRow(row: Record<string, unknown>): PlanContableCuenta {
  return {
    id: row.id != null ? String(row.id) : undefined,
    codigo_cuenta: normalizePcgeCode(String(row.codigo_cuenta ?? "")),
    nombre_cuenta: String(row.nombre_cuenta ?? ""),
    tipo_cuenta: row.tipo_cuenta != null ? String(row.tipo_cuenta) : null,
    nivel: Number(row.nivel ?? computeNivelFromCodigo(String(row.codigo_cuenta ?? ""))),
    naturaleza: row.naturaleza != null ? String(row.naturaleza) : null,
    aplica_para: arrayToText(row.aplica_para),
    palabras_clave: arrayToText(row.palabras_clave),
    activo: row.activo !== false,
    padre_codigo:
      row.padre_codigo != null
        ? normalizePcgeCode(String(row.padre_codigo))
        : computePadreCodigo(String(row.codigo_cuenta ?? "")),
    es_agrupador: row.es_agrupador === true,
    created_at: row.created_at != null ? String(row.created_at) : undefined,
    updated_at: row.updated_at != null ? String(row.updated_at) : undefined,
  };
}

export function buildPcgeTree(cuentas: PlanContableCuenta[]): PcgeTreeNode[] {
  const byCode = new Map<string, PcgeTreeNode>();
  for (const c of cuentas) {
    byCode.set(c.codigo_cuenta, { ...c, hijos: [] });
  }
  const roots: PcgeTreeNode[] = [];
  for (const node of byCode.values()) {
    const padre = node.padre_codigo ? byCode.get(node.padre_codigo) : undefined;
    if (padre) padre.hijos.push(node);
    else roots.push(node);
  }
  const sortNodes = (nodes: PcgeTreeNode[]) => {
    nodes.sort((a, b) => a.codigo_cuenta.localeCompare(b.codigo_cuenta));
    nodes.forEach((n) => sortNodes(n.hijos));
  };
  sortNodes(roots);
  return roots;
}

function applyFiltros(cuentas: PlanContableCuenta[], filtros?: PcgeFiltros): PlanContableCuenta[] {
  if (!filtros) return cuentas;
  return cuentas.filter((c) => {
    if (filtros.activo != null && c.activo !== filtros.activo) return false;
    if (filtros.soloOperativas && c.es_agrupador) return false;
    if (filtros.nivel != null && c.nivel !== filtros.nivel) return false;
    return true;
  });
}

/** Servicio PCGE refactorizado — lectura, escritura y estadísticas. */
export class PcgeService {
  async fetchAll(): Promise<PlanContableCuenta[]> {
    const allRows: unknown[] = [];
    const pageSize = 1000;
    let page = 0;

    while (true) {
      const { data, error } = await supabase
        .from("plan_contable_pcge")
        .select(PCGE_COLUMNS)
        .order("codigo_cuenta", { ascending: true })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      throwIfSupabaseError(error, "Error al cargar plan de cuentas");

      if (!data || data.length === 0) {
        break;
      }

      allRows.push(...data);

      if (data.length < pageSize) {
        break;
      }

      page++;
    }

    return allRows.map((row) => mapRow(row as Record<string, unknown>));
  }

  async getArbolPCGE(filtros?: PcgeFiltros): Promise<PcgeTreeNode[]> {
    const cuentas = await this.fetchAll();
    return buildPcgeTree(applyFiltros(cuentas, filtros));
  }

  async getSubCuentas(padreCodigo: string): Promise<PlanContableCuenta[]> {
    const padre = normalizePcgeCode(padreCodigo);
    const { data, error } = await supabase
      .from("plan_contable_pcge")
      .select(PCGE_COLUMNS)
      .eq("padre_codigo", padre)
      .order("codigo_cuenta", { ascending: true });
    throwIfSupabaseError(error, "Error al cargar subcuentas");
    return (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
  }

  async searchCuentas(termino: string, tipo?: "operativa" | "agrupadora" | "todas"): Promise<PlanContableCuenta[]> {
    const q = termino.trim().toLowerCase();
    const all = await this.fetchAll();
    let results = all;
    if (q) {
      results = all.filter(
        (c) => c.codigo_cuenta.includes(q) || c.nombre_cuenta.toLowerCase().includes(q),
      );
    }
    if (tipo === "operativa") results = results.filter((c) => !c.es_agrupador);
    if (tipo === "agrupadora") results = results.filter((c) => c.es_agrupador);
    return results.slice(0, 100);
  }

  async getCuentaCompleta(codigo: string): Promise<PcgeCuentaDetalle | null> {
    const code = normalizePcgeCode(codigo);
    const { data, error } = await supabase
      .from("plan_contable_pcge")
      .select(PCGE_COLUMNS)
      .eq("codigo_cuenta", code)
      .maybeSingle();
    if (error || !data) return null;

    const cuenta = mapRow(data as Record<string, unknown>);
    const hijos = await this.getSubCuentas(code);

    let nombre_padre: string | null = null;
    if (cuenta.padre_codigo) {
      const { data: padre } = await supabase
        .from("plan_contable_pcge")
        .select("nombre_cuenta")
        .eq("codigo_cuenta", cuenta.padre_codigo)
        .maybeSingle();
      nombre_padre = padre?.nombre_cuenta ? String(padre.nombre_cuenta) : null;
    }

    const now = new Date();
    const mesActual = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;

    const { count: asientosMes } = await supabase
      .from("asientos_contables")
      .select("id", { count: "exact", head: true })
      .eq("cuenta_contable", code)
      .eq("periodo", mesActual);

    const { count: asientosTotal } = await supabase
      .from("asientos_contables")
      .select("id", { count: "exact", head: true })
      .eq("cuenta_contable", code);

    const { data: ultimo } = await supabase
      .from("asientos_contables")
      .select("fecha_asiento")
      .eq("cuenta_contable", code)
      .order("fecha_asiento", { ascending: false })
      .limit(1)
      .maybeSingle();

    const actividad_mensual: { mes: string; count: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const periodo = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
      const { count } = await supabase
        .from("asientos_contables")
        .select("id", { count: "exact", head: true })
        .eq("cuenta_contable", code)
        .eq("periodo", periodo);
      actividad_mensual.push({ mes: periodo, count: count ?? 0 });
    }

    return {
      ...cuenta,
      nombre_padre,
      hijos_directos: hijos,
      estadisticas: {
        asientos_mes: asientosMes ?? 0,
        asientos_total: asientosTotal ?? 0,
        ultimo_movimiento: ultimo?.fecha_asiento ? String(ultimo.fecha_asiento) : null,
        actividad_mensual,
      },
    };
  }

  async createCuenta(input: CrearCuentaPcgeDTO): Promise<void> {
    const validation = validatePCGEHierarchy(input.codigo_cuenta, input.padre_codigo);
    if (!validation.valid) throw new Error(validation.errors.join("; "));
    await upsertPcgeCuenta(input);
  }

  async updateCuenta(codigo: string, datos: ActualizarCuentaPcgeDTO): Promise<void> {
    await upsertPcgeCuenta({ ...datos, codigo_cuenta: codigo });
  }

  async getCuentasOperativas(): Promise<PlanContableCuenta[]> {
    return fetchPcgeCuentasActivas();
  }

  async getEstadisticasPCGE(): Promise<PcgeEstadisticas> {
    const cuentas = await this.fetchAll();
    const por_nivel: Record<number, number> = {};
    for (const c of cuentas) {
      por_nivel[c.nivel] = (por_nivel[c.nivel] ?? 0) + 1;
    }

    const { data: usoRows } = await supabase
      .from("asientos_contables")
      .select("cuenta_contable")
      .limit(5000);

    const usoMap = new Map<string, number>();
    for (const row of usoRows ?? []) {
      const code = normalizePcgeCode(String(row.cuenta_contable ?? ""));
      if (code) usoMap.set(code, (usoMap.get(code) ?? 0) + 1);
    }

    const mas_usadas = [...usoMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([codigo_cuenta, usos]) => {
        const c = cuentas.find((x) => x.codigo_cuenta === codigo_cuenta);
        return {
          codigo_cuenta,
          nombre_cuenta: c?.nombre_cuenta ?? "—",
          usos,
        };
      });

    return {
      total: cuentas.length,
      por_nivel,
      operativas: cuentas.filter((c) => !c.es_agrupador).length,
      agrupadoras: cuentas.filter((c) => c.es_agrupador).length,
      mas_usadas,
    };
  }
}

export const pcgeService = new PcgeService();

// ─── Funciones legacy (compatibilidad combobox y módulos existentes) ───

export async function fetchPcgeCuentas(): Promise<PlanContableCuenta[]> {
  return pcgeService.fetchAll();
}

export async function fetchPcgeJerarquico(): Promise<PcgeJerarquico[]> {
  const { data, error } = await supabase
    .from("v_pcge_jerarquico")
    .select("*")
    .order("codigo_cuenta", { ascending: true });

  if (error) {
    const cuentas = await fetchPcgeCuentas();
    return cuentas.map((c) => ({
      ...c,
      nombre_padre: null,
      ruta_visual: `${c.codigo_cuenta} — ${c.nombre_cuenta}`,
    }));
  }
  return (data ?? []).map((row) => mapRow(row as Record<string, unknown>) as PcgeJerarquico);
}

export async function fetchPcgeCuentasActivas(): Promise<PlanContableCuenta[]> {
  const { data, error } = await supabase
    .from("plan_contable_pcge")
    .select(PCGE_COLUMNS)
    .eq("activo", true)
    .eq("es_agrupador", false)
    .order("codigo_cuenta", { ascending: true });

  if (error?.code === "42703") {
    const { data: fallback, error: err2 } = await supabase
      .from("plan_contable_pcge")
      .select(PCGE_COLUMNS)
      .eq("activo", true)
      .order("codigo_cuenta", { ascending: true });
    throwIfSupabaseError(err2, "Error al cargar cuentas activas");
    return (fallback ?? []).map((row) => mapRow(row as Record<string, unknown>));
  }

  throwIfSupabaseError(error, "Error al cargar cuentas activas");
  return (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
}

export async function generarCodigoPcgeHijo(padreCodigo?: string | null): Promise<string> {
  const { data, error } = await supabase.rpc("generar_codigo_pcge", {
    p_codigo_padre: padreCodigo ? normalizePcgeCode(padreCodigo) : null,
  });
  if (error) throw error;
  return normalizePcgeCode(String(data ?? ""));
}

export async function upsertPcgeCuenta(input: CrearCuentaPcgeDTO | ActualizarCuentaPcgeDTO): Promise<void> {
  const codigo_cuenta = normalizePcgeCode(input.codigo_cuenta);
  const nombre_cuenta = (input.nombre_cuenta ?? "").trim();
  const codeErr = validatePcgeCode(codigo_cuenta);
  if (codeErr) throw new Error(codeErr);

  const hierarchy = validatePCGEHierarchy(codigo_cuenta, input.padre_codigo);
  if (!hierarchy.valid) throw new Error(hierarchy.errors.join("; "));

  const nivel = input.nivel ?? computeNivelFromCodigo(codigo_cuenta);
  const padre_codigo = input.padre_codigo ?? computePadreCodigo(codigo_cuenta);

  const payload = sanitizePayload({
    codigo_cuenta,
    nombre_cuenta,
    nivel,
    padre_codigo,
    es_agrupador: input.es_agrupador ?? false,
    activo: input.activo ?? true,
    tipo_cuenta: input.tipo_cuenta ?? null,
    naturaleza: input.naturaleza ?? null,
    aplica_para: textToArray(input.aplica_para),
    palabras_clave: textToArray(input.palabras_clave),
  });

  const existing = await supabase
    .from("plan_contable_pcge")
    .select("codigo_cuenta")
    .eq("codigo_cuenta", codigo_cuenta)
    .maybeSingle();

  if (existing.data) {
    const { error } = await supabase
      .from("plan_contable_pcge")
      .update(payload)
      .eq("codigo_cuenta", codigo_cuenta);
    throwIfSupabaseError(error, "Error al actualizar cuenta PCGE");
    return;
  }

  const { error } = await supabase.from("plan_contable_pcge").insert(payload);
  throwIfSupabaseError(error, "Error al registrar cuenta PCGE");

  if (padre_codigo) {
    await supabase
      .from("plan_contable_pcge")
      .update({ es_agrupador: true })
      .eq("codigo_cuenta", padre_codigo);
  }
}

export async function setPcgeActivo(codigo_cuenta: string, activo: boolean): Promise<void> {
  const { error } = await supabase
    .from("plan_contable_pcge")
    .update({ activo })
    .eq("codigo_cuenta", normalizePcgeCode(codigo_cuenta));
  throwIfSupabaseError(error, "Error al cambiar estado de cuenta");
}

export async function deletePcgeCuenta(codigo_cuenta: string): Promise<void> {
  const code = normalizePcgeCode(codigo_cuenta);
  const { count, error: countErr } = await supabase
    .from("plan_contable_pcge")
    .select("codigo_cuenta", { count: "exact", head: true })
    .eq("padre_codigo", code);
  if (countErr) throw countErr;
  if ((count ?? 0) > 0) {
    throw new Error("No se puede eliminar: la cuenta tiene subcuentas hijas.");
  }
  const { error } = await supabase.from("plan_contable_pcge").delete().eq("codigo_cuenta", code);
  throwIfSupabaseError(error, "Error al eliminar cuenta PCGE");
}

// ─── React Query hooks ───

export function useArbolPCGE(filtros?: PcgeFiltros) {
  return useQuery({
    queryKey: [...PCGE_ARBOL_KEY, filtros ?? {}],
    queryFn: () => pcgeService.getArbolPCGE(filtros),
    staleTime: 60 * 60_000,
    gcTime: 24 * 60 * 60_000,
  });
}

export function usePcgeCuentas() {
  return useQuery({
    queryKey: PCGE_CUENTAS_KEY,
    queryFn: fetchPcgeCuentas,
    staleTime: 60 * 60_000,
    gcTime: 24 * 60 * 60_000,
  });
}

export function useSearchCuentas(termino: string, tipo?: "operativa" | "agrupadora" | "todas") {
  return useQuery({
    queryKey: [...PCGE_QUERY_KEY, "search", termino, tipo ?? "todas"],
    queryFn: () => pcgeService.searchCuentas(termino, tipo),
    enabled: termino.trim().length >= 1,
    placeholderData: (prev) => prev,
  });
}

export function useCuentaDetalle(codigo: string | null | undefined) {
  return useQuery({
    queryKey: [...PCGE_QUERY_KEY, "detalle", codigo],
    queryFn: () => (codigo ? pcgeService.getCuentaCompleta(codigo) : null),
    enabled: !!codigo,
    staleTime: 5 * 60_000,
  });
}

export function usePcgeEstadisticas() {
  return useQuery({
    queryKey: [...PCGE_QUERY_KEY, "stats"],
    queryFn: () => pcgeService.getEstadisticasPCGE(),
    staleTime: 10 * 60_000,
  });
}

export function useUpsertPcgeCuenta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: upsertPcgeCuenta,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: PCGE_QUERY_KEY });
    },
  });
}

export function useDeletePcgeCuenta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deletePcgeCuenta,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: PCGE_QUERY_KEY });
    },
  });
}
