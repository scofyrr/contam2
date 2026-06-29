// src/routes/login.tsx - VERSIÓN SIMPLIFICADA Y CORREGIDA
import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";
import { FieldHelper } from "@/components/ui/field-helper";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FileText, Lock } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { session, loading: sessLoading } = useSession();
  const [email, setEmail] = useState("admin@contam.pe");
  const [password, setPassword] = useState("Admin123456!");
  const [loading, setLoading] = useState(false);

  // Verificar sesión al cargar
  useEffect(() => {
    const checkLocalStorage = () => {
      const token = localStorage.getItem('sb-auth-token');
      console.log("🔍 [LocalStorage] Token (sb-auth-token):", token ? "✅ Sí" : "❌ No");
    };
    checkLocalStorage();
  }, []);

  // Redirigir si hay sesión
  useEffect(() => {
    if (!sessLoading && session) {
      console.log("✅ Sesión detectada, redirigiendo a /sire-registros");
      window.location.href = "/sire-registros";
    }
  }, [sessLoading, session]);

  if (sessLoading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (session) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Redirigiendo al dashboard...</p>
        </div>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    console.log("🔐 Intentando login con:", email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) throw error;
      
      if (data?.session) {
        console.log("✅ Login exitoso!");
        console.log("📝 Usuario:", data.session.user.email);
        
        toast.success("Bienvenido a CONTAM");
        
        // 🔥 REDIRECCIÓN INMEDIATA
        window.location.href = "/sire-registros";
      } else {
        console.error("❌ No se recibió sesión");
        toast.error("Error: No se pudo establecer la sesión");
        setLoading(false);
      }
    } catch (error) {
      console.error("❌ Error:", error);
      toast.error( error.message);
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
            <div className="size-11 rounded-md bg-primary text-primary-foreground grid place-items-center mb-3">
              <Lock className="size-5" />
            </div>
            <h2 className="font-display text-2xl font-semibold">Iniciar sesión</h2>
            <p className="text-sm text-muted-foreground">Usa el administrador por defecto para comenzar.</p>
          </div>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">Correo</Label>
              <Input 
                id="email" 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
              <FieldHelper>
                Ingrese el correo electrónico registrado en CONTAM (ej. admin@contam.pe).
              </FieldHelper>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
              <FieldHelper>
                Contraseña de acceso al sistema. Debe tener al menos 8 caracteres con mayúsculas y números.
              </FieldHelper>
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? "Ingresando…" : "Entrar al sistema"}
          </Button>
          <div className="rounded-md border bg-muted/50 p-3 text-xs text-muted-foreground flex gap-2">
            <FileText className="size-4 shrink-0 mt-0.5" />
            <div>
              <strong className="text-foreground">Credenciales:</strong>
              <br />admin@contam.pe / Admin123456!
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}