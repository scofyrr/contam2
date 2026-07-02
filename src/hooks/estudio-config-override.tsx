import { createContext, useContext, type ReactNode } from "react";
import type { EstudioConfigBundle } from "@/modules/config/types/estudio-config";

const EstudioConfigOverrideContext = createContext<EstudioConfigBundle | null>(null);

export function EstudioConfigOverrideProvider({
  bundle,
  children,
}: {
  bundle: EstudioConfigBundle | null;
  children: ReactNode;
}) {
  return (
    <EstudioConfigOverrideContext.Provider value={bundle}>
      {children}
    </EstudioConfigOverrideContext.Provider>
  );
}

export function useEstudioConfigOverride(): EstudioConfigBundle | null {
  return useContext(EstudioConfigOverrideContext);
}
