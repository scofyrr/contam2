"""Orquestador Mistral con herramientas read-only."""

from __future__ import annotations

import asyncio
import json
import logging
from typing import Any

from mistralai.client import Mistral

from config import MISTRAL_API_KEY, MISTRAL_MODEL
from prompts import SYSTEM_PROMPT_ASK
from tools import TOOL_DEFINITIONS, build_verified_count_context, execute_tool, try_direct_count_reply

logger = logging.getLogger(__name__)

MAX_TOOL_ROUNDS = 10


def _to_mistral_messages(
    history: list[dict[str, str]],
    *,
    extra_system: str = "",
) -> list[dict[str, Any]]:
    system_content = SYSTEM_PROMPT_ASK
    if extra_system:
        system_content = f"{SYSTEM_PROMPT_ASK}\n\n{extra_system}"
    messages: list[dict[str, Any]] = [{"role": "system", "content": system_content}]
    for item in history:
        role = item.get("role", "user")
        content = item.get("content", "")
        if role in {"user", "assistant"} and content:
            messages.append({"role": role, "content": content})
    return messages


def _extract_tool_calls(choice: Any) -> list[Any]:
    message = getattr(choice, "message", None)
    if message is None:
        return []
    tool_calls = getattr(message, "tool_calls", None)
    return tool_calls or []


def _message_to_dict(message: Any) -> dict[str, Any]:
    payload: dict[str, Any] = {
        "role": getattr(message, "role", "assistant"),
        "content": getattr(message, "content", None) or "",
    }
    tool_calls = getattr(message, "tool_calls", None)
    if tool_calls:
        payload["tool_calls"] = []
        for tc in tool_calls:
            fn = tc.function
            payload["tool_calls"].append(
                {
                    "id": tc.id,
                    "type": "function",
                    "function": {
                        "name": fn.name,
                        "arguments": fn.arguments,
                    },
                }
            )
    return payload


async def run_ask_agent(
    history: list[dict[str, str]],
    *,
    thinking_seconds: float = 0,
) -> dict[str, Any]:
    if thinking_seconds > 0:
        await asyncio.sleep(min(thinking_seconds, 30))

    last_user = ""
    for item in reversed(history):
        if item.get("role") == "user" and (item.get("content") or "").strip():
            last_user = item["content"].strip()
            break

    direct = try_direct_count_reply(last_user, history)
    if direct:
        return {
            "reply": direct["reply"],
            "tools_used": direct["tools_used"],
            "thinking_seconds": thinking_seconds,
        }

    verified_counts = build_verified_count_context(last_user, history)

    client = Mistral(api_key=MISTRAL_API_KEY)
    messages = _to_mistral_messages(history, extra_system=verified_counts)
    tools_used: list[str] = []

    for _round in range(MAX_TOOL_ROUNDS):
        response = client.chat.complete(
            model=MISTRAL_MODEL,
            messages=messages,
            tools=TOOL_DEFINITIONS,
            tool_choice="auto",
            temperature=0.2,
        )

        choice = response.choices[0]
        assistant_message = choice.message
        messages.append(_message_to_dict(assistant_message))

        tool_calls = _extract_tool_calls(choice)
        if not tool_calls:
            content = (assistant_message.content or "").strip()
            return {
                "reply": content or "No pude generar una respuesta.",
                "tools_used": tools_used,
                "thinking_seconds": thinking_seconds,
            }

        for tool_call in tool_calls:
            fn = tool_call.function
            name = fn.name
            try:
                args = json.loads(fn.arguments or "{}")
            except json.JSONDecodeError:
                args = {}

            tools_used.append(name)
            logger.info("Tool call: %s %s", name, args)
            tool_result = execute_tool(name, args)

            messages.append(
                {
                    "role": "tool",
                    "name": name,
                    "content": tool_result,
                    "tool_call_id": tool_call.id,
                }
            )

    return {
        "reply": "Alcancé el límite de consultas internas. Intenta una pregunta más específica.",
        "tools_used": tools_used,
        "thinking_seconds": thinking_seconds,
    }
