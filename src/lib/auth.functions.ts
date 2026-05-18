// src/lib/auth.functions.ts
// CONTAM — Server functions de autenticación (sin Supabase Auth).
// Valida email/contraseña contra la tabla `usuarios` y mantiene la sesión por cookie.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import crypto from "node:crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getContamSession } from "./session.server";

// Exportamos los roles permitidos en CONTAM para usarlos en la UI si es necesario
export type ContamRol = "ADMIN" | "CONTADOR" | "OPERADOR";

// Helper para hashing estático (ideal para pruebas iniciales y desarrollo rápido)
function sha256(input: string) {
  return crypto.createHash("sha256").update(input, "utf8").digest("hex");
}

/**
 * Server Function: Iniciar Sesión
 * Valida las credenciales en el backend y genera la cookie de sesión.
 */
export const login = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      email: z.string().email("Formato de correo electrónico inválido"),
      password: z.string().min(1, "La contraseña es requerida").max(200),
    }),
  )
  .handler(async ({ data }) => {
    // Consulta directa a la tabla local de usuarios usando el cliente administrativo
    const { data: user, error } = await supabaseAdmin
      .from("usuarios")
      .select("id, email, nombre, rol, activo, password_hash")
      .eq("email", data.email)
      .maybeSingle();

    if (error) throw new Error("Error interno al consultar el usuario");
    if (!user) throw new Error("Credenciales inválidas");
    if (!user.activo) throw new Error("El usuario se encuentra desactivado");
    
    // Verificación del hash SHA256 de la contraseña
    if (user.password_hash !== sha256(data.password)) {
      throw new Error("Credenciales inválidas");
    }

    // Actualización de la cookie de sesión segura en el servidor
    const session = await getContamSession();
    await session.update({
      userId: user.id,
      email: user.email,
      nombre: user.nombre,
      rol: user.rol as ContamRol,
    });

    return { 
      id: user.id, 
      email: user.email, 
      nombre: user.nombre, 
      rol: user.rol as ContamRol 
    };
  });

/**
 * Server Function: Cerrar Sesión
 * Limpia por completo los datos de la cookie.
 */
export const logout = createServerFn({ method: "POST" }).handler(async () => {
  const session = await getContamSession();
  await session.clear();
  return { ok: true };
});

/**
 * Server Function: Obtener Usuario Actual
 * Devuelve los datos del usuario en sesión o null si no está autenticado.
 */
export const me = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getContamSession();
  if (!session.data?.userId) return null;
  
  return {
    id: session.data.userId,
    email: session.data.email!,
    nombre: session.data.nombre!,
    rol: session.data.rol as ContamRol,
  };
});

/**
 * Helper de Servidor: Requerir Sesión Obligatoria
 * No es una Server Function expuesta al cliente, sino un guard para usar internamente
 * en otras funciones del servidor (ej. al emitir un comprobante a SUNAT o consultar el SIRE).
 */
export async function requireSession() {
  const session = await getContamSession();
  if (!session.data?.userId) throw new Error("No autenticado");
  return session.data;
}
