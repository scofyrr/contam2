import { ac as supabase, a9 as sanitizePayload, ad as throwIfSupabaseError } from "./router-BRL0s0LD.js";
import { a as apiRequest, A as ApiError, u as useDjangoApi } from "./http-client-BNGDvc7A.js";
function parseCredenciales$1(value) {
  return {
    usuario: String(value?.usuario ?? ""),
    clave: String(value?.clave ?? "")
  };
}
function toCredencialesDto(c) {
  return { usuario: c.usuario ?? "", clave: c.clave ?? "" };
}
function mapContribuyenteFromDto(row) {
  return {
    id: row.id,
    ruc: row.ruc.trim(),
    razonSocial: row.razon_social,
    estado: row.estado,
    otros: row.otros ?? "",
    fechaVencimientoDeclaracion: row.fecha_vencimiento_declaracion ?? "",
    cat1ra: Boolean(row.cat1ra),
    cat2da: Boolean(row.cat2da),
    cat3ra: Boolean(row.cat3ra),
    cat4taRetenciones: Boolean(row.cat4ta_retenciones),
    cat4taCtaPropia: Boolean(row.cat4ta_cta_propia),
    cat5ta: Boolean(row.cat5ta),
    claveSol: parseCredenciales$1(row.clave_sol),
    afpNet: parseCredenciales$1(row.afp_net),
    validezCpe: parseCredenciales$1(row.validez_cpe),
    clavesSire: parseCredenciales$1(row.claves_sire),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
function toContribuyenteDto(c) {
  const ruc = c.ruc.replace(/\D/g, "").slice(0, 11);
  return {
    ruc,
    razon_social: c.razonSocial.trim(),
    estado: c.estado ?? "ACTIVO",
    otros: c.otros ?? "",
    fecha_vencimiento_declaracion: c.fechaVencimientoDeclaracion?.trim() ? c.fechaVencimientoDeclaracion : null,
    cat1ra: c.cat1ra ?? false,
    cat2da: c.cat2da ?? false,
    cat3ra: c.cat3ra ?? false,
    cat4ta_retenciones: c.cat4taRetenciones ?? false,
    cat4ta_cta_propia: c.cat4taCtaPropia ?? false,
    cat5ta: c.cat5ta ?? false,
    clave_sol: toCredencialesDto(c.claveSol),
    afp_net: toCredencialesDto(c.afpNet),
    validez_cpe: toCredencialesDto(c.validezCpe),
    claves_sire: toCredencialesDto(c.clavesSire)
  };
}
async function fetchContribuyentesViaApi() {
  const rows = await apiRequest("/contribuyentes/", { method: "GET" });
  return rows.map(mapContribuyenteFromDto);
}
async function fetchContribuyenteByRucViaApi(ruc) {
  const clean = ruc.replace(/\D/g, "").slice(0, 11);
  try {
    const row = await apiRequest(`/contribuyentes/${clean}/`, {
      method: "GET"
    });
    return mapContribuyenteFromDto(row);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}
async function rucExistsViaApi(ruc, excludeRuc) {
  const clean = ruc.replace(/\D/g, "");
  if (!clean) return false;
  const found = await fetchContribuyenteByRucViaApi(clean);
  if (!found) return false;
  return true;
}
async function upsertContribuyenteViaApi(contribuyente) {
  const body = toContribuyenteDto(contribuyente);
  const existing = await fetchContribuyenteByRucViaApi(body.ruc);
  if (existing) {
    const row2 = await apiRequest(`/contribuyentes/${body.ruc}/`, {
      method: "PATCH",
      body: JSON.stringify(body)
    });
    return mapContribuyenteFromDto(row2);
  }
  const row = await apiRequest("/contribuyentes/", {
    method: "POST",
    body: JSON.stringify(body)
  });
  return mapContribuyenteFromDto(row);
}
async function deleteContribuyenteViaApi(ruc) {
  const clean = ruc.replace(/\D/g, "").slice(0, 11);
  await apiRequest(`/contribuyentes/${clean}/`, { method: "DELETE" });
}
async function bulkUpsertContribuyentesViaApi(list) {
  let count = 0;
  for (const c of list) {
    await upsertContribuyenteViaApi(c);
    count += 1;
  }
  return count;
}
function parseCredenciales(value) {
  const obj = value ?? {};
  return {
    usuario: String(obj.usuario ?? ""),
    clave: String(obj.clave ?? "")
  };
}
function toJsonCredenciales(c) {
  return { usuario: c.usuario ?? "", clave: c.clave ?? "" };
}
function toContribuyenteInsert(c) {
  return sanitizePayload({
    ruc: c.ruc.replace(/\D/g, "").slice(0, 11),
    razon_social: c.razonSocial.trim(),
    estado: c.estado ?? "ACTIVO",
    otros: c.otros ?? "",
    fecha_vencimiento_declaracion: c.fechaVencimientoDeclaracion?.trim() ? c.fechaVencimientoDeclaracion : null,
    cat1ra: c.cat1ra ?? false,
    cat2da: c.cat2da ?? false,
    cat3ra: c.cat3ra ?? false,
    cat4ta_retenciones: c.cat4taRetenciones ?? false,
    cat4ta_cta_propia: c.cat4taCtaPropia ?? false,
    cat5ta: c.cat5ta ?? false,
    clave_sol: toJsonCredenciales(c.claveSol),
    afp_net: toJsonCredenciales(c.afpNet),
    validez_cpe: toJsonCredenciales(c.validezCpe),
    claves_sire: toJsonCredenciales(c.clavesSire),
    ...c.id ? { id: c.id } : {}
  });
}
function mapContribuyenteFromRow(row) {
  return {
    id: row.id,
    ruc: row.ruc.trim(),
    razonSocial: row.razon_social,
    estado: row.estado,
    otros: row.otros ?? "",
    fechaVencimientoDeclaracion: row.fecha_vencimiento_declaracion ?? "",
    cat1ra: Boolean(row.cat1ra),
    cat2da: Boolean(row.cat2da),
    cat3ra: Boolean(row.cat3ra),
    cat4taRetenciones: Boolean(row.cat4ta_retenciones),
    cat4taCtaPropia: Boolean(row.cat4ta_cta_propia),
    cat5ta: Boolean(row.cat5ta),
    claveSol: parseCredenciales(row.clave_sol),
    afpNet: parseCredenciales(row.afp_net),
    validezCpe: parseCredenciales(row.validez_cpe),
    clavesSire: parseCredenciales(row.claves_sire),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
async function fetchContribuyentes() {
  if (useDjangoApi()) {
    return fetchContribuyentesViaApi();
  }
  const { data, error } = await supabase.from("contribuyentes").select("*").order("razon_social", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => mapContribuyenteFromRow(row));
}
async function fetchContribuyenteByRuc(ruc) {
  if (useDjangoApi()) {
    return fetchContribuyenteByRucViaApi(ruc);
  }
  const clean = ruc.replace(/\D/g, "").slice(0, 11);
  const { data, error } = await supabase.from("contribuyentes").select("*").eq("ruc", clean).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return mapContribuyenteFromRow(data);
}
async function rucExists(ruc, excludeRuc) {
  if (useDjangoApi()) {
    return rucExistsViaApi(ruc);
  }
  const clean = ruc.replace(/\D/g, "");
  if (!clean) return false;
  const { data, error } = await supabase.from("contribuyentes").select("ruc").eq("ruc", clean).maybeSingle();
  if (error) throw error;
  if (!data) return false;
  return true;
}
async function upsertContribuyente(contribuyente) {
  if (useDjangoApi()) {
    return upsertContribuyenteViaApi(contribuyente);
  }
  const payload = toContribuyenteInsert(contribuyente);
  const ruc = payload.ruc;
  const existing = await fetchContribuyenteByRuc(ruc);
  if (existing) {
    const { ruc: _pk, ...updateBody } = payload;
    const { data, error: error2 } = await supabase.from("contribuyentes").update(sanitizePayload(updateBody)).eq("ruc", ruc).select("*").single();
    throwIfSupabaseError(error2, "Error al actualizar contribuyente");
    if (!data) throw new Error("No se recibió respuesta al actualizar contribuyente");
    return mapContribuyenteFromRow(data);
  }
  const { error } = await supabase.from("contribuyentes").insert(payload);
  throwIfSupabaseError(error, "Error al registrar contribuyente");
  const saved = await fetchContribuyenteByRuc(ruc);
  if (!saved) {
    throw new Error("No se pudo recuperar el contribuyente guardado");
  }
  return saved;
}
async function deleteContribuyente(ruc) {
  if (useDjangoApi()) {
    return deleteContribuyenteViaApi(ruc);
  }
  const { error } = await supabase.from("contribuyentes").delete().eq("ruc", ruc);
  if (error) throw error;
}
async function bulkUpsertContribuyentes(list) {
  if (list.length === 0) return 0;
  if (useDjangoApi()) {
    return bulkUpsertContribuyentesViaApi(list);
  }
  const rows = list.map((c) => toContribuyenteInsert(c));
  const { error } = await supabase.from("contribuyentes").upsert(rows, { onConflict: "ruc" });
  throwIfSupabaseError(error, "Error en carga masiva de contribuyentes");
  return rows.length;
}
export {
  fetchContribuyentes as a,
  bulkUpsertContribuyentes as b,
  deleteContribuyente as d,
  fetchContribuyenteByRuc as f,
  rucExists as r,
  upsertContribuyente as u
};
