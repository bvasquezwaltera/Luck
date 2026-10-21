"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { Avatar } from "@/ui/Avatar";
import { Card } from "@/ui/Card";
import { ChatComposer } from "@/modules/panel/freelancer/messages/chat/ChatComposer";
import { MessageBubble } from "@/modules/panel/freelancer/messages/chat/MessageBubble";

export interface ChatMessage {
  from: "me" | "them";
  text: string;
  time: string;
  fileName?: string;
  fileUrl?: string;
}

export function ChatView({
  contactName,
  contactInitials,
  initialMessages,
  onBack,
}: {
  contactName: string;
  contactInitials: string;
  initialMessages: ChatMessage[];
  onBack: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  const handleSendText = (text: string) => {
    setMessages((current) => [...current, { from: "me", text, time: "Ahora" }]);
  };

  const handleSendFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setMessages((current) => [
        ...current,
        { from: "me", text: "", time: "Ahora", fileName: file.name, fileUrl: reader.result as string },
      ]);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card className="flex h-[calc(100vh-48px)] flex-col overflow-hidden !p-0">
      <div className="flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-3 sm:px-5">
        <button
          type="button"
          onClick={onBack}
          aria-label="Volver a mensajes"
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <Avatar initials={contactInitials} name={contactName} size="sm" />
        <p className="text-sm font-semibold text-slate-900">{contactName}</p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-slate-50/70 px-4 py-5 sm:px-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <MessageCircle className="h-8 w-8 text-slate-300" />
            <p className="text-sm text-slate-500">Escribe el primer mensaje.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {messages.map((message, index) => (
              // Mensajes seguidos del mismo autor van más juntos que los de distinto autor.
              <div key={index} className={index === 0 ? "" : messages[index - 1].from === message.from ? "mt-1" : "mt-4"}>
                <MessageBubble message={message} />
              </div>
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <ChatComposer onSendText={handleSendText} onSendFile={handleSendFile} />
    </Card>
  );
}
