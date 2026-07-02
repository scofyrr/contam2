# ADR-006: Formato de Códigos PCGE — Secuencial sin Separadores

**Fecha**: 2026-07-01  
**Estado**: Aceptado  
**Autor**: Equipo CONTAM  
**Migraciones**: `020_fix_pcge_codes.sql`, `20260701120000_pcge_correccion.sql`

## Contexto

El PCGE peruano define cuentas jerárquicas. Convenciones comunes:

1. **Con separadores**: `10.1.01` (Elemento.Subelemento.Cuenta)
2. **Secuencial**: `10101` (sin puntos)

Datos históricos y imports externos usaban puntos. SUNAT/PLE exige códigos numéricos consistentes.

## Decisión

**Códigos secuenciales sin puntos ni separadores** en `plan_contable_pcge` y en toda la aplicación.

### Niveles por longitud (implementación actual)

| Longitud | Nivel | Ejemplo |
|----------|-------|---------|
| 1 | Elemento | `1` |
| 2 | Subelemento | `10` |
| 3 | Cuenta mayor | `101` |
| 4 | Subcuenta | `1010` |
| 6 | Divisionaria | `101101` |
| 8 | Subdivisional | `10110101` |

> Nota: longitudes 5 y 7 **no son válidas** (`validatePCGEHierarchy` en `pcge-validator.ts`).

### Normalización

- Frontend: `normalizeCuentaContable()` en `asientos-contables-utils.ts`
- PCGE: `normalizePcgeCode()` en `pcge-codigo.ts`
- BD: función `pcge_strip_dots()` en migración `20260701120000`

### Justificación

1. Compatibilidad SUNAT / libros electrónicos (PLE)
2. Orden lexicográfico = orden jerárquico
3. Sin ambigüedad de parsing (`10.1` vs `101`)
4. URLs y queries sin escape de caracteres

## Consecuencias

**Positivas**:

- Compatibilidad total con exportaciones SUNAT
- Búsqueda y ordenamiento natural
- Validación estricta por longitud

**Negativas**:

- Legibilidad humana reducida (`4011101` vs `40.1.1.1.01`)
- Migración de datos históricos con puntos

**Mitigaciones**:

- UI formatea visualmente (badges por nivel en PCGE premium)
- Normalización automática al importar o escribir

## Alternativas rechazadas

### Alternativa 1: Almacenar con puntos, normalizar solo al exportar

Rechazada: inconsistencia entre BD, asientos y PLE.

### Alternativa 2: Dos columnas (display + canonical)

Rechazada: complejidad de sincronización sin beneficio claro.

### Alternativa 3: Códigos alfanuméricos extendidos

Rechazada: fuera del estándar PCGE/SUNAT.
