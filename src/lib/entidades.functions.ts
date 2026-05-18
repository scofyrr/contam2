// CONTAM — CRUD básico de Entidades (clientes / proveedores).
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSession } from "./auth.functions";

const EntidadInput = z.object({
  tipo_documento: z.enum(["0", "1", "4", "6", "7", "A", "B", "C", "D", "E"]),
  numero_documento: z.string().min(1).max(15),
  razon_social: z.string().min(1).max(500),
  nombre_comercial: z.string().max(500).optional().nullable(),
  direccion: z.string().max(500).optional().nullable(),
  tipo: z.enum(["CLIENTE", "PROVEEDOR", "AMBOS"]).default("CLIENTE"),
  email: z.string().email().optional().nullable().or(z.literal("")),
  telefono: z.string().max(30).optional().nullable(),
});

export const listEntidades = createServerFn({ method: "GET" }).handler(async () => {
  await requireSession();
  const { data, error } = await supabaseAdmin
    .from("entidades")
    .select("*")
    .order("razon_social", { ascending: true })
    .limit(500);
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const createEntidad = createServerFn({ method: "POST" })
  .inputValidator(EntidadInput)
  .handler(async ({ data }) => {
    await requireSession();
    const payload = { ...data, email: data.email || null };
    const { data: row, error } = await supabaseAdmin
      .from("entidades")
      .insert(payload)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteEntidad = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    await requireSession();
    const { error } = await supabaseAdmin.from("entidades").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
