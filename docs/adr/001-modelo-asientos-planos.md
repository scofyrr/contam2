# ADR-001: Modelo de Asientos Contables Planos

**Fecha**: 2026-06-02  
**Estado**: Aceptado  
**Autor**: Equipo CONTAM  
**Stakeholders**: Desarrollo, Contabilidad  
**Migración relacionada**: `20260602140000_flat_asientos_v_libro_diario.sql`

## Contexto

El sistema debe persistir asientos contables para:

- Provisiones desde comprobantes SIRE
- Asientos manuales del libro diario
- Centralizaciones de caja
- Cancelaciones y liquidaciones
- Ajustes (diferencia de cambio, depreciaciones, plantillas)

Existen dos modelos habituales en bases relacionales:

**Modelo cabecera-líneas** (tradicional):

- `asientos_cabecera`: id, fecha, glosa, tipo, estado
- `asientos_lineas`: asiento_id, cuenta, debe, haber, orden
- Ventaja: normalización, sin redundancia de cabecera
- Desventaja: JOIN obligatorio en casi toda consulta

**Modelo plano** (denormalizado):

- Tabla única `asientos_contables`: cada fila es una línea con metadatos completos
- Campos: `fecha_asiento`, `cuenta_contable`, `debe`, `haber`, `tipo_asiento`, `tipo_libro`, `glosa`, `sire_registro_id`, `ruc_contraparte`, etc.
- Ventaja: consultas directas, reporting simple, mejor para PostgREST
- Desventaja: redundancia de glosa/fecha/tipo por línea del mismo asiento

## Decisión

**Adoptamos el modelo plano** en `public.asientos_contables`.

La implementación actual está en `src/lib/asientos-contables-utils.ts` (`lineasToAsientosPlanos`, `toAsientoContableInsert`) y la vista `v_libro_diario` consume filas planas sin JOIN cabecera-líneas.

### Justificación

1. **Rendimiento**: el libro diario consulta líneas individuales con contexto; evitar JOINs mejora latencia en dashboards y PLE.
2. **Reporting SQL**: vistas y materialized views (`mv_dashboard_stats`) son más simples sobre una sola tabla.
3. **Trazabilidad por línea**: cada fila puede referenciar `sire_registro_id` y contraparte de forma independiente.
4. **Centralización de caja**: los lotes usan el UUID de la primera línea como referencia (`idReferenciaLote` en utils).
5. **PostgREST/Supabase**: filtrado, paginación y RLS funcionan mejor sobre tablas planas.

## Consecuencias

**Positivas**:

- Consultas de libro diario más rápidas (sin JOIN cabecera-líneas)
- Código frontend más simple (una entidad de insert)
- Flexibilidad de metadatos por línea
- Vistas SQL más mantenibles

**Negativas**:

- Redundancia: glosa, `fecha_asiento`, `tipo_libro` se repiten por línea del mismo asiento
- Mayor uso de disco (~30 % estimado)
- Cambios de glosa requieren actualizar múltiples filas
- No hay FK que garantice coherencia de metadatos entre líneas del mismo lote

**Mitigaciones**:

- Validación en aplicación (`validarAsientoCompleto` en `asiento-validator-service.ts`)
- Triggers de auditoría (`auditoria_cambios`, migración 028)
- RPC `rpc_validate_accounting_integrity` para chequeos cross-tabla
- Índices en migraciones 029

## Alternativas rechazadas

### Alternativa 1: Modelo cabecera-líneas tradicional

Rechazada por JOINs constantes, peor rendimiento en reporting y dos entidades a sincronizar en frontend.

### Alternativa 2: Modelo híbrido (cabecera + líneas con datos embebidos)

Rechazada por complejidad de sincronización sin beneficio claro frente al plano puro.

### Alternativa 3: Documentos JSON (MongoDB)

Rechazada por stack PostgreSQL definido; se perderían RLS, triggers y SQL analítico contable.
