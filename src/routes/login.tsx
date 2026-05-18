import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { login, me } from "@/lib/auth.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FileText, Lock } from "lucide-react";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    const u = await me();
    if (u) throw redirect({ to: "/dashboard" });
  },
  head: () => ({
    meta: [{ title: "Ingresar — CONTAM" }, { name: "description", content: "Acceso al sistema contable y de facturación electrónica CONTAM." }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const router = useRouter();
  const doLogin = useServerFn(login);
  const [email, setEmail] = useState("admin@sistema.pe");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await doLogin({ data: { email, password } });
      toast.success("Bienvenido a CONTAM");
      router.navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-12 text-sidebar-foreground" style={{ background: "var(--gradient-brand)" }}>
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-md bg-accent text-accent-foreground grid place-items-center font-display font-bold">C</div>
          <span className="font-display text-xl font-semibold tracking-tight">CONTAM</span>
        </div>
        <div className="space-y-6 max-w-md">
          <h1 className="font-display text-5xl font-semibold leading-tight">Contabilidad y facturación electrónica adaptada al SIRE.</h1>
          <p className="text-sidebar-foreground/80 leading-relaxed">
            Registra comprobantes, genera asientos automáticos según el PCGE y exporta tus libros 140400 (RVIE) y 130400 (RCE) listos para SUNAT.
          </p>
          <ul className="space-y-2 text-sm text-sidebar-foreground/70">
            <li>• Cumple Anexo 2 — RS N.° 112-2021/SUNAT</li>
            <li>• Partida doble automática (Cuentas 12, 40, 70, 60, 42)</li>
            <li>• Exportación TXT con nomenclatura SUNAT</li>
          </ul>
        </div>
        <p className="text-xs text-sidebar-foreground/60">© 2026 CONTAM — Perú</p>
      </div>

      <div className="flex items-center justify-center p-8">
        <form onSubmit={onSubmit} className="w-full max-w-sm space-y-6">
          <div className="space-y-2">
            <div className="size-11 rounded-md bg-primary text-primary-foreground grid place-items-center mb-3"><Lock className="size-5" /></div>
            <h2 className="font-display text-2xl font-semibold">Iniciar sesión</h2>
            <p className="text-sm text-muted-foreground">Usa las credenciales de administrador por defecto para comenzar.</p>
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
            <div>
              <strong className="text-foreground">Credenciales de desarrollo:</strong> <br />
              admin@sistema.pe / admin123
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
