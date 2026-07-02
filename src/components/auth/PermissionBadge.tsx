import { Check, X } from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";
import { cn } from "@/lib/utils";

type Props = {
  permiso: string;
  rucId?: string | null;
  className?: string;
  showLabel?: boolean;
};

export function PermissionBadge({ permiso, rucId, className, showLabel = true }: Props) {
  const { tiene, permisos } = usePermissions();
  const ok = tiene(permiso, rucId);
  const info = permisos.includes(permiso);
  const [modulo, accion] = permiso.split(".");

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium border",
        ok
          ? "bg-[#00C897]/20 text-[#00C897] border-[#00C897]/30"
          : "bg-[#FF5E7A]/20 text-[#FF5E7A] border-[#FF5E7A]/30",
        className,
      )}
      title={permiso}
    >
      {ok ? <Check className="size-3" /> : <X className="size-3" />}
      {showLabel ? (
        <span>
          {modulo?.toUpperCase()} — {accion ?? permiso}
          {!info && !ok ? " (no asignado)" : ""}
        </span>
      ) : null}
    </span>
  );
}
