import { useEffect, useState } from "react";

/**
 * Retorna `true` únicamente tras el montaje efectivo en el cliente.
 * Use para evitar hydration mismatch en fechas, Intl, localStorage, etc.
 */
export function useIsMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
