import { useCallback, useEffect, useMemo, useState } from "react";
import type { ContenidoContadorConfig } from "@/modules/config/types/estudio-config";
import type { AnuncioEstudio } from "@/modules/dashboard/types/dashboard-configurable-types";

const STORAGE_KEY = "contam_anuncios_vistos";

const PRIORIDAD_RANK: Record<string, number> = {
  CRITICA: 0,
  ALTA: 1,
  MEDIA: 2,
  BAJA: 3,
};

function readVistos(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function writeVistos(ids: Set<string>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

function mapAnuncios(contenido: ContenidoContadorConfig["anuncios"]): AnuncioEstudio[] {
  return contenido.map((a, i) => ({
    id: `anuncio-${i}-${a.titulo.slice(0, 12)}`,
    titulo: a.titulo,
    mensaje: a.mensaje,
    prioridad: a.prioridad,
    fecha_fin: a.fecha_fin,
  }));
}

export function useAnunciosEstudio(anunciosRaw: ContenidoContadorConfig["anuncios"]) {
  const [vistos, setVistos] = useState<Set<string>>(() => readVistos());
  const [indice, setIndice] = useState(0);

  const anuncios = useMemo(() => {
    const ahora = new Date();
    return mapAnuncios(anunciosRaw)
      .filter((a) => !a.fecha_fin || new Date(a.fecha_fin) > ahora)
      .filter((a) => a.prioridad === "CRITICA" || !vistos.has(a.id))
      .sort((a, b) => (PRIORIDAD_RANK[a.prioridad] ?? 9) - (PRIORIDAD_RANK[b.prioridad] ?? 9));
  }, [anunciosRaw, vistos]);

  const anuncioActivo = anuncios[indice % Math.max(anuncios.length, 1)] ?? null;

  useEffect(() => {
    if (anuncios.length <= 1) return;
    const t = setInterval(() => setIndice((i) => (i + 1) % anuncios.length), 10_000);
    return () => clearInterval(t);
  }, [anuncios.length]);

  const marcarComoVisto = useCallback((anuncioId: string) => {
    setVistos((prev) => {
      const next = new Set(prev);
      next.add(anuncioId);
      writeVistos(next);
      return next;
    });
    setIndice((i) => i + 1);
  }, []);

  const rotarSiguiente = useCallback(() => {
    setIndice((i) => (i + 1) % Math.max(anuncios.length, 1));
  }, [anuncios.length]);

  return { anuncios, anuncioActivo, marcarComoVisto, rotarSiguiente };
}
