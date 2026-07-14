-- Corregir duplicidad de triggers de auditoría y remover restricción NOT NULL
-- Idempotente

-- 1. Asegurar que modulo_afectado sea anulable
ALTER TABLE public.auditoria_cambios 
  ALTER COLUMN modulo_afectado DROP NOT NULL;

-- 2. Eliminar triggers legados/duplicados para evitar doble inserción y fallos
DROP TRIGGER IF EXISTS trigger_auditoria_asientos ON public.asientos_contables;
DROP TRIGGER IF EXISTS trigger_auditoria_registros_sire ON public.registros_sire_cabecera;
DROP TRIGGER IF EXISTS trigger_auditoria_movimientos ON public.movimientos_caja;
