# ADR-005: Estrategia de Autenticación y Autorización

**Fecha**: 2026-02-01  
**Estado**: Aceptado  
**Autor**: Equipo CONTAM  
**Migración RBAC**: `027_rbac_system.sql`

## Contexto

Requisitos de seguridad:

- Login/logout de usuarios contables
- Autorización granular por módulo (SIRE, diario, caja, admin)
- Multi-tenancy por RUC (estudio contable con varios clientes)
- Aislamiento de datos entre estudios

## Decisión

**Supabase Auth + Row Level Security (RLS) + RBAC en aplicación**.

### Capas

1. **Supabase Auth**: flujo PKCE, JWT, refresh automático (`src/integrations/supabase/client.ts`)
2. **RLS PostgreSQL**: políticas por tabla usando `auth.uid()`
3. **RBAC aplicación**: tablas `roles`, `permisos`, `usuario_roles`, `auditoria_seguridad`
4. **Servicio frontend**: `permission-service.ts` con caché 5 min y modo legacy si RBAC no está desplegado

### Multi-tenancy por RUC

- `contribuyentes` / fichas RUC del estudio
- `usuario_roles.ruc_id`: scope por RUC (`NULL` = global)
- RPC `rpc_check_permission(p_user_id, p_permiso, p_ruc_id)` valida acceso
- Hooks: `use-permissions.tsx`, guards `RequirePermission`

### ¿Por qué no JWT manual?

- Supabase Auth gestiona refresh, expiración y hardening
- Integración nativa PostgREST (`auth.uid()` en RLS)
- Menos superficie de ataque custom

## Consecuencias

**Positivas**:

- Seguridad robusta out-of-the-box
- RLS protege aunque el frontend tenga bugs
- Auditoría de accesos (`rpc_log_security_event`, panel admin)

**Negativas**:

- Dependencia moderada de Supabase Auth
- RLS complejo de depurar
- Overhead en cada query

## Alternativas rechazadas

### Alternativa 1: JWT manual + tabla usuarios propia

Rechazada: reinventar autenticación, más código, menor seguridad.

### Alternativa 2: Solo RBAC en frontend sin RLS

Rechazada: bypass trivial vía PostgREST directo.

### Alternativa 3: Auth0 / Cognito externo

Rechazada por costo y desacople con PostgREST/Supabase en fase actual.
