import { a as createLucideIcon } from "./index-Do_kSTPt.js";
import "./server-BIroHbvu.js";
import { am as useAccessibility } from "./router-BRL0s0LD.js";
const __iconNode = [
  ["path", { d: "M15 3h6v6", key: "1q9fwt" }],
  ["path", { d: "M10 14 21 3", key: "gplh6r" }],
  ["path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6", key: "a6xqqp" }]
];
const ExternalLink = createLucideIcon("external-link", __iconNode);
function useUiPreferences() {
  const a11y = useAccessibility();
  return {
    darkMode: a11y.resolvedMode === "dark",
    expandedMode: a11y.expandedMode,
    toggleDarkMode: () => {
      a11y.setMode(a11y.resolvedMode === "dark" ? "light" : "dark");
    },
    toggleExpandedMode: a11y.toggleExpandedMode
  };
}
export {
  ExternalLink as E,
  useUiPreferences as u
};
