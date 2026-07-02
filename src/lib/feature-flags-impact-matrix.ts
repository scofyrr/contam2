/**
 * Matriz de impacto de feature flags SIRE.
 * Ejecutar `generateImpactReport()` en consola DEV para inspeccionar.
 */

export type FlagImpactEntry = {
  flag: string;
  file: string;
  line: number;
  function: string;
  legacyPath: string;
  newPath: string;
  risk: "bajo" | "medio" | "alto";
  deadCode?: boolean;
  notes?: string;
};

/** Puntos donde se evalúa VITE_USE_NEW_SIRE_STRUCTURE y derivados. */
export const FEATURE_FLAGS_IMPACT_MATRIX: FlagImpactEntry[] = [
  {
    flag: "VITE_USE_NEW_SIRE_STRUCTURE",
    file: "src/lib/feature-flags.ts",
    line: 2,
    function: "useNewSireStructure",
    legacyPath: "registros_sire (tabla monolítica)",
    newPath: "registros_sire_cabecera + hijas + vista registros_sire_completo",
    risk: "alto",
    notes: "Switch central; desalineación si triggers sync no están activos en BD",
  },
  {
    flag: "VITE_USE_NEW_SIRE_STRUCTURE",
    file: "src/lib/feature-flags.ts",
    line: 7,
    function: "getSireReadSource",
    legacyPath: "FROM registros_sire",
    newPath: "FROM registros_sire_completo",
    risk: "alto",
  },
  {
    flag: "VITE_USE_NEW_SIRE_STRUCTURE",
    file: "src/lib/feature-flags.ts",
    line: 11,
    function: "getSireCabeceraTable",
    legacyPath: "UPDATE registros_sire",
    newPath: "UPDATE registros_sire_cabecera",
    risk: "alto",
  },
  {
    flag: "VITE_USE_NEW_SIRE_STRUCTURE",
    file: "src/lib/feature-flags.ts",
    line: 16,
    function: "getSireEmbedRelation",
    legacyPath: "asientos_contables → registros_sire",
    newPath: "asientos_contables → registros_sire_cabecera",
    risk: "alto",
    notes: "FK sire_registro_id debe existir en ambas tablas (mismo UUID) para embed PostgREST",
  },
  {
    flag: "VITE_USE_NEW_SIRE_STRUCTURE",
    file: "src/lib/sire-registros-service.ts",
    line: 96,
    function: "fetchRegistrosSireRows",
    legacyPath: "select * from registros_sire",
    newPath: "select * from registros_sire_completo",
    risk: "medio",
  },
  {
    flag: "VITE_USE_NEW_SIRE_STRUCTURE",
    file: "src/lib/sire-registros-service.ts",
    line: 207,
    function: "upsertRegistroSire",
    legacyPath: "insert/update registros_sire",
    newPath: "upsertRegistroNormalizado (4 tablas)",
    risk: "alto",
    notes: "Sin sync triggers, solo escribe en un lado",
  },
  {
    flag: "VITE_USE_NEW_SIRE_STRUCTURE",
    file: "src/lib/sire-registros-service.ts",
    line: 230,
    function: "deleteRegistroSire",
    legacyPath: "delete registros_sire",
    newPath: "delete registros_sire_cabecera (CASCADE hijas)",
    risk: "medio",
  },
  {
    flag: "VITE_USE_NEW_SIRE_STRUCTURE",
    file: "src/lib/asiento-cancelacion.ts",
    line: 24,
    function: "cancelacion helpers",
    legacyPath: "registros_sire cancelacion_*",
    newPath: "registros_sire_cabecera cancelacion_*",
    risk: "medio",
  },
  {
    flag: "VITE_USE_NEW_SIRE_STRUCTURE",
    file: "src/lib/caja-liquidacion-service.ts",
    line: 29,
    function: "fetchComprobantesPendientesLiquidacion",
    legacyPath: "getSireReadSource() → legacy view",
    newPath: "getSireReadSource() → completo",
    risk: "medio",
  },
  {
    flag: "VITE_USE_NEW_SIRE_STRUCTURE",
    file: "src/lib/cancelaciones-service.ts",
    line: 49,
    function: "fetch cancelaciones",
    legacyPath: "registros_sire",
    newPath: "registros_sire_completo",
    risk: "medio",
  },
  {
    flag: "VITE_USE_NEW_SIRE_STRUCTURE",
    file: "src/lib/cxc-cxp-service.ts",
    line: 163,
    function: "CxC/CxP queries",
    legacyPath: "registros_sire",
    newPath: "registros_sire_completo",
    risk: "medio",
  },
  {
    flag: "VITE_USE_NEW_SIRE_STRUCTURE",
    file: "src/lib/sire-validate-service.ts",
    line: 27,
    function: "validación SIRE",
    legacyPath: "registros_sire + cabecera legacy",
    newPath: "completo + cabecera normalizada",
    risk: "medio",
  },
  {
    flag: "VITE_USE_NEW_SIRE_STRUCTURE",
    file: "src/routes/api/stats/kpis.ts",
    line: 15,
    function: "API KPIs",
    legacyPath: "registros_sire",
    newPath: "registros_sire_completo",
    risk: "bajo",
  },
  {
    flag: "VITE_USE_NEW_SIRE_STRUCTURE",
    file: "src/routes/api/stats/charts.ts",
    line: 15,
    function: "API charts",
    legacyPath: "registros_sire",
    newPath: "registros_sire_completo",
    risk: "bajo",
  },
  {
    flag: "VITE_USE_NEW_SIRE_STRUCTURE",
    file: "src/routes/_app.dashboard-estadisticas.tsx",
    line: 255,
    function: "DashboardEstadisticasPage",
    legacyPath: "display getSireReadSource()",
    newPath: "display getSireReadSource()",
    risk: "bajo",
    deadCode: false,
  },
  {
    flag: "VITE_USE_DJANGO_API",
    file: "src/lib/feature-flags.ts",
    line: 0,
    function: "(no exportado aún en feature-flags.ts)",
    legacyPath: "Supabase directo",
    newPath: "Django REST",
    risk: "medio",
    deadCode: true,
    notes: "Flag referenciado en docs; consolidar en feature-flags.ts",
  },
];

/** Agrupa entradas por archivo. */
export function groupImpactByFile(entries = FEATURE_FLAGS_IMPACT_MATRIX): Map<string, FlagImpactEntry[]> {
  const map = new Map<string, FlagImpactEntry[]>();
  for (const e of entries) {
    const list = map.get(e.file) ?? [];
    list.push(e);
    map.set(e.file, list);
  }
  return map;
}

/** Reporte legible para consola (solo DEV). */
export function generateImpactReport(): string {
  const lines: string[] = [
    "=== CONTAM Feature Flags Impact Report ===",
    `Generado: ${new Date().toISOString()}`,
    `Entradas: ${FEATURE_FLAGS_IMPACT_MATRIX.length}`,
    "",
  ];

  const byRisk = { alto: 0, medio: 0, bajo: 0 };
  const dead = FEATURE_FLAGS_IMPACT_MATRIX.filter((e) => e.deadCode);

  for (const e of FEATURE_FLAGS_IMPACT_MATRIX) {
    byRisk[e.risk]++;
    lines.push(
      `[${e.risk.toUpperCase()}] ${e.flag} → ${e.file}:${e.line} (${e.function})`,
      `  Legacy: ${e.legacyPath}`,
      `  New:    ${e.newPath}`,
      e.notes ? `  Notas:  ${e.notes}` : "",
      "",
    );
  }

  lines.push(
    "--- Resumen ---",
    `Riesgo alto: ${byRisk.alto}, medio: ${byRisk.medio}, bajo: ${byRisk.bajo}`,
    `Código muerto marcado: ${dead.length}`,
  );

  if (dead.length) {
    lines.push("", "Dead code:");
    for (const d of dead) {
      lines.push(`  - ${d.file} (${d.function})`);
    }
  }

  const report = lines.filter(Boolean).join("\n");

  if (import.meta.env.DEV && typeof console !== "undefined") {
    console.info(report);
  }

  return report;
}

if (import.meta.env.DEV && typeof window !== "undefined") {
  (window as Window & { __contamImpactReport?: () => string }).__contamImpactReport =
    generateImpactReport;
}
