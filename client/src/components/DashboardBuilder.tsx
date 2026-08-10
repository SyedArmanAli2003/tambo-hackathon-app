import { Button } from "@/components/ui/button";
import { useData } from "@/contexts/DataContext";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Sparkles, AlertTriangle } from "lucide-react";
import {
  useTambo,
  useTamboContextHelpers,
  useTamboThreadInput,
} from "@tambo-ai/react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { analyzeDataset, type DataSummary } from "@/lib/dataAnalysis";
import { useDashboardNav } from "@/contexts/DashboardNavContext";
import MessageList from "@/components/chat/MessageList";
import { buildDashboardContext } from "@/lib/dashboardContext";

/**
 * Dashboard Builder Component
 * Uses real Tambo AI to generate dashboard components from natural language.
 * Pre-analyzes uploaded data so the AI can give intelligent, query-specific answers.
 */
export default function DashboardBuilder() {
  const { activeDataset } = useData();
  const {
    messages,
    currentThreadId,
    startNewThread,
    isStreaming,
    isWaiting,
    streamingState,
  } = useTambo();
  const {
    value,
    setValue,
    submit,
    isPending,
    error: inputError,
  } = useTamboThreadInput();
  const { addContextHelper, removeContextHelper } = useTamboContextHelpers();
  const dashboardContentRef = useRef<HTMLDivElement>(null);
  const { register } = useDashboardNav();
  const isLoading = isPending || isWaiting || isStreaming;

  // Pre-compute data analysis whenever the active dataset changes
  const dataSummary: DataSummary | null = useMemo(() => {
    if (!activeDataset) return null;
    return analyzeDataset(
      activeDataset.data,
      activeDataset.columns,
      activeDataset.columnTypes
    );
  }, [activeDataset]);

  const contextRef = useRef(
    buildDashboardContext(activeDataset, dataSummary, value)
  );
  contextRef.current = buildDashboardContext(activeDataset, dataSummary, value);

  useEffect(() => {
    addContextHelper("dashboardDataset", () => contextRef.current);
    return () => removeContextHelper("dashboardDataset");
  }, [addContextHelper, removeContextHelper]);

  const handleGenerate = async () => {
    if (!value.trim() || isLoading) return;

    try {
      await submit();
    } catch {
      // The SDK exposes the submission error through its mutation state below.
    }
  };

  const handleClear = useCallback(() => {
    startNewThread();
    setValue("");
  }, [setValue, startNewThread]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  // Register dashboard state with navbar context
  useEffect(() => {
    register({
      dashboardRef: dashboardContentRef,
      hasMessages: messages.length > 0,
      onClear: handleClear,
    });
  }, [handleClear, messages.length, register]);

  const errorMessage =
    streamingState.error?.message ??
    (inputError instanceof Error ? inputError.message : null);

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Welcome State */}
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-xl rounded-lg border border-slate-200 dark:border-slate-700/60 p-8 text-center shadow-sm">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Sparkles className="w-6 h-6 text-indigo-500" />
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Welcome to Dashboard Builder
                  </h2>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Describe the dashboard you want in natural language. Our AI
                  will intelligently choose and render the right components for
                  you.
                </p>
                <div className="space-y-3 text-left bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 mb-6">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                    Try asking for:
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                      <span className="text-xl">📊</span> "Show me sales by
                      region with revenue trends"
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                      <span className="text-xl">📈</span> "Create a user growth
                      dashboard"
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                      <span className="text-xl">🔗</span> "Analyze revenue vs
                      customer correlation"
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                      <span className="text-xl">📁</span> Upload a CSV/JSON
                      file, then ask about your data
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Chat Messages & Rendered Components */}
          {messages.length > 0 && (
            <div ref={dashboardContentRef}>
              <MessageList messages={messages} threadId={currentThreadId} />
            </div>
          )}

          {errorMessage ? (
            <div className="max-w-2xl mx-auto my-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-300">
                  Generation failed
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {errorMessage}
                </p>
              </div>
            </div>
          ) : null}

          {/* Loading / Generation Status */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center py-8"
              >
                <div className="text-center">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {isWaiting ? "Waiting for Tambo…" : "Generating dashboard…"}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 capitalize">
                    {streamingState.status}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tip for empty state */}
          {messages.length === 0 && (
            <div className="max-w-2xl mx-auto mt-8 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-500 flex items-center justify-center gap-2">
                <span>💡</span> Tip: Upload your data first, then ask the AI to
                visualize it
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-700/60 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={value}
              onChange={e => setValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Describe your dashboard (e.g., 'Show me sales by region with revenue trends')..."
              className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              disabled={isLoading}
            />
            <Button
              onClick={handleGenerate}
              disabled={!value.trim() || isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Generate</span>
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
            💡 Tip: Upload your data, then describe what you want to see
          </p>
        </div>
      </div>
    </div>
  );
}
