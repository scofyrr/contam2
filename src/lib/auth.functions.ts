// CONTAM — server functions de autenticación (sin Supabase Auth).
// Valida email/contraseña contra la tabla `usuarios` y mantiene sesión por cookie.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import crypto from "node:crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getContamSession } from "./session.server";

function sha256(input: string) {
  return crypto.createHash("sha256").update(input, "utf8").digest("hex");
}

export const login = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      email: z.string().email(),
      password: z.string().min(1).max(200),
    }),
  )
  .handler(async ({ data }) => {
    const { data: user, error } = await supabaseAdmin
      .from("usuarios")
      .select("id, email, nombre, rol, activo, password_hash")
      .eq("email", data.email)
      .maybeSingle();

    if (error) throw new Error("Error consultando usuario");
    if (!user) throw new Error("Credenciales inválidas");
    if (!user.activo) throw new Error("Usuario desactivado");
    if (user.password_hash !== sha256(data.password)) {
      throw new Error("Credenciales inválidas");
    }

    const session = await getContamSession();
    await session.update({
      userId: user.id,
      email: user.email,
      nombre: user.nombre,
      rol: user.rol as ContamRol,
    });
    return { id: user.id, email: user.email, nombre: user.nombre, rol: user.rol };
  });

type ContamRol = "ADMIN" | "CONTADOR" | "OPERADOR";

export const logout = createServerFn({ method: "POST" }).handler(async () => {
  const session = await getContamSession();
  await session.clear();
  return { ok: true };
});

export const me = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getContamSession();
  if (!session.data?.userId) return null;
  return {
    id: session.data.userId,
    email: session.data.email!,
    nombre: session.data.nombre!,
    rol: session.data.rol!,
  };
});

export async function requireSession() {
  const session = await getContamSession();
  if (!session.data?.userId) throw new Error("No autenticado");
  return session.data;
}
