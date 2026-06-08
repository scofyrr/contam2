"""Normalización de códigos PCGE antes de persistir en varchar."""

from __future__ import annotations

import re


def normalize_cuenta_contable(value: str | None) -> str:
    """
    Extrae el código numérico PCGE desde valores de UI como '[601101]' o '601101'.
    Si no hay dígitos, devuelve el texto sin corchetes y espacios extremos.
    """
    if value is None:
        return ""
    text = str(value).strip()
    if not text:
        return ""
    match = re.search(r"\d+", text)
    if match:
        return match.group(0)
    return text.replace("[", "").replace("]", "").strip()
