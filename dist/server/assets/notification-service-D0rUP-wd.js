import { ac as supabase } from "./router-CQNpPKTf.js";
const DEFAULT_PREFERENCIAS = {
  notificacionesInApp: true,
  notificacionesCorreo: false,
  frecuenciaCorreo: "diario",
  horasSilencio: null,
  modulosActivos: ["SIRE", "DIARIO", "CAJA", "TAREAS"],
  prioridadMinima: "MEDIA"
};
const LOCAL_KEY = "contam-notificaciones-local";
const PREFS_KEY = "contam-notif-prefs";
function mapRow(row) {
  const meta = row.metadata ?? {};
  return {
    id: String(row.id),
    user_id: String(row.usuario_id ?? ""),
    tipo: String(row.tipo ?? "ALERTA_SISTEMA"),
    titulo: String(row.asunto ?? ""),
    mensaje: String(row.cuerpo ?? ""),
    leida: row.leido === true,
    fecha_creacion: String(row.created_at ?? (/* @__PURE__ */ new Date()).toISOString()),
    metadata: {
      tareaId: meta.tareaId != null ? String(meta.tareaId) : void 0,
      ruc: meta.ruc != null ? String(meta.ruc) : void 0,
      periodo: meta.periodo != null ? String(meta.periodo) : void 0,
      modulo: meta.modulo != null ? String(meta.modulo) : void 0,
      linkNavegacion: meta.linkNavegacion != null ? String(meta.linkNavegacion) : void 0,
      prioridad: meta.prioridad != null ? String(meta.prioridad) : void 0
    }
  };
}
function readLocal() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "[]");
  } catch {
    return [];
  }
}
function writeLocal(items) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_KEY, JSON.stringify(items.slice(0, 100)));
}
function readLocalPrefs(userId) {
  if (typeof window === "undefined") return { userId, ...DEFAULT_PREFERENCIAS };
  try {
    const raw = JSON.parse(localStorage.getItem(PREFS_KEY) ?? "{}");
    return { userId, ...DEFAULT_PREFERENCIAS, ...raw };
  } catch {
    return { userId, ...DEFAULT_PREFERENCIAS };
  }
}
class NotificationService {
  userId = null;
  useDb = true;
  async inicializar(userId) {
    this.userId = userId;
    const { error } = await supabase.from("notificaciones_correo").select("id").limit(1);
    this.useDb = !error;
  }
  async obtenerNotificaciones(limite = 20, soloNoLeidas = false) {
    if (!this.userId) return readLocal().slice(0, limite);
    if (this.useDb) {
      let q = supabase.from("notificaciones_correo").select("*").eq("usuario_id", this.userId).order("created_at", { ascending: false }).limit(limite);
      if (soloNoLeidas) q = q.eq("leido", false);
      const { data, error } = await q;
      if (!error && data) return data.map((r) => mapRow(r));
      this.useDb = false;
    }
    let local = readLocal();
    if (soloNoLeidas) local = local.filter((n) => !n.leida);
    return local.slice(0, limite);
  }
  async marcarComoLeida(notificacionId) {
    if (this.useDb && this.userId) {
      const { error } = await supabase.from("notificaciones_correo").update({ leido: true }).eq("id", notificacionId).eq("usuario_id", this.userId);
      if (!error) return;
      this.useDb = false;
    }
    writeLocal(readLocal().map((n) => n.id === notificacionId ? { ...n, leida: true } : n));
  }
  async marcarTodasComoLeidas() {
    if (this.useDb && this.userId) {
      const { error } = await supabase.from("notificaciones_correo").update({ leido: true }).eq("usuario_id", this.userId).eq("leido", false);
      if (!error) return;
      this.useDb = false;
    }
    writeLocal(readLocal().map((n) => ({ ...n, leida: true })));
  }
  async generarNotificacion(input) {
    const id = crypto.randomUUID();
    const row = {
      id,
      usuario_id: input.user_id || this.userId,
      correo_destino: "",
      remitente: "CONTAM",
      asunto: input.titulo,
      cuerpo: input.mensaje,
      tipo: input.tipo,
      metadata: input.metadata,
      leido: false
    };
    if (this.useDb && this.userId) {
      const { data, error } = await supabase.from("notificaciones_correo").insert(row).select("id").single();
      if (!error && data) return String(data.id);
      this.useDb = false;
    }
    const notif = {
      ...input,
      id,
      leida: false,
      fecha_creacion: (/* @__PURE__ */ new Date()).toISOString()
    };
    writeLocal([notif, ...readLocal()]);
    window.dispatchEvent(new CustomEvent("contam:notificacion-nueva", { detail: notif }));
    return id;
  }
  async obtenerConteoNoLeidas() {
    const items = await this.obtenerNotificaciones(100, true);
    return items.length;
  }
  async obtenerPreferencias() {
    const uid = this.userId ?? "anon";
    if (this.useDb && this.userId) {
      const { data, error } = await supabase.from("preferencias_notificaciones").select("*").eq("user_id", this.userId).maybeSingle();
      if (!error && data) {
        return {
          userId: uid,
          notificacionesInApp: data.notificaciones_in_app !== false,
          notificacionesCorreo: data.notificaciones_correo === true,
          frecuenciaCorreo: data.frecuencia_correo ?? "diario",
          horasSilencio: data.horas_silencio ?? null,
          modulosActivos: data.modulos_activos ?? DEFAULT_PREFERENCIAS.modulosActivos,
          prioridadMinima: data.prioridad_minima ?? "MEDIA"
        };
      }
    }
    return readLocalPrefs(uid);
  }
  async actualizarPreferencias(prefs) {
    const uid = this.userId ?? "anon";
    const current = await this.obtenerPreferencias();
    const merged = { ...current, ...prefs, userId: uid };
    if (this.useDb && this.userId) {
      const { error } = await supabase.from("preferencias_notificaciones").upsert({
        user_id: this.userId,
        notificaciones_in_app: merged.notificacionesInApp,
        notificaciones_correo: merged.notificacionesCorreo,
        frecuencia_correo: merged.frecuenciaCorreo,
        horas_silencio: merged.horasSilencio,
        modulos_activos: merged.modulosActivos,
        prioridad_minima: merged.prioridadMinima,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      if (!error) return;
    }
    localStorage.setItem(PREFS_KEY, JSON.stringify(merged));
  }
  verificarHorarioSilencio(prefs) {
    const p = prefs;
    if (!p?.horasSilencio) return false;
    const now = /* @__PURE__ */ new Date();
    const mins = now.getHours() * 60 + now.getMinutes();
    const [hi, mi] = p.horasSilencio.inicio.split(":").map(Number);
    const [hf, mf] = p.horasSilencio.fin.split(":").map(Number);
    const start = hi * 60 + mi;
    const end = hf * 60 + mf;
    if (start <= end) return mins >= start && mins <= end;
    return mins >= start || mins <= end;
  }
  async sincronizarDesdeTareas() {
    if (!this.userId) return;
    await supabase.rpc("rpc_generar_notificaciones_desde_tareas", { p_user_id: this.userId }).catch(() => null);
  }
}
const notificationService = new NotificationService();
async function notificarTareaGenerada(params) {
  await notificationService.inicializar(params.userId);
  const prefs = await notificationService.obtenerPreferencias();
  if (notificationService.verificarHorarioSilencio(prefs) && !prefs.notificacionesInApp) return;
  await notificationService.generarNotificacion({
    user_id: params.userId,
    tipo: "TAREA_ASIGNADA",
    titulo: params.titulo,
    mensaje: params.mensaje,
    metadata: {
      tareaId: params.tareaId,
      prioridad: params.prioridad,
      linkNavegacion: params.link ?? "/tareas"
    }
  });
}
export {
  notificationService as a,
  notificarTareaGenerada as n
};
