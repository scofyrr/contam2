# CONTAM AI Agent (Beta)

Ecosistema **aislado** del ERP. No modifica `backend/` ni escribe en la base de datos.

## Modos

| Modo | Descripción |
|------|-------------|
| **Ask** | Consultas BD read-only + búsqueda web |
| **Composer** | Rellena formularios desde `fichas_ruc` + valida Clave SOL (OAuth SUNAT). **No guarda ni emite.** |
| **Debug** | Revisa lo que Composer rellenó, corrige vs BD y avisa qué estaba mal |

## Clave SOL y SUNAT

1. **Clave SOL** = usuario + contraseña del portal SUNAT Operaciones en Línea (SOL).
2. **Credenciales API** (`SUNAT_CLIENT_ID` / `SUNAT_CLIENT_SECRET`) = las generas en SOL → Credenciales API SUNAT.
3. Composer **valida** la Clave SOL vía `api-seguridad.sunat.gob.pe` (OAuth password grant).
4. La **Ficha RUC completa** no tiene REST oficial como “Ver Ficha RUC” en SOL; CONTAM usa datos ya en `fichas_ruc` (sincronizados previamente).

## Requisitos

- Python 3.11+
- Node.js 20+

## 1. Backend (puerto 8001)

```powershell
cd ai-agent/server
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
# Copia .env.example a .env — MISTRAL_API_KEY, DB_*, SUNAT_CLIENT_*
python main.py
```

## 2. Frontend demo (puerto 5174)

```powershell
cd ai-agent/client
npm install
npm run dev
```

Abre http://localhost:5174 — formulario Ficha RUC demo + chat Composer.

## Integración ERP (sin tocar backend)

En formularios React del ERP, marca campos rellenables:

```html
<input data-ai-field="general.razonSocial" data-ai-label="Razón Social" />
```

Desde el chat Composer, envía `page_context` con `ruc`, `page_id` y `fields`.  
Usa `window.CONTAM_AI.applyFillActions()` (`client/src/composer-bridge.ts`).

## Seguridad

- PostgreSQL **solo lectura**
- Clave SOL nunca se devuelve al LLM ni en respuestas JSON
- Composer **no** pulsa Guardar / Emitir / Pagar
- Campos sensibles enmascarados en modo Ask

## Estructura

```
ai-agent/
├── server/   FastAPI + Ask + Composer + SUNAT client
└── client/   React demo + composer-bridge
```
