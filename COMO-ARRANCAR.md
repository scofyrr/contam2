# Cómo arrancar CONTAM (desarrollo)

## Orden recomendado (3 terminales)

### Terminal 1 — Backend IA (chat) — **SÍ necesita venv**
```powershell
cd C:\Users\joser\Documentos\peru-fiscal-core8\ai-agent\server
.\venv\Scripts\Activate.ps1
python main.py
```
Debe decir: `Uvicorn running on http://127.0.0.1:8001`

### Terminal 2 — Backend Django (ERP) — **SÍ necesita venv**
```powershell
cd C:\Users\joser\Documentos\peru-fiscal-core8\backend
.\venv\Scripts\Activate.ps1
python manage.py runserver
```
Debe decir: `Starting development server at http://127.0.0.1:8000/`

> Si no tienes venv en `backend/` aún:
> `python -m venv venv` → `.\venv\Scripts\Activate.ps1` → `pip install -r requirements.txt`

### Terminal 3 — Frontend ERP — **NO necesita venv** (usa Node/npm)
```powershell
cd C:\Users\joser\Documentos\peru-fiscal-core8
npm run dev
```
Abre la URL que muestre (ej. http://localhost:5173)

---

## ¿Cuándo activar venv?

| Terminal | ¿Venv? | Por qué |
|----------|--------|---------|
| Frontend (`npm run dev`) | **No** | Es JavaScript/Node, no Python |
| Django (`backend/`) | **Sí** | Python + dependencias del ERP |
| IA (`ai-agent/server/`) | **Sí** | Python + Mistral + FastAPI |

---

## Compilar (producción)

```powershell
cd C:\Users\joser\Documentos\peru-fiscal-core8
npm run build
```

---

## Si el chat dice "Failed to fetch"

1. Verifica que Terminal 1 (IA) esté corriendo en puerto **8001**
2. **Reinicia** Terminal 3 (`Ctrl+C` y otra vez `npm run dev`) después de cambios en `vite.config.ts`
3. Prueba en el navegador: http://localhost:5173/ai-api/health → debe responder `{"status":"ok"}`
