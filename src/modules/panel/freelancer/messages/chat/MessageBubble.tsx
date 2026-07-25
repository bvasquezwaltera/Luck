import { Paperclip } from "lucide-react";
import type { ChatMessage } from "@/modules/panel/freelancer/messages/chat/ChatView";

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isMe = message.from === "me";

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-xs ${isMe ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-800"}`}>
        {message.fileUrl && message.fileName?.match(/\.(png|jpe?g|gif|webp|svg)$/i) ? (
          <img src={message.fileUrl} alt={message.fileName} className="max-h-48 rounded-lg" />
        ) : message.fileUrl ? (
          <a
            href={message.fileUrl}
            download={message.fileName}
            className={`flex items-center gap-2 underline ${isMe ? "text-white" : "text-indigo-600"}`}
          >
            <Paperclip className="h-3.5 w-3.5 shrink-0" />
            {message.fileName}
          </a>
        ) : (
          <p>{message.text}</p>
        )}
        <p className={`mt-1 text-[10px] ${isMe ? "text-indigo-100" : "text-gray-400"}`}>{message.time}</p>
      </div>
    </div>
  );
}
