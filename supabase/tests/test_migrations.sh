#!/bin/bash
# ============================================================
# SCRIPT DE VALIDACIÓN DE MIGRACIONES SQL
# ============================================================
# Prueba que todas las migraciones se ejecuten correctamente
# en una base de datos temporal.
#
# Requisitos: PostgreSQL client (createdb, psql, dropdb)
# Uso: bash supabase/tests/test_migrations.sh

set -e

DB_NAME="contam_test_$(date +%s)"
MIGRATIONS_DIR="$(cd "$(dirname "$0")/../migrations" && pwd)"

echo "🧪 Creando base de datos temporal: $DB_NAME"
createdb "$DB_NAME" 2>/dev/null || echo "Usando base de datos existente"

echo "📦 Ejecutando migraciones en orden..."
for migration in $(ls "$MIGRATIONS_DIR" | sort); do
  echo "  ▶ Ejecutando: $migration"
  psql -d "$DB_NAME" -f "$MIGRATIONS_DIR/$migration" -q || {
    echo "  ❌ ERROR en migración: $migration"
    exit 1
  }
  echo "  ✓ Completada"
done

echo ""
echo "🔍 Validando schema final..."

psql -d "$DB_NAME" -c "
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
"

psql -d "$DB_NAME" -c "
SELECT proname
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
ORDER BY proname;
"

psql -d "$DB_NAME" -c "
SELECT tgname, tgrelid::regclass
FROM pg_trigger
WHERE tgisinternal = false
ORDER BY tgname;
"

echo ""
echo "🧹 Limpiando base de datos temporal..."
dropdb "$DB_NAME"

echo "✅ Todas las migraciones ejecutadas correctamente"
