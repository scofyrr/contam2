# CONTAM AI Agent (Beta)

Ecosistema **aislado** del ERP. No modifica `src/`, `backend/` ni la base de datos.

## Modo actual

- **Ask**: chat con lectura BD (solo SELECT) + búsqueda web
- **Composer / Debug**: visibles pero desactivados

## Requisitos

- Python 3.11+
- Node.js 20+

## 1. Backend (puerto 8001)

```powershell
cd ai-agent/server
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
# Copia .env.example a .env y completa MISTRAL_API_KEY + DB_*
python main.py
```

## 2. Frontend (puerto 5174)

```powershell
cd ai-agent/client
npm install
npm run dev
```

Abre http://localhost:5174 — bolita abajo a la derecha.

## Seguridad

- Conexión PostgreSQL en modo **read-only**
- Sin migraciones ni escrituras
- Campos sensibles (password, clave_sol, etc.) enmascarados
- API key Mistral solo en `ai-agent/server/.env`

## Estructura

```
ai-agent/
├── server/   FastAPI + Mistral + tools
└── client/   React chat (beta standalone)
```
