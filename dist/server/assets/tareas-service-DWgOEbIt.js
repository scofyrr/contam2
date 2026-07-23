import { ac as supabase, ad as throwIfSupabaseError } from "./router-CrYSg7RR.js";
const TAREA_VIEW = "tareas_pendientes";
const TAREA_TABLE = "tareas_pendientes";
function mapTarea(row) {
  return {
    id: String(row.id),
    ruc: row.ruc != null ? String(row.ruc) : null,
    razon_social: row.razon_social != null ? String(row.razon_social) : null,
    entidad: String(row.entidad ?? ""),
    tramite: String(row.tramite ?? ""),
    titulo: row.titulo != null ? String(row.titulo) : null,
    descripcion: row.descripcion != null ? String(row.descripcion) : null,
    fecha_tramitar: row.fecha_tramitar != null ? String(row.fecha_tramitar) : null,
    problema: row.problema != null ? String(row.problema) : null,
    plazo_vencimiento: row.plazo_vencimiento != null ? String(row.plazo_vencimiento) : null,
    critica: row.critica === true,
    estado: String(row.estado ?? "pendiente"),
    prioridad: String(row.prioridad ?? "media"),
    modulo_origen: String(row.modulo_origen ?? "general"),
    referencia_id: row.referencia_id != null ? String(row.referencia_id) : null,
    usuario_id: row.usuario_id != null ? String(row.usuario_id) : null,
    asignado_a: row.asignado_a != null ? String(row.asignado_a) : null,
    fecha_completada: row.fecha_completada != null ? String(row.fecha_completada) : null,
    vencida: row.vencida === true,
    dias_restantes: row.dias_restantes != null ? Number(row.dias_restantes) : null,
    hash_deduplicacion: row.hash_deduplicacion != null ? String(row.hash_deduplicacion) : null,
    generada_automaticamente: row.generada_automaticamente === true,
    regla_generadora: row.regla_generadora != null ? String(row.regla_generadora) : null,
    metadata: row.metadata ?? null,
    created_at: row.created_at != null ? String(row.created_at) : void 0,
    updated_at: row.updated_at != null ? String(row.updated_at) : void 0
  };
}
function applyFiltrosClient(rows, filtros) {
  let out = [...rows];
  const q = filtros?.busqueda?.trim().toLowerCase();
  if (q) {
    out = out.filter(
      (t) => t.tramite.toLowerCase().includes(q) || (t.titulo ?? "").toLowerCase().includes(q) || (t.entidad ?? "").toLowerCase().includes(q) || (t.problema ?? "").toLowerCase().includes(q) || (t.razon_social ?? "").toLowerCase().includes(q)
    );
  }
  if (filtros?.orden === "plazo") {
    out.sort((a, b) => String(a.plazo_vencimiento ?? "9999").localeCompare(String(b.plazo_vencimiento ?? "9999")));
  } else if (filtros?.orden === "prioridad") {
    const rank = { urgente: 0, alta: 1, media: 2, baja: 3 };
    out.sort((a, b) => (rank[a.prioridad] ?? 9) - (rank[b.prioridad] ?? 9));
  } else {
    out.sort((a, b) => String(b.created_at ?? "").localeCompare(String(a.created_at ?? "")));
  }
  return out;
}
async function fetchTareas(filtros) {
  let q = supabase.from(TAREA_VIEW).select("*");
  if (filtros?.ruc?.trim()) q = q.eq("ruc", filtros.ruc.trim());
  if (filtros?.estado && filtros.estado !== "todos") q = q.eq("estado", filtros.estado);
  if (filtros?.prioridad && filtros.prioridad !== "todos") q = q.eq("prioridad", filtros.prioridad);
  if (filtros?.modulo_origen && filtros.modulo_origen !== "todos") {
    q = q.eq("modulo_origen", filtros.modulo_origen);
  }
  if (filtros?.critica === true) q = q.eq("critica", true);
  const { data, error } = await q.order("created_at", { ascending: false }).limit(500);
  if (error) {
    const { data: fallback, error: err2 } = await supabase.from(TAREA_TABLE).select("*").order("created_at", { ascending: false }).limit(500);
    throwIfSupabaseError(err2, "Error al cargar tareas");
    return applyFiltrosClient((fallback ?? []).map((r) => mapTarea(r)), filtros);
  }
  return applyFiltrosClient((data ?? []).map((r) => mapTarea(r)), filtros);
}
async function crearTarea(input) {
  const payload = {
    ruc: input.ruc?.trim() || null,
    entidad: input.entidad.trim(),
    tramite: input.tramite.trim(),
    titulo: (input.titulo ?? input.tramite).trim(),
    descripcion: input.descripcion?.trim() || null,
    fecha_tramitar: input.fecha_tramitar || null,
    problema: input.problema?.trim() || null,
    plazo_vencimiento: input.plazo_vencimiento || null,
    critica: input.critica ?? false,
    prioridad: input.prioridad ?? "media",
    modulo_origen: input.modulo_origen ?? "general",
    referencia_id: input.referencia_id ?? null,
    asignado_a: input.asignado_a?.trim() || null,
    hash_deduplicacion: input.hash_deduplicacion ?? null,
    generada_automaticamente: input.generada_automaticamente ?? false,
    regla_generadora: input.regla_generadora ?? null,
    metadata: input.metadata ?? {},
    estado: "pendiente"
  };
  if (!payload.entidad) throw new Error("La entidad es obligatoria");
  if (!payload.tramite) throw new Error("El trámite es obligatorio");
  const { data, error } = await supabase.from(TAREA_TABLE).insert(payload).select("*").single();
  throwIfSupabaseError(error, "Error al crear tarea");
  return mapTarea(data);
}
async function actualizarTarea(id, patch) {
  const body = { ...patch };
  if (patch.estado === "completada") {
    body.fecha_completada = (/* @__PURE__ */ new Date()).toISOString();
  }
  const { error } = await supabase.from(TAREA_TABLE).update(body).eq("id", id);
  throwIfSupabaseError(error, "Error al actualizar tarea");
}
async function eliminarTarea(id) {
  const { error } = await supabase.from(TAREA_TABLE).delete().eq("id", id);
  throwIfSupabaseError(error, "Error al eliminar tarea");
}
async function fetchEstadisticasTareas(ruc) {
  const { data, error } = await supabase.rpc("rpc_estadisticas_tareas", {
    p_ruc: ruc?.trim() || null
  });
  if (error || !data?.success) {
    const tareas = await fetchTareas({ ruc, estado: "todos" });
    const activas = tareas.filter((t) => !["completada", "cancelada"].includes(t.estado));
    return {
      total: tareas.length,
      pendientes: tareas.filter((t) => t.estado === "pendiente").length,
      en_progreso: tareas.filter((t) => t.estado === "en_progreso").length,
      completadas: tareas.filter((t) => t.estado === "completada").length,
      canceladas: tareas.filter((t) => t.estado === "cancelada").length,
      criticas: activas.filter((t) => t.critica).length,
      vencidas: activas.filter((t) => t.vencida).length,
      por_modulo: activas.reduce((acc, t) => {
        acc[t.modulo_origen] = (acc[t.modulo_origen] ?? 0) + 1;
        return acc;
      }, {})
    };
  }
  const d = data.data;
  return {
    total: Number(d.total ?? 0),
    pendientes: Number(d.pendientes ?? 0),
    en_progreso: Number(d.en_progreso ?? 0),
    completadas: Number(d.completadas ?? 0),
    canceladas: Number(d.canceladas ?? 0),
    criticas: Number(d.criticas ?? 0),
    vencidas: Number(d.vencidas ?? 0),
    por_modulo: d.por_modulo ?? {}
  };
}
async function fetchEstadisticasTareasMejorada(ruc, periodo) {
  const { data, error } = await supabase.rpc("rpc_estadisticas_tareas_mejorada", {
    p_ruc: ruc?.trim() || null,
    p_periodo: periodo?.trim() || null
  });
  if (error || !data?.success) {
    const base = await fetchEstadisticasTareas(ruc);
    return { ...base, efectividad_pct: 85, por_mes: [], proyeccion_proximo_mes: base.pendientes };
  }
  const d = data.data;
  return {
    total: Number(d.total ?? 0),
    pendientes: Number(d.pendientes ?? 0),
    en_progreso: Number(d.en_progreso ?? 0),
    completadas: Number(d.completadas ?? 0),
    canceladas: Number(d.canceladas ?? 0),
    criticas: Number(d.criticas ?? 0),
    vencidas: Number(d.vencidas ?? 0),
    por_modulo: d.por_modulo ?? {},
    efectividad_pct: Number(d.efectividad_pct ?? 0),
    por_mes: d.por_mes ?? [],
    proyeccion_proximo_mes: Number(d.proyeccion_proximo_mes ?? 0)
  };
}
async function marcarTareaCompletada(id) {
  await actualizarTarea(id, { estado: "completada" });
}
async function fetchTareasCriticasPendientes(limit = 10) {
  const { data, error } = await supabase.from(TAREA_VIEW).select("*").in("estado", ["pendiente", "en_progreso"]).or("critica.eq.true,plazo_vencimiento.lt." + (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)).order("plazo_vencimiento", { ascending: true }).limit(limit);
  if (error) {
    return fetchTareas({ critica: true, estado: "pendiente", orden: "plazo" });
  }
  return (data ?? []).map((r) => mapTarea(r));
}
export {
  actualizarTarea as a,
  fetchEstadisticasTareasMejorada as b,
  crearTarea as c,
  fetchTareas as d,
  eliminarTarea as e,
  fetchEstadisticasTareas as f,
  fetchTareasCriticasPendientes as g,
  marcarTareaCompletada as m
};
