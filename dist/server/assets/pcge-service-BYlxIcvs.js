import { u as useQuery } from "./useQuery-GwWd8T8C.js";
import { a8 as sanitizePayload, ab as supabase, ac as throwIfSupabaseError } from "./router-B2oVQHub.js";
const PCGE_LONGITUDES_NIVEL = {
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 6,
  6: 8
};
function normalizePcgeCode(input) {
  return String(input ?? "").trim().replace(/\./g, "").replace(/\D/g, "");
}
function computeNivelFromCodigo(codigo) {
  const len = normalizePcgeCode(codigo).length;
  if (len <= 1) return 1;
  if (len <= 2) return 2;
  if (len <= 3) return 3;
  if (len <= 4) return 4;
  if (len <= 6) return 5;
  return 6;
}
function computePadreCodigo(codigo) {
  const c = normalizePcgeCode(codigo);
  if (c.length <= 1) return null;
  if (c.length === 2) return c.slice(0, 1);
  if (c.length === 3) return c.slice(0, 2);
  if (c.length === 4) return c.slice(0, 3);
  if (c.length <= 6) return c.slice(0, 4);
  return c.slice(0, 6);
}
function validatePcgeCode(codigo) {
  const c = normalizePcgeCode(codigo);
  if (!c) return "El código de cuenta es obligatorio";
  if (!/^\d+$/.test(c)) return "Solo se permiten dígitos (sin puntos)";
  const len = c.length;
  const validLengths = Object.values(PCGE_LONGITUDES_NIVEL);
  if (!validLengths.includes(len)) {
    return `Longitud inválida (${len}). Use 1, 2, 3, 4, 6 u 8 dígitos según el nivel PCGE`;
  }
  return null;
}
function formatCuentaPcge(cuenta) {
  return `${normalizePcgeCode(cuenta.codigo_cuenta)} — ${cuenta.nombre_cuenta}`;
}
function nextChildLength(padreCodigo) {
  const len = normalizePcgeCode(padreCodigo).length;
  if (len === 1) return 2;
  if (len === 2) return 3;
  if (len === 3) return 4;
  if (len === 4) return 6;
  if (len === 6) return 8;
  return null;
}
const VALID_LENGTHS = /* @__PURE__ */ new Set([1, 2, 3, 4, 6, 8]);
const NIVEL_NOMBRES = {
  1: "Elemento",
  2: "Subelemento",
  3: "Cuenta Mayor",
  4: "Subcuenta",
  5: "Divisionaria",
  6: "Subdivisional"
};
function validatePCGEHierarchy(codigo, padreCodigo) {
  const errors = [];
  const warnings = [];
  const c = normalizePcgeCode(codigo);
  if (!c) {
    return {
      valid: false,
      nivel: null,
      nivelNombre: null,
      padreEsperado: null,
      errors: ["El código de cuenta es obligatorio"],
      warnings
    };
  }
  if (!/^\d+$/.test(c)) {
    errors.push("El código solo puede contener dígitos (sin puntos ni letras)");
  }
  if (c.length < 1 || c.length > 8) {
    errors.push(`Longitud ${c.length} inválida: el PCGE admite entre 1 y 8 dígitos`);
  }
  if (!VALID_LENGTHS.has(c.length)) {
    errors.push(
      `Longitud ${c.length} no corresponde a un nivel PCGE válido. Use 1, 2, 3, 4, 6 u 8 dígitos`
    );
  }
  const nivel = errors.length === 0 ? computeNivelFromCodigo(c) : null;
  const padreEsperado = c ? computePadreCodigo(c) : null;
  if (padreCodigo != null && padreCodigo !== "") {
    const padre = normalizePcgeCode(padreCodigo);
    if (!c.startsWith(padre)) {
      errors.push(
        `El código ${c} debe comenzar con el prefijo del padre ${padre} (jerarquía secuencial PCGE)`
      );
    }
    const expectedChildLen = nextChildLength(padre);
    if (expectedChildLen != null && c.length !== expectedChildLen) {
      errors.push(
        `Bajo el padre ${padre} se espera un código de ${expectedChildLen} dígitos, no ${c.length}`
      );
    }
  } else if (padreEsperado && c.length > 1) {
    warnings.push(`Padre esperado según estructura: ${padreEsperado}`);
  }
  if (c.length === 1 && padreCodigo) {
    errors.push("Las cuentas de nivel Elemento (1 dígito) no pueden tener padre");
  }
  return {
    valid: errors.length === 0,
    nivel,
    nivelNombre: nivel ? NIVEL_NOMBRES[nivel] : null,
    padreEsperado,
    errors,
    warnings
  };
}
function getNivelNombre(nivel) {
  const n = nivel;
  return NIVEL_NOMBRES[n] ?? `Nivel ${nivel}`;
}
function getColorNivel(nivel) {
  const map = {
    1: "text-premium-gold border-premium-gold/40 bg-premium-gold/10",
    2: "text-premium-cyan border-premium-cyan/40 bg-premium-cyan/10",
    3: "text-foreground border-border/60 bg-muted/30",
    4: "text-success border-success/30 bg-success/10",
    5: "text-warning border-warning/30 bg-warning/10",
    6: "text-muted-foreground border-border/40 bg-muted/20"
  };
  return map[nivel] ?? map[6];
}
const PCGE_COLUMNS = "id, codigo_cuenta, nombre_cuenta, tipo_cuenta, nivel, naturaleza, aplica_para, palabras_clave, activo, padre_codigo, es_agrupador, created_at, updated_at";
const PCGE_QUERY_KEY = ["pcge"];
const PCGE_CUENTAS_KEY = ["pcge", "cuentas"];
function arrayToText(value) {
  if (value == null) return null;
  if (Array.isArray(value)) {
    const items = value.map((x) => String(x).trim()).filter(Boolean);
    return items.length ? items.join(", ") : null;
  }
  const text = String(value).trim();
  return text || null;
}
function textToArray(value) {
  const text = (value ?? "").trim();
  if (!text) return null;
  return text.split(",").map((x) => x.trim()).filter(Boolean);
}
function mapRow(row) {
  return {
    id: row.id != null ? String(row.id) : void 0,
    codigo_cuenta: normalizePcgeCode(String(row.codigo_cuenta ?? "")),
    nombre_cuenta: String(row.nombre_cuenta ?? ""),
    tipo_cuenta: row.tipo_cuenta != null ? String(row.tipo_cuenta) : null,
    nivel: Number(row.nivel ?? computeNivelFromCodigo(String(row.codigo_cuenta ?? ""))),
    naturaleza: row.naturaleza != null ? String(row.naturaleza) : null,
    aplica_para: arrayToText(row.aplica_para),
    palabras_clave: arrayToText(row.palabras_clave),
    activo: row.activo !== false,
    padre_codigo: row.padre_codigo != null ? normalizePcgeCode(String(row.padre_codigo)) : computePadreCodigo(String(row.codigo_cuenta ?? "")),
    es_agrupador: row.es_agrupador === true,
    created_at: row.created_at != null ? String(row.created_at) : void 0,
    updated_at: row.updated_at != null ? String(row.updated_at) : void 0
  };
}
function buildPcgeTree(cuentas) {
  const byCode = /* @__PURE__ */ new Map();
  for (const c of cuentas) {
    byCode.set(c.codigo_cuenta, { ...c, hijos: [] });
  }
  const roots = [];
  for (const node of byCode.values()) {
    const padre = node.padre_codigo ? byCode.get(node.padre_codigo) : void 0;
    if (padre) padre.hijos.push(node);
    else roots.push(node);
  }
  const sortNodes = (nodes) => {
    nodes.sort((a, b) => a.codigo_cuenta.localeCompare(b.codigo_cuenta));
    nodes.forEach((n) => sortNodes(n.hijos));
  };
  sortNodes(roots);
  return roots;
}
function applyFiltros(cuentas, filtros) {
  if (!filtros) return cuentas;
  return cuentas.filter((c) => {
    if (filtros.activo != null && c.activo !== filtros.activo) return false;
    if (filtros.soloOperativas && c.es_agrupador) return false;
    if (filtros.nivel != null && c.nivel !== filtros.nivel) return false;
    return true;
  });
}
class PcgeService {
  async fetchAll() {
    const allRows = [];
    const pageSize = 1e3;
    let page = 0;
    while (true) {
      const { data, error } = await supabase.from("plan_contable_pcge").select(PCGE_COLUMNS).order("codigo_cuenta", { ascending: true }).range(page * pageSize, (page + 1) * pageSize - 1);
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
    return allRows.map((row) => mapRow(row));
  }
  async getArbolPCGE(filtros) {
    const cuentas = await this.fetchAll();
    return buildPcgeTree(applyFiltros(cuentas, filtros));
  }
  async getSubCuentas(padreCodigo) {
    const padre = normalizePcgeCode(padreCodigo);
    const { data, error } = await supabase.from("plan_contable_pcge").select(PCGE_COLUMNS).eq("padre_codigo", padre).order("codigo_cuenta", { ascending: true });
    throwIfSupabaseError(error, "Error al cargar subcuentas");
    return (data ?? []).map((row) => mapRow(row));
  }
  async searchCuentas(termino, tipo) {
    const q = termino.trim().toLowerCase();
    const all = await this.fetchAll();
    let results = all;
    if (q) {
      results = all.filter(
        (c) => c.codigo_cuenta.includes(q) || c.nombre_cuenta.toLowerCase().includes(q)
      );
    }
    if (tipo === "operativa") results = results.filter((c) => !c.es_agrupador);
    if (tipo === "agrupadora") results = results.filter((c) => c.es_agrupador);
    return results.slice(0, 100);
  }
  async getCuentaCompleta(codigo) {
    const code = normalizePcgeCode(codigo);
    const { data, error } = await supabase.from("plan_contable_pcge").select(PCGE_COLUMNS).eq("codigo_cuenta", code).maybeSingle();
    if (error || !data) return null;
    const cuenta = mapRow(data);
    const hijos = await this.getSubCuentas(code);
    let nombre_padre = null;
    if (cuenta.padre_codigo) {
      const { data: padre } = await supabase.from("plan_contable_pcge").select("nombre_cuenta").eq("codigo_cuenta", cuenta.padre_codigo).maybeSingle();
      nombre_padre = padre?.nombre_cuenta ? String(padre.nombre_cuenta) : null;
    }
    const now = /* @__PURE__ */ new Date();
    const mesActual = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
    const { count: asientosMes } = await supabase.from("asientos_contables").select("id", { count: "exact", head: true }).eq("cuenta_contable", code).eq("periodo", mesActual);
    const { count: asientosTotal } = await supabase.from("asientos_contables").select("id", { count: "exact", head: true }).eq("cuenta_contable", code);
    const { data: ultimo } = await supabase.from("asientos_contables").select("fecha_asiento").eq("cuenta_contable", code).order("fecha_asiento", { ascending: false }).limit(1).maybeSingle();
    const actividad_mensual = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const periodo = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
      const { count } = await supabase.from("asientos_contables").select("id", { count: "exact", head: true }).eq("cuenta_contable", code).eq("periodo", periodo);
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
        actividad_mensual
      }
    };
  }
  async createCuenta(input) {
    const validation = validatePCGEHierarchy(input.codigo_cuenta, input.padre_codigo);
    if (!validation.valid) throw new Error(validation.errors.join("; "));
    await upsertPcgeCuenta(input);
  }
  async updateCuenta(codigo, datos) {
    await upsertPcgeCuenta({ ...datos, codigo_cuenta: codigo });
  }
  async getCuentasOperativas() {
    return fetchPcgeCuentasActivas();
  }
  async getEstadisticasPCGE() {
    const cuentas = await this.fetchAll();
    const por_nivel = {};
    for (const c of cuentas) {
      por_nivel[c.nivel] = (por_nivel[c.nivel] ?? 0) + 1;
    }
    const { data: usoRows } = await supabase.from("asientos_contables").select("cuenta_contable").limit(5e3);
    const usoMap = /* @__PURE__ */ new Map();
    for (const row of usoRows ?? []) {
      const code = normalizePcgeCode(String(row.cuenta_contable ?? ""));
      if (code) usoMap.set(code, (usoMap.get(code) ?? 0) + 1);
    }
    const mas_usadas = [...usoMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([codigo_cuenta, usos]) => {
      const c = cuentas.find((x) => x.codigo_cuenta === codigo_cuenta);
      return {
        codigo_cuenta,
        nombre_cuenta: c?.nombre_cuenta ?? "—",
        usos
      };
    });
    return {
      total: cuentas.length,
      por_nivel,
      operativas: cuentas.filter((c) => !c.es_agrupador).length,
      agrupadoras: cuentas.filter((c) => c.es_agrupador).length,
      mas_usadas
    };
  }
}
const pcgeService = new PcgeService();
async function fetchPcgeCuentas() {
  return pcgeService.fetchAll();
}
async function fetchPcgeCuentasActivas() {
  const { data, error } = await supabase.from("plan_contable_pcge").select(PCGE_COLUMNS).eq("activo", true).eq("es_agrupador", false).order("codigo_cuenta", { ascending: true });
  if (error?.code === "42703") {
    const { data: fallback, error: err2 } = await supabase.from("plan_contable_pcge").select(PCGE_COLUMNS).eq("activo", true).order("codigo_cuenta", { ascending: true });
    throwIfSupabaseError(err2, "Error al cargar cuentas activas");
    return (fallback ?? []).map((row) => mapRow(row));
  }
  throwIfSupabaseError(error, "Error al cargar cuentas activas");
  return (data ?? []).map((row) => mapRow(row));
}
async function generarCodigoPcgeHijo(padreCodigo) {
  const { data, error } = await supabase.rpc("generar_codigo_pcge", {
    p_codigo_padre: padreCodigo ? normalizePcgeCode(padreCodigo) : null
  });
  if (error) throw error;
  return normalizePcgeCode(String(data ?? ""));
}
async function upsertPcgeCuenta(input) {
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
    palabras_clave: textToArray(input.palabras_clave)
  });
  const existing = await supabase.from("plan_contable_pcge").select("codigo_cuenta").eq("codigo_cuenta", codigo_cuenta).maybeSingle();
  if (existing.data) {
    const { error: error2 } = await supabase.from("plan_contable_pcge").update(payload).eq("codigo_cuenta", codigo_cuenta);
    throwIfSupabaseError(error2, "Error al actualizar cuenta PCGE");
    return;
  }
  const { error } = await supabase.from("plan_contable_pcge").insert(payload);
  throwIfSupabaseError(error, "Error al registrar cuenta PCGE");
  if (padre_codigo) {
    await supabase.from("plan_contable_pcge").update({ es_agrupador: true }).eq("codigo_cuenta", padre_codigo);
  }
}
async function setPcgeActivo(codigo_cuenta, activo) {
  const { error } = await supabase.from("plan_contable_pcge").update({ activo }).eq("codigo_cuenta", normalizePcgeCode(codigo_cuenta));
  throwIfSupabaseError(error, "Error al cambiar estado de cuenta");
}
function usePcgeCuentas() {
  return useQuery({
    queryKey: PCGE_CUENTAS_KEY,
    queryFn: fetchPcgeCuentas,
    staleTime: 60 * 6e4,
    gcTime: 24 * 60 * 6e4
  });
}
function useCuentaDetalle(codigo) {
  return useQuery({
    queryKey: [...PCGE_QUERY_KEY, "detalle", codigo],
    queryFn: () => codigo ? pcgeService.getCuentaCompleta(codigo) : null,
    enabled: !!codigo,
    staleTime: 5 * 6e4
  });
}
export {
  computePadreCodigo as a,
  buildPcgeTree as b,
  computeNivelFromCodigo as c,
  fetchPcgeCuentasActivas as d,
  formatCuentaPcge as e,
  fetchPcgeCuentas as f,
  generarCodigoPcgeHijo as g,
  getColorNivel as h,
  getNivelNombre as i,
  useCuentaDetalle as j,
  usePcgeCuentas as k,
  normalizePcgeCode as n,
  setPcgeActivo as s,
  upsertPcgeCuenta as u,
  validatePCGEHierarchy as v
};
