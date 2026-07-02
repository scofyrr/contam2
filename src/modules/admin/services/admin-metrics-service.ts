import { adminDashboardService } from "@/modules/dashboard/services/dashboard-service";
import { auditoriaService } from "@/modules/auditoria/services/auditoria-service";
import type {
  ActividadRegistro,
  AlertaEstudio,
  ContadorPerformance,
  EstudioMetrics,
} from "@/modules/dashboard/types/dashboard";

export type AdminEstudioKPIs = EstudioMetrics & {
  estadoSistema: "NORMAL" | "ATENCION" | "CRITICO";
  alertasSeguridad: number;
  contadoresInactivos: number;
};

export type AdminGraficos = {
  clientesPorContador: { nombre: string; clientes: number }[];
  facturacionMensual: { mes: string; monto: number }[];
};

class AdminMetricsService {
  async getEstudioKPIs(adminUserId: string): Promise<AdminEstudioKPIs> {
    const [metrics, contadores, alertas, auditStats] = await Promise.all([
      adminDashboardService.getEstudioMetrics(adminUserId),
      adminDashboardService.getContadoresPerformance(adminUserId),
      adminDashboardService.getAlertasEstudio(adminUserId),
      auditoriaService.obtenerDashboardStats().catch(() => null),
    ]);

    const inactivos = contadores.filter((c) => c.estado === "INACTIVO").length;
    const criticas = alertas.filter((a) => a.severidad === "CRITICA").length;
    const seguridad = auditStats?.alertasActivas ?? alertas.length;

    let estadoSistema: AdminEstudioKPIs["estadoSistema"] = "NORMAL";
    if (criticas > 0 || metrics.tareasVencidasEstudio > 10) estadoSistema = "CRITICO";
    else if (inactivos > 0 || metrics.tareasVencidasEstudio > 0) estadoSistema = "ATENCION";

    return {
      ...metrics,
      estadoSistema,
      alertasSeguridad: seguridad,
      contadoresInactivos: inactivos,
    };
  }

  async getRendimientoContadores(adminUserId: string): Promise<ContadorPerformance[]> {
    return adminDashboardService.getContadoresPerformance(adminUserId);
  }

  async getClientesPorContador(adminUserId: string): Promise<{ nombre: string; clientes: number }[]> {
    const perf = await this.getRendimientoContadores(adminUserId);
    return perf.map((c) => ({ nombre: c.nombre.split(" ")[0], clientes: c.clientesAsignados }));
  }

  async getFacturacionEstudio(meses = 12): Promise<{ mes: string; monto: number }[]> {
    return adminDashboardService.getFacturacionMensual(meses);
  }

  async getAlertasEstudio(adminUserId: string): Promise<AlertaEstudio[]> {
    return adminDashboardService.getAlertasEstudio(adminUserId);
  }

  async getActividadReciente(limit = 10): Promise<ActividadRegistro[]> {
    return adminDashboardService.getActividadReciente(limit);
  }

  async getGraficos(adminUserId: string): Promise<AdminGraficos> {
    const [clientesPorContador, facturacionMensual] = await Promise.all([
      this.getClientesPorContador(adminUserId),
      this.getFacturacionEstudio(12),
    ]);
    return { clientesPorContador, facturacionMensual };
  }
}

export const adminMetricsService = new AdminMetricsService();
