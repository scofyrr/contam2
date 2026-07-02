# API Interna — CONTAM

Referencia de endpoints HTTP (TanStack Start), RPCs PostgreSQL y servicios TypeScript expuestos al frontend.

---

## 1. Endpoints TanStack Start (servidor)

Rutas en `src/routes/api/` ejecutadas en el servidor SSR de TanStack Start.

### `GET /api/stats/kpis`

KPIs del dashboard (ventas, compras, utilidad, IGV).

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `periodo` | query, opcional | Formato `YYYYMM` |

**Respuesta**: `KpisResponse` (`src/lib/sire-types.ts`)

**Fuente de datos**: `getSireReadSource()` según feature flag SIRE.

---

### `GET /api/stats/charts`

Series temporales para gráficos del dashboard.

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `periodo` | query, opcional | Filtra por período |

**Respuesta**: `ChartsResponse`

---

### `POST /api/sire/validate`

Valida un comprobante SIRE y genera asiento de provisión.

**Body JSON**:

```json
{ "registroId": "uuid-del-registro-sire" }
```

**Respuesta 200**:

```json
{
  "ok": true,
  "message": "Registro validado y asiento generado",
  "alreadyValidated": false
}
```

**Errores**: `400` (sin registroId), `404` (no encontrado), `500`

**Implementación**: `src/routes/api/sire/validate.ts` → `validarRegistroSire()`

---

## 2. RPCs PostgreSQL (Supabase)

Invocación desde frontend:

```typescript
const { data, error } = await supabase.rpc("nombre_rpc", { param: valor });
```

### Contabilidad y caja

| RPC | Descripción | Parámetros clave |
|-----|-------------|------------------|
| `rpc_liquidacion_caja_mejorada` | Liquidación atómica SIRE + caja | `p_registro_sire_id`, cuentas, movimiento |
| `rpc_cancelar_liquidacion` | Revierte liquidación | `p_registro_sire_id` |
| `rpc_centralizacion_inteligente` | Centraliza movimientos caja | `p_ruc`, `p_periodo`, criterios |
| `rpc_descentralizar_periodo` | Revierte centralización | periodo, RUC |
| `rpc_obtener_liquidez_global` | Saldo liquidez por RUC | `p_ruc` |
| `rpc_validate_accounting_integrity` | Integridad contable | `p_ruc`, `p_periodo` |
| `rpc_fix_common_integrity_issues` | Corrección asistida | `p_dry_run` |

### SIRE y sincronización

| RPC | Descripción |
|-----|-------------|
| `rpc_detect_sire_structure` | Detecta modo legacy vs normalizado |
| `rpc_get_sire_consistency_metrics` | Métricas de divergencia sync |
| `rpc_resolve_sire_sync_error` | Marca error de sync resuelto |

### RBAC (migración 027)

| RPC | Descripción |
|-----|-------------|
| `rpc_check_permission` | Verifica permiso + scope RUC |
| `rpc_get_user_permissions` | Lista permisos efectivos |
| `rpc_get_user_roles` | Roles del usuario |
| `rpc_assign_role` / `rpc_remove_role` | Admin de roles |
| `rpc_log_security_event` | Auditoría de acceso denegado |
| `rpc_list_users_for_admin` | Listado usuarios admin |
| `rpc_rbac_bootstrap_needed` | Indica si falta bootstrap SUPER_ADMIN |

### Auditoría y performance

| RPC | Descripción |
|-----|-------------|
| `rpc_buscar_auditoria` | Búsqueda auditoría enriquecida |
| `rpc_auditoria_dashboard_stats` | KPIs panel auditoría |
| `rpc_refresh_materialized_views` | Refresca MVs dashboard |
| `rpc_get_mv_dashboard_stats` | Stats desde materialized view |

### Tareas

| RPC | Descripción |
|-----|-------------|
| `rpc_estadisticas_tareas` | Estadísticas tareas pendientes |
| `rpc_generar_notificaciones_desde_tareas` | Notificaciones automáticas |

---

## 3. API Django (opcional)

Activada con `VITE_USE_DJANGO_API=true` y `VITE_API_URL=http://127.0.0.1:8000`.

Cliente HTTP: `src/lib/api/http-client.ts`

Cuando el flag está desactivado (default), el frontend usa Supabase directo.

---

## 4. Agente IA (opcional)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/api/chat` | Mensaje + historial → respuesta LLM |

**Base URL dev**: proxy `/ai-api` (Vite → `localhost:8001`)  
**Base URL prod**: `VITE_AI_API_URL`

Componente UI: `src/components/ai-chat-bubble.tsx`

---

## 5. Servicios TypeScript clave (no HTTP)

| Servicio | Ruta | Responsabilidad |
|----------|------|-----------------|
| `sire-registros-service` | `src/lib/` | CRUD lectura SIRE |
| `sire-validate-service` | `src/lib/` | Validación + provisión |
| `sire-sync-service` | `src/modules/sire/services/` | Sync legacy ↔ normalizado |
| `asientos-generator` | `src/lib/` | Líneas partida doble |
| `asientos-contables-utils` | `src/lib/` | Normalización inserts planos |
| `caja-liquidacion-service` | `src/lib/` | Orquesta RPC liquidación |
| `permission-service` | `src/modules/auth/services/` | RBAC + caché |
| `asiento-template-engine` | `src/modules/contabilidad/diario/services/` | Plantillas contables |
| `pcge-validator` | `src/modules/contabilidad/pcge/services/` | Jerarquía PCGE |
| `conciliacion-bancaria-service` | `src/modules/caja/services/` | Matching extractos |

---

## 6. Feature flags que afectan la API

| Variable | Impacto |
|----------|---------|
| `VITE_USE_NEW_SIRE_STRUCTURE` | Tabla/vista SIRE en queries |
| `VITE_USE_DJANGO_API` | Origen de datos REST vs Supabase |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | Cliente Supabase |
| `VITE_AI_API_URL` | URL del agente IA |

Ver [ADR-002](./adr/002-dualidad-backend-feature-flags.md).

---

## 7. Convenciones

- RPCs: prefijo `rpc_`, snake_case, retorno JSON o SETOF
- Endpoints internos: JSON, errores `{ error: string }`
- Permisos: validar con `permission-service` antes de UI; RLS en BD como última línea de defensa
