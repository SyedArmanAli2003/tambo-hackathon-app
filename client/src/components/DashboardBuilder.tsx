import { Button } from "@/components/ui/button";
import { useData } from "@/contexts/DataContext";
import DataUpload from "@/components/DataUpload";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Trash2, Sparkles, AlertTriangle } from "lucide-react";
import { useTamboThread, useTamboThreadInput } from "@tambo-ai/react";
import { useMemo, useRef, Component, type ReactNode } from "react";
import {
  analyzeDataset,
  buildAnalysisSummaryText,
  findRelevantAggregation,
  type DataSummary,
} from "@/lib/dataAnalysis";
import ExportButton from "@/components/ExportButton";

/**
 * Inline error boundary that catches crashes in AI-rendered components
 * so one bad component doesn't kill the entire app.
 */
class ComponentErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">Component failed to render</p>
            <p className="text-xs text-red-600 mt-1">{this.state.error?.message || "Unknown error"}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Dashboard Builder Component
 * Uses real Tambo AI to generate dashboard components from natural language.
 * Pre-analyzes uploaded data so the AI can give intelligent, query-specific answers.
 */
export default function DashboardBuilder() {
  const { activeDataset } = useData();
  const { thread, startNewThread, generationStage, generationStatusMessage } = useTamboThread();
  const { value, setValue, submit, isPending } = useTamboThreadInput();
  const dashboardContentRef = useRef<HTMLDivElement>(null);

  const messages = thread?.messages ?? [];
  const isLoading = isPending || (generationStage !== "IDLE" && generationStage !== "COMPLETE" && generationStage !== "ERROR");

  // Pre-compute data analysis whenever the active dataset changes
  const dataSummary: DataSummary | null = useMemo(() => {
    if (!activeDataset) return null;
    return analyzeDataset(
      activeDataset.data,
      activeDataset.columns,
      activeDataset.columnTypes
    );
  }, [activeDataset]);

  const handleGenerate = async () => {
    if (!value.trim() || isLoading) return;

    // Build rich additional context with analysis
    const additionalContext: Record<string, any> = {};

    // System-level instruction to make the AI behave like a data analyst
    additionalContext.systemInstruction = `You are an expert data analyst and dashboard builder. Your job is to:
1. UNDERSTAND the user's question and figure out EXACTLY what they want to see.
2. ANALYZE the provided dataset to compute the correct answer.
3. CHOOSE the right visualization component(s) for the answer.
4. COMPUTE and AGGREGATE the actual data from the dataset — do NOT use placeholder or made-up numbers.
5. ALWAYS respond with relevant, query-specific content. Different questions MUST produce different outputs.

RULES:
- If the user asks a QUESTION (e.g. "which product has highest revenue?"), answer it with a TextBlock containing your analysis AND show a supporting chart.
- If the user asks for a VISUALIZATION (e.g. "show revenue by region"), pick the right chart type and aggregate the data correctly.
- For KPI/summary requests, compute the real values (sum, average, count, etc.) from the data.
- For comparisons, use BarChart. For trends over time, use LineChart. For proportions, use PieChart. For correlations, use ScatterPlot. For lists/details, use DataTable.
- You can render MULTIPLE components in a single response when appropriate.
- ALWAYS pass the actual computed/aggregated data arrays to component props — never leave data empty.
- Format numbers nicely (e.g. "$1.2M" instead of "1234567").
- When the user's question is unrelated to the data, politely explain what data is available and suggest relevant queries.`;

    if (activeDataset && dataSummary) {
      // Provide the full analysis context
      const summaryText = buildAnalysisSummaryText(dataSummary);
      const relevantAgg = findRelevantAggregation(dataSummary, value);

      additionalContext.datasetInfo = {
        name: activeDataset.name,
        rowCount: activeDataset.rowCount,
        columns: activeDataset.columns,
        columnTypes: activeDataset.columnTypes,
      };

      additionalContext.analysisSummary = summaryText;

      // Pass full column stats
      additionalContext.columnStats = dataSummary.columnStats;

      // Pass relevant pre-computed aggregation if found
      if (relevantAgg) {
        additionalContext.relevantAggregation = {
          description: relevantAgg.description,
          groupBy: relevantAgg.groupBy,
          metric: relevantAgg.metric,
          operation: relevantAgg.operation,
          data: relevantAgg.data,
        };
      }

      // Pass top correlations
      if (dataSummary.correlations.length > 0) {
        additionalContext.correlations = dataSummary.correlations
          .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))
          .slice(0, 5)
          .map((c) => ({
            x: c.xColumn,
            y: c.yColumn,
            r: c.correlation,
            scatterData: c.scatterData.slice(0, 50),
          }));
      }

      // Pass a compact version of the data (limit rows for token budget)
      const dataSlice = activeDataset.data.slice(0, 200);
      additionalContext.data = dataSlice;

      // Available aggregations list
      additionalContext.availableAggregations = dataSummary.precomputedAggregations
        .slice(0, 30)
        .map((a) => ({
          description: a.description,
          groupBy: a.groupBy,
          metric: a.metric,
          operation: a.operation,
          data: a.data,
        }));

      additionalContext.instruction = `The user uploaded "${activeDataset.name}" (${activeDataset.rowCount} rows, columns: ${activeDataset.columns.join(", ")}). Use the data, analysis summary, and pre-computed aggregations provided to answer their query accurately. The aggregation data is already computed and ready to use as chart data — just map it to the right component props format.`;
    } else {
      additionalContext.instruction = `No dataset is uploaded. If the user asks about data, tell them to upload a CSV or JSON file first using the upload button. You can still answer general questions or show example dashboards with sample data you generate.`;
    }

    await submit({ additionalContext });
  };

  const handleClear = () => {
    startNewThread();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  // Extract text content from a message
  const getMessageText = (msg: any): string => {
    if (typeof msg.content === "string") return msg.content;
    if (Array.isArray(msg.content)) {
      return msg.content
        .filter((p: any) => p.type === "text")
        .map((p: any) => p.text)
        .join(" ");
    }
    return "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard Builder</h1>
            <p className="text-sm text-slate-600">Powered by Tambo Generative UI</p>
          </div>
          <div className="flex items-center gap-2">
            <DataUpload />
            {messages.length > 0 && (
              <>
                <ExportButton
                  targetRef={dashboardContentRef}
                  fileName={activeDataset ? `dashboard-${activeDataset.name}` : "dashboard"}
                />
                <Button
                  onClick={handleClear}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

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
              <div className="bg-white rounded-lg border border-slate-200 p-8 text-center shadow-sm">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Sparkles className="w-6 h-6 text-indigo-500" />
                  <h2 className="text-2xl font-bold text-slate-900">
                    Welcome to Dashboard Builder
                  </h2>
                </div>
                <p className="text-slate-600 mb-6">
                  Describe the dashboard you want in natural language. Our AI will
                  intelligently choose and render the right components for you.
                </p>
                <div className="space-y-3 text-left bg-slate-50 rounded-lg p-6 mb-6">
                  <p className="text-sm font-semibold text-slate-700 mb-3">Try asking for:</p>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600 flex items-center gap-2">
                      <span className="text-xl">📊</span> "Show me sales by region with revenue trends"
                    </p>
                    <p className="text-sm text-slate-600 flex items-center gap-2">
                      <span className="text-xl">📈</span> "Create a user growth dashboard"
                    </p>
                    <p className="text-sm text-slate-600 flex items-center gap-2">
                      <span className="text-xl">🔗</span> "Analyze revenue vs customer correlation"
                    </p>
                    <p className="text-sm text-slate-600 flex items-center gap-2">
                      <span className="text-xl">📁</span> Upload a CSV/JSON file, then ask about your data
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Chat Messages & Rendered Components */}
          {messages.length > 0 && (
            <div ref={dashboardContentRef} className="space-y-6 mb-8">
              {messages.map((msg: any, idx: number) => {
                const text = getMessageText(msg);
                const isUser = msg.role === "user";

                return (
                  <motion.div
                    key={msg.id || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.05, 0.3) }}
                  >
                    {/* Text bubble */}
                    {text && (
                      <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
                        <div
                          className={`max-w-lg px-4 py-3 rounded-lg ${
                            isUser
                              ? "bg-indigo-600 text-white rounded-br-none"
                              : "bg-slate-100 text-slate-900 rounded-bl-none"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{text}</p>
                        </div>
                      </div>
                    )}

                    {/* AI-rendered component */}
                    {msg.renderedComponent && (
                      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                        <ComponentErrorBoundary>
                          {msg.renderedComponent}
                        </ComponentErrorBoundary>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}

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
                  <p className="text-sm text-slate-600">
                    {generationStatusMessage || "Thinking..."}
                  </p>
                  {generationStage && generationStage !== "IDLE" && (
                    <p className="text-xs text-slate-400 mt-1 capitalize">
                      {generationStage.replace(/_/g, " ").toLowerCase()}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tip for empty state */}
          {messages.length === 0 && (
            <div className="max-w-2xl mx-auto mt-8 text-center">
              <p className="text-xs text-slate-500 flex items-center justify-center gap-2">
                <span>💡</span> Tip: Upload your data first, then ask the AI to visualize it
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-slate-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Describe your dashboard (e.g., 'Show me sales by region with revenue trends')..."
              className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
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
          <p className="text-xs text-slate-500 mt-2">
            {activeDataset ? (
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                Using dataset: <strong>{activeDataset.name}</strong> ({activeDataset.rowCount} rows, {activeDataset.columns.length} cols)
              </span>
            ) : (
              <>💡 Tip: Upload your own CSV/JSON data, or describe what you want to see</>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
