import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartEmpty,
  ChartPanel,
  formatAxisMoney,
  moneyTooltipFormatter,
} from "@/components/chart-panel";
import {
  formatPeriodoLabel,
  periodoBarColor,
  resolvePeriodoActual,
  utilidadColor,
} from "@/lib/chart-utils";
import type { ChartsResponse } from "@/lib/sire-types";
import { CHART_THEME } from "@/lib/sire-types";

const chartConfig = {
  ventas: { label: "Ventas", color: CHART_THEME.ventas },
  compras: { label: "Compras", color: CHART_THEME.compras },
  utilidad: { label: "Utilidad", color: CHART_THEME.gain },
  igvVentas: { label: "IGV Ventas", color: CHART_THEME.igvVentas },
  igvCompras: { label: "IGV Compras", color: CHART_THEME.igvCompras },
};

function PeriodTick({
  x,
  y,
  payload,
  periodoActual,
}: {
  x?: number;
  y?: number;
  payload?: { value: string };
  periodoActual: string;
}) {
  if (x == null || y == null || !payload) return null;
  const current = payload.value === periodoActual;
  return (
    <text
      x={x}
      y={y + 14}
      textAnchor="middle"
      fill={current ? CHART_THEME.periodCurrent : CHART_THEME.neutral}
      fontSize={current ? 12 : 11}
      fontWeight={current ? 700 : 500}
    >
      {formatPeriodoLabel(payload.value)}
      {current ? " ★" : ""}
    </text>
  );
}

type Props = {
  charts: ChartsResponse;
  loading: boolean;
  filtroPeriodo?: string;
};

export function DashboardCharts({ charts, loading, filtroPeriodo = "" }: Props) {
  const periodos = charts.ventasPorPeriodo.map((p) => p.periodo);
  const periodoActual = resolvePeriodoActual(filtroPeriodo, periodos);

  const barData = charts.ventasPorPeriodo.map((v, i) => ({
    periodo: v.periodo,
    ventas: v.total,
    compras: charts.comprasPorPeriodo[i]?.total ?? 0,
    utilidad: charts.utilidadPorPeriodo[i]?.utilidad ?? 0,
  }));

  const igvData = charts.igvPorPeriodo.map((p) => ({
    periodo: p.periodo,
    igvVentas: p.igvVentas,
    igvCompras: p.igvCompras,
    saldo: p.igvVentas - p.igvCompras,
  }));

  const radarData = periodos.map((p) => ({
    periodo: formatPeriodoLabel(p),
    Ventas: charts.ventasPorPeriodo.find((v) => v.periodo === p)?.total ?? 0,
    Compras: charts.comprasPorPeriodo.find((v) => v.periodo === p)?.total ?? 0,
  }));

  const tickProps = { periodoActual };

  if (loading) {
    return (
      <div className="grid lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((n) => (
          <ChartPanel key={n} id={`loading-${n}`} title="Cargando…">
            <ChartEmpty message="Obteniendo datos de registros SIRE…" />
          </ChartPanel>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6" id="dashboard-charts-root">
      {periodoActual && (
        <p className="text-xs text-muted-foreground">
          Periodo destacado:{" "}
          <span className="font-semibold text-blue-700">
            {formatPeriodoLabel(periodoActual)}
          </span>{" "}
          (azul intenso en ejes) · Ganancias{" "}
          <span className="text-emerald-600 font-medium">verde</span> · Pérdidas{" "}
          <span className="text-red-600 font-medium">rojo</span>
        </p>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <ChartPanel
          id="chart-ventas-compras"
          title="Base imponible: ventas vs compras"
          description="Verde = ventas · Rojo = compras · Eje: periodo actual resaltado"
        >
          {barData.length === 0 ? (
            <ChartEmpty message="Sin registros en el periodo seleccionado." />
          ) : (
            <ChartContainer config={chartConfig} className="h-full w-full">
              <BarChart data={barData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_THEME.grid} />
                <XAxis dataKey="periodo" tick={(p) => <PeriodTick {...p} {...tickProps} />} height={36} />
                <YAxis tickFormatter={formatAxisMoney} tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent formatter={(v) => moneyTooltipFormatter(Number(v))} />} />
                <Legend />
                <Bar dataKey="ventas" name="Ventas" radius={[4, 4, 0, 0]}>
                  {barData.map((e) => (
                    <Cell
                      key={`v-${e.periodo}`}
                      fill={e.periodo === periodoActual ? "#15803d" : CHART_THEME.gain}
                    />
                  ))}
                </Bar>
                <Bar dataKey="compras" name="Compras" radius={[4, 4, 0, 0]}>
                  {barData.map((e) => (
                    <Cell
                      key={`c-${e.periodo}`}
                      fill={e.periodo === periodoActual ? "#b91c1c" : CHART_THEME.loss}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          )}
        </ChartPanel>

        <ChartPanel
          id="chart-utilidad-bars"
          title="Utilidad neta por periodo (barras)"
          description="Verde si hay ganancia, rojo si hay pérdida"
        >
          {charts.utilidadPorPeriodo.length === 0 ? (
            <ChartEmpty message="Sin datos de utilidad." />
          ) : (
            <ChartContainer config={chartConfig} className="h-full w-full">
              <BarChart data={charts.utilidadPorPeriodo} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="periodo" tick={(p) => <PeriodTick {...p} {...tickProps} />} height={36} />
                <YAxis tickFormatter={formatAxisMoney} />
                <ChartTooltip content={<ChartTooltipContent formatter={(v) => moneyTooltipFormatter(Number(v))} />} />
                <Bar dataKey="utilidad" name="Utilidad" radius={[6, 6, 0, 0]}>
                  {charts.utilidadPorPeriodo.map((e) => (
                    <Cell key={e.periodo} fill={utilidadColor(e.utilidad)} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          )}
        </ChartPanel>

        <ChartPanel
          id="chart-utilidad"
          title="Tendencia de utilidad"
          description="Área según resultado del periodo"
        >
          {charts.utilidadPorPeriodo.length === 0 ? (
            <ChartEmpty message="Sin datos." />
          ) : (
            <ChartContainer config={chartConfig} className="h-full w-full">
              <AreaChart data={charts.utilidadPorPeriodo} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="periodo" tick={(p) => <PeriodTick {...p} {...tickProps} />} height={36} />
                <YAxis tickFormatter={formatAxisMoney} />
                <ChartTooltip content={<ChartTooltipContent formatter={(v) => moneyTooltipFormatter(Number(v))} />} />
                <Area
                  type="monotone"
                  dataKey="utilidad"
                  stroke={CHART_THEME.neutral}
                  fill={CHART_THEME.periodRef}
                  fillOpacity={0.35}
                  strokeWidth={2}
                  name="Utilidad"
                />
              </AreaChart>
            </ChartContainer>
          )}
        </ChartPanel>

        <ChartPanel id="chart-igv" title="IGV y saldo fiscal" description="Barras azules + línea de saldo">
          {igvData.length === 0 ? (
            <ChartEmpty message="Sin datos de IGV." />
          ) : (
            <ChartContainer config={chartConfig} className="h-full w-full">
              <ComposedChart data={igvData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="periodo" tick={(p) => <PeriodTick {...p} {...tickProps} />} height={36} />
                <YAxis tickFormatter={formatAxisMoney} />
                <ChartTooltip content={<ChartTooltipContent formatter={(v) => moneyTooltipFormatter(Number(v))} />} />
                <Legend />
                <Bar dataKey="igvVentas" name="IGV Ventas" radius={3}>
                  {igvData.map((e) => (
                    <Cell key={`iv-${e.periodo}`} fill={periodoBarColor(e.periodo, periodoActual)} />
                  ))}
                </Bar>
                <Bar dataKey="igvCompras" name="IGV Compras" radius={3}>
                  {igvData.map((e) => (
                    <Cell
                      key={`ic-${e.periodo}`}
                      fill={
                        e.periodo === periodoActual
                          ? CHART_THEME.periodCurrent
                          : CHART_THEME.periodRef
                      }
                      fillOpacity={0.65}
                    />
                  ))}
                </Bar>
                <Line
                  type="monotone"
                  dataKey="saldo"
                  stroke={CHART_THEME.neutral}
                  strokeWidth={2}
                  dot={(props) => {
                    const { cx, cy, payload } = props as { cx: number; cy: number; payload: { saldo: number } };
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={5}
                        fill={utilidadColor(payload.saldo)}
                        stroke="#fff"
                        strokeWidth={1}
                      />
                    );
                  }}
                  name="Saldo IGV"
                />
              </ComposedChart>
            </ChartContainer>
          )}
        </ChartPanel>

        <ChartPanel id="chart-mix" title="Participación ventas / compras" description="Distribución del volumen">
          {charts.mixVentasCompras.length === 0 ? (
            <ChartEmpty message="Sin datos." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.mixVentasCompras}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={4}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  <Cell fill={CHART_THEME.gain} />
                  <Cell fill={CHART_THEME.loss} />
                </Pie>
                <Tooltip formatter={(v: number) => moneyTooltipFormatter(v)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartPanel>

        <ChartPanel id="chart-radar" title="Radar comparativo por periodo" description="Ventas y compras en todos los periodos">
          {periodos.length < 2 ? (
            <ChartEmpty message="Se necesitan al menos 2 periodos." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid stroke={CHART_THEME.grid} />
                <PolarAngleAxis dataKey="periodo" tick={{ fontSize: 10 }} />
                <Radar
                  name="Ventas"
                  dataKey="Ventas"
                  stroke={CHART_THEME.gain}
                  fill={CHART_THEME.gain}
                  fillOpacity={0.35}
                />
                <Radar
                  name="Compras"
                  dataKey="Compras"
                  stroke={CHART_THEME.loss}
                  fill={CHART_THEME.loss}
                  fillOpacity={0.25}
                />
                <Legend />
                <Tooltip formatter={(v: number) => moneyTooltipFormatter(v)} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </ChartPanel>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <ChartPanel id="chart-importe" title="Importe total de comprobantes" description="Evolución por periodo">
          {charts.importeTotalPorPeriodo.length === 0 ? (
            <ChartEmpty message="Sin importes." />
          ) : (
            <ChartContainer config={chartConfig} className="h-full w-full">
              <LineChart data={charts.importeTotalPorPeriodo} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="periodo" tick={(p) => <PeriodTick {...p} {...tickProps} />} height={36} />
                <YAxis tickFormatter={formatAxisMoney} />
                <ChartTooltip content={<ChartTooltipContent formatter={(v) => moneyTooltipFormatter(Number(v))} />} />
                <Legend />
                <Line type="monotone" dataKey="ventas" stroke={CHART_THEME.gain} strokeWidth={2} name="Ventas" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="compras" stroke={CHART_THEME.loss} strokeWidth={2} name="Compras" dot={{ r: 3 }} />
              </LineChart>
            </ChartContainer>
          )}
        </ChartPanel>

        <ChartPanel id="chart-composicion" title="Composición mensual" description="Base ventas y compras">
          {charts.composicionMensual.length === 0 ? (
            <ChartEmpty message="Sin datos." />
          ) : (
            <ChartContainer config={chartConfig} className="h-full w-full">
              <AreaChart data={charts.composicionMensual} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="periodo" tick={(p) => <PeriodTick {...p} {...tickProps} />} height={36} />
                <YAxis tickFormatter={formatAxisMoney} />
                <ChartTooltip content={<ChartTooltipContent formatter={(v) => moneyTooltipFormatter(Number(v))} />} />
                <Legend />
                <Area type="monotone" dataKey="baseVentas" stackId="1" fill={CHART_THEME.gain} stroke={CHART_THEME.gain} fillOpacity={0.5} name="Base ventas" />
                <Area type="monotone" dataKey="baseCompras" stackId="2" fill={CHART_THEME.loss} stroke={CHART_THEME.loss} fillOpacity={0.4} name="Base compras" />
              </AreaChart>
            </ChartContainer>
          )}
        </ChartPanel>

        <ChartPanel id="chart-tipo-cdp" title="Por tipo de comprobante" description="SUNAT cod_tipo_cdp">
          {charts.porTipoComprobante.length === 0 ? (
            <ChartEmpty message="Sin tipos." />
          ) : (
            <ChartContainer config={chartConfig} className="h-full w-full">
              <BarChart data={charts.porTipoComprobante} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={formatAxisMoney} />
                <YAxis type="category" dataKey="codigo" width={36} />
                <ChartTooltip content={<ChartTooltipContent formatter={(v) => moneyTooltipFormatter(Number(v))} />} />
                <Legend />
                <Bar dataKey="ventas" fill={CHART_THEME.gain} name="Ventas" radius={3} />
                <Bar dataKey="compras" fill={CHART_THEME.loss} name="Compras" radius={3} />
              </BarChart>
            </ChartContainer>
          )}
        </ChartPanel>

        <ChartPanel id="chart-estado" title="Estado de validación SIRE" description="Pendiente / validado / IA">
          {charts.porEstadoValidacion.length === 0 ? (
            <ChartEmpty message="Sin estados." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.porEstadoValidacion}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="estado" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="cantidad" name="Registros" radius={[6, 6, 0, 0]}>
                  {charts.porEstadoValidacion.map((row) => (
                    <Cell
                      key={row.estado}
                      fill={
                        row.estado === "validado"
                          ? CHART_THEME.gain
                          : row.estado === "pendiente"
                            ? CHART_THEME.neutral
                            : "#f59e0b"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartPanel>
      </div>

      <ChartPanel
        id="chart-top-contrapartes"
        title="Top contrapartes por importe"
        description="Verde clientes · Rojo proveedores"
      >
        {charts.topContrapartes.length === 0 ? (
          <ChartEmpty message="Sin contrapartes." />
        ) : (
          <ChartContainer config={chartConfig} className="h-full w-full max-w-4xl mx-auto">
            <BarChart data={charts.topContrapartes} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tickFormatter={formatAxisMoney} />
              <YAxis type="category" dataKey="nombre" width={140} tick={{ fontSize: 10 }} />
              <ChartTooltip content={<ChartTooltipContent formatter={(v) => moneyTooltipFormatter(Number(v))} />} />
              <Bar dataKey="importe" name="Importe" radius={4}>
                {charts.topContrapartes.map((row) => (
                  <Cell
                    key={row.nombre}
                    fill={row.tipo === "VENTA" ? CHART_THEME.gain : CHART_THEME.loss}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </ChartPanel>
    </div>
  );
}
