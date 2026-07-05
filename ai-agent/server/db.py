"""Conexión PostgreSQL solo lectura. Sin DDL ni escrituras."""

from __future__ import annotations

import json
from contextlib import contextmanager
from datetime import date, datetime
from decimal import Decimal
from typing import Any
from uuid import UUID

import psycopg2
import psycopg2.extras

from config import ALLOWED_TABLES, DB_CONFIG

# Columnas que nunca se devuelven al cliente ni a la IA
BLOCKED_COLUMNS = frozenset(
    {
        "password",
        "session_data",
        "clave_sol",
        "claves_sire",
        "afp_net",
    }
)


def _serialize(value: Any) -> Any:
    if value is None:
        return None
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, (UUID, Decimal)):
        return str(value)
    if isinstance(value, dict):
        return {k: _serialize(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_serialize(v) for v in value]
    return value


def sanitize_row(row: dict[str, Any]) -> dict[str, Any]:
    clean: dict[str, Any] = {}
    for key, value in row.items():
        if key in BLOCKED_COLUMNS:
            clean[key] = "[OCULTO — dato sensible]"
            continue
        clean[key] = _serialize(value)
    return clean


@contextmanager
def read_only_connection():
    conn = psycopg2.connect(**DB_CONFIG)
    try:
        conn.set_session(readonly=True, autocommit=True)
        with conn.cursor() as cur:
            cur.execute("SET default_transaction_read_only = on")
        yield conn
    finally:
        conn.close()


def table_exists(conn, table: str) -> bool:
    if table not in ALLOWED_TABLES:
        return False
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = %s
            LIMIT 1
            """,
            (table,),
        )
        return cur.fetchone() is not None


def list_existing_tables() -> list[str]:
    with read_only_connection() as conn:
        found: list[str] = []
        for table in sorted(ALLOWED_TABLES):
            if table_exists(conn, table):
                found.append(table)
        return found


def fetch_all(conn, query: str, params: tuple | list | None = None) -> list[dict[str, Any]]:
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        cur.execute(query, params or ())
        rows = cur.fetchall()
        return [sanitize_row(dict(row)) for row in rows]


def fetch_one(conn, query: str, params: tuple | list | None = None) -> dict[str, Any] | None:
    rows = fetch_all(conn, query, params)
    return rows[0] if rows else None


def fetch_scalar(conn, query: str, params: tuple | list | None = None) -> Any:
    with conn.cursor() as cur:
        cur.execute(query, params or ())
        row = cur.fetchone()
        return row[0] if row else None


def get_table_columns(conn, table: str) -> list[dict[str, Any]]:
    if table not in ALLOWED_TABLES:
        return []
    return fetch_all(
        conn,
        """
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = %s
        ORDER BY ordinal_position
        """,
        (table,),
    )
