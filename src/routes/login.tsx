import { createFileRoute, useRouter, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FileText, Lock } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Ingresar — CONTAM" }] }),
  component: LoginPage,
});

function LoginPage() {
  const router = useRouter();
  const { session, loading: sessLoading } = useSession();
  const [email, setEmail] = useState("admin@contam.pe");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);

  if (sessLoading) return null;
  if (session) return <Navigate to="/sire-registros" />;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Bienvenido a CONTAM");
    router.navigate({ to: "/sire-registros" });
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-12 text-sidebar-foreground" style={{ background: "var(--gradient-brand)" }}>
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-md bg-accent text-accent-foreground grid place-items-center font-display font-bold">C</div>
          <span className="font-display text-xl font-semibold tracking-tight">CONTAM</span>
        </div>
        <div className="space-y-6 max-w-md">
          <h1 className="font-display text-5xl font-semibold leading-tight">Sistema Contable Moderno con registros SIRE.</h1>
          <p className="text-sidebar-foreground/80 leading-relaxed">
            Gestiona ventas y compras con la estructura extendida SUNAT (35 columnas + campos libres) y filtra por periodo, RUC, tipo CDP y más.
          </p>
        </div>
        <p className="text-xs text-sidebar-foreground/60">© 2026 CONTAM — Perú</p>
      </div>

      <div className="flex items-center justify-center p-8">
        <form onSubmit={onSubmit} className="w-full max-w-sm space-y-6">
          <div className="space-y-2">
            <div className="size-11 rounded-md bg-primary text-primary-foreground grid place-items-center mb-3"><Lock className="size-5" /></div>
            <h2 className="font-display text-2xl font-semibold">Iniciar sesión</h2>
            <p className="text-sm text-muted-foreground">Usa el administrador por defecto para comenzar.</p>
          </div>
          <div className="space-y-3">
            <div>
              <Label htmlFor="email">Correo</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? "Ingresando…" : "Entrar al sistema"}
          </Button>
          <div className="rounded-md border bg-muted/50 p-3 text-xs text-muted-foreground flex gap-2">
            <FileText className="size-4 shrink-0 mt-0.5" />
            <div><strong className="text-foreground">Credenciales:</strong><br />admin@contam.pe / admin123</div>
          </div>
        </form>
      </div>
    </div>
  );
}
