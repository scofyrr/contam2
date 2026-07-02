import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Landmark, Plus, Table2 } from "lucide-react";
import { toast } from "sonner";

import { ConfigContableCard } from "@/components/pcge/config-contable-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PcgeTable } from "@/components/pcge/pcge-table";
import { ArbolPCGE } from "@/modules/contabilidad/pcge/components/ArbolPCGE";
import { PcgeTreePremium } from "@/modules/contabilidad/pcge/components/pcge-tree-premium";
import { FormularioCuentaPCGE } from "@/modules/contabilidad/pcge/components/FormularioCuentaPCGE";
import {
  generarCodigoPcgeHijo,
  setPcgeActivo,
  upsertPcgeCuenta,
  usePcgeCuentas,
  type PcgeCuenta,
} from "@/lib/pcge-service";

export const Route = createFileRoute("/_app/pcge")({
  component: PcgePage,
});

function PcgePage() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<PcgeCuenta | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [padreCodigo, setPadreCodigo] = useState<string | null>(null);
  const [editInitial, setEditInitial] = useState<Partial<PcgeCuenta> | null>(null);

  const cuentasQuery = usePcgeCuentas();

  const saveMutation = useMutation({
    mutationFn: upsertPcgeCuenta,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["pcge"] });
      toast.success("Cuenta PCGE guardada");
      setOpenForm(false);
      setEditInitial(null);
      setPadreCodigo(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleActivo = useMutation({
    mutationFn: ({ codigo, activo }: { codigo: string; activo: boolean }) =>
      setPcgeActivo(codigo, activo),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["pcge"] });
    },
  });

  const openNewChild = async (padre: PcgeCuenta) => {
    try {
      const hijo = await generarCodigoPcgeHijo(padre.codigo_cuenta);
      setPadreCodigo(padre.codigo_cuenta);
      setEditInitial({ codigo_cuenta: hijo, padre_codigo: padre.codigo_cuenta, es_agrupador: false });
      setOpenForm(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo generar código hijo");
    }
  };

  const cuentas = cuentasQuery.data ?? [];

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold flex items-center gap-2">
            <Landmark className="size-8 text-primary" />
            Plan de Cuentas (PCGE)
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Códigos secuenciales sin puntos · Resolución CONASEV / PCGE Perú 2026
          </p>
        </div>
        <Badge variant="outline" className="border-blue-500/40 text-blue-700">
          {cuentas.length} cuentas
        </Badge>
      </header>

      <Tabs defaultValue="explorador">
        <TabsList>
          <TabsTrigger value="explorador">Explorador premium</TabsTrigger>
          <TabsTrigger value="arbol">Árbol clásico</TabsTrigger>
          <TabsTrigger value="tabla">Tabla editable</TabsTrigger>
          <TabsTrigger value="config">Configuración</TabsTrigger>
        </TabsList>

        <TabsContent value="explorador" className="mt-4">
          <PcgeTreePremium
            cuentas={cuentas}
            loading={cuentasQuery.isLoading}
            error={cuentasQuery.error instanceof Error ? cuentasQuery.error : null}
            onRetry={() => void cuentasQuery.refetch()}
            selectedCodigo={selected?.codigo_cuenta}
            onSelect={setSelected}
            onEdit={(c) => {
              setEditInitial(c);
              setOpenForm(true);
            }}
            onAddChild={openNewChild}
          />
        </TabsContent>

        <TabsContent value="arbol" className="mt-4">
          <div className="grid lg:grid-cols-[1fr_320px] gap-4">
            <ArbolPCGE
              cuentas={cuentas}
              selectedCodigo={selected?.codigo_cuenta}
              onSelect={setSelected}
              onAddChild={openNewChild}
            />
            <div className="rounded-xl border bg-card p-4 space-y-3">
              <h3 className="font-medium">Cuenta seleccionada</h3>
              {selected ? (
                <>
                  <p className="font-mono text-lg">{selected.codigo_cuenta}</p>
                  <p className="text-sm">{selected.nombre_cuenta}</p>
                  <p className="text-xs text-muted-foreground">
                    Nivel {selected.nivel} · {selected.es_agrupador ? "Agrupador" : "Operativa"}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditInitial(selected);
                        setOpenForm(true);
                      }}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        toggleActivo.mutate({
                          codigo: selected.codigo_cuenta,
                          activo: !selected.activo,
                        })
                      }
                    >
                      {selected.activo ? "Desactivar" : "Activar"}
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Seleccione una cuenta del árbol.</p>
              )}
              <Button
                className="w-full"
                onClick={() => {
                  setEditInitial(null);
                  setPadreCodigo(null);
                  setOpenForm(true);
                }}
              >
                <Plus className="size-4 mr-2" />
                Nueva cuenta raíz
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tabla" className="mt-4">
          <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
            <Table2 className="size-4" />
            Vista tabular legacy con búsqueda y alta rápida
          </div>
          <PcgeTable />
        </TabsContent>

        <TabsContent value="config" className="mt-4">
          <ConfigContableCard />
        </TabsContent>
      </Tabs>

      <FormularioCuentaPCGE
        open={openForm}
        onOpenChange={setOpenForm}
        initial={editInitial}
        padreCodigo={padreCodigo}
        loading={saveMutation.isPending}
        onSubmit={(values) =>
          saveMutation.mutate({
            codigo_cuenta: values.codigo_cuenta,
            nombre_cuenta: values.nombre_cuenta,
            nivel: values.nivel,
            padre_codigo: values.padre_codigo,
            es_agrupador: values.es_agrupador,
            activo: values.activo,
            naturaleza: values.naturaleza,
            tipo_cuenta: values.tipo_cuenta,
          })
        }
      />
    </div>
  );
}
