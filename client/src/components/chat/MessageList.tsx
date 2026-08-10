import type { ReactTamboThreadMessage } from "@tambo-ai/react";
import { motion } from "framer-motion";
import MessageItem from "./MessageItem";

export default function MessageList({
  messages,
  threadId,
}: {
  messages: ReactTamboThreadMessage[];
  threadId: string;
}) {
  return (
    <div className="space-y-6 mb-8">
      {messages.map((message, index) => (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: Math.min(index * 0.05, 0.3) }}
        >
          <MessageItem message={message} threadId={threadId} />
        </motion.div>
      ))}
    </div>
  );
}
