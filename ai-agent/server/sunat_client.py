"""Cliente SUNAT (OAuth Clave SOL + credenciales API). Uso interno del Composer — sin escribir BD."""

from __future__ import annotations

import logging
from typing import Any

from config import SUNAT_CLIENT_ID, SUNAT_CLIENT_SECRET, SUNAT_SIRE_SCOPE, SUNAT_TOKEN_URL_TEMPLATE

try:
    import httpx
except ImportError:
    httpx = None  # type: ignore[assignment,misc]

logger = logging.getLogger(__name__)


def _normalize_ruc(ruc: str) -> str:
    return "".join(c for c in (ruc or "") if c.isdigit())[:11]


def sunat_configured() -> bool:
    return bool(SUNAT_CLIENT_ID and SUNAT_CLIENT_SECRET)


def validate_sol_credentials(ruc: str, usuario: str, clave: str) -> dict[str, Any]:
    """
    Valida Clave SOL obteniendo token OAuth (api-seguridad SUNAT).
    No devuelve la clave ni el token completo al cliente — solo estado.
    """
    if httpx is None:
        return {"ok": False, "error": "httpx no instalado", "source": "sunat_oauth"}

    if not sunat_configured():
        return {
            "ok": False,
            "error": "Faltan SUNAT_CLIENT_ID / SUNAT_CLIENT_SECRET en .env del ai-agent",
            "source": "sunat_oauth",
        }

    clean_ruc = _normalize_ruc(ruc)
    usuario = (usuario or "").strip()
    clave = (clave or "").strip()
    if len(clean_ruc) != 11 or not usuario or not clave:
        return {"ok": False, "error": "RUC, usuario o clave SOL incompletos", "source": "sunat_oauth"}

    url = SUNAT_TOKEN_URL_TEMPLATE.format(client_id=SUNAT_CLIENT_ID)
    username = f"{clean_ruc}{usuario}"

    try:
        with httpx.Client(timeout=20.0) as client:
            resp = client.post(
                url,
                data={
                    "grant_type": "password",
                    "scope": SUNAT_SIRE_SCOPE,
                    "client_id": SUNAT_CLIENT_ID,
                    "client_secret": SUNAT_CLIENT_SECRET,
                    "username": username,
                    "password": clave,
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            if resp.status_code != 200:
                detail = resp.text[:300]
                return {
                    "ok": False,
                    "error": f"SUNAT rechazó la Clave SOL (HTTP {resp.status_code})",
                    "detail": detail,
                    "source": "sunat_oauth",
                }
            payload = resp.json()
            if not payload.get("access_token"):
                return {"ok": False, "error": "Token vacío de SUNAT", "source": "sunat_oauth"}
            return {
                "ok": True,
                "source": "sunat_oauth",
                "message": "Clave SOL válida — token obtenido",
                "expires_in": payload.get("expires_in"),
            }
    except Exception as exc:
        logger.exception("Error validando Clave SOL")
        return {"ok": False, "error": str(exc), "source": "sunat_oauth"}


def sunat_ficha_ruc_note() -> str:
    """
    SUNAT no expone un API REST público con la Ficha RUC completa (como en SOL → Ver Ficha RUC).
    Los datos se obtienen de fichas_ruc (migrados desde SUNAT) o el contador completa manualmente.
    """
    return (
        "La Ficha RUC completa no tiene endpoint REST oficial equivalente a 'Ver Ficha RUC' en SOL. "
        "CONTAM Composer usa la tabla fichas_ruc (datos ya sincronizados desde SUNAT) y valida "
        "Clave SOL vía OAuth cuando hay credenciales."
    )
