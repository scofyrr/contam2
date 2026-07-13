// supabase/functions/consultar-ruc/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { ruc } = await req.json();
    if (!ruc) {
      return new Response(JSON.stringify({ error: "RUC es requerido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const API_TOKEN = Deno.env.get("API_SUNAT_TOKEN");
    if (!API_TOKEN) {
      return new Response(JSON.stringify({ error: "Token de API externa no configurado" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Llamada a API externa
    const response = await fetch(`https://api.decolecta.com/v1/sunat/ruc/full?numero=${ruc}`, {
      headers: { 
        "Authorization": `Bearer ${API_TOKEN}`, 
        "Accept": "application/json" 
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: `Error de API externa: ${errorText}` }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    
    // Mapear con fallback para soportar snake_case (Decolecta) y camelCase
    const rucDoc = data.numero_documento || data.numeroDocumento || data.ruc;
    if (!rucDoc) {
      return new Response(JSON.stringify({ error: "Error al obtener datos: RUC no encontrado o respuesta inválida en API externa" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: "Credenciales de Supabase no configuradas" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Normalizar fechas a formato YYYY-MM-DD (ej: "07/09/2017" -> "2017-09-07")
    const normalizeDate = (val: string | null | undefined) => {
      if (!val) return null;
      const cleanVal = String(val).trim();
      if (cleanVal.includes("/")) {
        const parts = cleanVal.split("/");
        if (parts.length === 3) {
          return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
        }
      }
      return cleanVal;
    };

    // 2. Persistencia Normalizada
    // A. Ficha RUC (Datos principales)
    const { error: errorFicha } = await supabase.from("fichas_ruc").upsert({
      ruc: rucDoc,
      razon_social: (data.razon_social || data.razonSocial)?.trim().toUpperCase(),
      nombre_comercial: data.nombre_comercial || data.nombreComercial,
      estado_contribuyente: data.estado || data.estado_contribuyente,
      condicion_domicilio_fiscal: data.condicion || data.condicion_domicilio_fiscal,
      actividad_economica_principal: data.actividad_economica || data.actividadEconomica,
      sistema_contabilidad: data.tipo_contabilidad || data.tipoContabilidad,
      departamento: data.departamento,
      provincia: data.provincia,
      distrito: data.distrito,
      ubigeo: data.ubigeo,
      tipo_via: data.via_tipo || data.viaTipo,
      nombre_via: data.via_nombre || data.viaNombre,
      numero: data.numero,
      interior: data.interior,
      otras_referencias: data.direccion,
      fecha_inscripcion: normalizeDate(data.fecha_inscripcion || data.fechaInscripcion),
      fecha_inicio_actividades: normalizeDate(data.fecha_inicio_actividades || data.fechaInicioActividades || data.fecha_inicio_actividad),
      tipo_contribuyente: data.tipo || data.tipo_contribuyente || data.tipoContribuyente
    });

    if (errorFicha) throw errorFicha;

    // B. Tributos Afectos
    const tributosList = data.tributos_afectos || data.tributos || [];
    if (tributosList.length > 0) {
      const { error: errorTributos } = await supabase.from("tributos_afectos").upsert(
        tributosList.map((t: any) => ({
          ruc: rucDoc,
          tributo: t.descripcion || t.tributo,
          fecha_alta: normalizeDate(t.fecha || t.fecha_alta)
        }))
      );
      if (errorTributos) throw errorTributos;
    }

    // C. Representantes Legales
    const representantesList = data.representantes_legales || data.representantes || [];
    if (representantesList.length > 0) {
      const { error: errorReps } = await supabase.from("representantes_legales").upsert(
        representantesList.map((p: any) => ({
          ruc: rucDoc,
          apellidos_nombres: p.nombre || p.apellidos_nombres,
          tipo_documento: p.tipoDocumento || p.tipo_documento || "DNI",
          numero_documento: p.numero || p.numero_documento,
          cargo: p.cargo,
          fecha_desde: normalizeDate(p.desde || p.fecha_desde)
        }))
      );
      if (errorReps) throw errorReps;
    }

    // D. Establecimientos Anexos
    const localesList = data.locales_anexos || data.establecimientos || [];
    if (localesList.length > 0) {
      const { error: errorEst } = await supabase.from("establecimientos_anexos").upsert(
        localesList.map((e: any, idx: number) => ({
          ruc: rucDoc,
          denominacion: e.nombre || e.denominacion || `LOCAL ANEXO ${idx + 1}`,
          domicilio: e.direccion || e.domicilio,
          ubigeo: e.ubigeo,
          tipo: e.tipo || "LOCAL ANEXO"
        }))
      );
      if (errorEst) throw errorEst;
    }

    return new Response(JSON.stringify({ message: "Sincronización exitosa", data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
