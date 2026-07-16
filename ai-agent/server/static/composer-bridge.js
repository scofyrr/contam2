/** Puente DOM CONTAM AI — rellena campos [data-ai-field] sin guardar ni emitir. */
(function () {
  const SENSITIVE_BUTTON_RE =
    /guardar|save|emitir|pagar|declarar|enviar|submit|pay|declar/i;

  function scanFormFields(root) {
    root = root || document;
    const nodes = root.querySelectorAll("[data-ai-field]");
    const fields = [];
    nodes.forEach(function (el) {
      const path = el.getAttribute("data-ai-field") || "";
      if (!path) return;
      const label = el.getAttribute("data-ai-label") || path;
      const input = el;
      let value = "";
      if (input.tagName === "SELECT") value = input.value;
      else if ("value" in input) value = String(input.value || "");
      else value = el.textContent || "";
      fields.push({
        field_path: path,
        label: label,
        value: value,
        readonly: "readOnly" in input ? Boolean(input.readOnly) : false,
        disabled: "disabled" in input ? Boolean(input.disabled) : false,
        sensitive: el.getAttribute("data-ai-sensitive") === "true",
      });
    });
    return fields;
  }

  function applyFillActions(actions, root) {
    root = root || document;
    const failed = [];
    let applied = 0;
    for (const action of actions || []) {
      const el = root.querySelector('[data-ai-field="' + CSS.escape(action.field_path) + '"]');
      if (!el) {
        failed.push({ field_path: action.field_path, reason: "Campo no encontrado en pantalla" });
        continue;
      }
      if (el.getAttribute("data-ai-sensitive") === "true") {
        failed.push({ field_path: action.field_path, reason: "Campo sensible" });
        continue;
      }
      const input = el;
      if ("readOnly" in input && input.readOnly) {
        failed.push({ field_path: action.field_path, reason: "Solo lectura" });
        continue;
      }
      if ("disabled" in input && input.disabled) {
        failed.push({ field_path: action.field_path, reason: "Deshabilitado" });
        continue;
      }
      if (input.tagName === "SELECT") {
        const opt = Array.from(input.options).find(
          function (o) {
            return o.value === action.value || (o.textContent || "").includes(action.value);
          }
        );
        input.value = opt ? opt.value : action.value;
      } else if ("value" in input) {
        input.value = action.value;
      }
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      applied += 1;
    }
    return { applied: applied, failed: failed };
  }

  function guardSensitiveButtons(root) {
    root = root || document;
    const handler = function (e) {
      const target = e.target;
      if (!target) return;
      if (target.closest && target.closest("[data-ai-allow-submit='true']")) return;
      const btn = target.closest("button, [role='button'], input[type='submit']");
      if (!btn) return;
      const text = (btn.textContent || "") + " " + (btn.getAttribute("aria-label") || "");
      if (SENSITIVE_BUTTON_RE.test(text) && btn.getAttribute("data-ai-composer-click") === "true") {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    root.addEventListener("click", handler, true);
    return function () {
      root.removeEventListener("click", handler, true);
    };
  }

  window.CONTAM_AI = {
    scanFormFields: scanFormFields,
    applyFillActions: applyFillActions,
    guardSensitiveButtons: guardSensitiveButtons,
    version: "0.3.0",
  };
})();
