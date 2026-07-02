# ADR-003: Estrategia Strangler Fig para Normalización SIRE

**Fecha**: 2026-06-29  
**Estado**: Aceptado (en implementación)  
**Autor**: Equipo CONTAM  
**Migración relacionada**: `20260629120000_normalizacion_sire.sql`, `019_sire_sync_system.sql`

## Contexto

La tabla legacy `registros_sire` usa un modelo monolítico:

- Campos planos: periodo, tipo, serie, número, contraparte
- Columna JSONB `datos_completos` con montos y adicionales anidados

**Problemas**:

- Sin integridad referencial dentro de JSONB
- Consultas lentas con operadores JSONB
- Validación de estructura difícil
- PostgREST filtra mal dentro de JSONB profundo

**Solución objetivo** — cuatro tablas normalizadas:

- `registros_sire_cabecera`
- `registros_sire_montos`
- `registros_sire_modificaciones`
- `registros_sire_adicionales`

Vista unificada: `registros_sire_completo` (consumida cuando `VITE_USE_NEW_SIRE_STRUCTURE=true`).

## Decisión

**Patrón Strangler Fig** con coexistencia legacy/normalizado.

### Fases

1. **Fase 1 (actual)**: tablas normalizadas + triggers de sincronización bidireccional (`019_sire_sync_system.sql`)
2. **Fase 2**: activar `VITE_USE_NEW_SIRE_STRUCTURE=true` para lectura desde normalizado
3. **Fase 3**: escritura preferente en normalizado con sync a legacy
4. **Fase 4**: deprecar `registros_sire` monolítica y eliminar triggers

### Servicios implicados

- `src/modules/sire/services/sire-sync-service.ts` — reconciliación y sync
- `src/lib/sire-registros-service.ts` — lectura según flag
- RPCs: `rpc_detect_sire_structure`, `rpc_get_sire_consistency_metrics`, `rpc_resolve_sire_sync_error`

## Consecuencias

**Positivas**:

- Migración sin downtime
- Coexistencia durante transición
- Rollback en cualquier fase vía feature flag

**Negativas**:

- Duplicación temporal de datos
- Overhead en writes por triggers
- Complejidad de mantener dos estructuras

## Alternativas rechazadas

### Alternativa 1: Script de migración único con ventana de mantenimiento

Rechazada por riesgo de pérdida de datos y sin rollback fácil.

### Alternativa 2: Solo normalizado desde día cero

Rechazada porque producción ya tenía datos legacy en `registros_sire`.

### Alternativa 3: Mantener JSONB indefinidamente

Rechazada por deuda técnica en reporting, validación SUNAT y performance.
