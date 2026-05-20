// src/lib/auth.functions.ts
"use server"; // <-- Directiva vital para TanStack Start: expone de forma segura estas funciones al cliente mediante RPC

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import crypto from "node:crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getContamSession } from "./session.server";
import { ContamRol } from "./types"; // <-- Importando el tipo desde su archivo independiente libre de dependencias de servidor

function sha256(input: string) {
  return crypto.createHash("sha256").update(input, "utf8").digest("hex");
}

/**
 * Server Function: Iniciar Sesión
 * Valida las credenciales contra la tabla 'usuarios' y actualiza la cookie cifrada.
 */
export const login = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      email: z.string().email("Formato de correo electrónico inválido"),
      password: z.string().min(1, "La contraseña es requerida").max(200),
    }),
  )
  .handler(async ({ data }) => {
    // Consulta a la tabla de usuarios locales
    const { data: user, error } = await supabaseAdmin
      .from("usuarios")
      .select("id, email, nombre, rol, activo, password_hash")
      .eq("email", data.email)
      .maybeSingle();

    if (error) throw new Error("Error interno al consultar el usuario");
    if (!user) throw new Error("Credenciales inválidas");
    if (!user.activo) throw new Error("El usuario se encuentra desactivado");
    
    // Verificación del hash de seguridad
    if (user.password_hash !== sha256(data.password)) {
      throw new Error("Credenciales inválidas");
    }

    // Actualización de la sesión basada en cookies cifradas (Server-side)
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
 * Destruye la información guardada dentro del almacenamiento de la cookie.
 */
export const logout = createServerFn({ method: "POST" }).handler(async () => {
  const session = await getContamSession();
  await session.clear();
  return { ok: true };
});

/**
 * Server Function: Obtener Usuario Actual
 * Recupera el estado de sesión actual para hidratar la UI en el cliente.
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
 * Lógica auxiliar interna para blindar endpoints delicados (CPE, SIRE, etc).
 */
export async function requireSession() {
  const session = await getContamSession();
  if (!session.data?.userId) throw new Error("No autenticado");
  return session.data;
}
