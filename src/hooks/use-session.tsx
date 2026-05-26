// hooks/use-session.tsx - MODIFICADO
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type Ctx = { 
  session: Session | null; 
  user: User | null; 
  loading: boolean;
  error: Error | null; // AÑADIR error para mejor manejo
};

const SessionContext = createContext<Ctx>({ 
  session: null, 
  user: null, 
  loading: true,
  error: null
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        console.log("🔵 Iniciando verificación de sesión...");
        
        // Intentar obtener la sesión
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

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log("🔄 Evento auth:", event, newSession?.user?.email || "sin sesión");
      
      if (mounted) {
        setSession(newSession);
        setLoading(false);
        setError(null);
      }
    });

    // Timeout de seguridad MÁS LARGO (10 segundos para dar tiempo)
    timeoutId = setTimeout(() => {
      if (mounted && loading) {
        console.error("⏰ TIMEOUT: No se pudo obtener la sesión después de 10 segundos");
        setError(new Error("Timeout al conectar con Supabase"));
        setLoading(false);
      }
    }, 10000);

    // Ejecutar inicialización
    initializeAuth();

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  console.log("🎨 SessionProvider - loading:", loading, "session:", !!session, "error:", !!error);

  return (
    <SessionContext.Provider value={{ session, user: session?.user ?? null, loading, error }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => {
  return useContext(SessionContext);
};
