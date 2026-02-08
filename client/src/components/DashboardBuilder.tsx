import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Send, Loader2, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTamboThread, type TamboThreadMessage } from "@tambo-ai/react";

function isContentPart(value: unknown): value is { type: string } {
  return (
    !!value &&
    typeof value === "object" &&
    "type" in value &&
    typeof (value as { type?: unknown }).type === "string"
  );
}

function contentToText(
  content: TamboThreadMessage["content"] | undefined
): string {
  if (!content || content.length === 0) return "";

  const parts = content
    .map(part => {
      if (!isContentPart(part)) return "";

      switch (part.type) {
        case "text": {
          const text = (part as { text?: unknown }).text;
          if (text == null) return "";
          if (typeof text === "string") return text;
          if (typeof text === "number" || typeof text === "boolean") {
            return String(text);
          }

          if (import.meta.env.DEV) {
            console.warn("Unexpected non-primitive text content", { text, part });
          }
          try {
            return JSON.stringify(text);
          } catch {
            return "[unsupported text payload]";
          }
        }
        case "image_url":
          return "[image]";
        default:
          const label = `[${part.type} content not yet supported]`;
          if (import.meta.env.DEV) {
            console.warn("Unsupported message content part", part);
          }
          return label;
      }
    })
    .filter(Boolean);

  if (parts.length === 0) {
    return "[unsupported message content]";
  }

  return parts.join(" ").trim();
}

function formatTimestamp(createdAt: string | number | Date | undefined) {
  if (!createdAt) return "";

  const date = createdAt instanceof Date ? createdAt : new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    if (import.meta.env.DEV) {
      console.warn("Invalid message createdAt timestamp", { createdAt });
    }
    return "";
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
* DashboardBuilder Component
* Main interface for AI-powered dashboard generation.
*/
export default function DashboardBuilder() {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  const {
    thread,
    sendThreadMessage,
    startNewThread,
    isIdle,
    generationStatusMessage,
  } = useTamboThread();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = input.trim();
    if (!trimmed) return;
    if (!isIdle) {
      setError("Please wait for the current dashboard generation to finish.");
      return;
    }

    setError(null);
    try {
      await sendThreadMessage(trimmed);
      setInput("");
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error("Failed to send Tambo message", err);
      }
      const status = (err as any)?.status ?? (err as any)?.response?.status;
      if (status === 401 || status === 403) {
        setError(
          "Your Tambo API key appears invalid or unauthorized. Please check VITE_TAMBO_API_KEY."
        );
      } else {
        setError(
          "Failed to send message. This may be a temporary issue with the Tambo service. Please try again."
        );
      }
    }
  };

  const clearConversation = () => {
    startNewThread();
    setInput("");
    setError(null);
  };

  const handleRefresh = () => {
    if (!isIdle) return;
    if (thread.messages.length === 0) {
      clearConversation();
      return;
    }

    setIsClearConfirmOpen(true);
  };

  const messages = thread.messages;
  const isLoading = !isIdle;

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="border-b border-slate-200 bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Dashboard Builder
              </h1>
              <p className="text-sm text-slate-600">
                Powered by Tambo Generative UI
              </p>
            </div>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={!isIdle}
            >
              <RefreshCw className="w-4 h-4" />
              Clear
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={isClearConfirmOpen} onOpenChange={setIsClearConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear dashboard?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear the current conversation and start a new dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={!isIdle}
              onClick={() => {
                if (!isIdle) return;
                clearConversation();
                setIsClearConfirmOpen(false);
              }}
            >
              Clear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="inline-block p-6 bg-gradient-to-br from-indigo-50 to-cyan-50 rounded-lg border-2 border-indigo-100">
                <h2 className="text-2xl font-bold text-slate-900 mb-3">
                  Welcome to Dashboard Builder
                </h2>
                <p className="text-slate-600 max-w-md mb-6">
                  Describe the dashboard you want to create in natural language.
                  Tambo will automatically generate the right components for you.
                </p>
                <div className="space-y-2 text-sm text-slate-700">
                  <p className="font-semibold">Try asking for:</p>
                  <ul className="space-y-1">
                    <li>📊 "Show me sales by region with revenue trends"</li>
                    <li>📈 "Create a user growth dashboard"</li>
                    <li>🔗 "Analyze revenue vs customer correlation"</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <AnimatePresence>
                {messages.map(message => {
                  const text = contentToText(message.content);
                  const timestamp = formatTimestamp(message.createdAt);

                  if (!text && !message.renderedComponent) {
                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-xs text-slate-500 italic"
                      >
                        [This message contains content types the app doesn’t support
                        yet.]
                      </motion.div>
                    );
                  }

                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      {message.role === "user" ? (
                        <div className="flex justify-end mb-4">
                          <div className="bg-indigo-600 text-white rounded-lg rounded-br-none px-4 py-3 max-w-md">
                            <p className="text-sm">{text}</p>
                            {timestamp ? (
                              <span className="text-xs text-indigo-100 mt-2 block">
                                {timestamp}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {text ? (
                            <div className="bg-white border-2 border-slate-200 rounded-lg rounded-bl-none px-4 py-3 max-w-2xl">
                              <p className="text-sm text-slate-700">{text}</p>
                              {timestamp ? (
                                <span className="text-xs text-slate-500 mt-2 block">
                                  {timestamp}
                                </span>
                              ) : null}
                            </div>
                          ) : null}

                          {message.renderedComponent ? (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.2 }}
                            >
                              {message.renderedComponent}
                            </motion.div>
                          ) : null}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {isLoading ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-white border-2 border-slate-200 rounded-lg rounded-bl-none px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
                      <span className="text-sm text-slate-600">
                        {generationStatusMessage || "Generating dashboard..."}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-slate-200 bg-white shadow-lg sticky bottom-0">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {error ? (
            <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </div>
          ) : null}
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Describe your dashboard (e.g., 'Show me sales by region with revenue trends')..."
              disabled={!isIdle}
              className="flex-1 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
            />
            <Button
              type="submit"
              disabled={!isIdle || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Generate</span>
            </Button>
          </form>
          <p className="text-xs text-slate-500 mt-2">
            💡 Tip: Ask for goals, comparisons, and insights (not just charts)
          </p>
        </div>
      </div>
    </div>
  );
}
