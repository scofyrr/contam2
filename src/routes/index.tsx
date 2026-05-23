import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/")({
  component: IndexRedirect,
});

function IndexRedirect() {
  const { session, loading } = useSession();
  if (loading) return <div className="min-h-screen grid place-items-center text-muted-foreground text-sm">Cargando…</div>;
  return <Navigate to={session ? "/sire-registros" : "/login"} />;
}
