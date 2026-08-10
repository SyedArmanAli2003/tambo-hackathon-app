import {
  ComponentRenderer,
  type Content,
  type TamboThreadMessage,
} from "@tambo-ai/react";
import { CheckCircle2, FileText, Loader2, Wrench } from "lucide-react";
import GeneratedComponentBoundary from "./GeneratedComponentBoundary";
import { getResourceLabel, getToolResultText } from "@/lib/messageContent";

export default function MessageContentRenderer({
  block,
  message,
  threadId,
  isUser,
}: {
  block: Content;
  message: TamboThreadMessage;
  threadId: string;
  isUser: boolean;
}) {
  switch (block.type) {
    case "text":
      return (
        <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
          <div
            className={`max-w-2xl px-4 py-3 rounded-lg ${
              isUser
                ? "bg-indigo-600 text-white rounded-br-none"
                : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-none"
            }`}
          >
            <p className="text-sm whitespace-pre-wrap leading-relaxed">
              {block.text}
            </p>
          </div>
        </div>
      );

    case "component": {
      const isComponentStreaming =
        block.streamingState === "started" ||
        block.streamingState === "streaming";

      return (
        <div className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-xl rounded-lg border border-slate-200 dark:border-slate-700/60 p-6 shadow-sm">
          {isComponentStreaming ? (
            <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-300 mb-3">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Generating {block.name}…
            </div>
          ) : null}
          <GeneratedComponentBoundary resetKey={`${message.id}:${block.id}`}>
            <ComponentRenderer
              content={block}
              threadId={threadId}
              messageId={message.id}
              fallback={
                <div className="text-sm text-amber-700 dark:text-amber-300">
                  The generated component “{block.name}” is not registered.
                </div>
              }
            />
          </GeneratedComponentBoundary>
        </div>
      );
    }

    case "tool_use":
      return (
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2">
          {block.hasCompleted ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          ) : (
            <Wrench className="w-4 h-4 text-indigo-500" />
          )}
          <span>
            {block.statusMessage ||
              `${block.name} ${block.hasCompleted ? "completed" : "is running"}`}
          </span>
        </div>
      );

    case "tool_result": {
      const resultText = getToolResultText(block);
      if (!block.isError) {
        return <span className="sr-only">Tool completed successfully.</span>;
      }
      return (
        <div className="text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-md px-3 py-2 whitespace-pre-wrap">
          {resultText || "The tool returned an error."}
        </div>
      );
    }

    case "resource":
      return (
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <FileText className="w-4 h-4" />
          <span>{getResourceLabel(block)}</span>
        </div>
      );

    default:
      return (
        <div className="text-xs text-slate-500 dark:text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 rounded-md px-3 py-2">
          Unsupported message content was omitted safely.
        </div>
      );
  }
}
