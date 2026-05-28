// src/hooks/use-session.tsx - VERSIÓN CORREGIDA
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
  loading: false,  // ← Cambiado: iniciar en true
  error: null
});

export function SessionProvider({ children }: { children: ReactNode }) {
  // 🔥 MODO DEMO FORZADO Y SIN BLOQUEOS
  const DEMO_MODE = false;
  
  const [state, setState] = useState<Ctx>({
    session: null,
    user: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    console.log("🚀 [SessionProvider] Iniciando, DEMO_MODE:", DEMO_MODE);

    if (DEMO_MODE) {
      console.log("🎭 [DEMO] Creando sesión de prueba...");
      
      // Crear sesión mock
      const mockUser = {
        id: "demo-user-id",
        email: "demo@contam.pe",
        user_metadata: { nombre: "Usuario Demo" },
        app_metadata: {},
        aud: "authenticated",
        created_at: new Date().toISOString(),
      } as User;
      
      const mockSession = {
        user: mockUser,
        access_token: "demo_token_" + Date.now(),
        refresh_token: "demo_refresh",
        expires_at: Date.now() + 3600000,
      } as Session;
      
      // Establecer la sesión inmediatamente
      setState({
        session: mockSession,
        user: mockUser,
        loading: false,
        error: null
      });
      
      console.log("✅ [DEMO] Sesión creada:", mockUser.email);
      return;
    }

    // ===== MODO REAL =====
    let mounted = true;

    const getSession = async () => {
      try {
        console.log("🔵 [REAL] Obteniendo sesión...");
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (mounted) {
          console.log("✅ [REAL] Sesión:", data.session?.user?.email || "null");
          setState({
            session: data.session,
            user: data.session?.user ?? null,
            loading: false,
            error: null
          });
        }
      } catch (err) {
        console.error("❌ [REAL] Error:", err);
        if (mounted) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: err instanceof Error ? err : new Error("Error de autenticación")
          }));
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log("🔄 [REAL] Evento:", event);
      if (mounted) {
        setState({
          session: newSession,
          user: newSession?.user ?? null,
          loading: false,
          error: null
        });
      }
    });

    getSession();
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <SessionContext.Provider value={state}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession debe usarse dentro de SessionProvider");
  }
  return context;
};