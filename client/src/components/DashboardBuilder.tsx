import { Button } from "@/components/ui/button";
import { useData } from "@/contexts/DataContext";
import DataUpload from "@/components/DataUpload";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Trash2, Sparkles } from "lucide-react";
import { useTamboThread, useTamboThreadInput } from "@tambo-ai/react";

/**
 * Dashboard Builder Component
 * Uses real Tambo AI to generate dashboard components from natural language
 */
export default function DashboardBuilder() {
  const { activeDataset } = useData();
  const { thread, startNewThread, generationStage, generationStatusMessage } = useTamboThread();
  const { value, setValue, submit, isPending } = useTamboThreadInput();

  const messages = thread?.messages ?? [];
  const isLoading = isPending || (generationStage !== "IDLE" && generationStage !== "COMPLETE" && generationStage !== "ERROR");

  const handleGenerate = async () => {
    if (!value.trim() || isLoading) return;

    // Build additional context with uploaded data if available
    const additionalContext: Record<string, any> = {};
    if (activeDataset) {
      additionalContext.uploadedData = {
        name: activeDataset.name,
        columns: activeDataset.columns,
        columnTypes: activeDataset.columnTypes,
        rowCount: activeDataset.rowCount,
        sampleRows: activeDataset.data.slice(0, 5),
        data: activeDataset.data,
      };
      additionalContext.instruction = `The user has uploaded a dataset called "${activeDataset.name}" with ${activeDataset.rowCount} rows and columns: ${activeDataset.columns.join(", ")}. Use this data to generate the requested charts and visualizations. Pass the actual data arrays to the component props.`;
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
              <Button
                onClick={handleClear}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </Button>
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
            <div className="space-y-6 mb-8">
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
                        {msg.renderedComponent}
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
