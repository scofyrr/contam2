# Diagramas de Arquitectura C4 — CONTAM

Modelo C4 en cuatro niveles usando [Mermaid](https://mermaid.js.org/). Compatible con GitHub, VS Code (extensión Mermaid Preview) y Cursor.

---

## Nivel 1 — Contexto del Sistema

Quién usa CONTAM y con qué sistemas externos interactúa.

```mermaid
C4Context
    title CONTAM — Diagrama de Contexto

    Person(contador, "Contador / Estudio", "Registra compras, ventas, caja y reportes SUNAT")
    Person(admin, "Administrador", "Gestiona usuarios, RBAC y auditoría")

    System(contam, "CONTAM ERP", "ERP contable peruano: SIRE, diario, caja, PCGE, reportes")

    System_Ext(sunat, "SUNAT / SIRE", "Comprobantes electrónicos y obligaciones tributarias")
    System_Ext(sbs, "SBS", "Tipo de cambio oficial")
    System_Ext(supabase, "Supabase", "PostgreSQL + Auth + PostgREST")
    System_Ext(mistral, "Mistral AI", "LLM para consultas (opcional)")

    Rel(contador, contam, "Opera contabilidad diaria")
    Rel(admin, contam, "Administra permisos y auditoría")
    Rel(contam, supabase, "Persistencia y autenticación")
    Rel(contam, sunat, "Importa / valida comprobantes SIRE")
    Rel(contam, sbs, "Consulta tipo de cambio")
    Rel(contam, mistral, "Chat IA (solo lectura)", "HTTPS")
```

---

## Nivel 2 — Contenedores

Aplicaciones y servicios desplegables.

```mermaid
C4Container
    title CONTAM — Diagrama de Contenedores

    Person(user, "Usuario contable")

    Container_Boundary(frontend, "Frontend") {
        Container(spa, "SPA React 19", "TypeScript, Vite 7, TanStack Start/Router/Query", "UI contable premium")
    }

    Container_Boundary(data, "Capa de datos") {
        ContainerDb(pg, "PostgreSQL", "Supabase", "Asientos, SIRE, caja, PCGE, RBAC, auditoría")
        Container(auth, "Supabase Auth", "JWT + PKCE", "Identidad de usuarios")
    }

    Container_Boundary(optional, "Servicios opcionales") {
        Container(django, "Django DRF", "Python", "API REST alternativa (VITE_USE_DJANGO_API)")
        Container(ai, "AI Agent", "FastAPI + Mistral", "Chat solo lectura :8001")
    }

    Rel(user, spa, "HTTPS")
    Rel(spa, auth, "Login / refresh token")
    Rel(spa, pg, "PostgREST + RPC", "Supabase JS")
    Rel(spa, django, "REST", "Opcional")
    Rel(spa, ai, "/ai-api proxy", "Opcional")
    Rel(django, pg, "SQL")
    Rel(ai, pg, "SELECT only")
```

---

## Nivel 3 — Componentes (Módulo SIRE)

Componentes principales del dominio SIRE dentro del frontend y BD.

```mermaid
flowchart TB
    subgraph UI["Capa UI"]
        SirePage["routes/_app.sire*.tsx"]
        ValidateBtn["Acciones validar / provisionar"]
    end

    subgraph Services["Servicios TypeScript"]
        SireData["sire-data.ts / sire-registros-service.ts"]
        SireValidate["sire-validate-service.ts"]
        SireSync["sire-sync-service.ts"]
        AsientosGen["asientos-generator.ts"]
        Flags["feature-flags.ts"]
    end

    subgraph API["TanStack Start API"]
        ValidateAPI["POST /api/sire/validate"]
        StatsAPI["GET /api/stats/kpis | charts"]
    end

    subgraph DB["PostgreSQL"]
        Legacy["registros_sire"]
        Norm["registros_sire_cabecera + hijos"]
        View["registros_sire_completo"]
        Asientos["asientos_contables"]
        RPC["rpc_liquidacion_caja_mejorada"]
    end

    SirePage --> SireData
    ValidateBtn --> SireValidate
    SireValidate --> AsientosGen
    SireData --> Flags
    Flags -->|legacy| Legacy
    Flags -->|normalizado| View
    SireSync --> Legacy
    SireSync --> Norm
    ValidateAPI --> SireValidate
    SireValidate --> Asientos
    StatsAPI --> View
    SirePage --> RPC
```

---

## Nivel 4 — Código (Flujo Compra → Provisión → Pago)

Secuencia detallada del flujo contable crítico.

```mermaid
sequenceDiagram
    autonumber
    actor U as Contador
    participant UI as SIRE UI
    participant Val as sire-validate-service
    participant Gen as asientos-generator
    participant Utils as asientos-contables-utils
    participant SB as Supabase
    participant RPC as rpc_liquidacion_caja_mejorada

    U->>UI: Selecciona comprobante COMPRA
    UI->>Val: validarRegistroSire(registroId)
    Val->>SB: SELECT registros_sire*
    Val->>Gen: generarLineasAsiento(registro)
    Note over Gen: DEBE gasto + IGV<br/>HABER proveedor
    Gen-->>Val: LineaAsientoInput[]
    Val->>Utils: lineasToAsientosPlanos(...)
    Utils-->>Val: AsientoContableInsert[]
    Val->>SB: INSERT asientos_contables
    SB-->>UI: Provisión OK (estado provisionado)

    U->>UI: Registra pago en caja
    UI->>SB: INSERT movimientos_caja
    U->>UI: Liquidar comprobante
    UI->>RPC: rpc_liquidacion_caja_mejorada(...)
    Note over RPC: Transacción atómica:<br/>asiento cancelación + estado pagado
    RPC-->>UI: Liquidación OK
    UI-->>U: Comprobante pagado + trazabilidad
```

---

## Stack tecnológico (referencia)

| Capa | Tecnología |
|------|------------|
| UI | React 19, TypeScript strict, Tailwind 4, shadcn/ui |
| Routing / SSR | TanStack Start + TanStack Router |
| Estado servidor | TanStack Query (`query-keys-contables.ts`) |
| BD | PostgreSQL 15+ (Supabase) |
| Auth | Supabase Auth + RLS + RBAC (027) |
| Tests | Vitest, Playwright, MSW |
| CI | GitHub Actions (`.github/workflows/ci.yml`) |
| Deploy | Cloudflare Pages |

---

## Documentos relacionados

- [ADRs](../adr/README.md)
- [API interna](../API_INTERNA.md)
- [Onboarding](../ONBOARDING.md)
- [Testing](../TESTING.md)
