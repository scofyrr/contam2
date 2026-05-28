import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { validarRegistroSire } from "@/lib/sire-validate-service";

export const Route = createFileRoute("/api/sire/validate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as { registroId?: string };
          const registroId = body?.registroId?.trim();

          if (!registroId) {
            return Response.json(
              { error: "registroId es obligatorio" },
              { status: 400 },
            );
          }

          const result = await validarRegistroSire(supabaseAdmin, registroId);
          return Response.json({
            ok: true,
            message: result.alreadyValidated
              ? "Registro ya validado; asiento existente"
              : "Registro validado y asiento generado",
            ...result,
          });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Error al validar registro";
          const status = message.includes("no encontrado") ? 404 : 500;
          console.error("[api/sire/validate]", error);
          return Response.json({ error: message }, { status });
        }
      },
    },
  },
});
