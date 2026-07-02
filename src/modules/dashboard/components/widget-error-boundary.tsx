import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  widgetName: string;
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class WidgetErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(`Widget ${this.props.widgetName} error:`, error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 flex items-center gap-3 min-h-[8rem]"
          role="alert"
        >
          <AlertTriangle className="size-5 text-red-400 shrink-0" />
          <div>
            <p className="text-sm font-medium text-[#E8EDF5]">Error en {this.props.widgetName}</p>
            <p className="text-xs text-[#8899B4] mt-0.5">
              No se pudo cargar este widget. El resto del dashboard sigue disponible.
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
