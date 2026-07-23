import { L as jsxRuntimeExports, U as reactExports } from "./server-B74aIV_r.js";
import { aq as usePermissions, as as useSession, ar as useQueryClient, $ as permissionService, aj as toast } from "./router-CrYSg7RR.js";
import { B as Badge } from "./badge-InzkuTfa.js";
import { B as Button } from "./button-DcgiDsFB.js";
import { D as Dialog, a as DialogContent, d as DialogHeader, e as DialogTitle, c as DialogFooter } from "./dialog-CjJEIfu3.js";
import { I as Input } from "./input-DSRp_ns6.js";
import { L as Label } from "./label-DgVY9oK6.js";
import { S as Select, c as SelectTrigger, d as SelectValue, a as SelectContent, b as SelectItem } from "./select-vFmCUSMY.js";
import { S as Skeleton } from "./skeleton-BCPdwz-t.js";
import { a as cn } from "./utils-8RO4xBwZ.js";
import { C as Check } from "./Combination-Dv6oOkbq.js";
import { X } from "./x-blP1WojS.js";
import { u as useQuery } from "./useQuery-BketnMI0.js";
import { u as useMutation } from "./useMutation-CDcyONza.js";
import { a as asignarRolUsuario, r as removerRolUsuario, d as listarUsuariosAdmin, c as listarRolesCatalogo, b as listarPermisosCatalogo, e as obtenerRolesUsuario, o as obtenerPermisosEfectivosUsuario, l as listarAuditoriaSeguridad } from "./rbac-admin-service-BrIYuoJa.js";
import { S as Shield } from "./shield-B9hQHCl8.js";
import { a as createLucideIcon } from "./index-50tj4GHC.js";
import { S as Search } from "./search-BYzsTB4u.js";
import { L as LoaderCircle } from "./loader-circle-DrYsJpg5.js";
import { P as Plus } from "./plus-BLEFpE62.js";
import { T as Trash2 } from "./trash-2-hQAkKFKp.js";
import { U as User } from "./user-DpXl7XoR.js";
import { E as Eye } from "./eye-C4t7LTZP.js";
import { C as Crown } from "./crown-Kj8YT-vl.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-BW7W4FEA.js";
import "./index-BLRiOdPv.js";
import "./index-BwBS18LE.js";
import "./chevron-up-CwVtrynv.js";
const __iconNode$3 = [
  [
    "path",
    {
      d: "M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z",
      key: "3c2336"
    }
  ],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
];
const BadgeCheck = createLucideIcon("badge-check", __iconNode$3);
const __iconNode$2 = [
  ["path", { d: "M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16", key: "jecpp" }],
  ["rect", { width: "20", height: "14", x: "2", y: "6", rx: "2", key: "i6l2r4" }]
];
const Briefcase = createLucideIcon("briefcase", __iconNode$2);
const __iconNode$1 = [
  ["path", { d: "M15 12h-5", key: "r7krc0" }],
  ["path", { d: "M15 8h-5", key: "1khuty" }],
  ["path", { d: "M19 17V5a2 2 0 0 0-2-2H4", key: "zz82l3" }],
  [
    "path",
    {
      d: "M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3",
      key: "1ph1d7"
    }
  ]
];
const ScrollText = createLucideIcon("scroll-text", __iconNode$1);
const __iconNode = [
  ["path", { d: "m16 11 2 2 4-4", key: "9rsbq5" }],
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }]
];
const UserCheck = createLucideIcon("user-check", __iconNode);
function PermissionBadge({ permiso, rucId, className, showLabel = true }) {
  const { tiene, permisos } = usePermissions();
  const ok = tiene(permiso, rucId);
  const info = permisos.includes(permiso);
  const [modulo, accion] = permiso.split(".");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "span",
    {
      className: cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium border",
        ok ? "bg-[#00C897]/20 text-[#00C897] border-[#00C897]/30" : "bg-[#FF5E7A]/20 text-[#FF5E7A] border-[#FF5E7A]/30",
        className
      ),
      title: permiso,
      children: [
        ok ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-3" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-3" }),
        showLabel ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          modulo?.toUpperCase(),
          " — ",
          accion ?? permiso,
          !info && !ok ? " (no asignado)" : ""
        ] }) : null
      ]
    }
  );
}
function useUsuariosAdmin(adminUserId) {
  return useQuery({
    queryKey: ["rbac", "usuarios", adminUserId],
    queryFn: () => listarUsuariosAdmin(adminUserId),
    enabled: !!adminUserId,
    staleTime: 3e4
  });
}
function useRolesCatalogo() {
  const { user } = useSession();
  return useQuery({
    queryKey: ["rbac", "roles-catalogo"],
    queryFn: listarRolesCatalogo,
    staleTime: 5 * 6e4,
    enabled: !!user?.id
  });
}
function usePermisosCatalogo() {
  const { user } = useSession();
  return useQuery({
    queryKey: ["rbac", "permisos-catalogo"],
    queryFn: listarPermisosCatalogo,
    staleTime: 5 * 6e4,
    enabled: !!user?.id
  });
}
function useUsuarioRoles(userId) {
  return useQuery({
    queryKey: ["rbac", "usuario-roles", userId],
    queryFn: () => obtenerRolesUsuario(userId),
    enabled: !!userId
  });
}
function useUsuarioPermisosEfectivos(userId) {
  return useQuery({
    queryKey: ["rbac", "usuario-permisos", userId],
    queryFn: () => obtenerPermisosEfectivosUsuario(userId),
    enabled: !!userId
  });
}
function useAuditoriaSeguridad(adminUserId, filterUserId) {
  return useQuery({
    queryKey: ["rbac", "auditoria", adminUserId, filterUserId],
    queryFn: () => listarAuditoriaSeguridad(adminUserId, filterUserId),
    enabled: !!adminUserId,
    staleTime: 15e3
  });
}
function useAsignarRol() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      adminUserId,
      targetUserId,
      rolNombre,
      rucId
    }) => asignarRolUsuario(adminUserId, targetUserId, rolNombre, rucId),
    onSuccess: async (_, vars) => {
      permissionService.invalidarCache(vars.targetUserId);
      await qc.invalidateQueries({ queryKey: ["rbac"] });
    }
  });
}
function useRemoverRol() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ adminUserId, asignacionId }) => removerRolUsuario(adminUserId, asignacionId),
    onSuccess: async () => {
      permissionService.invalidarCache();
      await qc.invalidateQueries({ queryKey: ["rbac"] });
    }
  });
}
const ROLE_ICONS = {
  Crown,
  Shield,
  BadgeCheck,
  Briefcase,
  UserCheck,
  Eye,
  User
};
function roleIcon(name) {
  const key = name.includes("ADMIN") ? "Shield" : name.includes("SENIOR") ? "BadgeCheck" : "User";
  return ROLE_ICONS[key] ?? User;
}
function initials(name) {
  return name.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}
function UserAvatar({ name, active }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: cn(
        "size-10 rounded-full grid place-items-center text-sm font-semibold shrink-0",
        active ? "bg-[#00C897]/20 text-[#00C897]" : "bg-[#8899B4]/20 text-[#8899B4]"
      ),
      children: initials(name)
    }
  );
}
function UserListItem({
  user,
  selected,
  onSelect
}) {
  const Icon = roleIcon(user.rolesResumen);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      type: "button",
      onClick: onSelect,
      className: cn(
        "w-full text-left rounded-xl border p-3 transition-all hover:bg-white/[0.03]",
        selected ? "border-[#C8A44D]/40 bg-white/[0.04]" : "border-white/[0.06] bg-white/[0.02]"
      ),
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(UserAvatar, { name: user.nombre, active: user.activo }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-[#E8EDF5] truncate", children: user.nombre }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("size-2 rounded-full shrink-0", user.activo ? "bg-[#00C897]" : "bg-[#FF5E7A]") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[#8899B4] truncate", children: user.email }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "text-[10px] border-white/10 gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "size-3" }),
              user.rolesResumen
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-[#8899B4]", children: user.rucsCount === 0 ? "Todos los RUCs" : `${user.rucsCount} RUC(s)` })
          ] })
        ] })
      ] })
    }
  );
}
function UsuariosAdminPremium() {
  const { user } = useSession();
  const adminId = user?.id ?? null;
  const [search, setSearch] = reactExports.useState("");
  const [selectedId, setSelectedId] = reactExports.useState(null);
  const [view, setView] = reactExports.useState("usuarios");
  const [assignOpen, setAssignOpen] = reactExports.useState(false);
  const [rolNombre, setRolNombre] = reactExports.useState("CONTADOR");
  const [rucScope, setRucScope] = reactExports.useState("");
  const usersQuery = useUsuariosAdmin(adminId);
  const rolesQuery = useRolesCatalogo();
  const permisosQuery = usePermisosCatalogo();
  const rolesUserQuery = useUsuarioRoles(selectedId);
  const permisosUserQuery = useUsuarioPermisosEfectivos(selectedId);
  const auditoriaQuery = useAuditoriaSeguridad(adminId, selectedId);
  const assignMut = useAsignarRol();
  const removeMut = useRemoverRol();
  const filtered = reactExports.useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = usersQuery.data ?? [];
    if (!q) return rows;
    return rows.filter(
      (u) => u.nombre.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.rolesResumen.toLowerCase().includes(q)
    );
  }, [usersQuery.data, search]);
  const selected = filtered.find((u) => u.userId === selectedId) ?? (usersQuery.data ?? []).find((u) => u.userId === selectedId);
  const permisosPorModulo = reactExports.useMemo(() => {
    const catalog = permisosQuery.data ?? [];
    const efectivos = new Set((permisosUserQuery.data ?? []).map((p) => p.codigo));
    const map = /* @__PURE__ */ new Map();
    for (const p of catalog) {
      const list = map.get(p.modulo) ?? [];
      const match = (permisosUserQuery.data ?? []).find((e) => e.codigo === p.codigo);
      list.push({ codigo: p.codigo, nombre: p.nombre, ok: efectivos.has(p.codigo), rol: match?.otorgado_por_rol });
      map.set(p.modulo, list);
    }
    return map;
  }, [permisosQuery.data, permisosUserQuery.data]);
  const handleAssign = async () => {
    if (!adminId || !selectedId) return;
    try {
      await assignMut.mutateAsync({
        adminUserId: adminId,
        targetUserId: selectedId,
        rolNombre,
        rucId: rucScope.trim() || null
      });
      toast.success(`Rol ${rolNombre} asignado`);
      setAssignOpen(false);
      setRucScope("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al asignar rol");
    }
  };
  const handleRemove = async (asignacionId) => {
    if (!adminId) return;
    try {
      await removeMut.mutateAsync({ adminUserId: adminId, asignacionId });
      toast.success("Rol removido");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al remover rol");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-[calc(100vh-8rem)] rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#060B14] to-[#080E1E] p-4 md:p-6 space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 border-b border-[#C8A44D]/20 pb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-display text-xl text-[#E8EDF5] flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "size-5 text-[#C8A44D]" }),
          "Administración de Usuarios y Permisos"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[#8899B4] mt-1", children: "Security Command Center — RBAC" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: view === "usuarios" ? "default" : "outline",
            size: "sm",
            className: view === "usuarios" ? "bg-[#C8A44D] text-black hover:bg-[#C8A44D]/90" : "border-white/10",
            onClick: () => setView("usuarios"),
            children: "Usuarios"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: view === "auditoria" ? "default" : "outline",
            size: "sm",
            className: view === "auditoria" ? "bg-[#00C8FF] text-black hover:bg-[#00C8FF]/90" : "border-white/10",
            onClick: () => setView("auditoria"),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollText, { className: "size-4 mr-1" }),
              "Auditoría"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 min-w-[200px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8899B4]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          value: search,
          onChange: (e) => setSearch(e.target.value),
          placeholder: "Buscar usuario...",
          className: "pl-9 bg-white/[0.03] border-white/[0.08]"
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-5 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-2 space-y-2 max-h-[70vh] overflow-y-auto pr-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-[#8899B4] uppercase tracking-wider px-1", children: "Usuarios" }),
        usersQuery.isLoading ? Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-20 rounded-xl" }, i)) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[#8899B4] p-4", children: "No hay usuarios" }) : filtered.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          UserListItem,
          {
            user: u,
            selected: selectedId === u.userId,
            onSelect: () => setSelectedId(u.userId)
          },
          u.userId
        ))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:col-span-3 rounded-xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-4 min-h-[320px]", children: !selected ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full grid place-items-center text-[#8899B4] text-sm", children: "Selecciona un usuario para ver detalle" }) : view === "auditoria" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-medium text-[#E8EDF5]", children: [
          "Actividad — ",
          selected.nombre
        ] }),
        auditoriaQuery.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-5 animate-spin text-[#8899B4]" }) : (auditoriaQuery.data ?? []).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[#8899B4]", children: "Sin eventos registrados" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2 max-h-[60vh] overflow-y-auto", children: (auditoriaQuery.data ?? []).map((ev) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "rounded-lg border border-white/[0.06] p-2 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[#00C8FF]", children: ev.accion }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#8899B4]", children: new Date(ev.createdAt).toLocaleString("es-PE") })
          ] }),
          ev.permisoSolicitado ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[#8899B4] mt-1", children: [
            "Permiso: ",
            ev.permisoSolicitado
          ] }) : null
        ] }, ev.id)) })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-16 rounded-2xl bg-[#00C897]/10 grid place-items-center text-xl font-bold text-[#00C897]", children: initials(selected.nombre) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-medium text-[#E8EDF5]", children: selected.nombre }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[#8899B4]", children: selected.email }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mt-2 flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: selected.activo ? "bg-[#00C897]/20 text-[#00C897]" : "bg-[#FF5E7A]/20 text-[#FF5E7A]", children: selected.activo ? "Activo" : "Inactivo" }),
              selected.lastSignInAt ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-[#8899B4] self-center", children: [
                "Último acceso: ",
                new Date(selected.lastSignInAt).toLocaleDateString("es-PE")
              ] }) : null
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-medium text-[#E8EDF5]", children: "Roles asignados" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "border-[#C8A44D]/30 text-[#C8A44D]", onClick: () => setAssignOpen(true), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4 mr-1" }),
              "Asignar rol"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            (rolesUserQuery.data ?? []).filter((r) => r.activo).map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "flex items-center justify-between rounded-lg border border-white/[0.06] p-2",
                style: { borderLeftColor: r.color, borderLeftWidth: 3 },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", style: { color: r.color }, children: r.rol_nombre }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-[#8899B4]", children: [
                      r.ruc_id ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[#00C8FF]", children: [
                        "RUC: ",
                        r.ruc_id
                      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#9B87F5]", children: "GLOBAL" }),
                      " · ",
                      "desde ",
                      r.fecha_desde
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      size: "icon",
                      variant: "ghost",
                      className: "text-[#FF5E7A] hover:bg-[#FF5E7A]/10",
                      onClick: () => void handleRemove(r.id),
                      disabled: removeMut.isPending,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-4" })
                    }
                  )
                ]
              },
              r.id
            )),
            (rolesUserQuery.data ?? []).filter((r) => r.activo).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[#8899B4]", children: "Sin roles asignados" }) : null
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-medium text-[#E8EDF5] mb-2", children: [
            "Permisos efectivos (",
            (permisosUserQuery.data ?? []).length,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 max-h-[40vh] overflow-y-auto", children: [...permisosPorModulo.entries()].map(([modulo, items]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "rounded-lg border border-white/[0.06] bg-white/[0.02]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("summary", { className: "cursor-pointer px-3 py-2 text-xs font-medium text-[#E8EDF5]", children: [
              modulo,
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2 text-[#8899B4]", children: [
                "(",
                items.filter((i) => i.ok).length,
                "/",
                items.length,
                ")"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "px-3 pb-2 space-y-1", children: items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center justify-between gap-2 text-[11px]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(PermissionBadge, { permiso: item.codigo, showLabel: false }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("flex-1 truncate", item.ok ? "text-[#E8EDF5]" : "text-[#8899B4] line-through"), children: item.nombre }),
              item.rol ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#8899B4] shrink-0", children: item.rol }) : null
            ] }, item.codigo)) })
          ] }, modulo)) })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: assignOpen, onOpenChange: setAssignOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "bg-[#0D1525] border-white/10 sm:max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "text-[#E8EDF5]", children: "Asignar rol" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Rol" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: rolNombre, onValueChange: setRolNombre, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "bg-white/[0.03] border-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: (rolesQuery.data ?? []).map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r.nombre, children: r.nombre }, r.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Scope RUC (vacío = global)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: rucScope,
              onChange: (e) => setRucScope(e.target.value.replace(/\D/g, "").slice(0, 11)),
              placeholder: "20100000001",
              className: "bg-white/[0.03] border-white/10 font-mono"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setAssignOpen(false), children: "Cancelar" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            className: "bg-gradient-to-r from-[#C8A44D] to-[#E8D5A3] text-black",
            onClick: () => void handleAssign(),
            disabled: assignMut.isPending,
            children: assignMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 animate-spin" }) : "Asignar"
          }
        )
      ] })
    ] }) })
  ] });
}
function AdminUsuariosPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(UsuariosAdminPremium, {});
}
export {
  AdminUsuariosPage as component
};
