// src/lib/auth.functions.ts
"use server";

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Server Function: Iniciar Sesión
 * Usa Supabase directamente para autenticación
 */
export const login = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      email: z.string().email("Formato de correo electrónico inválido"),
      password: z.string().min(1, "La contraseña es requerida"),
    }),
  )
  .handler(async ({ data }) => {
    // Autenticar con Supabase
    const { data: authData, error } = await supabaseAdmin.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      throw new Error("Credenciales inválidas");
    }

    return {
      id: authData.user.id,
      email: authData.user.email!,
      nombre: authData.user.user_metadata?.nombre || authData.user.email,
      rol: authData.user.user_metadata?.rol || "usuario",
    };
  });

/**
 * Server Function: Cerrar Sesión
 */
export const logout = createServerFn({ method: "POST" }).handler(async () => {
  await supabaseAdmin.auth.signOut();
  return { ok: true };
});

/**
 * Server Function: Obtener Usuario Actual
 */
export const me = createServerFn({ method: "GET" }).handler(async () => {
  const { data: { user } } = await supabaseAdmin.auth.getUser();
  
  if (!user) return null;
  
  return {
    id: user.id,
    email: user.email!,
    nombre: user.user_metadata?.nombre || user.email,
    rol: user.user_metadata?.rol || "usuario",
  };
});

/**
 * Helper: Requerir Sesión
 */
export async function requireSession() {
  const { data: { user } } = await supabaseAdmin.auth.getUser();
  if (!user) throw new Error("No autenticado");
  return user;
}
