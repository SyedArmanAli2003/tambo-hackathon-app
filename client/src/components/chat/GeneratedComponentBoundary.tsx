import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface GeneratedComponentBoundaryProps {
  children: ReactNode;
  resetKey: string;
}

interface GeneratedComponentBoundaryState {
  error: Error | null;
  resetKey: string;
}

export default class GeneratedComponentBoundary extends Component<
  GeneratedComponentBoundaryProps,
  GeneratedComponentBoundaryState
> {
  state: GeneratedComponentBoundaryState = {
    error: null,
    resetKey: this.props.resetKey,
  };

  static getDerivedStateFromError(
    error: Error
  ): Partial<GeneratedComponentBoundaryState> {
    return { error };
  }

  static getDerivedStateFromProps(
    props: GeneratedComponentBoundaryProps,
    state: GeneratedComponentBoundaryState
  ): Partial<GeneratedComponentBoundaryState> | null {
    return props.resetKey === state.resetKey
      ? null
      : { error: null, resetKey: props.resetKey };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error(
        "Generated component failed to render",
        error,
        info.componentStack
      );
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800 dark:text-red-300">
              Component failed to render
            </p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              {this.state.error.message ||
                "The generated component was invalid."}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
