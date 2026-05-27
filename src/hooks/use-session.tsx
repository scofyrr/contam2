// src/hooks/use-session.tsx - VERSIÓN FINAL CON SUPABASE REAL
import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

// 🔧 [DEBUG] Variables de entorno - fuera del componente
console.log("🔧 [DEBUG] === VERIFICANDO VARIABLES DE ENTORNO ===");
console.log("🔧 [DEBUG] VITE_SUPABASE_URL:", import.meta.env.VITE_SUPABASE_URL || "❌ NO DEFINIDA");
console.log("🔧 [DEBUG] VITE_SUPABASE_ANON_KEY:", import.meta.env.VITE_SUPABASE_ANON_KEY ? "✅ Existe" : "❌ FALTA");
console.log("🔧 [DEBUG] ======================================");

type Ctx = { 
  session: Session | null; 
  user: User | null; 
  loading: boolean;
  error: Error | null;
};

const SessionContext = createContext<Ctx>({ 
  session: null, 
  user: null, 
  loading: false,
  error: null
});

export function SessionProvider({ children }: { children: ReactNode }) {
  // 🔥 CRÍTICO: false = usar Supabase real, true = modo demo
  const DEMO_MODE = true;  // ← ¡CAMBIADO A false!
  
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    console.log("🚀 [SessionProvider] Iniciando, DEMO_MODE:", DEMO_MODE);

    if (DEMO_MODE) {
      console.log("🎭 [DEMO] MODO DEMO ACTIVADO - Usando sesión falsa");
      const mockUser = {
        id: "demo-user-id",
        email: "admin@contam.pe",
        user_metadata: { nombre: "Administrador" },
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
      return;
    }

    // ============================================
    // MODO REAL - SUPABASE
    // ============================================
    let mounted = true;

    const getSession = async () => {
      try {
        console.log("🔵 [REAL] Obteniendo sesión de Supabase...");
        
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (mounted) {
          console.log("✅ [REAL] Sesión obtenida:", data.session?.user?.email || "sin sesión");
          setSession(data.session);
        }
      } catch (err) {
        console.error("❌ [REAL] Error:", err);
        if (mounted) setError(err instanceof Error ? err : new Error("Error de autenticación"));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log("🔄 [REAL] Evento auth:", event, newSession?.user?.email || "sin sesión");
      if (mounted) {
        setSession(newSession);
        setLoading(false);
      }
    });

    getSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <SessionContext.Provider value={{ session, user: session?.user ?? null, loading, error }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => {
  return useContext(SessionContext);
};