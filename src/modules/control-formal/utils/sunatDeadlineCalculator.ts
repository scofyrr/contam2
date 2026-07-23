/** Feriados nacionales oficiales Perú — catálogo para cálculo de días hábiles SUNAT */
export const FERIADOS_NACIONALES_PE: string[] = [
  // 2024
  "2024-01-01",
  "2024-03-28",
  "2024-03-29",
  "2024-05-01",
  "2024-06-07",
  "2024-06-29",
  "2024-07-23",
  "2024-07-28",
  "2024-07-29",
  "2024-08-06",
  "2024-08-30",
  "2024-10-08",
  "2024-11-01",
  "2024-12-08",
  "2024-12-25",
  // 2025
  "2025-01-01",
  "2025-04-17",
  "2025-04-18",
  "2025-05-01",
  "2025-06-07",
  "2025-06-29",
  "2025-07-23",
  "2025-07-28",
  "2025-07-29",
  "2025-08-06",
  "2025-08-30",
  "2025-10-08",
  "2025-11-01",
  "2025-12-08",
  "2025-12-25",
  // 2026
  "2026-01-01",
  "2026-04-02",
  "2026-04-03",
  "2026-05-01",
  "2026-06-07",
  "2026-06-29",
  "2026-07-23",
  "2026-07-28",
  "2026-07-29",
  "2026-08-06",
  "2026-08-30",
  "2026-10-08",
  "2026-11-01",
  "2026-12-08",
  "2026-12-25",
  // 2027
  "2027-01-01",
  "2027-03-25",
  "2027-03-26",
  "2027-05-01",
  "2027-06-07",
  "2027-06-29",
  "2027-07-23",
  "2027-07-28",
  "2027-07-29",
  "2027-08-06",
  "2027-08-30",
  "2027-10-08",
  "2027-11-01",
  "2027-12-08",
  "2027-12-25",
];

const feriadosSet = new Set(FERIADOS_NACIONALES_PE);

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function esDiaHabilPeru(fecha: Date): boolean {
  const dow = fecha.getDay();
  if (dow === 0 || dow === 6) return false;
  return !feriadosSet.has(toDateKey(fecha));
}

export function calcular15DiasHabilesPeru(fechaInicio: Date): Date {
  const result = new Date(fechaInicio);
  let contador = 0;
  while (contador < 15) {
    result.setDate(result.getDate() + 1);
    if (esDiaHabilPeru(result)) {
      contador += 1;
    }
  }
  return result;
}

export function calcular60DiasCalendario(fechaInicio: Date): Date {
  const result = new Date(fechaInicio);
  result.setDate(result.getDate() + 60);
  return result;
}

export function diasHabilesRestantes(fechaLimite: Date, hoy = new Date()): number {
  const limite = new Date(fechaLimite);
  limite.setHours(0, 0, 0, 0);
  const actual = new Date(hoy);
  actual.setHours(0, 0, 0, 0);

  if (limite <= actual) return 0;

  let count = 0;
  const cursor = new Date(actual);
  while (cursor < limite) {
    cursor.setDate(cursor.getDate() + 1);
    if (esDiaHabilPeru(cursor)) count += 1;
  }
  return count;
}

export function diasCalendarioRestantes(fechaLimite: Date, hoy = new Date()): number {
  const limite = new Date(fechaLimite);
  limite.setHours(0, 0, 0, 0);
  const actual = new Date(hoy);
  actual.setHours(0, 0, 0, 0);
  const diff = Math.ceil((limite.getTime() - actual.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(diff, 0);
}

export function formatFechaPeru(fecha: Date): string {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(fecha);
}

export interface PlazosContingenciaCalculados {
  fechaLimiteComunicacion15d: Date;
  fechaLimiteReconstruccion60d: Date;
  diasRestantesComunicacion: number;
  diasRestantesReconstruccion: number;
}

export function calcularPlazosContingencia(fechaOcurrencia: Date, hoy = new Date()): PlazosContingenciaCalculados {
  const limite15 = calcular15DiasHabilesPeru(fechaOcurrencia);
  const limite60 = calcular60DiasCalendario(fechaOcurrencia);
  return {
    fechaLimiteComunicacion15d: limite15,
    fechaLimiteReconstruccion60d: limite60,
    diasRestantesComunicacion: diasHabilesRestantes(limite15, hoy),
    diasRestantesReconstruccion: diasCalendarioRestantes(limite60, hoy),
  };
}
