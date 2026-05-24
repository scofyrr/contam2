import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type Ctx = { 
  session: Session | null; 
  user: User | null; 
  loading: boolean;
};

const SessionContext = createContext<Ctx>({ 
  session: null, 
  user: null, 
  loading: true 
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // VERSIÓN SIMPLIFICADA - sin async/await, sin errores complejos
    
    // 1. Primero, obtener la sesión actual
    supabase.auth.getSession().then((result) => {
      console.log("🔵 getSession result:", result.data.session?.user?.email || "null");
      setSession(result.data.session);
      setLoading(false);
    }).catch((err) => {
      console.error("🔴 getSession error:", err);
      setLoading(false); // IMPORTANTE: siempre setear loading a false
    });

    // 2. Escuchar cambios futuros
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log("🟢 Auth event:", event, newSession?.user?.email || "null");
      setSession(newSession);
      setLoading(false);
    });

    // 3. TIMEOUT DE SEGURIDAD - por si todo falla
    const timeoutId = setTimeout(() => {
      console.log("⏰ TIMEOUT: forzando loading=false después de 3 segundos");
      setLoading(false);
    }, 3000);

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  console.log("🎨 SessionProvider render - loading:", loading, "session:", !!session);

  return (
    <SessionContext.Provider value={{ session, user: session?.user ?? null, loading }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => {
  return useContext(SessionContext);
};
