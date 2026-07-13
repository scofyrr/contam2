import type { PostgrestError } from "@supabase/supabase-js";

/** Elimina `undefined` y convierte strings vacíos a `null` (PostgREST rechaza undefined). */
export function sanitizePayload<T extends Record<string, unknown>>(payload: T): T {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) continue;
    if (value === "") {
      out[key] = null;
    } else {
      out[key] = value;
    }
  }
  return out as T;
}

const POSTGRES_CODE_MAP: Record<string, string> = {
  "22001": "El valor ingresado es demasiado largo para el campo",
  "23505": "Registro duplicado en la base de datos",
  "23503": "Restricción de clave foránea violada (referencia inexistente o registro en uso)",
  "23502": "Falta completar un campo obligatorio",
  "42P01": "La tabla de la base de datos no existe",
  "42703": "El campo solicitado no existe en la base de datos",
  "42501": "Permisos insuficientes en la base de datos",
  "08001": "No se pudo establecer conexión con la base de datos",
  "08004": "El servidor de base de datos rechazó la conexión",
  "08006": "Error de conexión de base de datos",
  "57014": "La operación en la base de datos fue cancelada"
};

function capitalizeFirstLetter(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function translatePostgresMessage(msg: string): string {
  if (!msg) return msg;

  // value too long for type character varying(N)
  let m = msg.match(/value too long for type character varying\((\d+)\)/i);
  if (m) {
    return `el valor ingresado es demasiado largo (máximo ${m[1]} caracteres)`;
  }
  
  // value too long for type character(N)
  m = msg.match(/value too long for type character\((\d+)\)/i);
  if (m) {
    return `el valor ingresado es demasiado largo (máximo ${m[1]} caracteres)`;
  }

  // null value in column "..." violates not-null constraint
  m = msg.match(/null value in column "([^"]+)" violates not-null constraint/i);
  if (m) {
    return `el campo "${m[1]}" es obligatorio y no puede estar vacío`;
  }

  // duplicate key value violates unique constraint "..."
  m = msg.match(/duplicate key value violates unique constraint "([^"]+)"/i);
  if (m) {
    return `ya existe un registro con este valor (duplicado en restricción "${m[1]}")`;
  }

  // insert or update on table "..." violates foreign key constraint "..."
  m = msg.match(/insert or update on table "([^"]+)" violates foreign key constraint "([^"]+)"/i);
  if (m) {
    return `no se pudo registrar porque hace referencia a un elemento que no existe (clave foránea en "${m[1]}")`;
  }

  // update or delete on table "..." violates foreign key constraint "..."
  m = msg.match(/update or delete on table "([^"]+)" violates foreign key constraint "([^"]+)"/i);
  if (m) {
    return `no se puede eliminar o modificar este registro porque otros datos dependen de él (tabla "${m[1]}")`;
  }

  // Permission denied / Insufficient privilege
  if (/permission denied/i.test(msg)) {
    return "permiso denegado para realizar esta operación en la base de datos";
  }

  return msg;
}

function translatePostgresDetails(details: string): string {
  if (!details) return details;

  // Key (field)=(value) already exists.
  let m = details.match(/Key \(([^)]+)\)=\(([^)]+)\) already exists/i);
  if (m) {
    return `La clave (${m[1]}) con valor (${m[2]}) ya existe.`;
  }

  // Key (field)=(value) is not present in table "table_name".
  m = details.match(/Key \(([^)]+)\)=\(([^)]+)\) is not present in table "([^"]+)"/i);
  if (m) {
    return `La referencia (${m[1]}) con valor (${m[2]}) no existe en la tabla "${m[3]}".`;
  }

  // Key (field)=(value) is still referenced from table "table_name".
  m = details.match(/Key \(([^)]+)\)=\(([^)]+)\) is still referenced from table "([^"]+)"/i);
  if (m) {
    return `No se puede eliminar porque está referenciado en la tabla "${m[3]}".`;
  }

  return details;
}

function translatePostgresHint(hint: string): string {
  if (!hint) return hint;
  
  if (/there is a unique constraint/i.test(hint)) {
    return "Asegúrese de ingresar un valor que no esté duplicado.";
  }
  
  return hint;
}

/** Mensaje legible para toasts a partir del error de Supabase/PostgREST. */
export function formatSupabaseError(error: PostgrestError | Error | unknown): string {
  if (!error) return "Error desconocido";

  if (error instanceof Error && !("code" in error)) {
    return error.message;
  }

  const pg = error as PostgrestError;
  const parts: string[] = [];

  let message = pg.message ? translatePostgresMessage(pg.message) : "";
  if (pg.code && POSTGRES_CODE_MAP[pg.code] && (!message || message === pg.message)) {
    message = POSTGRES_CODE_MAP[pg.code];
  }

  if (message) {
    parts.push(capitalizeFirstLetter(message));
  }

  if (pg.details && pg.details !== pg.message) {
    parts.push(`Detalle: ${translatePostgresDetails(pg.details)}`);
  }
  if (pg.hint) {
    parts.push(`Sugerencia: ${translatePostgresHint(pg.hint)}`);
  }
  if (pg.code) {
    parts.push(`Código: ${pg.code}`);
  }

  return parts.length > 0 ? parts.join(" · ") : "No se pudo completar la operación en la base de datos";
}

export function throwIfSupabaseError(
  error: PostgrestError | null,
  context?: string,
): void {
  if (!error) return;
  const msg = formatSupabaseError(error);
  throw new Error(context ? `${context}: ${msg}` : msg);
}
