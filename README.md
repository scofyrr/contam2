# CONTAM — ERP Contable Peruano

ERP contable moderno para estudios y empresas en Perú: SIRE, libro diario, caja, PCGE, reportes SUNAT y RBAC multi-RUC.

**Stack:** React 19 · TypeScript · Vite 7 · TanStack Start/Router/Query · Supabase PostgreSQL

---

## Inicio rápido

```bash
npm install
cp .env.example .env   # VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
npm run dev
```

Guía detallada: [COMO-ARRANCAR.md](./COMO-ARRANCAR.md)

---

## Documentación

**Índice completo:** [**docs/README.md**](./docs/README.md)

| Documento | Descripción |
|-----------|-------------|
| [docs/ONBOARDING.md](./docs/ONBOARDING.md) | Guía para nuevos desarrolladores |
| [docs/architecture/diagrams.md](./docs/architecture/diagrams.md) | Diagramas C4 (Mermaid) |
| [docs/adr/](./docs/adr/README.md) | Architecture Decision Records |
| [docs/API_INTERNA.md](./docs/API_INTERNA.md) | Endpoints y RPCs |
| [docs/STYLE_GUIDE.md](./docs/STYLE_GUIDE.md) | Convenciones de código |
| [docs/TESTING.md](./docs/TESTING.md) | Tests y CI |

---

## Scripts útiles

```bash
npm run dev            # Desarrollo
npm run build          # Producción
npm test               # Tests unitarios + integración
npm run ci             # Lint + types + coverage + build
```

---

## Servicios opcionales

- **Agente IA** (chat solo lectura): [ai-agent/README.md](./ai-agent/README.md) — puerto 8001
- **Django API**: `backend/` — solo si `VITE_USE_DJANGO_API=true`
