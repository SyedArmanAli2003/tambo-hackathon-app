import {
  TamboMessageProvider,
  type ReactTamboThreadMessage,
} from "@tambo-ai/react";
import MessageContentRenderer from "./MessageContentRenderer";

export default function MessageItem({
  message,
  threadId,
}: {
  message: ReactTamboThreadMessage;
  threadId: string;
}) {
  const isUser = message.role === "user";

  return (
    <TamboMessageProvider message={message}>
      <article aria-label={`${message.role} message`} className="space-y-3">
        {message.content.map((block, index) => (
          <MessageContentRenderer
            key={
              block.type === "component" || block.type === "tool_use"
                ? block.id
                : `${message.id}:${block.type}:${index}`
            }
            block={block}
            message={message}
            threadId={threadId}
            isUser={isUser}
          />
        ))}
      </article>
    </TamboMessageProvider>
  );
}
