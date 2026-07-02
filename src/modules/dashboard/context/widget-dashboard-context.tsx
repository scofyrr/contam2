import { createContext, useContext, type ReactNode } from "react";
import type { WidgetProps } from "@/modules/dashboard/types/dashboard-configurable-types";

const WidgetDashboardContext = createContext<WidgetProps | null>(null);

export function WidgetDashboardProvider({
  value,
  children,
}: {
  value: WidgetProps;
  children: ReactNode;
}) {
  return (
    <WidgetDashboardContext.Provider value={value}>{children}</WidgetDashboardContext.Provider>
  );
}

export function useWidgetDashboard(): WidgetProps {
  const ctx = useContext(WidgetDashboardContext);
  if (!ctx) {
    throw new Error("useWidgetDashboard debe usarse dentro de WidgetDashboardProvider");
  }
  return ctx;
}
