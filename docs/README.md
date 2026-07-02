# Documentación CONTAM

Índice central de documentación técnica del ERP contable peruano.

## Inicio rápido

- [COMO-ARRANCAR.md](../COMO-ARRANCAR.md) — Levantar el proyecto en minutos
- [ONBOARDING.md](./ONBOARDING.md) — Guía para nuevos desarrolladores

## Arquitectura

- [Diagramas C4](./architecture/diagrams.md) — Contexto, contenedores, componentes, secuencias
- [ADRs](./adr/README.md) — 7 decisiones arquitectónicas formales

## Desarrollo

- [STYLE_GUIDE.md](./STYLE_GUIDE.md) — Convenciones TypeScript, React, SQL, Git
- [API_INTERNA.md](./API_INTERNA.md) — Endpoints TanStack Start + RPCs Supabase
- [TESTING.md](./TESTING.md) — Vitest, integración, E2E, CI

## ADRs (resumen)

| # | Decisión |
|---|----------|
| 001 | Asientos contables planos |
| 002 | Feature flags (SIRE + Django) |
| 003 | Strangler Fig normalización SIRE |
| 004 | Lógica crítica en RPC PostgreSQL |
| 005 | Supabase Auth + RLS + RBAC |
| 006 | PCGE secuencial sin puntos |
| 007 | Agente IA aislado (solo lectura) |
