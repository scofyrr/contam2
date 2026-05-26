// hooks/use-session.tsx - MODIFICADO CON MODO DEMO
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type Ctx = { 
  session: Session | null; 
  user: User | null; 
  loading: boolean;
  error: Error | null;
};

const SessionContext = createContext<Ctx>({ 
  session: null, 
  user: null, 
  loading: false,  // ← Cambiado a false por defecto
  error: null
});

export function SessionProvider({ children }: { children: ReactNode }) {
  // 🔥 MODO DEMO - FORZAR loading = false INMEDIATAMENTE
  const DEMO_MODE = true;  // ← Cambia a false para usar Supabase real
  
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(!DEMO_MODE); // ← false si DEMO_MODE es true
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // 🔥 MODO DEMO: Crear sesión falsa y salir
    if (DEMO_MODE) {
      console.log("🎭 MODO DEMO ACTIVADO - loading=false inmediato");
      
      // Crear usuario de demostración
      const mockUser = {
        id: "demo-user-id",
        email: "demo@contam.com",
        user_metadata: { nombre: "Usuario Demo" },
        app_metadata: {},
        aud: "authenticated",
        created_at: new Date().toISOString(),
      } as User;
      
      const mockSession = {
        user: mockUser,
        access_token: "demo_token",
        refresh_token: "demo_refresh",
        expires_at: Date.now() + 3600000,
      } as Session;
      
      setSession(mockSession);
      setLoading(false);
      setError(null);
      
      return; // Salir del efecto, no ejecutar código de Supabase
    }

    // ============================================
    // CÓDIGO NORMAL DE SUPABASE (solo si DEMO_MODE = false)
    // ============================================
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        console.log("🔵 Iniciando verificación de sesión...");
        
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (mounted) {
          console.log("✅ Sesión obtenida:", data.session?.user?.email || "sin sesión");
          setSession(data.session);
          setError(null);
        }
      } catch (err) {
        console.error("❌ Error en getSession:", err);
        if (mounted) {
          setError(err instanceof Error ? err : new Error("Error de autenticación"));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log("🔄 Evento auth:", event, newSession?.user?.email || "sin sesión");
      
      if (mounted) {
        setSession(newSession);
        setLoading(false);
        setError(null);
      }
    });

    timeoutId = setTimeout(() => {
      if (mounted && loading) {
        console.error("⏰ TIMEOUT: No se pudo obtener la sesión después de 10 segundos");
        setError(new Error("Timeout al conectar con Supabase"));
        setLoading(false);
      }
    }, 10000);

    initializeAuth();

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  console.log("🎨 SessionProvider - loading:", loading, "session:", !!session, "error:", !!error, "demo:", DEMO_MODE);

  return (
    <SessionContext.Provider value={{ session, user: session?.user ?? null, loading, error }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => {
  return useContext(SessionContext);
};