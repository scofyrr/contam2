"""Herramientas read-only: base de datos + búsqueda web."""

from __future__ import annotations

import json
import re
from typing import Any

from duckduckgo_search import DDGS

from config import ALLOWED_TABLES
from db import fetch_all, fetch_one, list_existing_tables, read_only_connection, table_exists

RUC_RE = re.compile(r"\d{11}")


def _normalize_ruc(value: str) -> str:
    return "".join(c for c in (value or "") if c.isdigit())[:11]


def tool_list_tables() -> dict[str, Any]:
    existing = list_existing_tables()
    return {
        "available_tables": existing,
        "note": "Solo lectura. Tablas contables y auth Django disponibles según permisos.",
    }


def tool_get_contribuyente(ruc: str) -> dict[str, Any]:
    clean = _normalize_ruc(ruc)
    if len(clean) != 11:
        return {"error": "RUC inválido: debe tener 11 dígitos", "ruc": clean}

    with read_only_connection() as conn:
        if not table_exists(conn, "contribuyentes"):
            return {"error": "Tabla contribuyentes no encontrada en la base de datos"}

        row = fetch_one(
            conn,
            """
            SELECT ruc, razon_social, estado, otros, fecha_vencimiento_declaracion,
                   cat1ra, cat2da, cat3ra, cat4ta_retenciones, cat4ta_cta_propia, cat5ta,
                   validez_cpe, created_at, updated_at
            FROM contribuyentes
            WHERE ruc = %s
            LIMIT 1
            """,
            (clean,),
        )
        if not row:
            return {"found": False, "ruc": clean, "message": "No hay contribuyente con ese RUC"}
        return {"found": True, "contribuyente": row}


def tool_search_contribuyentes(query: str, limit: int = 10) -> dict[str, Any]:
    q = (query or "").strip()
    if not q:
        return {"error": "Consulta vacía"}

    limit = max(1, min(limit, 20))

    with read_only_connection() as conn:
        if not table_exists(conn, "contribuyentes"):
            return {"error": "Tabla contribuyentes no encontrada"}

        if RUC_RE.fullmatch(_normalize_ruc(q)):
            clean = _normalize_ruc(q)
            rows = fetch_all(
                conn,
                """
                SELECT ruc, razon_social, estado, otros
                FROM contribuyentes
                WHERE ruc = %s
                LIMIT %s
                """,
                (clean, limit),
            )
        else:
            pattern = f"%{q}%"
            rows = fetch_all(
                conn,
                """
                SELECT ruc, razon_social, estado, otros
                FROM contribuyentes
                WHERE razon_social ILIKE %s OR ruc ILIKE %s OR otros ILIKE %s
                ORDER BY razon_social
                LIMIT %s
                """,
                (pattern, pattern, pattern, limit),
            )

        return {"count": len(rows), "results": rows}


def tool_get_ficha_ruc(ruc: str) -> dict[str, Any]:
    clean = _normalize_ruc(ruc)
    if len(clean) != 11:
        return {"error": "RUC inválido: debe tener 11 dígitos"}

    with read_only_connection() as conn:
        if not table_exists(conn, "fichas_ruc"):
            return {"error": "Tabla fichas_ruc no encontrada"}

        row = fetch_one(
            conn,
            """
            SELECT ruc, razon_social, nombre_comercial, telefono_fijo1, telefono_fijo2,
                   telefono_movil1, telefono_movil2, correo_electronico1, correo_electronico2,
                   numero_fax, estado_contribuyente, actividad_economica_principal,
                   departamento, provincia, distrito, updated_at
            FROM fichas_ruc
            WHERE ruc = %s
            LIMIT 1
            """,
            (clean,),
        )
        if not row:
            return {"found": False, "ruc": clean, "message": "No hay ficha RUC registrada"}
        return {"found": True, "ficha": row}


def tool_get_auth_user(identifier: str) -> dict[str, Any]:
    ident = (identifier or "").strip()
    if not ident:
        return {"error": "Indica username o email"}

    with read_only_connection() as conn:
        if not table_exists(conn, "auth_user"):
            return {"error": "Tabla auth_user no encontrada"}

        row = fetch_one(
            conn,
            """
            SELECT id, username, first_name, last_name, email,
                   is_active, is_staff, is_superuser, last_login, date_joined
            FROM auth_user
            WHERE username ILIKE %s OR email ILIKE %s
            LIMIT 1
            """,
            (ident, ident),
        )
        if not row:
            return {"found": False, "message": "Usuario no encontrado"}
        return {"found": True, "user": row}


def tool_query_table(table: str, filters: dict[str, str] | None = None, limit: int = 10) -> dict[str, Any]:
    if table not in ALLOWED_TABLES:
        return {"error": f"Tabla no permitida: {table}"}

    limit = max(1, min(limit, 25))
    filters = filters or {}

    with read_only_connection() as conn:
        if not table_exists(conn, table):
            return {"error": f"Tabla {table} no existe en la base de datos"}

        where_parts: list[str] = []
        params: list[Any] = []
        for col, val in filters.items():
            if not re.match(r"^[a-z_][a-z0-9_]*$", col):
                return {"error": f"Nombre de columna inválido: {col}"}
            where_parts.append(f'"{col}"::text ILIKE %s')
            params.append(f"%{val}%")

        where_sql = f" WHERE {' AND '.join(where_parts)}" if where_parts else ""
        query = f'SELECT * FROM "{table}"{where_sql} LIMIT %s'
        params.append(limit)

        try:
            rows = fetch_all(conn, query, tuple(params))
        except Exception as exc:
            return {"error": f"Error en consulta read-only: {exc}"}

        return {"table": table, "count": len(rows), "rows": rows}


def tool_search_web(query: str, max_results: int = 5) -> dict[str, Any]:
    q = (query or "").strip()
    if not q:
        return {"error": "Consulta web vacía"}

    max_results = max(1, min(max_results, 8))
    try:
        with DDGS() as ddgs:
            hits = list(ddgs.text(q, max_results=max_results))
        results = [
            {
                "title": h.get("title", ""),
                "snippet": h.get("body", ""),
                "url": h.get("href", ""),
            }
            for h in hits
        ]
        return {"query": q, "count": len(results), "results": results}
    except Exception as exc:
        return {"error": f"No se pudo buscar en internet: {exc}"}


TOOL_DEFINITIONS: list[dict[str, Any]] = [
    {
        "type": "function",
        "function": {
            "name": "list_tables",
            "description": "Lista tablas disponibles para consulta read-only.",
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_contribuyente",
            "description": "Obtiene datos de un contribuyente por RUC (11 dígitos).",
            "parameters": {
                "type": "object",
                "properties": {"ruc": {"type": "string", "description": "RUC de 11 dígitos"}},
                "required": ["ruc"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "search_contribuyentes",
            "description": "Busca contribuyentes por RUC parcial o razón social.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string"},
                    "limit": {"type": "integer", "minimum": 1, "maximum": 20},
                },
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_ficha_ruc",
            "description": "Obtiene teléfonos, correos y datos SUNAT de la ficha RUC.",
            "parameters": {
                "type": "object",
                "properties": {"ruc": {"type": "string"}},
                "required": ["ruc"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_auth_user",
            "description": "Busca usuario del sistema (auth_user) por username o email.",
            "parameters": {
                "type": "object",
                "properties": {"identifier": {"type": "string"}},
                "required": ["identifier"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "query_table",
            "description": "Consulta genérica read-only sobre tablas permitidas con filtros ILIKE.",
            "parameters": {
                "type": "object",
                "properties": {
                    "table": {"type": "string"},
                    "filters": {
                        "type": "object",
                        "additionalProperties": {"type": "string"},
                    },
                    "limit": {"type": "integer", "minimum": 1, "maximum": 25},
                },
                "required": ["table"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "search_web",
            "description": "Busca información actual en internet (deportes, noticias, etc.).",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string"},
                    "max_results": {"type": "integer", "minimum": 1, "maximum": 8},
                },
                "required": ["query"],
            },
        },
    },
]


def execute_tool(name: str, arguments: dict[str, Any]) -> str:
    if name == "list_tables":
        result = tool_list_tables()
    elif name == "get_contribuyente":
        result = tool_get_contribuyente(arguments.get("ruc", ""))
    elif name == "search_contribuyentes":
        result = tool_search_contribuyentes(
            arguments.get("query", ""),
            int(arguments.get("limit", 10)),
        )
    elif name == "get_ficha_ruc":
        result = tool_get_ficha_ruc(arguments.get("ruc", ""))
    elif name == "get_auth_user":
        result = tool_get_auth_user(arguments.get("identifier", ""))
    elif name == "query_table":
        result = tool_query_table(
            arguments.get("table", ""),
            arguments.get("filters") or {},
            int(arguments.get("limit", 10)),
        )
    elif name == "search_web":
        result = tool_search_web(
            arguments.get("query", ""),
            int(arguments.get("max_results", 5)),
        )
    else:
        result = {"error": f"Herramienta desconocida: {name}"}

    return json.dumps(result, ensure_ascii=False, default=str)
