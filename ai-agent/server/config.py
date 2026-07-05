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

QUERY_DEFAULT_LIMIT = int(os.getenv("QUERY_DEFAULT_LIMIT", "50"))
QUERY_MAX_LIMIT = int(os.getenv("QUERY_MAX_LIMIT", "200"))
QUERY_MAX_OFFSET = int(os.getenv("QUERY_MAX_OFFSET", "50000"))

# Modo Composer
COMPOSER_MAX_THINKING_SECONDS = int(os.getenv("COMPOSER_MAX_THINKING_SECONDS", "45"))
ASK_MAX_THINKING_SECONDS = int(os.getenv("ASK_MAX_THINKING_SECONDS", "15"))
DEBUG_MAX_THINKING_SECONDS = int(os.getenv("DEBUG_MAX_THINKING_SECONDS", "30"))
SUNAT_CLIENT_ID = os.getenv("SUNAT_CLIENT_ID", "").strip()
SUNAT_CLIENT_SECRET = os.getenv("SUNAT_CLIENT_SECRET", "").strip()
SUNAT_TOKEN_URL_TEMPLATE = (
    "https://api-seguridad.sunat.gob.pe/v1/clientessol/{client_id}/oauth2/token/"
)
SUNAT_SIRE_SCOPE = "https://api-sire.sunat.gob.pe"

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
