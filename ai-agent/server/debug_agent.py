"""Modo Debug — revisión y corrección de datos rellenados por Composer."""

from __future__ import annotations

import asyncio
from typing import Any

from composer_data import gather_composer_data, verify_fields_against_source
from composer_schemas import get_page_schema
from config import DEBUG_MAX_THINKING_SECONDS


def _normalize_page_context(page_context: dict[str, Any] | None) -> dict[str, Any]:
    ctx = page_context or {}
    return {
        "page_id": (ctx.get("page_id") or ctx.get("route") or "ficha-ruc").strip().lstrip("/"),
        "ruc": (ctx.get("ruc") or "").strip(),
        "fields": ctx.get("fields") or [],
        "title": ctx.get("title") or "",
    }


def _fields_from_schema(page_id: str, page_fields: list[dict[str, Any]]) -> list[dict[str, Any]]:
    if page_fields:
        return page_fields
    schema = get_page_schema(page_id)
    if not schema:
        return []
    return [{"path": f["path"], "label": f["label"], "value": ""} for f in schema.get("fields", [])]


def _format_debug_reply(
    fixes: list[dict[str, Any]],
    correct: list[dict[str, Any]],
    issues: list[dict[str, Any]],
    data: dict[str, Any],
) -> str:
    lines = [
        f"🔍 **Modo Debug** — Revisión post-Composer · RUC `{data.get('ruc', '?')}`",
        "",
        f"✅ **{len(correct)} campos** coinciden con la base de datos.",
    ]

    fixed_issues = [i for i in issues if i.get("fixed")]
    no_ref = [i for i in issues if i.get("issue_type") == "no_reference"]

    if fixed_issues:
        lines.append(f"⚠️ **{len(fixed_issues)} campos** estaban mal o vacíos — **corregidos**:")
        for item in fixed_issues[:30]:
            lines.append(f"  • **{item.get('label', item.get('field_path'))}**: {item.get('message')}")
        if len(fixed_issues) > 30:
            lines.append(f"  • … y {len(fixed_issues) - 30} más")
    else:
        lines.append("")
        lines.append("🎉 **Todo cuadra** con la BD — no hubo correcciones.")

    if no_ref:
        lines.append("")
        lines.append(f"ℹ️ **{len(no_ref)} campos** con valor pero sin referencia en BD (revísalos tú):")
        for item in no_ref[:10]:
            lines.append(f"  • {item.get('label', item.get('field_path'))}")

    sources = data.get("sources") or []
    if sources:
        lines.append("")
        lines.append(f"*Fuente de verdad: {', '.join(sources)}*")

    lines.extend(
        [
            "",
            "**Importante:** Solo corregí según BD read-only. Revisa y guarda tú — no se envió nada a SUNAT.",
        ]
    )
    return "\n".join(lines)


async def run_debug_agent(
    history: list[dict[str, str]],
    *,
    page_context: dict[str, Any] | None = None,
    thinking_seconds: float = 0,
) -> dict[str, Any]:
    thinking = min(max(thinking_seconds, 0), DEBUG_MAX_THINKING_SECONDS)
    if thinking > 0:
        await asyncio.sleep(thinking)

    ctx = _normalize_page_context(page_context)
    page_id = ctx["page_id"].replace("_app.", "").replace("/", "-")
    if page_id.startswith("ficha"):
        page_id = "ficha-ruc"

    ruc = ctx["ruc"]
    if not ruc:
        return {
            "reply": "Abre el **Editor** de Ficha RUC con un RUC seleccionado para revisar los datos.",
            "fill_actions": [],
            "debug_issues": [],
            "tools_used": [],
            "thinking_seconds": thinking,
            "debug_meta": {"error": "missing_ruc"},
        }

    fields = _fields_from_schema(page_id, ctx["fields"])
    if not fields:
        return {
            "reply": f"No hay campos para revisar en `{page_id}`.",
            "fill_actions": [],
            "debug_issues": [],
            "tools_used": [],
            "thinking_seconds": thinking,
        }

    data = gather_composer_data(ruc, page_id, validate_sol=False)
    if data.get("error"):
        return {
            "reply": data["error"],
            "fill_actions": [],
            "debug_issues": [],
            "tools_used": ["gather_composer_data"],
            "thinking_seconds": thinking,
        }

    fixes, correct, issues = verify_fields_against_source(fields, data.get("values") or {})
    reply = _format_debug_reply(fixes, correct, issues, data)

    return {
        "reply": reply,
        "fill_actions": fixes,
        "debug_issues": issues,
        "skipped_fields": [{"field_path": c["field_path"], "label": c["label"], "reason": "OK"} for c in correct],
        "tools_used": ["gather_composer_data", "verify_fields_against_source"],
        "thinking_seconds": thinking,
        "debug_meta": {
            "ruc": data.get("ruc"),
            "page_id": page_id,
            "correct_count": len(correct),
            "fixed_count": len(fixes),
            "issue_count": len(issues),
            "sources": data.get("sources"),
        },
    }
