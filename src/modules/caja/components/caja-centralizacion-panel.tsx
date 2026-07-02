import { useState } from "react";
import { Loader2, Play, RotateCcw, Eye } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCentralizarPeriodo, useDescentralizarPeriodo } from "@/hooks/use-caja-premium";
import { useCaja } from "@/hooks/use-caja";
import type { AgrupacionCentralizacion, CentralizacionGrupo } from "@/modules/caja/types/conciliacion";

function fmt(n: number) {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(n);
}

export function CajaCentralizacionPanel({ ruc, periodo }: { ruc: string; periodo: string }) {
  const [agrupacion, setAgrupacion] = useState<AgrupacionCentralizacion>("cuenta");
  const [preview, setPreview] = useState<CentralizacionGrupo[] | null>(null);

  const { pendientesCentralizarQuery } = useCaja({ ruc, periodo });
  const centralizar = useCentralizarPeriodo();
  const descentralizar = useDescentralizarPeriodo();

  const runPreview = async () => {
    try {
      const rows = await centralizar.mutateAsync({
        ruc,
        periodo,
        agrupacion,
        dryRun: true,
      });
      setPreview(rows);
      if (rows.length === 0) toast.info("No hay movimientos pendientes de centralizar");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error en vista previa");
    }
  };

  const ejecutar = async () => {
    try {
      const rows = await centralizar.mutateAsync({
        ruc,
        periodo,
        agrupacion,
        dryRun: false,
      });
      setPreview(rows);
      toast.success(`Centralización ejecutada: ${rows.length} grupo(s)`);
      await pendientesCentralizarQuery.refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al centralizar");
    }
  };

  const revertir = async () => {
    try {
      await descentralizar.mutateAsync({ ruc, periodo });
      setPreview(null);
      toast.success("Centralización revertida");
      await pendientesCentralizarQuery.refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo revertir");
    }
  };

  const pendientes = pendientesCentralizarQuery.data?.length ?? 0;

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">Centralización inteligente</h3>
          <p className="text-xs text-muted-foreground">
            Agrupe movimientos sin asiento y genere asientos CAJA_BANCOS
          </p>
        </div>
        <Badge variant="outline">{pendientes} pendientes</Badge>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <Select value={agrupacion} onValueChange={(v) => setAgrupacion(v as AgrupacionCentralizacion)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Agrupación" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cuenta">Por cuenta PCGE</SelectItem>
            <SelectItem value="tipo">Por tipo (ingreso/egreso)</SelectItem>
            <SelectItem value="dia">Por día</SelectItem>
            <SelectItem value="origen">Por origen documento</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" onClick={runPreview} disabled={centralizar.isPending}>
          {centralizar.isPending ? <Loader2 className="size-4 animate-spin" /> : <Eye className="size-4" />}
          Vista previa
        </Button>
        <Button size="sm" onClick={ejecutar} disabled={centralizar.isPending || pendientes === 0}>
          <Play className="size-4" /> Ejecutar
        </Button>
        <Button variant="ghost" size="sm" onClick={revertir} disabled={descentralizar.isPending}>
          <RotateCcw className="size-4" /> Revertir período
        </Button>
      </div>

      {pendientesCentralizarQuery.isLoading ? (
        <Skeleton className="h-32 rounded-lg bg-white/5" />
      ) : preview && preview.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Grupo</TableHead>
              <TableHead>Cuenta</TableHead>
              <TableHead className="text-right">Mov.</TableHead>
              <TableHead className="text-right">Ingresos</TableHead>
              <TableHead className="text-right">Egresos</TableHead>
              <TableHead className="text-right">Neto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {preview.map((g, i) => (
              <TableRow key={`${g.grupoNombre}-${i}`}>
                <TableCell className="font-medium">{g.grupoNombre}</TableCell>
                <TableCell className="font-mono text-xs">{g.cuentaContable}</TableCell>
                <TableCell className="text-right">{g.cantidadMovimientos}</TableCell>
                <TableCell className="text-right font-mono text-emerald-600">{fmt(g.totalIngresos)}</TableCell>
                <TableCell className="text-right font-mono text-red-500">{fmt(g.totalEgresos)}</TableCell>
                <TableCell className="text-right font-mono">{fmt(g.montoNeto)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-6">
          Ejecute vista previa para ver los asientos que se generarían
        </p>
      )}
    </div>
  );
}
