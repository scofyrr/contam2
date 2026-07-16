import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowDownLeft, ArrowUpRight, Loader2, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { fetchFlujoCajaBancos } from "@/lib/libro-caja-asientos-service";
import { revertirCancelacion } from "@/lib/asiento-cancelacion";
import { queryKeys } from "@/lib/query-keys-contables";

function formatMoney(n: number) {
  return n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function FlujoCajaTable({
  ruc,
  periodo,
}: {
  ruc: string;
  periodo: string | null;
}) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: queryKeys.libroCajaBancos(ruc, periodo),
    queryFn: () =>
      fetchFlujoCajaBancos({
        ruc,
        periodo,
      }),
    enabled: !!ruc,
  });

  const anular = useMutation({
    mutationFn: (sireRegistroId: string) => revertirCancelacion(sireRegistroId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.libroCajaBancos(ruc, periodo) });
      await qc.invalidateQueries({ queryKey: ["registros_sire"] });
      await qc.invalidateQueries({ queryKey: ["cancelaciones"] });
    },
  });

  const rows = query.data ?? [];

  return (
    <div className="rounded-xl border bg-card overflow-x-auto">
      <div className="p-4 border-b">
        <h2 className="font-medium">Flujo de efectivo (CAJA_BANCOS)</h2>
        <p className="text-xs text-muted-foreground">
          Cancelaciones desde Libro Diario y operaciones directas · solo tipo_libro = CAJA_BANCOS
        </p>
      </div>

      {query.isLoading ? (
        <div className="p-8 flex justify-center text-muted-foreground gap-2">
          <Loader2 className="size-4 animate-spin" />
          Cargando movimientos…
        </div>
      ) : rows.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground text-sm">
          No hay movimientos de caja para este periodo. Use &quot;Registrar Pago / Cobro&quot; en el Libro Diario.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Glosa</TableHead>
              <TableHead>Cuenta</TableHead>
              <TableHead className="text-right">Ingreso</TableHead>
              <TableHead className="text-right">Egreso</TableHead>
              <TableHead>Origen</TableHead>
              <TableHead className="text-right">Anular</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const ingreso = row.debe > 0 ? row.debe : 0;
              const egreso = row.haber > 0 ? row.haber : 0;
              return (
                <TableRow key={row.id}>
                  <TableCell>{row.fecha_asiento}</TableCell>
                  <TableCell className="max-w-md">
                    <div className="flex items-start gap-2">
                      {ingreso > 0 ? (
                        <ArrowDownLeft className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <ArrowUpRight className="size-4 text-red-600 shrink-0 mt-0.5" />
                      )}
                      <span className="text-sm">{row.glosa}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{row.cuenta_contable}</TableCell>
                  <TableCell className="text-right tabular-nums text-emerald-700">
                    {ingreso > 0 ? formatMoney(ingreso) : "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-red-700">
                    {egreso > 0 ? formatMoney(egreso) : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">
                      {row.origen === "cancelacion_caja" ? "Cancelación CxP/CxC" : "Directo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {row.sire_registro_id ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Anular este movimiento"
                            disabled={anular.isPending}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Anular movimiento?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Se eliminará el asiento de cancelación y el movimiento de caja.{" "}
                              El comprobante SIRE volverá a estado{" "}
                              <strong>Pendiente</strong>.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => anular.mutate(row.sire_registro_id!)}
                            >
                              Sí, anular
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
