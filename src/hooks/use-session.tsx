import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User, AuthError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type Ctx = { 
  session: Session | null; 
  user: User | null; 
  loading: boolean;
  error: AuthError | null;  // ✅ Agregamos manejo de errores
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
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    let isMounted = true; // ✅ Prevenir actualizaciones si el componente se desmonta

    console.log("🔐 SessionProvider: Inicializando...");

    // ✅ Función para actualizar estado de forma segura
    const setSessionSafe = (newSession: Session | null) => {
      if (isMounted) {
        setSession(newSession);
        setLoading(false);
      }
    };

    const setErrorSafe = (newError: AuthError | null) => {
      if (isMounted) {
        setError(newError);
        setLoading(false);
      }
    };

    // ✅ 1. Obtener sesión actual (con manejo de errores)
    const initSession = async () => {
      try {
        console.log("📡 Obteniendo sesión actual...");
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("❌ Error al obtener sesión:", sessionError);
          setErrorSafe(sessionError);
        } else {
          console.log("✅ Sesión obtenida:", currentSession?.user?.email ?? "No hay sesión");
          setSessionSafe(currentSession);
        }
      } catch (err) {
        console.error("❌ Excepción en getSession:", err);
        setErrorSafe(err as AuthError);
      }
    };

    // ✅ 2. Escuchar cambios en autenticación
    console.log("👂 Configurando listener de autenticación...");
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log(`🔄 Auth event: ${event}`, newSession?.user?.email ?? "No session");
      
      if (isMounted) {
        setSession(newSession);
        setLoading(false);
        setError(null); // Limpiar error si hay cambio exitoso
      }
    });

    // Ejecutar inicialización
    initSession();

    // ✅ Cleanup: desuscribir y marcar como desmontado
    return () => {
      console.log("🧹 Limpiando SessionProvider...");
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []); // ✅ Array vacío: solo se ejecuta al montar

  return (
    <SessionContext.Provider value={{ 
      session, 
      user: session?.user ?? null, 
      loading,
      error 
    }}>
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
