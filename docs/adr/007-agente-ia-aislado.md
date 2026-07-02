# ADR-007: Arquitectura del Agente de IA

**Fecha**: 2026-06-15  
**Estado**: Aceptado  
**Autor**: Equipo CONTAM  
**Código**: `ai-agent/`, `src/components/ai-chat-bubble.tsx`

## Contexto

CONTAM incluye un agente de IA (FastAPI + Mistral) para consultas sobre datos contables. Requisitos:

1. **Solo lectura** — no modificar datos
2. **No interferir** con flujos contables críticos
3. **Opcional** — el ERP funciona sin él
4. **Aislado** por seguridad

## Decisión

**Subsistema completamente aislado**:

| Aspecto | Implementación |
|---------|----------------|
| Servidor | FastAPI en `ai-agent/server/` (puerto **8001**) |
| Acceso BD | PostgreSQL **read-only** (usuario limitado) |
| Mutations | Prohibidas (sin RPC, sin INSERT/UPDATE/DELETE) |
| Frontend ERP | Proxy Vite `/ai-api` → `127.0.0.1:8001` (`vite.config.ts`) |
| UI | `AiChatBubble` flotante en `_app.tsx` (no bloquea flujos) |
| Producción | `VITE_AI_API_URL` apunta al servicio desplegado |

### Justificación

1. **Seguridad**: un LLM no debe alterar asientos ni SIRE
2. **Resiliencia**: fallo del agente no afecta contabilidad
3. **Opcionalidad**: despliegues sin IA no levantan el servicio
4. **Independencia**: FastAPI reemplazable sin tocar core React

## Consecuencias

**Positivas**:

- Cero riesgo de corrupción de datos por IA
- Deploy y desarrollo independientes
- Fácil deshabilitar (no levantar Terminal 1)

**Negativas**:

- No automatiza tareas contables (solo consulta)
- Latencia HTTP + inferencia LLM
- Servicio adicional a mantener

## Alternativas rechazadas

### Alternativa 1: Llamada directa a Mistral desde el browser

Rechazada: expone API key, sin capa de seguridad ni enmascaramiento de datos sensibles.

### Alternativa 2: IA con permisos de escritura (automatización)

Rechazada: riesgo inaceptable en datos auditables SUNAT.

### Alternativa 3: Integrar IA dentro de Django

Rechazada: acoplaría IA al backend opcional; el camino Supabase-direct quedaría sin chat.
