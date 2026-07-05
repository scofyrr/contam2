/** Puente para rellenar campos del ERP desde acciones del Composer (sin guardar ni emitir). */

export type FillAction = {
  field_path: string;
  value: string;
  label?: string;
  source?: string;
};

export type ApplyResult = {
  applied: number;
  failed: { field_path: string; reason: string }[];
};

const SENSITIVE_BUTTON_RE =
  /guardar|save|emitir|pagar|declarar|enviar|submit|pay|declar/i;

/** Escanea inputs con data-ai-field dentro de un contenedor (p. ej. formulario activo). */
export function scanFormFields(root: ParentNode = document): PageFieldSnapshot[] {
  const nodes = root.querySelectorAll<HTMLElement>("[data-ai-field]");
  const fields: PageFieldSnapshot[] = [];
  nodes.forEach((el) => {
    const path = el.getAttribute("data-ai-field") ?? "";
    if (!path) return;
    const label = el.getAttribute("data-ai-label") ?? path;
    const input = el as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    const value =
      input instanceof HTMLSelectElement
        ? input.value
        : "value" in input
          ? String(input.value ?? "")
          : el.textContent ?? "";
    fields.push({
      field_path: path,
      label,
      value,
      readonly: "readOnly" in input ? Boolean(input.readOnly) : false,
      disabled: "disabled" in input ? Boolean(input.disabled) : false,
      sensitive: el.getAttribute("data-ai-sensitive") === "true",
    });
  });
  return fields;
}

export type PageFieldSnapshot = {
  field_path: string;
  label?: string;
  value?: string;
  readonly?: boolean;
  disabled?: boolean;
  sensitive?: boolean;
};

export function applyFillActions(
  actions: FillAction[],
  root: ParentNode = document,
): ApplyResult {
  const failed: ApplyResult["failed"] = [];
  let applied = 0;

  for (const action of actions) {
    const el = root.querySelector<HTMLElement>(`[data-ai-field="${CSS.escape(action.field_path)}"]`);
    if (!el) {
      failed.push({ field_path: action.field_path, reason: "Campo no encontrado en pantalla" });
      continue;
    }
    if (el.getAttribute("data-ai-sensitive") === "true") {
      failed.push({ field_path: action.field_path, reason: "Campo sensible — no autocompletar" });
      continue;
    }

    const input = el as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    if ("readOnly" in input && input.readOnly) {
      failed.push({ field_path: action.field_path, reason: "Solo lectura" });
      continue;
    }
    if ("disabled" in input && input.disabled) {
      failed.push({ field_path: action.field_path, reason: "Deshabilitado" });
      continue;
    }

    if (input instanceof HTMLSelectElement) {
      const opt = Array.from(input.options).find(
        (o) => o.value === action.value || o.textContent?.includes(action.value),
      );
      if (opt) input.value = opt.value;
      else input.value = action.value;
    } else if ("value" in input) {
      input.value = action.value;
    }

    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    applied += 1;
  }

  return { applied, failed };
}

/** Bloquea clics automáticos en botones peligrosos desde el agente (defensa en profundidad). */
export function guardSensitiveButtons(root: ParentNode = document): () => void {
  const handler = (e: Event) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;
    if (target.closest("[data-ai-allow-submit='true']")) return;
    const btn = target.closest("button, [role='button'], input[type='submit']");
    if (!btn) return;
    const text = (btn.textContent ?? "") + " " + (btn.getAttribute("aria-label") ?? "");
    if (SENSITIVE_BUTTON_RE.test(text) && btn.getAttribute("data-ai-composer-click") === "true") {
      e.preventDefault();
      e.stopPropagation();
    }
  };
  root.addEventListener("click", handler, true);
  return () => root.removeEventListener("click", handler, true);
}

/** Expone API global para integrar CONTAM ERP sin tocar backend. */
export function installComposerBridge(): void {
  (window as unknown as { CONTAM_AI?: object }).CONTAM_AI = {
    scanFormFields,
    applyFillActions,
    version: "0.2.0",
  };
}
