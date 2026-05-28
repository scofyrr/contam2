import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { computeKpis, DEMO_REGISTROS } from "@/lib/stats-service";
import type { RegistroSire } from "@/lib/sire-types";

export const Route = createFileRoute("/api/stats/kpis")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const periodo = url.searchParams.get("periodo");

        try {
          let q = supabaseAdmin.from("registros_sire").select("*");
          if (periodo) q = q.eq("periodo", periodo);

          const { data, error } = await q;
          if (error) throw error;

          const rows = (data ?? []) as unknown as RegistroSire[];
          return Response.json(computeKpis(rows, periodo));
        } catch (error) {
          console.warn("[api/stats/kpis] fallback demo:", error);
          const rows = periodo
            ? DEMO_REGISTROS.filter((r) => r.periodo === periodo)
            : DEMO_REGISTROS;
          return Response.json({ ...computeKpis(rows, periodo), demo: true });
        }
      },
    },
  },
});
