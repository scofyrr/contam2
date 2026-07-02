# Guía de Estilo de Código — CONTAM

Estándares premium para TypeScript, React, SQL y Git en el proyecto peru-fiscal-core8.

---

## TypeScript

### Naming

| Elemento | Convención | Ejemplo |
|----------|------------|---------|
| Archivos | kebab-case | `sire-registros-service.ts` |
| Componentes React | PascalCase | `LibroDiarioPremium.tsx` |
| Funciones | camelCase | `fetchRegistrosSire` |
| Constantes | UPPER_SNAKE_CASE | `MAX_REGISTROS_POR_PAGINA` |
| Interfaces / tipos | PascalCase descriptivo | `RegistroSire`, `AsientoContableInsert` |
| Enums / unions | PascalCase | `TipoAsientoDb`, `EstadoValidacion` |

### Imports

Orden recomendado:

1. React / hooks
2. Librerías externas
3. Módulos internos (`@/…`)
4. Tipos (`import type`)
5. Estilos (si aplica)

Usar alias `@/` para rutas internas (configurado en `tsconfig.json` y Vitest).

```typescript
import { useQuery } from "@tanstack/react-query";
import { generarLineasAsiento } from "@/lib/asientos-generator";
import type { RegistroSire } from "@/lib/sire-types";
```

### Strict mode

- `strict: true` — no negociable
- Evitar `any`; usar `unknown` + type narrowing
- Evitar `as` sin validación previa
- Tipar retornos en funciones exportadas
- Preferir `interface` para objetos extensibles; `type` para unions

---

## React

### Componentes

- Solo functional components + hooks
- Props tipadas con `interface` o `type`
- Desestructurar props en la firma

```typescript
interface Props {
  ruc: string;
  periodo: string;
}

export function PanelSire({ ruc, periodo }: Props) {
  // ...
}
```

### Estado

| Tipo | Herramienta |
|------|-------------|
| Server state | TanStack Query |
| UI local | `useState` |
| Global app | Context + custom hooks |
| Formularios | React Hook Form + Zod |

### Rendimiento

- `useMemo` — cálculos costosos derivados de props/state
- `useCallback` — funciones pasadas a hijos memoizados
- `React.memo` — componentes con props estables
- `useDeferredValue` — inputs de búsqueda pesada
- `useTransition` — cambios de tab/ruta no urgentes

No optimizar prematuramente; medir con panel Performance (`admin/performance`) cuando aplique.

---

## PostgreSQL / SQL

### Migraciones

- Nombre: `YYYYMMDDHHMMSS_descripcion.sql` o `NNN_descripcion.sql` (numeración secuencial del proyecto)
- **Idempotentes**: `IF NOT EXISTS`, `CREATE OR REPLACE`
- Comentario de bloque al inicio explicando propósito
- Una responsabilidad por migración cuando sea posible

### Convenciones

| Elemento | Convención |
|----------|------------|
| Tablas | snake_case plural (`asientos_contables`) |
| PK | `id UUID DEFAULT gen_random_uuid()` |
| Timestamps | `TIMESTAMPTZ DEFAULT now()` |
| FK | Con `ON DELETE` explícito |
| RPCs | Prefijo `rpc_`, documentar parámetros |

---

## CSS / Tailwind

- Utility-first (Tailwind 4)
- Base: componentes shadcn/ui en `src/components/ui/`
- Dark mode por defecto (tema premium CONTAM)
- Evitar CSS modules salvo excepción justificada

### Paleta premium

```
Fondo principal:     bg-[#060B14]
Fondo secundario:    bg-[#0A1628]
Texto primario:      text-[#E8EDF5]
Texto secundario:    text-[#8899B4]
Acento dorado:       text-[#C8A95A]
Acento esmeralda:    text-[#00C897]
Acento cyan:         text-[#00D4FF]
Acento coral:        text-[#FF6B6B]
```

Clases semánticas del proyecto: `text-premium-gold`, `text-success`, `text-warning`, etc.

---

## Contabilidad (dominio)

- Códigos PCGE: **sin puntos**, normalizar con `normalizeCuentaContable()` / `normalizePcgeCode()`
- Montos: redondear a 2 decimales (`round2`)
- Asientos: validar partida doble antes de persistir
- Operaciones multi-tabla: **RPC**, no secuencia de inserts desde cliente
- Glosas: descriptivas, incluir referencia al comprobante cuando aplique

---

## Tests

- Archivos: `*.test.ts` en `tests/unit/` o `tests/integration/`
- Patrón **AAA**: Arrange → Act → Assert
- Sin Supabase real: mocks en `tests/__mocks__/`
- Nombres en español descriptivos: `debe rechazar asiento descuadrado`

Ver [TESTING.md](./TESTING.md).

---

## Git

### Branches

| Prefijo | Uso |
|---------|-----|
| `main` | Producción |
| `develop` | Integración |
| `feature/*` | Nueva funcionalidad |
| `fix/*` | Corrección |
| `migration/*` | Solo cambios de BD |

### Commits (Conventional Commits en español)

```
feat(sire): agrega sincronización bidireccional
fix(caja): corrige tolerancia en conciliación
refactor(diario): extrae validador de asientos
docs(adr): registra decisión modelo plano
test(pcge): cubre validatePCGEHierarchy
```

---

## Linting y formato

```bash
npm run lint          # ESLint 9 flat config
npm run lint:fix
npm run format        # Prettier
npm run format:check  # CI
```

El CI (`.github/workflows/ci.yml`) ejecuta lint + prettier + tests en cada PR.

---

## Referencias

- [ADRs](./adr/README.md) — decisiones que no se discuten sin RFC
- [API interna](./API_INTERNA.md) — contratos RPC y endpoints
- [Onboarding](./ONBOARDING.md) — setup inicial
