import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type Ctx = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: Error | null;
};

const SessionContext = createContext<Ctx | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Ctx>({
    session: null,
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    const getSession = async () => {
      try {
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (mounted) {
          setState({
            session: data.session,
            user: data.session?.user ?? null,
            loading: false,
            error: null,
          });
        }
      } catch (err) {
        if (mounted) {
          setState({
            session: null,
            user: null,
            loading: false,
            error: err instanceof Error ? err : new Error("Error de autenticación"),
          });
        }
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (mounted) {
        setState({
          session: newSession,
          user: newSession?.user ?? null,
          loading: false,
          error: null,
        });
      }
    });

    void getSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return <SessionContext.Provider value={state}>{children}</SessionContext.Provider>;
}

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession debe usarse dentro de SessionProvider");
  }
  return context;
};
