"""API FastAPI del agente CONTAM AI — modos Ask y Composer."""

from __future__ import annotations

import logging
from typing import Any, Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from agent import run_ask_agent
from composer_agent import run_composer_agent
from composer_schemas import list_supported_pages
from config import (
    AI_SERVER_HOST,
    AI_SERVER_PORT,
    ASK_MAX_THINKING_SECONDS,
    COMPOSER_MAX_THINKING_SECONDS,
    DEBUG_MAX_THINKING_SECONDS,
)
from db import list_existing_tables
from debug_agent import run_debug_agent
from tools import tool_list_tables

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="CONTAM AI Agent",
    description="Beta — Ask, Composer (relleno) y Debug (revisión post-Composer)",
    version="0.3.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class PageField(BaseModel):
    path: str = Field(alias="field_path", default="")
    field_path: str = ""
    label: str = ""
    value: str = ""
    readonly: bool = False
    disabled: bool = False
    sensitive: bool = False

    model_config = {"populate_by_name": True}


class PageContext(BaseModel):
    page_id: str = "ficha-ruc"
    route: str = ""
    ruc: str = ""
    title: str = ""
    fields: list[dict[str, Any]] = Field(default_factory=list)
    sol_credentials: dict[str, str] | None = None
    overwrite: bool = False


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=8000)
    history: list[ChatMessage] = Field(default_factory=list)
    mode: Literal["ask", "composer", "debug"] = "ask"
    thinking_seconds: float = Field(default=0, ge=0, le=45)
    page_context: PageContext | None = None


class FillAction(BaseModel):
    field_path: str
    label: str = ""
    value: str
    source: str = ""


class SkippedField(BaseModel):
    field_path: str
    label: str = ""
    reason: str
    current_value: str | None = None


class DebugIssue(BaseModel):
    field_path: str
    label: str = ""
    issue_type: str = ""
    current_value: str = ""
    expected_value: str = ""
    fixed: bool = False
    message: str = ""


class ChatResponse(BaseModel):
    reply: str
    mode: str
    tools_used: list[str] = Field(default_factory=list)
    thinking_seconds: float = 0
    fill_actions: list[FillAction] = Field(default_factory=list)
    skipped_fields: list[SkippedField] = Field(default_factory=list)
    composer_meta: dict[str, Any] | None = None
    debug_issues: list[DebugIssue] = Field(default_factory=list)
    debug_meta: dict[str, Any] | None = None


@app.get("/health")
def health():
    return {"status": "ok", "service": "contam-ai-agent", "modes": ["ask", "composer", "debug"]}


@app.get("/api/tables")
def api_tables():
    try:
        return tool_list_tables()
    except Exception as exc:
        logger.exception("Error listando tablas")
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.get("/api/composer/pages")
def api_composer_pages():
    return {"pages": list_supported_pages()}


@app.post("/api/chat", response_model=ChatResponse)
async def api_chat(body: ChatRequest):
    history = [m.model_dump() for m in body.history]
    history.append({"role": "user", "content": body.message.strip()})

    if body.mode == "composer":
        max_thinking = COMPOSER_MAX_THINKING_SECONDS
    elif body.mode == "debug":
        max_thinking = DEBUG_MAX_THINKING_SECONDS
    else:
        max_thinking = ASK_MAX_THINKING_SECONDS
    thinking = min(body.thinking_seconds, max_thinking)

    page_ctx = body.page_context.model_dump() if body.page_context else {}

    try:
        if body.mode == "composer":
            result = await run_composer_agent(
                history,
                page_context=page_ctx,
                thinking_seconds=thinking,
            )
        elif body.mode == "debug":
            result = await run_debug_agent(
                history,
                page_context=page_ctx,
                thinking_seconds=thinking,
            )
        else:
            result = await run_ask_agent(
                history,
                thinking_seconds=thinking,
            )
    except Exception as exc:
        logger.exception("Error en agente")
        raise HTTPException(status_code=500, detail=f"Error del agente: {exc}") from exc

    return ChatResponse(
        reply=result["reply"],
        mode=body.mode,
        tools_used=result.get("tools_used", []),
        thinking_seconds=result.get("thinking_seconds", thinking),
        fill_actions=result.get("fill_actions") or [],
        skipped_fields=result.get("skipped_fields") or [],
        composer_meta=result.get("composer_meta"),
        debug_issues=result.get("debug_issues") or [],
        debug_meta=result.get("debug_meta"),
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host=AI_SERVER_HOST, port=AI_SERVER_PORT, reload=False)
