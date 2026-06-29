"""API FastAPI del agente CONTAM AI (beta, modo Ask)."""

from __future__ import annotations

import logging
from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from agent import run_ask_agent
from config import AI_SERVER_HOST, AI_SERVER_PORT
from db import list_existing_tables
from tools import tool_list_tables

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="CONTAM AI Agent",
    description="Beta — modo Ask, solo lectura en BD",
    version="0.1.0",
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


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=8000)
    history: list[ChatMessage] = Field(default_factory=list)
    mode: Literal["ask", "composer", "debug"] = "ask"
    thinking_seconds: float = Field(default=0, ge=0, le=30)


class ChatResponse(BaseModel):
    reply: str
    mode: str
    tools_used: list[str] = Field(default_factory=list)
    thinking_seconds: float = 0


@app.get("/health")
def health():
    return {"status": "ok", "service": "contam-ai-agent"}


@app.get("/api/tables")
def api_tables():
    try:
        return tool_list_tables()
    except Exception as exc:
        logger.exception("Error listando tablas")
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/api/chat", response_model=ChatResponse)
async def api_chat(body: ChatRequest):
    if body.mode != "ask":
        raise HTTPException(
            status_code=400,
            detail="Solo el modo 'ask' está disponible en esta beta.",
        )

    history = [m.model_dump() for m in body.history]
    history.append({"role": "user", "content": body.message.strip()})

    try:
        result = await run_ask_agent(
            history,
            thinking_seconds=body.thinking_seconds,
        )
    except Exception as exc:
        logger.exception("Error en agente")
        raise HTTPException(status_code=500, detail=f"Error del agente: {exc}") from exc

    return ChatResponse(
        reply=result["reply"],
        mode="ask",
        tools_used=result.get("tools_used", []),
        thinking_seconds=result.get("thinking_seconds", body.thinking_seconds),
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host=AI_SERVER_HOST, port=AI_SERVER_PORT, reload=True)
