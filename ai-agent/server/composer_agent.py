"""Orquestador modo Composer — relleno determinístico + resumen LLM."""

from __future__ import annotations

import asyncio
import json
import logging
import re
from typing import Any

from mistralai.client import Mistral

from composer_data import build_fill_plan, detect_fill_intent, gather_composer_data
from composer_schemas import get_page_schema
from config import COMPOSER_MAX_THINKING_SECONDS, MISTRAL_API_KEY, MISTRAL_MODEL
from prompts_composer import SYSTEM_PROMPT_COMPOSER

logger = logging.getLogger(__name__)

MAX_COMPOSER_TOOL_ROUNDS = 8


def _normalize_page_context(page_context: dict[str, Any] | None) -> dict[str, Any]:
    ctx = page_context or {}
    return {
        "page_id": (ctx.get("page_id") or ctx.get("route") or "ficha-ruc").strip().lstrip("/"),
        "ruc": (ctx.get("ruc") or "").strip(),
        "fields": ctx.get("fields") or [],
        "sol_credentials": ctx.get("sol_credentials"),
        "overwrite": bool(ctx.get("overwrite")),
        "title": ctx.get("title") or "",
    }


def _fields_from_schema(page_id: str, page_fields: list[dict[str, Any]]) -> list[dict[str, Any]]:
    if page_fields:
        return page_fields
    schema = get_page_schema(page_id)
    if not schema:
        return []
    return [
        {"path": f["path"], "label": f["label"], "value": ""}
        for f in schema.get("fields", [])
    ]


def _format_reply_deterministic(
    fills: list[dict[str, Any]],
    skipped: list[dict[str, Any]],
    data: dict[str, Any],
) -> str:
    lines = [
        f"**Modo Composer** — RUC `{data.get('ruc', '?')}`",
        "",
        f"✅ **{len(fills)} campos** listos para rellenar en pantalla.",
    ]
    if skipped:
        manual = [s for s in skipped if "complétalo" in s.get("reason", "").lower() or "Sin dato" in s.get("reason", "")]
        lines.append(f"⚠️ **{len(manual)} campos** sin dato en BD/Clave SOL — debes completarlos tú:")
        for item in manual[:25]:
            lines.append(f"  • {item.get('label', item.get('field_path'))}: {item.get('reason')}")
        if len(manual) > 25:
            lines.append(f"  • … y {len(manual) - 25} más")
    sol_val = (data.get("meta") or {}).get("sol_validation") or {}
    if sol_val.get("ok"):
        lines.extend(["", "🔐 Clave SOL validada con SUNAT (OAuth)."])
    sources = data.get("sources") or []
    if sources:
        lines.append("")
        lines.append(f"*Fuentes: {', '.join(sources)}*")
    lines.extend(
        [
            "",
            "**Importante:** Revisa cada valor y guarda tú. No se pulsó Guardar, Emitir ni Pagar.",
        ]
    )
    return "\n".join(lines)


async def _llm_polish_reply(
    user_message: str,
    deterministic_reply: str,
    fills: list[dict[str, Any]],
    skipped: list[dict[str, Any]],
    data: dict[str, Any],
) -> str:
    try:
        client = Mistral(api_key=MISTRAL_API_KEY)
        payload = {
            "user_request": user_message,
            "fills_count": len(fills),
            "skipped_count": len(skipped),
            "skipped_sample": skipped[:15],
            "sources": data.get("sources"),
            "sol_validation": (data.get("meta") or {}).get("sol_validation"),
        }
        response = client.chat.complete(
            model=MISTRAL_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT_COMPOSER},
                {
                    "role": "user",
                    "content": (
                        f"Solicitud del contador: {user_message}\n\n"
                        f"Plan verificado (NO cambies cifras ni inventes campos):\n"
                        f"{json.dumps(payload, ensure_ascii=False)}\n\n"
                        f"Borrador:\n{deterministic_reply}\n\n"
                        "Mejora el texto para el contador manteniendo exactitud legal."
                    ),
                },
            ],
            temperature=0.1,
        )
        content = (response.choices[0].message.content or "").strip()
        return content or deterministic_reply
    except Exception:
        logger.exception("LLM polish falló — usando respuesta determinística")
        return deterministic_reply


async def run_composer_agent(
    history: list[dict[str, str]],
    *,
    page_context: dict[str, Any] | None = None,
    thinking_seconds: float = 0,
    use_llm_summary: bool = True,
) -> dict[str, Any]:
    thinking = min(max(thinking_seconds, 0), COMPOSER_MAX_THINKING_SECONDS)
    if thinking > 0:
        await asyncio.sleep(thinking)

    ctx = _normalize_page_context(page_context)
    page_id = ctx["page_id"].replace("_app.", "").replace("/", "-")
    if page_id.startswith("ficha"):
        page_id = "ficha-ruc"

    ruc = ctx["ruc"]
    if not ruc:
        for item in reversed(history):
            if item.get("role") != "user":
                continue
            match = re.search(r"\d{11}", item.get("content", ""))
            if match:
                ruc = match.group(0)
                break

    if not ruc:
        return {
            "reply": "Indica el RUC del contribuyente o abre la ficha con el RUC cargado en pantalla.",
            "fill_actions": [],
            "skipped_fields": [],
            "tools_used": [],
            "thinking_seconds": thinking,
            "composer_meta": {"error": "missing_ruc"},
        }

    fields = _fields_from_schema(page_id, ctx["fields"])
    if not fields:
        schema = get_page_schema(page_id)
        if not schema:
            return {
                "reply": f"Página `{page_id}` no soportada aún en Composer. Soportadas: ficha-ruc, contribuyentes.",
                "fill_actions": [],
                "skipped_fields": [],
                "tools_used": ["get_page_schema"],
                "thinking_seconds": thinking,
            }

    data = gather_composer_data(
        ruc,
        page_id,
        page_sol=ctx.get("sol_credentials"),
        validate_sol=True,
    )
    if data.get("error"):
        return {
            "reply": data["error"],
            "fill_actions": [],
            "skipped_fields": [],
            "tools_used": ["gather_composer_data"],
            "thinking_seconds": thinking,
        }

    last_user = ""
    for item in reversed(history):
        if item.get("role") == "user" and item.get("content"):
            last_user = item["content"]
            break

    fill_intent = detect_fill_intent(last_user)
    overwrite = bool(ctx.get("overwrite")) or fill_intent

    fills, skipped = build_fill_plan(
        fields,
        data.get("values") or {},
        overwrite=overwrite,
        fill_intent=fill_intent,
    )

    deterministic = _format_reply_deterministic(fills, skipped, data)

    reply = deterministic
    if use_llm_summary and fills:
        reply = await _llm_polish_reply(last_user, deterministic, fills, skipped, data)

    tools_used = ["gather_composer_data", "build_fill_plan"]
    if (data.get("meta") or {}).get("sol_validation", {}).get("ok"):
        tools_used.append("validate_sol_sunat")

    return {
        "reply": reply,
        "fill_actions": fills,
        "skipped_fields": skipped,
        "tools_used": tools_used,
        "thinking_seconds": thinking,
        "composer_meta": {
            "ruc": data.get("ruc"),
            "page_id": page_id,
            "filled_count": len(fills),
            "skipped_count": len(skipped),
            "sources": data.get("sources"),
        },
    }
