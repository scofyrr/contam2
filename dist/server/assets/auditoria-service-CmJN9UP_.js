import { ab as supabase } from "./router-DdOnzL1Y.js";
function mapRegistro(row) {
  return {
    id: row.id,
    userId: row.usuario_id,
    usuarioEmail: row.usuario_email ?? void 0,
    tablaAfectada: row.tabla_nombre,
    registroId: row.registro_id,
    modulo: row.modulo_afectado ?? "OTRO",
    rucAfectado: row.ruc_afectado ?? void 0,
    periodoAfectado: row.periodo_afectado ?? void 0,
    accion: row.accion ?? row.operacion ?? "MODIFICAR",
    operacion: row.operacion ?? void 0,
    detalleJsonb: row.detalle_jsonb ?? void 0,
    diffJsonb: row.diff_jsonb ?? void 0,
    ipAddress: row.ip_address ?? void 0,
    userAgent: row.user_agent ?? void 0,
    severity: row.severity ?? "INFO",
    createdAt: row.created_at
  };
}
function mapAlerta(row) {
  return {
    id: row.id,
    tipo: row.tipo,
    severidad: row.severidad,
    titulo: row.titulo,
    descripcion: row.descripcion ?? "",
    modulo: row.modulo_afectado ?? void 0,
    userId: row.user_id ?? void 0,
    rucAfectado: row.ruc_afectado ?? void 0,
    detalles: row.detalles ?? void 0,
    resuelta: row.resuelta,
    createdAt: row.created_at
  };
}
class AuditoriaService {
  async buscarRegistros(filters = {}) {
    const pagina = filters.pagina ?? 1;
    const limit = filters.limit ?? 50;
    try {
      const { data, error } = await supabase.rpc("rpc_buscar_auditoria", {
        p_modulo: filters.modulo ?? null,
        p_accion: filters.accion ?? null,
        p_ruc: filters.ruc ?? null,
        p_periodo: filters.periodo ?? null,
        p_user_id: filters.userId ?? null,
        p_severity: filters.severity ?? null,
        p_fecha_desde: filters.fechaDesde ?? null,
        p_fecha_hasta: filters.fechaHasta ?? null,
        p_busqueda: filters.busqueda ?? null,
        p_pagina: pagina,
        p_limit: limit
      });
      if (error) throw error;
      const rows = data ?? [];
      const total = rows[0]?.total_count ?? 0;
      return { data: rows.map(mapRegistro), total: Number(total), pagina };
    } catch {
      return { data: [], total: 0, pagina: 1 };
    }
  }
  async obtenerRegistroDetalle(id) {
    const { data } = await this.buscarRegistros({ busqueda: id.slice(0, 8), limit: 1 });
    return data.find((r) => r.id === id) ?? data[0] ?? null;
  }
  async obtenerResumenActividad(_horas = 24) {
    try {
      const { data, error } = await supabase.from("v_actividad_reciente").select("*");
      if (error) throw error;
      return (data ?? []).map((r) => ({
        modulo: String(r.modulo_afectado ?? "OTRO"),
        accion: String(r.accion ?? ""),
        totalOperaciones: Number(r.total ?? 0),
        usuariosUnicos: Number(r.usuarios_unicos ?? 0),
        rucsUnicos: Number(r.rucs_unicos ?? 0),
        ultimaActividad: String(r.ultima_actividad ?? (/* @__PURE__ */ new Date()).toISOString())
      }));
    } catch {
      return [];
    }
  }
  async obtenerCambiosSensibles(limit = 20) {
    try {
      const { data, error } = await supabase.from("v_cambios_sensibles").select("*").limit(limit);
      if (error) throw error;
      return (data ?? []).map((row) => ({
        id: String(row.id),
        userId: row.usuario_id,
        usuarioEmail: row.usuario_email,
        usuarioNombre: row.usuario_nombre,
        tablaAfectada: String(row.tabla_nombre),
        registroId: String(row.registro_id),
        modulo: String(row.modulo_afectado ?? "OTRO"),
        rucAfectado: row.ruc_afectado,
        periodoAfectado: row.periodo_afectado,
        accion: String(row.accion ?? row.operacion),
        detalleJsonb: row.detalle_jsonb,
        diffJsonb: row.diff_jsonb,
        severity: String(row.severity ?? "INFO"),
        createdAt: String(row.created_at)
      }));
    } catch {
      return [];
    }
  }
  async obtenerAlertas(noResueltas = true) {
    try {
      let q = supabase.from("alertas_auditoria").select("*").order("created_at", { ascending: false }).limit(100);
      if (noResueltas) q = q.eq("resuelta", false);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map(mapAlerta);
    } catch {
      return [];
    }
  }
  async resolverAlerta(alertaId) {
    const { error } = await supabase.rpc("rpc_resolver_alerta", { p_alerta_id: alertaId });
    if (error) throw error;
  }
  async ejecutarDeteccionPatrones() {
    try {
      const { data, error } = await supabase.rpc("rpc_ejecutar_deteccion_patrones");
      if (error) throw error;
      return (data ?? []).map(mapAlerta);
    } catch {
      return [];
    }
  }
  async obtenerDashboardStats() {
    try {
      const { data, error } = await supabase.rpc("rpc_auditoria_dashboard_stats");
      if (error) throw error;
      const d = data;
      return {
        accionesHoy: Number(d.acciones_hoy ?? 0),
        usuariosActivos: Number(d.usuarios_activos ?? 0),
        alertasActivas: Number(d.alertas_activas ?? 0),
        modulosActivos: Number(d.modulos_activos ?? 0),
        estadoSistema: d.estado_sistema ?? "NORMAL"
      };
    } catch {
      return {
        accionesHoy: 0,
        usuariosActivos: 0,
        alertasActivas: 0,
        modulosActivos: 0,
        estadoSistema: "NORMAL"
      };
    }
  }
  async obtenerActividadUsuario(userId, dias = 30) {
    try {
      const { data, error } = await supabase.rpc("rpc_actividad_usuario_auditoria", {
        p_user_id: userId,
        p_dias: dias
      });
      if (error) throw error;
      const d = data;
      return {
        total: Number(d.total ?? 0),
        porModulo: d.por_modulo ?? {},
        porAccion: d.por_accion ?? {}
      };
    } catch {
      return { total: 0, porModulo: {}, porAccion: {} };
    }
  }
}
const auditoriaService = new AuditoriaService();
export {
  auditoriaService as a
};
