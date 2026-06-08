import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  desactivarCuentaFinanciera,
  fetchCuentasFinancieras,
  upsertCuentaFinanciera,
} from "@/lib/cuentas-financieras-service";
import type { CuentaFinanciera, CuentaFinancieraTipo } from "@/lib/cuentas-financieras-types";
import { queryKeys } from "@/lib/query-keys-contables";

export function CuentasFinancierasPanel({ ruc }: { ruc: string }) {
  const qc = useQueryClient();
  const [draft, setDraft] = useState({
    nombre: "",
    tipo: "BANCO" as CuentaFinancieraTipo,
    cuenta_contable: "104101",
    banco: "BCP",
    numero_cuenta: "",
  });

  const query = useQuery({
    queryKey: queryKeys.cuentasFinancieras(ruc),
    queryFn: () => fetchCuentasFinancieras(ruc),
    enabled: !!ruc,
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      upsertCuentaFinanciera({
        ruc,
        nombre: draft.nombre,
        tipo: draft.tipo,
        cuenta_contable: draft.cuenta_contable,
        banco: draft.tipo === "BANCO" ? draft.banco : null,
        numero_cuenta: draft.numero_cuenta || null,
        activo: true,
      }),
    onSuccess: () => {
      toast.success("Cuenta financiera guardada");
      setDraft((d) => ({ ...d, nombre: "", numero_cuenta: "" }));
      qc.invalidateQueries({ queryKey: queryKeys.cuentasFinancieras(ruc) });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => desactivarCuentaFinanciera(id),
    onSuccess: () => {
      toast.success("Cuenta desactivada");
      qc.invalidateQueries({ queryKey: queryKeys.cuentasFinancieras(ruc) });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = query.data ?? [];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-4">
        <div className="mb-4">
          <h2 className="font-medium flex items-center gap-2">
            <Building2 className="size-5 text-primary" />
            Cuentas financieras (Clase 10)
          </h2>
          <p className="text-xs text-muted-foreground">
            Cajas chicas y cuentas bancarias vinculadas al PCGE
          </p>
        </div>

        {query.isLoading ? (
          <div className="py-6 flex justify-center text-muted-foreground gap-2">
            <Loader2 className="size-4 animate-spin" />
            Cargando…
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Cuenta PCGE</TableHead>
                <TableHead>Banco / N° cuenta</TableHead>
                <TableHead className="w-16" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((c: CuentaFinanciera) => (
                <TableRow key={c.id}>
                  <TableCell>{c.nombre}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{c.tipo === "BANCO" ? "Banco" : "Caja chica"}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{c.cuenta_contable}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {[c.banco, c.numero_cuenta].filter(Boolean).join(" · ") || "—"}
                  </TableCell>
                  <TableCell>
                    {!c.id.startsWith("local-") && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive"
                        onClick={() => deleteMutation.mutate(c.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="rounded-xl border bg-card p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Nombre</Label>
          <Input
            placeholder="BCP Corriente Soles"
            value={draft.nombre}
            onChange={(e) => setDraft((d) => ({ ...d, nombre: e.target.value }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Tipo</Label>
          <Select
            value={draft.tipo}
            onValueChange={(v) =>
              setDraft((d) => ({
                ...d,
                tipo: v as CuentaFinancieraTipo,
                cuenta_contable: v === "CAJA_CHICA" ? "101101" : "104101",
              }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CAJA_CHICA">Caja chica</SelectItem>
              <SelectItem value="BANCO">Banco</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Cuenta contable</Label>
          <Input
            value={draft.cuenta_contable}
            onChange={(e) => setDraft((d) => ({ ...d, cuenta_contable: e.target.value }))}
          />
        </div>
        {draft.tipo === "BANCO" && (
          <div className="space-y-1.5">
            <Label>Banco</Label>
            <Input
              value={draft.banco}
              onChange={(e) => setDraft((d) => ({ ...d, banco: e.target.value }))}
            />
          </div>
        )}
        <div className="space-y-1.5">
          <Label>N° cuenta (opcional)</Label>
          <Input
            value={draft.numero_cuenta}
            onChange={(e) => setDraft((d) => ({ ...d, numero_cuenta: e.target.value }))}
          />
        </div>
        <div className="flex items-end">
          <Button
            className="w-full"
            disabled={!draft.nombre.trim() || saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
          >
            <Plus className="size-4 mr-1" />
            Agregar cuenta
          </Button>
        </div>
      </div>
    </div>
  );
}
