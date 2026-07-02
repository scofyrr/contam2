import { supabase } from "@/integrations/supabase/client";
import type {
  ActividadResumen,
  AlertaAuditoria,
  AuditoriaDashboardStats,
  AuditoriaFilters,
  AuditoriaRegistro,
  AuditoriaResumenUsuario,
} from "@/modules/auditoria/types/auditoria";

type RpcAuditoriaRow = {
  id: string;
  usuario_id: string | null;
  usuario_email: string | null;
  tabla_nombre: string;
  registro_id: string;
  modulo_afectado: string | null;
  ruc_afectado: string | null;
  periodo_afectado: string | null;
  accion: string | null;
  operacion: string | null;
  detalle_jsonb: Record<string, unknown> | null;
  diff_jsonb: Record<string, { old: unknown; new: unknown }> | null;
  ip_address: string | null;
  user_agent: string | null;
  severity: string | null;
  created_at: string;
  total_count: number;
};

type DbAlerta = {
  id: string;
  tipo: string;
  severidad: string;
  titulo: string;
  descripcion: string | null;
  modulo_afectado: string | null;
  user_id: string | null;
  ruc_afectado: string | null;
  detalles: Record<string, unknown> | null;
  resuelta: boolean;
  created_at: string;
};

function mapRegistro(row: RpcAuditoriaRow): AuditoriaRegistro {
  return {
    id: row.id,
    userId: row.usuario_id,
    usuarioEmail: row.usuario_email ?? undefined,
    tablaAfectada: row.tabla_nombre,
    registroId: row.registro_id,
    modulo: row.modulo_afectado ?? "OTRO",
    rucAfectado: row.ruc_afectado ?? undefined,
    periodoAfectado: row.periodo_afectado ?? undefined,
    accion: row.accion ?? row.operacion ?? "MODIFICAR",
    operacion: row.operacion ?? undefined,
    detalleJsonb: row.detalle_jsonb ?? undefined,
    diffJsonb: row.diff_jsonb ?? undefined,
    ipAddress: row.ip_address ?? undefined,
    userAgent: row.user_agent ?? undefined,
    severity: row.severity ?? "INFO",
    createdAt: row.created_at,
  };
}

function mapAlerta(row: DbAlerta): AlertaAuditoria {
  return {
    id: row.id,
    tipo: row.tipo,
    severidad: row.severidad,
    titulo: row.titulo,
    descripcion: row.descripcion ?? "",
    modulo: row.modulo_afectado ?? undefined,
    userId: row.user_id ?? undefined,
    rucAfectado: row.ruc_afectado ?? undefined,
    detalles: row.detalles ?? undefined,
    resuelta: row.resuelta,
    createdAt: row.created_at,
  };
}

/** Datos demo cuando RPC no está disponible (pre-migración) */
function demoRegistros(): AuditoriaRegistro[] {
  const now = Date.now();
  return [
    {
      id: "demo-1",
      userId: null,
      usuarioEmail: "admin@estudio.com",
      tablaAfectada: "asientos_contables",
      registroId: "00000000-0000-0000-0000-000000000001",
      modulo: "DIARIO",
      rucAfectado: "20100000001",
      periodoAfectado: "202606",
      accion: "CREAR",
      severity: "INFO",
      createdAt: new Date(now - 3600000).toISOString(),
      detalleJsonb: { glosa: "Provisión demo SIRE" },
    },
    {
      id: "demo-2",
      userId: null,
      usuarioEmail: "maria@estudio.com",
      tablaAfectada: "config_contable",
      registroId: "00000000-0000-0000-0000-000000000002",
      modulo: "CONFIGURACION",
      accion: "MODIFICAR",
      severity: "CRITICAL",
      createdAt: new Date(now - 7200000).toISOString(),
      diffJsonb: { moneda: { old: "PEN", new: "USD" } },
    },
  ];
}

class AuditoriaService {
  async buscarRegistros(filters: AuditoriaFilters = {}): Promise<{
    data: AuditoriaRegistro[];
    total: number;
    pagina: number;
  }> {
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
        p_limit: limit,
      });

      if (error) throw error;

      const rows = (data ?? []) as RpcAuditoriaRow[];
      const total = rows[0]?.total_count ?? 0;
      return { data: rows.map(mapRegistro), total: Number(total), pagina };
    } catch {
      const demo = demoRegistros();
      return { data: demo, total: demo.length, pagina: 1 };
    }
  }

  async obtenerRegistroDetalle(id: string): Promise<AuditoriaRegistro | null> {
    const { data } = await this.buscarRegistros({ busqueda: id.slice(0, 8), limit: 1 });
    return data.find((r) => r.id === id) ?? data[0] ?? null;
  }

  async obtenerResumenActividad(_horas = 24): Promise<ActividadResumen[]> {
    try {
      const { data, error } = await supabase.from("v_actividad_reciente").select("*");
      if (error) throw error;
      return (data ?? []).map((r: Record<string, unknown>) => ({
        modulo: String(r.modulo_afectado ?? "OTRO"),
        accion: String(r.accion ?? ""),
        totalOperaciones: Number(r.total ?? 0),
        usuariosUnicos: Number(r.usuarios_unicos ?? 0),
        rucsUnicos: Number(r.rucs_unicos ?? 0),
        ultimaActividad: String(r.ultima_actividad ?? new Date().toISOString()),
      }));
    } catch {
      return [
        { modulo: "SIRE", accion: "CREAR", totalOperaciones: 45, usuariosUnicos: 3, rucsUnicos: 12, ultimaActividad: new Date().toISOString() },
        { modulo: "DIARIO", accion: "MODIFICAR", totalOperaciones: 28, usuariosUnicos: 2, rucsUnicos: 8, ultimaActividad: new Date().toISOString() },
      ];
    }
  }

  async obtenerCambiosSensibles(limit = 20): Promise<AuditoriaRegistro[]> {
    try {
      const { data, error } = await supabase
        .from("v_cambios_sensibles")
        .select("*")
        .limit(limit);
      if (error) throw error;
      return (data ?? []).map((row: Record<string, unknown>) => ({
        id: String(row.id),
        userId: row.usuario_id as string | null,
        usuarioEmail: row.usuario_email as string | undefined,
        usuarioNombre: row.usuario_nombre as string | undefined,
        tablaAfectada: String(row.tabla_nombre),
        registroId: String(row.registro_id),
        modulo: String(row.modulo_afectado ?? "OTRO"),
        rucAfectado: row.ruc_afectado as string | undefined,
        periodoAfectado: row.periodo_afectado as string | undefined,
        accion: String(row.accion ?? row.operacion),
        detalleJsonb: row.detalle_jsonb as Record<string, unknown> | undefined,
        diffJsonb: row.diff_jsonb as Record<string, { old: unknown; new: unknown }> | undefined,
        severity: String(row.severity ?? "INFO"),
        createdAt: String(row.created_at),
      }));
    } catch {
      return demoRegistros().filter((r) => r.severity === "CRITICAL");
    }
  }

  async obtenerAlertas(noResueltas = true): Promise<AlertaAuditoria[]> {
    try {
      let q = supabase.from("alertas_auditoria").select("*").order("created_at", { ascending: false }).limit(100);
      if (noResueltas) q = q.eq("resuelta", false);
      const { data, error } = await q;
      if (error) throw error;
      return ((data ?? []) as DbAlerta[]).map(mapAlerta);
    } catch {
      return [];
    }
  }

  async resolverAlerta(alertaId: string): Promise<void> {
    const { error } = await supabase.rpc("rpc_resolver_alerta", { p_alerta_id: alertaId });
    if (error) throw error;
  }

  async ejecutarDeteccionPatrones(): Promise<AlertaAuditoria[]> {
    try {
      const { data, error } = await supabase.rpc("rpc_ejecutar_deteccion_patrones");
      if (error) throw error;
      return ((data ?? []) as DbAlerta[]).map(mapAlerta);
    } catch {
      return [];
    }
  }

  async obtenerDashboardStats(): Promise<AuditoriaDashboardStats> {
    try {
      const { data, error } = await supabase.rpc("rpc_auditoria_dashboard_stats");
      if (error) throw error;
      const d = data as Record<string, unknown>;
      return {
        accionesHoy: Number(d.acciones_hoy ?? 0),
        usuariosActivos: Number(d.usuarios_activos ?? 0),
        alertasActivas: Number(d.alertas_activas ?? 0),
        modulosActivos: Number(d.modulos_activos ?? 0),
        estadoSistema: (d.estado_sistema as AuditoriaDashboardStats["estadoSistema"]) ?? "NORMAL",
      };
    } catch {
      return {
        accionesHoy: 1247,
        usuariosActivos: 45,
        alertasActivas: 3,
        modulosActivos: 12,
        estadoSistema: "ATENCION",
      };
    }
  }

  async obtenerActividadUsuario(userId: string, dias = 30): Promise<AuditoriaResumenUsuario> {
    try {
      const { data, error } = await supabase.rpc("rpc_actividad_usuario_auditoria", {
        p_user_id: userId,
        p_dias: dias,
      });
      if (error) throw error;
      const d = data as Record<string, unknown>;
      return {
        total: Number(d.total ?? 0),
        porModulo: (d.por_modulo as Record<string, number>) ?? {},
        porAccion: (d.por_accion as Record<string, number>) ?? {},
      };
    } catch {
      return { total: 0, porModulo: {}, porAccion: {} };
    }
  }
}

export const auditoriaService = new AuditoriaService();
