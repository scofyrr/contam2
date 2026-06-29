import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env", override=True)


def _require(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise RuntimeError(f"Falta variable de entorno: {name}")
    return value


MISTRAL_API_KEY = _require("MISTRAL_API_KEY")
MISTRAL_MODEL = os.getenv("MISTRAL_MODEL", "mistral-small-latest").strip()

DB_CONFIG = {
    "dbname": _require("DB_NAME"),
    "user": _require("DB_USER"),
    "password": _require("DB_PASSWORD"),
    "host": _require("DB_HOST"),
    "port": _require("DB_PORT"),
    "sslmode": os.getenv("DB_SSLMODE", "require").strip() or "require",
}

AI_SERVER_HOST = os.getenv("AI_SERVER_HOST", "127.0.0.1")
AI_SERVER_PORT = int(os.getenv("AI_SERVER_PORT", "8001"))

# Tablas permitidas (solo lectura, consultas predefinidas)
ALLOWED_TABLES = frozenset(
    {
        # Contabilidad / ERP
        "contribuyentes",
        "fichas_ruc",
        "registros_sire",
        "plan_contable_pcge",
        "asientos_contables",
        "movimientos_caja",
        # Auth Django (solo lectura; sin passwords)
        "auth_user",
        "auth_group",
        "auth_user_groups",
        "auth_permission",
        "auth_group_permissions",
        "auth_user_user_permissions",
        "django_content_type",
        "django_admin_log",
    }
)
