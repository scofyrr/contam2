/** Tipos del Plan Contable General Empresarial (PCGE) — Perú, códigos sin puntos. */

export type PcgeNivel = 1 | 2 | 3 | 4 | 5 | 6;

export type PlanContableCuenta = {
  id?: string;
  codigo_cuenta: string;
  nombre_cuenta: string;
  nivel: PcgeNivel | number;
  padre_codigo?: string | null;
  es_agrupador?: boolean;
  activo: boolean;
  naturaleza?: string | null;
  tipo_cuenta?: string | null;
  aplica_para?: string | null;
  palabras_clave?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type PcgeJerarquico = PlanContableCuenta & {
  nombre_padre?: string | null;
  ruta_visual?: string | null;
};

export type PcgeTreeNode = PlanContableCuenta & {
  hijos: PcgeTreeNode[];
};

export type CrearCuentaPcgeDTO = {
  codigo_cuenta: string;
  nombre_cuenta: string;
  nivel?: number;
  padre_codigo?: string | null;
  es_agrupador?: boolean;
  activo?: boolean;
  naturaleza?: string | null;
  tipo_cuenta?: string | null;
  aplica_para?: string | null;
  palabras_clave?: string | null;
};

export type ActualizarCuentaPcgeDTO = Partial<Omit<CrearCuentaPcgeDTO, "codigo_cuenta">> & {
  codigo_cuenta: string;
};

/** Longitudes válidas por nivel PCGE peruano. */
export const PCGE_LONGITUDES_NIVEL: Record<PcgeNivel, number> = {
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 6,
  6: 8,
};
