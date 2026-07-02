import type { PendingTask, SugerenciaInteligente } from "@/modules/notificaciones/types/alert-system";

export type CargaTrabajoNivel = "BAJA" | "NORMAL" | "ALTA" | "CRITICA";

export type ContadorEstado = "ACTIVO" | "INACTIVO" | "AUSENTE";

export interface EstudioMetrics {
  totalContadores: number;
  contadoresActivos: number;
  totalClientes: number;
  clientesActivos: number;
  facturacionMensual: number;
  facturacionAnual: number;
  efectividadPromedio: number;
  tareasPendientesEstudio: number;
  tareasVencidasEstudio: number;
  clientesPorContador: { contadorId: string; nombre: string; clientes: number }[];
  facturacionPorMes: { mes: string; monto: number }[];
}

export interface ContadorPerformance {
  userId: string;
  nombre: string;
  email: string;
  rol: string;
  clientesAsignados: number;
  tareasPendientes: number;
  tareasCompletadas: number;
  tareasVencidas: number;
  efectividad: number;
  ultimaActividad: string;
  estado: ContadorEstado;
  cargaTrabajo: CargaTrabajoNivel;
}

export interface ContadorPersonalMetrics {
  clientesAsignados: number;
  tareasPendientes: number;
  tareasVencidas: number;
  tareasHoy: number;
  efectividad: number;
  comprobantesPendientes: number;
  asientosDelMes: number;
  movimientosCajaPendientes: number;
  cxcVencido: number;
  cxpVencido: number;
  cargaTrabajo: CargaTrabajoNivel;
  rachaDiasProductivos: number;
  tareasCompletadasHoy: number;
}

export interface ClienteAsignado {
  ruc: string;
  razonSocial: string;
  estado: string;
  tareasPendientes: number;
  ultimaActividad: string;
  comprobantesPendientes: number;
  cxcVencido: number;
  cxpVencido: number;
  saldoCaja: number;
  alertas: number;
}

export interface AlertaEstudio {
  id: string;
  severidad: "CRITICA" | "ADVERTENCIA" | "INFORMATIVA";
  titulo: string;
  descripcion: string;
  contadorId?: string;
  contadorNombre?: string;
}

export interface ActividadRegistro {
  id: string;
  userId?: string;
  usuarioNombre?: string;
  tipo: "TAREA_COMPLETADA" | "COMPROBANTE" | "CAJA" | "TAREA_VENCIDA" | "SISTEMA" | "FICHA" | "OTRO";
  titulo: string;
  detalle?: string;
  createdAt: string;
}

export interface TareasPorContador {
  contadorId: string;
  nombre: string;
  pendientes: number;
  vencidas: number;
  completadas: number;
}

export interface CargaTrabajoDia {
  fecha: string;
  total: number;
  vencidas: number;
}

export interface Logro {
  id: string;
  titulo: string;
  descripcion: string;
  icono: string;
  tipo: "RACHA" | "EFECTIVIDAD" | "VOLUMEN" | "VELOCIDAD" | "ESPECIAL";
  desbloqueado: boolean;
  progreso?: number;
  fechaDesbloqueo?: string;
}

export type { PendingTask, SugerenciaInteligente };
