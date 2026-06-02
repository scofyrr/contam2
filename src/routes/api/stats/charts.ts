import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { computeCharts } from "@/lib/stats-service";
import { normalizeRegistroSire } from "@/lib/sire-data";
import type { RegistroSire } from "@/lib/sire-types";

export const Route = createFileRoute("/api/stats/charts")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const periodo = url.searchParams.get("periodo");

        let q = supabaseAdmin.from("registros_sire").select("*");
        if (periodo) q = q.eq("periodo", periodo);

        const { data, error } = await q;
        if (error) {
          console.error("[api/stats/charts]", error);
          return Response.json({ error: error.message }, { status: 500 });
        }

        const rows = (data ?? []).map(
          (row) => normalizeRegistroSire(row as Record<string, unknown>) as RegistroSire,
        );
        return Response.json(computeCharts(rows, periodo));
      },
    },
  },
});
