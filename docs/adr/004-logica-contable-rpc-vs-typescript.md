# ADR-004: Ubicación de Lógica Contable Crítica

**Fecha**: 2026-05-10  
**Estado**: Aceptado  
**Autor**: Equipo CONTAM

## Contexto

Operaciones contables críticas requieren **atomicidad** y **consistencia transaccional**:

- Liquidación SIRE (asiento + movimiento caja + estado comprobante)
- Cancelación de liquidación (reversión completa)
- Centralización de caja (N movimientos → asientos en lote)
- Validación de integridad contable cross-tabla

Involucran múltiples tablas: `asientos_contables`, `movimientos_caja`, `registros_sire*`, `config_contable`.

## Decisión

**La lógica contable crítica reside en funciones RPC PostgreSQL (PL/pgSQL)**, no en TypeScript del cliente.

### RPCs críticas (referencia)

| RPC | Propósito | Migración |
|-----|-----------|-----------|
| `rpc_liquidacion_caja_mejorada` | Liquidación atómica SIRE + caja | `20260629120000` |
| `rpc_cancelar_liquidacion` | Revierte liquidación | `20260629120000` |
| `rpc_centralizacion_inteligente` | Centraliza movimientos por criterio | `024_caja_mejoras` |
| `rpc_descentralizar_periodo` | Revierte centralización | `024_caja_mejoras` |
| `rpc_validate_accounting_integrity` | Validación cross-tabla | `021_accounting_integrity` |
| `rpc_fix_common_integrity_issues` | Corrección asistida (dry-run) | `021_accounting_integrity` |

### Lógica en TypeScript (servicios)

- Validaciones de formulario (React Hook Form + Zod)
- Transformaciones para UI (`normalizeRegistroSire`, `generarLineasAsiento`)
- Pre-visualización de plantillas (`AsientoTemplateEngine`)
- Cálculos no transaccionales (proyección diferencia de cambio, KPIs)
- Orquestación que **llama** RPCs vía `supabase.rpc()`

### Justificación

1. **Atomicidad**: una función PL/pgSQL = una transacción; rollback automático ante error
2. **Consistencia**: lógica junto a los datos, sin latencia entre pasos
3. **Seguridad**: `SECURITY DEFINER` con permisos controlados
4. **Multi-cliente**: React, Django o futuros clientes comparten la misma regla de negocio
5. **Auditoría**: triggers capturan cambios dentro de la misma transacción

## Consecuencias

**Positivas**:

- Imposible dejar estados intermedios corruptos por fallo de red
- Consistencia garantizada entre tablas
- Fuente única de verdad en BD

**Negativas**:

- PL/pgSQL más difícil de testear que TypeScript
- Menor pool de desarrolladores con expertise avanzado en SQL
- Debugging sin breakpoints en BD

**Mitigaciones**:

- Tests de integración + script `supabase/tests/test_migrations.sh`
- `RAISE NOTICE` / logging en funciones críticas
- Documentación en [API interna](../API_INTERNA.md)

## Alternativas rechazadas

### Alternativa 1: Toda la lógica en TypeScript con múltiples inserts

Rechazada: sin transacción distribuida, riesgo de estados parciales ante timeout o error de red.

### Alternativa 2: Lógica solo en Django

Rechazada: duplicaría reglas ya en PostgreSQL; clientes Supabase-direct quedarían sin protección.

### Alternativa 3: Edge Functions Supabase

Rechazada para operaciones contables: latencia extra y complejidad de despliegue vs RPC nativo.
