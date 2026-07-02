# ADR-002: Estrategia de Feature Flags para Migración Gradual

**Fecha**: 2026-04-20  
**Estado**: Aceptado (en transición)  
**Autor**: Equipo CONTAM

## Contexto

El sistema puede obtener datos desde dos caminos:

1. **Supabase directo** (PostgREST): React → `@supabase/supabase-js` → PostgreSQL
2. **Django DRF** (opcional): React → REST API → PostgreSQL

Ambos apuntan a la misma base PostgreSQL en Supabase, pero:

- Supabase directo tiene menor latencia (sin capa intermedia)
- Django concentra lógica Python para equipos que lo prefieren
- No todos los despliegues requieren Django
- Migrar todos los clientes de golpe es riesgoso

Paralelamente, SIRE migra de:

- `registros_sire` (monolítica + JSONB)
- `registros_sire_cabecera` + tablas hijas normalizadas

## Decisión

**Usamos feature flags a nivel de build/despliegue** controlados por variables `VITE_*`.

### Implementación actual

```typescript
// src/lib/feature-flags.ts
export function useNewSireStructure(): boolean {
  const raw = import.meta.env.VITE_USE_NEW_SIRE_STRUCTURE;
  return String(raw ?? "").toLowerCase() === "true";
}

export function getSireReadSource(): "registros_sire_completo" | "registros_sire" {
  return useNewSireStructure() ? "registros_sire_completo" : "registros_sire";
}
```

```typescript
// src/lib/api/config.ts
export function useDjangoApi(): boolean {
  const raw = import.meta.env.VITE_USE_DJANGO_API;
  return String(raw ?? "").toLowerCase() === "true";
}
```

| Variable | Default | Efecto |
|----------|---------|--------|
| `VITE_USE_NEW_SIRE_STRUCTURE` | `false` | Lee/escribe SIRE normalizado vs legacy |
| `VITE_USE_DJANGO_API` | `false` | Usa REST Django en lugar de Supabase directo |
| `VITE_API_URL` | — | Base URL Django cuando el flag está activo |
| `VITE_ENABLE_PERFORMANCE_MONITORING` | — | Telemetría de rendimiento en cliente |

Los flags se configuran **por despliegue** (Cloudflare Pages, `.env` local), no por usuario. El código mantiene ambos caminos con fallbacks documentados en `src/lib/feature-flags-impact-matrix.ts`.

### Justificación

1. Migración gradual sin big-bang
2. Rollback rápido cambiando env y redesplegando
3. A/B en staging antes de producción
4. Clientes sin Django no pagan costo de mantenerlo

## Consecuencias

**Positivas**:

- Cero downtime en migraciones estructurales
- Rollback seguro
- Pruebas controladas en producción

**Negativas**:

- Código con dos caminos (`sire-registros-service`, `sire-sync-service`, stats API)
- Tests deben cubrir ambos modos cuando aplique
- Riesgo de divergencia si no se mantienen sincronizados
- Código legacy cuando un flag se apaga permanentemente

## Alternativas rechazadas

### Alternativa 1: Migración big-bang a Django

Rechazada por riesgo de downtime, rollback lento y coordinación multi-cliente.

### Alternativa 2: Branch por feature en Git

Rechazada por merges conflictivos y codebases divergentes.

### Alternativa 3: Feature flags por usuario en BD

Rechazada por complejidad operativa; los cambios estructurales (SIRE) son de infraestructura, no de permiso individual.
