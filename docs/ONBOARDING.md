# Guía de Onboarding — CONTAM / peru-fiscal-core8

Bienvenido al equipo. CONTAM es un ERP contable peruano moderno (React 19 + Supabase + PostgreSQL). Esta guía te pone productivo en **menos de 30 minutos**.

---

## Prerrequisitos

| Herramienta | Versión |
|-------------|---------|
| Node.js | 20+ |
| npm | 10+ |
| Git | cualquier reciente |
| Cuenta Supabase | free tier suficiente para dev |

**VS Code recomendado** — extensiones:

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- PostgreSQL (syntax highlighting migraciones)
- Mermaid Preview (diagramas en `docs/`)

**Opcional** (solo si usas esos módulos):

- Python 3.11+ (Django + AI agent)
- PostgreSQL client local (`psql`, para `supabase/tests/test_migrations.sh`)

---

## Primeros pasos (15 minutos)

### 1. Clonar e instalar

```bash
git clone <repo-url>
cd peru-fiscal-core8
npm install
```

### 2. Variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con credenciales de tu proyecto Supabase (Settings → API):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 3. Levantar el frontend

```bash
npm run dev
```

Abre la URL indicada (típicamente [http://localhost:5173](http://localhost:5173)).

### 4. Servicios opcionales

```bash
# Agente IA (chat flotante) — Terminal aparte
cd ai-agent/server
python -m venv venv
# Windows: .\venv\Scripts\Activate.ps1
pip install -r requirements.txt
cp .env.example .env   # MISTRAL_API_KEY + DB read-only
python main.py         # → http://127.0.0.1:8001

# Django (solo si VITE_USE_DJANGO_API=true)
cd backend
python -m venv venv
pip install -r requirements.txt
python manage.py runserver   # → http://127.0.0.1:8000
```

---

## Arquitectura en 10 minutos

### Estructura de carpetas

```
src/
├── routes/           → Páginas (file-based routing, TanStack Router)
├── modules/          → Dominios nuevos (PCGE, auth, auditoría, caja…)
├── lib/              → Servicios transversales y legacy
├── components/       → UI compartida (ui/ = shadcn)
├── hooks/            → React Query hooks y providers
├── integrations/     → Cliente Supabase
└── types/            → Tipos compartidos (pcge, rbac…)

supabase/migrations/  → Schema SQL + RPCs
tests/                → Vitest unit + integración + Playwright E2E
docs/                 → ADRs, arquitectura, API, estilo
```

### ¿Dónde está la lógica?

| Tipo de cambio | Ubicación |
|----------------|-----------|
| Nueva tabla/columna | `supabase/migrations/NNN_descripcion.sql` |
| Operación atómica contable | RPC PostgreSQL (ver [API_INTERNA.md](./API_INTERNA.md)) |
| Validación / UI / preview | Servicio TS en `src/lib/` o `src/modules/` |
| Pantalla nueva | `src/routes/_app.*.tsx` + componente en `src/modules/` |
| Permisos | `permission-service.ts` + migración RBAC |
| Invalidación cache | `src/lib/query-keys-contables.ts` |

### Decisiones arquitectónicas clave

Lee los [ADRs](./adr/README.md) antes de proponer cambios estructurales:

1. Asientos **planos** (no cabecera-líneas)
2. Feature flags SIRE y Django
3. Strangler Fig para normalización SIRE
4. Lógica crítica en **RPC**, no en cliente
5. Auth: Supabase + RLS + RBAC
6. PCGE sin puntos
7. IA aislada solo lectura

Diagramas C4: [architecture/diagrams.md](./architecture/diagrams.md)

---

## Flujo típico de desarrollo

```
1. ¿Requiere schema?     → Migración SQL idempotente
2. ¿Es transaccional?    → RPC en PostgreSQL
3. ¿Es UI/validación?    → Servicio TS + componente React
4. ¿Afecta cache?        → query-keys-contables.ts
5. ¿Nuevo permiso?       → Migración RBAC + guard RequirePermission
6. ¿Tests?               → tests/unit o tests/integration
```

### Comandos útiles

```bash
npm run dev              # Desarrollo
npm run build            # Build producción
npm run lint             # ESLint
npm run type-check       # TypeScript
npm test                 # Tests unitarios + integración
npm run test:coverage    # Con cobertura
npm run ci               # Pipeline local completo
```

---

## Testing

Ver [TESTING.md](./TESTING.md).

```bash
npm test                 # 113+ tests, < 15 s
npm run test:ui          # Vitest UI interactiva
npm run test:e2e         # Playwright (requiere build)
```

---

## Recursos clave

| Documento | Contenido |
|-----------|-----------|
| [COMO-ARRANCAR.md](../COMO-ARRANCAR.md) | Arranque rápido + troubleshooting |
| [adr/](./adr/README.md) | Decisiones arquitectónicas |
| [architecture/diagrams.md](./architecture/diagrams.md) | Diagramas C4 |
| [API_INTERNA.md](./API_INTERNA.md) | Endpoints y RPCs |
| [STYLE_GUIDE.md](./STYLE_GUIDE.md) | Convenciones de código |
| [TESTING.md](./TESTING.md) | Estrategia de pruebas |

---

## Checklist del primer día

- [ ] Proyecto corre con `npm run dev`
- [ ] Login funciona contra Supabase
- [ ] Leí ADR-001 y ADR-003 (asientos + SIRE)
- [ ] Revisé diagrama de contexto C4
- [ ] Ejecuté `npm test` exitosamente
- [ ] Identifiqué mi módulo en `src/modules/`

---

## ¿Dónde preguntar?

- **Bugs / features**: GitHub Issues del repositorio
- **Arquitectura**: consultar ADRs antes de abrir discusión
- **Migraciones pendientes**: revisar numeración 021–029 en `supabase/migrations/`

---

*Última actualización: junio 2026 — Macro-tarea 12 documentación arquitectónica*
