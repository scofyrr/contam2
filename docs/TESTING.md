# Guía de Testing — CONTAM

Sistema de aseguramiento de calidad para el ERP contable peruano (React 19 + TypeScript + Supabase).

## Estrategia de Testing

### Pirámide de testing

| Capa | Proporción objetivo | Ubicación | Herramienta |
|------|---------------------|-----------|-------------|
| Unitarios | ~60% | `tests/unit/` | Vitest |
| Integración | ~30% | `tests/integration/` | Vitest + mocks Supabase |
| E2E | ~10% | `tests/e2e/` | Playwright |

### Cobertura objetivo por módulo (servicios críticos)

| Módulo | Objetivo líneas | Objetivo branches |
|--------|-----------------|-------------------|
| Asientos (`asientos-*`) | ≥75% | ≥60% |
| PCGE validator | ≥75% | ≥60% |
| Template engine | ≥70% | ≥60% |
| Conciliación bancaria | ≥70% | ≥60% |
| Permission service | ≥70% | ≥60% |

## Cómo ejecutar tests

```bash
# Unitarios + integración (modo watch)
npm run test:watch

# Una sola ejecución (CI local)
npm test

# Con cobertura
npm run test:coverage

# UI interactiva de Vitest
npm run test:ui

# E2E con Playwright
npm run test:e2e
npm run test:e2e:ui

# Pipeline completo local (lint + types + tests + build)
npm run ci
```

## Convenciones

- **Nombrado:** `*.test.ts` o `*.spec.ts` (E2E)
- **Patrón AAA:** Arrange → Act → Assert en cada `it`
- **Sin Supabase real:** usar `tests/__mocks__/supabase.ts`
- **TypeScript strict:** evitar `any` en tests
- **Tiempo:** suite completa < 30 s en local

## Estructura de directorios

```
tests/
├── setup.ts                 # Mocks globales (DOM, localStorage, crypto)
├── __mocks__/supabase.ts    # Cliente Supabase encadenable
├── helpers/
│   ├── test-utils.tsx       # QueryClient + renderWithProviders
│   └── fixtures.ts          # Registros SIRE de prueba
├── unit/                    # Tests aislados por servicio
├── integration/             # Flujos contables multi-paso
└── e2e/                     # Smoke y flujos UI (Playwright)
```

## Ejemplos

### Test unitario

```typescript
import { describe, it, expect } from "vitest";
import { normalizeCuentaContable } from "@/lib/asientos-contables-utils";

describe("normalizeCuentaContable", () => {
  it("elimina puntos del código PCGE", () => {
    // Arrange
    const input = "10.1.01";
    // Act
    const result = normalizeCuentaContable(input);
    // Assert
    expect(result).toBe("10101");
  });
});
```

### Test de integración (flujo contable)

```typescript
import { generarLineasAsiento } from "@/lib/asientos-generator";
import { validarAsientoCompleto } from "@/modules/contabilidad/diario/services/asiento-validator-service";
import { mockRegistroCompra } from "../helpers/fixtures";

it("compra con provisión cuadra partida doble", () => {
  const lineas = generarLineasAsiento(mockRegistroCompra());
  const r = validarAsientoCompleto(lineas, {
    glosa: "Provisión compra",
    fecha: "2026-01-15",
    ruc: "20100000001",
    tipoLibro: "DIARIO_COMPRAS",
  });
  expect(r.esValido).toBe(true);
});
```

### Mock de Supabase

```typescript
import { createMockSupabaseClient } from "../__mocks__/supabase";

const mock = createMockSupabaseClient();
mock.mockRpcResolve([{ codigo: "sire.leer" }]);
```

### Componentes React

```typescript
import { renderWithProviders } from "../helpers/test-utils";
import { screen } from "@testing-library/react";

renderWithProviders(<MiComponente />);
expect(screen.getByText(/CONTAM/i)).toBeInTheDocument();
```

## Flujos críticos que SIEMPRE deben pasar

1. **Compra → Provisión → Pago** — `tests/integration/flujo-compra-provision-pago.test.ts`
2. **Venta → Cobro / CXC** — `tests/integration/flujo-venta-cobro.test.ts`
3. **Centralización de caja** — `tests/integration/flujo-centralizacion-caja.test.ts`
4. **Diferencia de cambio** — `tests/integration/flujo-diferencia-cambio.test.ts`
5. **Validación PCGE** — `tests/unit/pcge/pcge-validator.test.ts`
6. **RBAC permisos** — `tests/unit/auth/permission-service.test.ts`

## Migraciones SQL

Validación offline de migraciones (requiere PostgreSQL local):

```bash
bash supabase/tests/test_migrations.sh
```

## CI/CD

El workflow `.github/workflows/ci.yml` ejecuta en cada push/PR a `main` o `develop`:

1. ESLint + Prettier + TypeScript
2. Vitest con cobertura (umbral mínimo 70% en servicios críticos)
3. Build de producción
4. E2E Playwright (solo en PR)
5. Deploy preview Cloudflare (opcional, requiere secrets)

## Mocks vs stubs

- **Mock:** objeto simulado con `vi.fn()` (Supabase, RPC)
- **Stub:** datos fijos (`fixtures.ts`, registros SIRE)
- Preferir stubs para lógica pura; mocks para I/O y servicios externos
