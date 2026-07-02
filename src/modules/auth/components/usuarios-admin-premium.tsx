import { useMemo, useState } from "react";
import {
  BadgeCheck,
  Briefcase,
  Crown,
  Eye,
  Loader2,
  Plus,
  ScrollText,
  Search,
  Shield,
  Trash2,
  User,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PermissionBadge } from "@/components/auth/PermissionBadge";
import { useSession } from "@/hooks/use-session";
import {
  useAsignarRol,
  useAuditoriaSeguridad,
  usePermisosCatalogo,
  useRemoverRol,
  useRolesCatalogo,
  useUsuarioPermisosEfectivos,
  useUsuarioRoles,
  useUsuariosAdmin,
} from "@/hooks/use-rbac-admin";
import type { UsuarioAdminRow } from "@/modules/auth/types/rbac";
import { cn } from "@/lib/utils";

const ROLE_ICONS: Record<string, typeof Crown> = {
  Crown,
  Shield,
  BadgeCheck,
  Briefcase,
  UserCheck,
  Eye,
  User,
};

function roleIcon(name: string) {
  const key = name.includes("ADMIN") ? "Shield" : name.includes("SENIOR") ? "BadgeCheck" : "User";
  return ROLE_ICONS[key] ?? User;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function UserAvatar({ name, active }: { name: string; active: boolean }) {
  return (
    <div
      className={cn(
        "size-10 rounded-full grid place-items-center text-sm font-semibold shrink-0",
        active ? "bg-[#00C897]/20 text-[#00C897]" : "bg-[#8899B4]/20 text-[#8899B4]",
      )}
    >
      {initials(name)}
    </div>
  );
}

function UserListItem({
  user,
  selected,
  onSelect,
}: {
  user: UsuarioAdminRow;
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = roleIcon(user.rolesResumen);
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full text-left rounded-xl border p-3 transition-all hover:bg-white/[0.03]",
        selected ? "border-[#C8A44D]/40 bg-white/[0.04]" : "border-white/[0.06] bg-white/[0.02]",
      )}
    >
      <div className="flex items-start gap-3">
        <UserAvatar name={user.nombre} active={user.activo} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-[#E8EDF5] truncate">{user.nombre}</span>
            <span className={cn("size-2 rounded-full shrink-0", user.activo ? "bg-[#00C897]" : "bg-[#FF5E7A]")} />
          </div>
          <p className="text-xs text-[#8899B4] truncate">{user.email}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge variant="outline" className="text-[10px] border-white/10 gap-1">
              <Icon className="size-3" />
              {user.rolesResumen}
            </Badge>
            <span className="text-[10px] text-[#8899B4]">
              {user.rucsCount === 0 ? "Todos los RUCs" : `${user.rucsCount} RUC(s)`}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

export function UsuariosAdminPremium() {
  const { user } = useSession();
  const adminId = user?.id ?? null;

  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<"usuarios" | "auditoria">("usuarios");
  const [assignOpen, setAssignOpen] = useState(false);
  const [rolNombre, setRolNombre] = useState("CONTADOR");
  const [rucScope, setRucScope] = useState("");

  const usersQuery = useUsuariosAdmin(adminId);
  const rolesQuery = useRolesCatalogo();
  const permisosQuery = usePermisosCatalogo();
  const rolesUserQuery = useUsuarioRoles(selectedId);
  const permisosUserQuery = useUsuarioPermisosEfectivos(selectedId);
  const auditoriaQuery = useAuditoriaSeguridad(adminId, selectedId);
  const assignMut = useAsignarRol();
  const removeMut = useRemoverRol();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = usersQuery.data ?? [];
    if (!q) return rows;
    return rows.filter(
      (u) => u.nombre.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.rolesResumen.toLowerCase().includes(q),
    );
  }, [usersQuery.data, search]);

  const selected = filtered.find((u) => u.userId === selectedId) ?? (usersQuery.data ?? []).find((u) => u.userId === selectedId);

  const permisosPorModulo = useMemo(() => {
    const catalog = permisosQuery.data ?? [];
    const efectivos = new Set((permisosUserQuery.data ?? []).map((p) => p.codigo));
    const map = new Map<string, Array<{ codigo: string; nombre: string; ok: boolean; rol?: string }>>();
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
        rucId: rucScope.trim() || null,
      });
      toast.success(`Rol ${rolNombre} asignado`);
      setAssignOpen(false);
      setRucScope("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al asignar rol");
    }
  };

  const handleRemove = async (asignacionId: string) => {
    if (!adminId) return;
    try {
      await removeMut.mutateAsync({ adminUserId: adminId, asignacionId });
      toast.success("Rol removido");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al remover rol");
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#060B14] to-[#080E1E] p-4 md:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#C8A44D]/20 pb-4">
        <div>
          <h1 className="font-display text-xl text-[#E8EDF5] flex items-center gap-2">
            <Shield className="size-5 text-[#C8A44D]" />
            Administración de Usuarios y Permisos
          </h1>
          <p className="text-xs text-[#8899B4] mt-1">Security Command Center — RBAC</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === "usuarios" ? "default" : "outline"}
            size="sm"
            className={view === "usuarios" ? "bg-[#C8A44D] text-black hover:bg-[#C8A44D]/90" : "border-white/10"}
            onClick={() => setView("usuarios")}
          >
            Usuarios
          </Button>
          <Button
            variant={view === "auditoria" ? "default" : "outline"}
            size="sm"
            className={view === "auditoria" ? "bg-[#00C8FF] text-black hover:bg-[#00C8FF]/90" : "border-white/10"}
            onClick={() => setView("auditoria")}
          >
            <ScrollText className="size-4 mr-1" />
            Auditoría
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8899B4]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar usuario..."
            className="pl-9 bg-white/[0.03] border-white/[0.08]"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2 space-y-2 max-h-[70vh] overflow-y-auto pr-1">
          <p className="text-xs font-medium text-[#8899B4] uppercase tracking-wider px-1">Usuarios</p>
          {usersQuery.isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
          ) : filtered.length === 0 ? (
            <p className="text-sm text-[#8899B4] p-4">No hay usuarios</p>
          ) : (
            filtered.map((u) => (
              <UserListItem
                key={u.userId}
                user={u}
                selected={selectedId === u.userId}
                onSelect={() => setSelectedId(u.userId)}
              />
            ))
          )}
        </div>

        <div className="lg:col-span-3 rounded-xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-4 min-h-[320px]">
          {!selected ? (
            <div className="h-full grid place-items-center text-[#8899B4] text-sm">
              Selecciona un usuario para ver detalle
            </div>
          ) : view === "auditoria" ? (
            <div className="space-y-3">
              <h2 className="font-medium text-[#E8EDF5]">Actividad — {selected.nombre}</h2>
              {auditoriaQuery.isLoading ? (
                <Loader2 className="size-5 animate-spin text-[#8899B4]" />
              ) : (auditoriaQuery.data ?? []).length === 0 ? (
                <p className="text-sm text-[#8899B4]">Sin eventos registrados</p>
              ) : (
                <ul className="space-y-2 max-h-[60vh] overflow-y-auto">
                  {(auditoriaQuery.data ?? []).map((ev) => (
                    <li key={ev.id} className="rounded-lg border border-white/[0.06] p-2 text-xs">
                      <div className="flex justify-between gap-2">
                        <span className="font-mono text-[#00C8FF]">{ev.accion}</span>
                        <span className="text-[#8899B4]">{new Date(ev.createdAt).toLocaleString("es-PE")}</span>
                      </div>
                      {ev.permisoSolicitado ? (
                        <p className="text-[#8899B4] mt-1">Permiso: {ev.permisoSolicitado}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="size-16 rounded-2xl bg-[#00C897]/10 grid place-items-center text-xl font-bold text-[#00C897]">
                  {initials(selected.nombre)}
                </div>
                <div>
                  <h2 className="text-lg font-medium text-[#E8EDF5]">{selected.nombre}</h2>
                  <p className="text-sm text-[#8899B4]">{selected.email}</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <Badge className={selected.activo ? "bg-[#00C897]/20 text-[#00C897]" : "bg-[#FF5E7A]/20 text-[#FF5E7A]"}>
                      {selected.activo ? "Activo" : "Inactivo"}
                    </Badge>
                    {selected.lastSignInAt ? (
                      <span className="text-[10px] text-[#8899B4] self-center">
                        Último acceso: {new Date(selected.lastSignInAt).toLocaleDateString("es-PE")}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-[#E8EDF5]">Roles asignados</h3>
                  <Button size="sm" variant="outline" className="border-[#C8A44D]/30 text-[#C8A44D]" onClick={() => setAssignOpen(true)}>
                    <Plus className="size-4 mr-1" />
                    Asignar rol
                  </Button>
                </div>
                <div className="space-y-2">
                  {(rolesUserQuery.data ?? []).filter((r) => r.activo).map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between rounded-lg border border-white/[0.06] p-2"
                      style={{ borderLeftColor: r.color, borderLeftWidth: 3 }}
                    >
                      <div>
                        <p className="text-sm font-medium" style={{ color: r.color }}>{r.rol_nombre}</p>
                        <p className="text-[10px] text-[#8899B4]">
                          {r.ruc_id ? (
                            <span className="text-[#00C8FF]">RUC: {r.ruc_id}</span>
                          ) : (
                            <span className="text-[#9B87F5]">GLOBAL</span>
                          )}
                          {" · "}desde {r.fecha_desde}
                        </p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-[#FF5E7A] hover:bg-[#FF5E7A]/10"
                        onClick={() => void handleRemove(r.id)}
                        disabled={removeMut.isPending}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                  {(rolesUserQuery.data ?? []).filter((r) => r.activo).length === 0 ? (
                    <p className="text-xs text-[#8899B4]">Sin roles asignados</p>
                  ) : null}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-[#E8EDF5] mb-2">
                  Permisos efectivos ({(permisosUserQuery.data ?? []).length})
                </h3>
                <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                  {[...permisosPorModulo.entries()].map(([modulo, items]) => (
                    <details key={modulo} className="rounded-lg border border-white/[0.06] bg-white/[0.02]">
                      <summary className="cursor-pointer px-3 py-2 text-xs font-medium text-[#E8EDF5]">
                        {modulo}
                        <span className="ml-2 text-[#8899B4]">
                          ({items.filter((i) => i.ok).length}/{items.length})
                        </span>
                      </summary>
                      <ul className="px-3 pb-2 space-y-1">
                        {items.map((item) => (
                          <li key={item.codigo} className="flex items-center justify-between gap-2 text-[11px]">
                            <PermissionBadge permiso={item.codigo} showLabel={false} />
                            <span className={cn("flex-1 truncate", item.ok ? "text-[#E8EDF5]" : "text-[#8899B4] line-through")}>
                              {item.nombre}
                            </span>
                            {item.rol ? <span className="text-[#8899B4] shrink-0">{item.rol}</span> : null}
                          </li>
                        ))}
                      </ul>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="bg-[#0D1525] border-white/10 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#E8EDF5]">Asignar rol</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Rol</Label>
              <Select value={rolNombre} onValueChange={setRolNombre}>
                <SelectTrigger className="bg-white/[0.03] border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(rolesQuery.data ?? []).map((r) => (
                    <SelectItem key={r.id} value={r.nombre}>{r.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Scope RUC (vacío = global)</Label>
              <Input
                value={rucScope}
                onChange={(e) => setRucScope(e.target.value.replace(/\D/g, "").slice(0, 11))}
                placeholder="20100000001"
                className="bg-white/[0.03] border-white/10 font-mono"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)}>Cancelar</Button>
            <Button
              className="bg-gradient-to-r from-[#C8A44D] to-[#E8D5A3] text-black"
              onClick={() => void handleAssign()}
              disabled={assignMut.isPending}
            >
              {assignMut.isPending ? <Loader2 className="size-4 animate-spin" /> : "Asignar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
