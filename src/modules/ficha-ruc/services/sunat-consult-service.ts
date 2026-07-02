import { supabase } from "@/integrations/supabase/client";
import type { RucValidation, SunatDataSource, SunatRucData, SunatRucResponse } from "@/modules/ficha-ruc/types/sunat";

const CACHE_PREFIX = "sunat_cache_";
const RATE_KEY = "sunat_rate_limit";
const MAX_PER_MINUTE = 10;

const FACTORES = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2] as const;

const NOMBRES = ["JUAN", "MARIA", "JOSE", "CARMEN", "LUIS", "ANA", "CARLOS", "ROSA", "JORGE", "GLORIA"];
const APELLIDOS = ["GARCIA", "RODRIGUEZ", "LOPEZ", "MARTINEZ", "HERNANDEZ", "DIAZ", "TORRES", "RAMIREZ", "FLORES", "MORALES"];
const FANTASIAS = ["ANDINO", "PACIFICO", "CONTINENTAL", "UNIVERSAL", "ATLANTICO", "CORDILLERA", "AMAZONAS", "SOL", "ESTRELLA", "CONDOR"];

const ACTIVIDADES = [
  { codigo: "4711", descripcion: "VENTA AL POR MENOR EN COMERCIOS NO ESPECIALIZADOS" },
  { codigo: "5610", descripcion: "ACTIVIDADES DE RESTAURANTES Y DE SERVICIO MOVIL DE COMIDAS" },
  { codigo: "6201", descripcion: "PROGRAMACION INFORMATICA" },
  { codigo: "7020", descripcion: "ACTIVIDADES DE CONSULTORIA DE GESTION" },
  { codigo: "4520", descripcion: "MANTENIMIENTO Y REPARACION DE VEHICULOS AUTOMOTORES" },
  { codigo: "4110", descripcion: "CONSTRUCCION DE EDIFICIOS" },
  { codigo: "4923", descripcion: "TRANSPORTE DE CARGA POR CARRETERA" },
  { codigo: "6910", descripcion: "ACTIVIDADES JURIDICAS" },
  { codigo: "6920", descripcion: "ACTIVIDADES DE CONTABILIDAD, TENEDURIA DE LIBROS Y AUDITORIA" },
  { codigo: "7310", descripcion: "PUBLICIDAD" },
];

const DEPARTAMENTOS: Record<string, { provincias: string[]; distritos: string[] }> = {
  LIMA: {
    provincias: ["LIMA", "CALLAO", "CAÑETE", "HUARAL"],
    distritos: ["MIRAFLORES", "SAN ISIDRO", "SURCO", "LA MOLINA", "SAN BORJA", "BARRANCO", "MAGDALENA", "LINCE"],
  },
  AREQUIPA: {
    provincias: ["AREQUIPA", "CAYLLOMA", "ISLAY"],
    distritos: ["CERCADO", "YANAHUARA", "CAYMA", "SACHACA"],
  },
  CUSCO: {
    provincias: ["CUSCO", "URUBAMBA"],
    distritos: ["CUSCO", "WANCHAQ", "SANTIAGO"],
  },
};

function seeded(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)]!;
}

export function calcularDigitoVerificador(ruc10: string): number {
  const digits = ruc10.split("").map(Number);
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += digits[i]! * FACTORES[i]!;
  }
  const resto = sum % 11;
  if (resto === 0) return 0;
  if (resto === 1) return 1;
  return 11 - resto;
}

export function validarRuc(ruc: string): RucValidation {
  const clean = ruc.replace(/\D/g, "").slice(0, 11);
  const errores: string[] = [];
  const warnings: string[] = [];

  if (clean.length !== 11) errores.push("El RUC debe tener exactamente 11 dígitos numéricos.");
  if (!/^\d+$/.test(clean)) errores.push("El RUC solo puede contener números.");

  const prefix = clean.slice(0, 2);
  const validPrefixes = ["10", "15", "16", "17", "20"];
  if (clean.length === 11 && !validPrefixes.includes(prefix)) {
    warnings.push(`Prefijo ${prefix} no es un tipo SUNAT habitual (10, 15, 16, 17, 20).`);
  }

  let digitoCalculado = 0;
  let digito = 0;
  if (clean.length === 11) {
    digito = Number(clean[10]);
    if (prefix === "10" || prefix === "20") {
      digitoCalculado = calcularDigitoVerificador(clean.slice(0, 10));
      if (digito !== digitoCalculado) {
        errores.push(
          `Dígito verificador incorrecto (esperado ${digitoCalculado}, recibido ${digito}).`,
        );
      }
    } else {
      warnings.push("Validación de dígito verificador omitida para este tipo de RUC.");
    }
  }

  return {
    esValido: errores.length === 0 && clean.length === 11,
    ruc: clean,
    digitoVerificador: digito,
    digitoVerificadorCalculado: digitoCalculado,
    errores,
    warnings,
  };
}

function cacheGet(ruc: string): { data: SunatRucData; ts: number; estado: string } | null {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${ruc}`);
    if (!raw) return null;
    return JSON.parse(raw) as { data: SunatRucData; ts: number; estado: string };
  } catch {
    return null;
  }
}

function cacheSet(ruc: string, data: SunatRucData) {
  localStorage.setItem(
    `${CACHE_PREFIX}${ruc}`,
    JSON.stringify({ data, ts: Date.now(), estado: data.estadoContribuyente }),
  );
}

function checkRateLimit(): { ok: boolean; restantes: number; waitMs: number } {
  const now = Date.now();
  const windowMs = 60_000;
  let bucket: { ts: number; count: number };
  try {
    bucket = JSON.parse(localStorage.getItem(RATE_KEY) ?? '{"ts":0,"count":0}');
  } catch {
    bucket = { ts: now, count: 0 };
  }
  if (now - bucket.ts > windowMs) bucket = { ts: now, count: 0 };
  if (bucket.count >= MAX_PER_MINUTE) {
    return { ok: false, restantes: 0, waitMs: windowMs - (now - bucket.ts) };
  }
  bucket.count += 1;
  localStorage.setItem(RATE_KEY, JSON.stringify(bucket));
  return { ok: true, restantes: MAX_PER_MINUTE - bucket.count, waitMs: 0 };
}

function generarDatosSimulados(ruc: string): SunatRucData {
  const seed = parseInt(ruc, 10) || 20100000001;
  const rng = seeded(seed);
  const tipo = ruc.slice(0, 2);
  const act = pick(rng, ACTIVIDADES);
  const deptKey = pick(rng, Object.keys(DEPARTAMENTOS));
  const dept = DEPARTAMENTOS[deptKey]!;
  const prov = pick(rng, dept.provincias);
  const dist = pick(rng, dept.distritos);

  let razonSocial: string;
  if (tipo === "10") {
    const ap = pick(rng, APELLIDOS);
    const nom = pick(rng, NOMBRES);
    razonSocial = rng() > 0.5 ? `${ap} ${nom}, ${pick(rng, NOMBRES)}` : `${ap} ${nom}`;
  } else {
    const fant = pick(rng, FANTASIAS);
    razonSocial = pick(rng, [
      `${fant} SERVICIOS GENERALES S.A.C.`,
      `${fant} COMERCIAL S.R.L.`,
      `INVERSIONES ${fant} E.I.R.L.`,
      `CORPORACION ${fant} S.A.`,
    ]).replace("{NOMBRE_FANTASIA}", fant);
  }

  const year = 2005 + Math.floor(rng() * 18);
  const mes = 1 + Math.floor(rng() * 12);
  const dia = 1 + Math.floor(rng() * 28);
  const fechaInscripcion = `${year}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;

  const estados: SunatRucData["estadoContribuyente"][] = ["ACTIVO", "ACTIVO", "ACTIVO", "SUSPENSION_TEMPORAL", "BAJA_DEFINITIVA"];
  const estado = estados[Math.floor(rng() * estados.length)]!;

  return {
    ruc,
    razonSocial,
    nombreComercial: rng() > 0.35 ? `${pick(rng, FANTASIAS)} GROUP` : undefined,
    tipoContribuyente:
      tipo === "10" ? "PERSONA_NATURAL" : tipo === "20" ? "SOCIEDAD_ANONIMA" : "OTRO",
    estadoContribuyente: estado,
    fechaInscripcion,
    fechaInicioActividades: fechaInscripcion,
    actividadEconomicaPrincipal: act,
    actividadesEconomicasSecundarias:
      rng() > 0.5 ? [pick(rng, ACTIVIDADES)] : [],
    domicilioFiscal: {
      direccion: `AV. ${pick(rng, FANTASIAS)} ${100 + Math.floor(rng() * 900)}`,
      departamento: deptKey,
      provincia: prov,
      distrito: dist,
      ubigeo: String(150100 + Math.floor(rng() * 50)).padStart(6, "0"),
    },
    representantesLegales:
      tipo !== "10"
        ? [
            {
              nombre: `${pick(rng, APELLIDOS)} ${pick(rng, NOMBRES)} ${pick(rng, APELLIDOS)}`,
              cargo: "GERENTE GENERAL",
              fechaDesde: fechaInscripcion,
              tipoDocumento: "DNI",
              numeroDocumento: String(10000000 + Math.floor(rng() * 89999999)),
            },
          ]
        : [],
    tributosAfectos: [
      { codigo: "1000", descripcion: "IGV", desde: fechaInscripcion },
      { codigo: "2000", descripcion: "RENTA", desde: fechaInscripcion },
    ],
    establecimientos: [
      {
        codigo: "0000",
        tipo: "DOMICILIO FISCAL",
        direccion: `AV. ${pick(rng, FANTASIAS)} ${100 + Math.floor(rng() * 900)}`,
        departamento: deptKey,
        provincia: prov,
        distrito: dist,
      },
    ],
    fechaActualizacion: new Date().toISOString(),
  };
}

async function fetchFromDb(ruc: string): Promise<SunatRucData | null> {
  const { data } = await supabase.from("fichas_ruc").select("*").eq("ruc", ruc).maybeSingle();
  if (!data?.razon_social) return null;
  const row = data as Record<string, unknown>;
  return {
    ruc,
    razonSocial: String(row.razon_social ?? ""),
    nombreComercial: row.nombre_comercial ? String(row.nombre_comercial) : undefined,
    tipoContribuyente: "OTRO",
    estadoContribuyente: mapEstado(String(row.estado_contribuyente ?? "ACTIVO")),
    fechaInscripcion: String(row.fecha_inscripcion ?? "").slice(0, 10) || new Date().toISOString().slice(0, 10),
    fechaInicioActividades: String(row.fecha_inicio_actividades ?? row.fecha_inscripcion ?? "").slice(0, 10),
    actividadEconomicaPrincipal: {
      codigo: "0000",
      descripcion: String(row.actividad_economica_principal ?? row.actividad_economica ?? ""),
    },
    actividadesEconomicasSecundarias: [],
    domicilioFiscal: {
      direccion: String(row.tipo_via ?? ""),
      departamento: String(row.departamento ?? ""),
      provincia: String(row.provincia ?? ""),
      distrito: String(row.distrito ?? ""),
      ubigeo: "",
    },
    representantesLegales: [],
    tributosAfectos: [],
    establecimientos: [],
    fechaActualizacion: String(row.ultima_actualizacion ?? row.updated_at ?? new Date().toISOString()),
  };
}

function mapEstado(e: string): SunatRucData["estadoContribuyente"] {
  const u = e.toUpperCase();
  if (u.includes("SUSP")) return "SUSPENSION_TEMPORAL";
  if (u.includes("BAJA")) return "BAJA_DEFINITIVA";
  if (u.includes("NO")) return "NO_HALLADO";
  return "ACTIVO";
}

function cacheTtl(estado: string): number {
  return estado === "BAJA_DEFINITIVA" ? 7 * 24 * 3600_000 : 24 * 3600_000;
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function consultarRucSunat(
  ruc: string,
  options?: { forzarActualizacion?: boolean },
): Promise<SunatRucResponse> {
  const validation = validarRuc(ruc);
  if (!validation.esValido) {
    return {
      success: false,
      error: validation.errores.join(" "),
      metadata: { timestamp: new Date().toISOString(), source: "DATOS_SIMULADOS" },
    };
  }

  const clean = validation.ruc;

  if (!options?.forzarActualizacion) {
    const cached = cacheGet(clean);
    if (cached) {
      const age = Date.now() - cached.ts;
      if (age < cacheTtl(cached.estado)) {
        return {
          success: true,
          data: cached.data,
          metadata: {
            timestamp: new Date().toISOString(),
            source: "CACHE_LOCAL",
            cacheAge: Math.round(age / 1000),
          },
        };
      }
    }

    const dbData = await fetchFromDb(clean);
    if (dbData?.razonSocial) {
      cacheSet(clean, dbData);
      return {
        success: true,
        data: dbData,
        metadata: { timestamp: new Date().toISOString(), source: "DATOS_SIRE" },
      };
    }
  }

  let rate = checkRateLimit();
  if (!rate.ok) {
    await delay(Math.min(rate.waitMs, 5000));
    rate = checkRateLimit();
    if (!rate.ok) {
      return {
        success: false,
        error: "Límite de consultas alcanzado. Intente en un minuto.",
        metadata: {
          timestamp: new Date().toISOString(),
          source: "DATOS_SIMULADOS",
          consultasRestantes: 0,
        },
      };
    }
  }

  await delay(1000 + Math.floor(Math.random() * 2000));

  const data = generarDatosSimulados(clean);
  cacheSet(clean, data);

  return {
    success: true,
    data,
    metadata: {
      timestamp: new Date().toISOString(),
      source: "DATOS_SIMULADOS",
      consultasRestantes: rate.restantes,
    },
  };
}

export function getEstadoActualizacionBadge(ultimaActualizacion?: string | null): string {
  if (!ultimaActualizacion) return "NUNCA_ACTUALIZADA";
  const days = (Date.now() - new Date(ultimaActualizacion).getTime()) / 86_400_000;
  if (days > 90) return "DESACTUALIZADA_90_DIAS";
  if (days > 30) return "DESACTUALIZADA_30_DIAS";
  return "ACTUALIZADA";
}

export const sunatConsultService = {
  validarRuc,
  consultarRucSunat,
  calcularDigitoVerificador,
  getEstadoActualizacionBadge,
};
