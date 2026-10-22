import { FileText, Image as ImageIcon, Paperclip } from "lucide-react";
import { formatMessageTime } from "@/lib/formatMessageTime";
import type { ChatMessage } from "@/types/message";

const ATTACHMENT_ICONS = { pdf: FileText, image: ImageIcon, file: Paperclip } as const;

export function MessageBubble({
  message,
  seen,
  onOpenAttachment,
}: {
  message: ChatMessage;
  seen: boolean;
  onOpenAttachment: (message: ChatMessage) => void;
}) {
  const { mine, attachment } = message;
  const AttachmentIcon = attachment ? ATTACHMENT_ICONS[attachment.type] : null;

  return (
    <div className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm sm:max-w-[70%] lg:max-w-xl ${
          mine ? "rounded-br-md bg-indigo-600 text-white" : "rounded-bl-md border border-slate-200 bg-white text-slate-800"
        }`}
      >
        {attachment && AttachmentIcon && (
          <button
            type="button"
            onClick={() => onOpenAttachment(message)}
            className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left transition ${
              mine ? "bg-indigo-500/60 hover:bg-indigo-500" : "bg-slate-50 hover:bg-slate-100"
            } ${message.text ? "mb-2" : ""}`}
          >
            <AttachmentIcon className="h-4 w-4 shrink-0" />
            <span className="min-w-0">
              <span className="block truncate text-xs font-semibold">{attachment.name}</span>
              <span className={`block text-[10px] ${mine ? "text-indigo-100" : "text-slate-400"}`}>{attachment.size}</span>
            </span>
          </button>
        )}
        {message.text && <p className="whitespace-pre-wrap break-words leading-relaxed">{message.text}</p>}
        <p className={`mt-1 text-right text-[10px] ${mine ? "text-indigo-200" : "text-slate-400"}`}>
          {formatMessageTime(message.createdAt)}
        </p>
      </div>
      {seen && <p className="mt-0.5 pr-1 text-[10px] text-slate-400">Visto</p>}
    </div>
  );
}
