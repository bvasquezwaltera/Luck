"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
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
    <Card className="flex h-[calc(100vh-48px)] flex-col !p-0">
      <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
        <button type="button" onClick={onBack} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <Avatar initials={contactInitials} name={contactName} size="sm" />
        <p className="text-sm font-semibold text-gray-900">{contactName}</p>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {messages.map((message, index) => (
          <MessageBubble key={index} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <ChatComposer onSendText={handleSendText} onSendFile={handleSendFile} />
    </Card>
  );
}
