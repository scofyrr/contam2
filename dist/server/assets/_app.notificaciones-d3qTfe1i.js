import { U as reactExports, L as jsxRuntimeExports } from "./server-BIroHbvu.js";
import { aj as toast, L as Link } from "./router-BRL0s0LD.js";
import { B as Badge } from "./badge-BjDV6F_B.js";
import { B as Button } from "./button-CAvVOLL8.js";
import { I as Input } from "./input-Buvw7UNv.js";
import { S as Select, c as SelectTrigger, d as SelectValue, a as SelectContent, b as SelectItem } from "./select-BZS9NJ-P.js";
import { S as Skeleton } from "./skeleton-wfCnfyZT.js";
import { a as cn } from "./utils-8RO4xBwZ.js";
import { u as useNotifications } from "./use-notifications-Ddkz_Kzo.js";
import { B as Bell } from "./bell-DLhSs_n1.js";
import { C as Check } from "./Combination-BhKuaGUd.js";
import { S as Search } from "./search-Cg9HIdxP.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-Do_kSTPt.js";
import "./index-Bd_3-P22.js";
import "./chevron-up-CkMbl0kk.js";
import "./tareas-service-cnCEUa8P.js";
import "./notification-service-4RfXiETS.js";
function groupLabel(iso) {
  const d = new Date(iso);
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const yday = new Date(today);
  yday.setDate(yday.getDate() - 1);
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  if (dt.getTime() === today.getTime()) return "Hoy";
  if (dt.getTime() === yday.getTime()) return "Ayer";
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  if (dt >= weekAgo) return "Esta semana";
  return d.toLocaleDateString("es-PE", {
    month: "long",
    year: "numeric"
  });
}
function NotificacionesPage() {
  const {
    notificaciones,
    noLeidas,
    marcarLeida,
    marcarTodasLeidas,
    conectado
  } = useNotifications();
  const [filtro, setFiltro] = reactExports.useState("todas");
  const [modulo, setModulo] = reactExports.useState("todos");
  const [q, setQ] = reactExports.useState("");
  const filtered = reactExports.useMemo(() => {
    let list = [...notificaciones];
    if (filtro === "no_leidas") list = list.filter((n) => !n.leida);
    if (modulo !== "todos") list = list.filter((n) => n.metadata.modulo === modulo || n.tipo.includes(modulo));
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter((n) => n.titulo.toLowerCase().includes(s) || n.mensaje.toLowerCase().includes(s));
    }
    return list;
  }, [notificaciones, filtro, modulo, q]);
  const grouped = reactExports.useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    for (const n of filtered) {
      const g = groupLabel(n.fecha_creacion);
      const arr = map.get(g) ?? [];
      arr.push(n);
      map.set(g, arr);
    }
    return [...map.entries()];
  }, [filtered]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 max-w-3xl mx-auto space-y-6 min-h-full bg-gradient-to-b from-[#060B14] to-[#080E1E]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-wrap items-end justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-display text-2xl font-semibold flex items-center gap-2 text-[#E8EDF5]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "size-7 text-[#00C8FF]" }),
          "Notificaciones"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: cn("text-xs mt-1", conectado ? "text-emerald-400" : "text-[#8899B4]"), children: [
          conectado ? "● Conectado" : "○ Modo offline (localStorage)",
          " · ",
          noLeidas,
          " sin leer"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", className: "border-white/10", onClick: () => {
        void marcarTodasLeidas();
        toast.success("Marcadas como leídas");
      }, disabled: noLeidas === 0, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-4 mr-1" }),
        "Marcar todas"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 min-w-[200px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "size-4 absolute left-2.5 top-2.5 text-[#8899B4]" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Buscar…", value: q, onChange: (e) => setQ(e.target.value), className: "pl-8 bg-white/[0.03] border-white/10" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filtro, onValueChange: (v) => setFiltro(v), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-36 bg-white/[0.03] border-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "todas", children: "Todas" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "no_leidas", children: "No leídas" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: modulo, onValueChange: setModulo, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-36 bg-white/[0.03] border-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Módulo" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "todos", children: "Todos" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "SIRE", children: "SIRE" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "TAREA", children: "Tareas" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "CIERRE", children: "Cierre" })
        ] })
      ] })
    ] }),
    notificaciones.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-20 rounded-xl bg-white/5" }, i)),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-sm text-[#8899B4] py-4", children: "No hay notificaciones aún" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6", children: grouped.map(([grupo, items]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xs uppercase tracking-wider text-[#8899B4] mb-2", children: grupo }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: items.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => void marcarLeida(n.id), className: cn("w-full text-left rounded-xl border p-4 transition-colors", "border-white/[0.06] hover:bg-white/[0.04]", !n.leida && "bg-white/[0.03] border-[#00C8FF]/20"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[9px] mb-1", children: n.tipo.replace(/_/g, " ") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-[#E8EDF5]", children: n.titulo }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[#8899B4] mt-1", children: n.mensaje })
          ] }),
          !n.leida && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-2 rounded-full bg-[#00C8FF] shrink-0 mt-1" })
        ] }),
        n.metadata.linkNavegacion ? /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: n.metadata.linkNavegacion, className: "text-xs text-[#00C8FF] mt-2 inline-block hover:underline", onClick: (e) => e.stopPropagation(), children: "Ir →" }) : null
      ] }, n.id)) })
    ] }, grupo)) })
  ] });
}
export {
  NotificacionesPage as component
};
