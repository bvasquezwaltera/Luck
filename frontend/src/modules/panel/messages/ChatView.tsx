"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { ChatComposer } from "@/modules/panel/messages/ChatComposer";
import { MessageBubble } from "@/modules/panel/messages/MessageBubble";
import { fetchMessages, markConversationRead, openMessageAttachment, sendMessage } from "@/lib/api/client/messages";
import type { ChatMessage, Conversation } from "@/types/message";
import { Avatar } from "@/ui/Avatar";
import { Card } from "@/ui/Card";

const POLL_MS = 4000;

export function ChatView({ conversation, onBack }: { conversation: Conversation; onBack: () => void }) {
  const { contractId, counterpart, title } = conversation;
  const [messages, setMessages] = useState<ChatMessage[] | null>(null);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const lastCount = useRef(0);

  const refresh = useCallback(async () => {
    const result = await fetchMessages(contractId);
    if (!result) return;
    setMessages(result);
    // Lo que me escribió la otra persona queda leído al verlo.
    if (result.some((message) => !message.mine && !message.read)) void markConversationRead(contractId);
  }, [contractId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial desde el servidor
    void refresh();
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [refresh]);

  // Solo baja al final cuando llegan mensajes nuevos; si no, no le quita el scroll a quien está leyendo arriba.
  useEffect(() => {
    if (messages && messages.length !== lastCount.current) {
      endRef.current?.scrollIntoView({ block: "end" });
      lastCount.current = messages.length;
    }
  }, [messages]);

  async function handleSend(text: string, file: File | null): Promise<boolean> {
    setError("");
    const result = await sendMessage(contractId, { text, file });
    if (result.error || !result.message) {
      setError(result.error ?? "No se pudo enviar el mensaje.");
      return false;
    }
    const sent = result.message;
    setMessages((current) => [...(current ?? []), sent]);
    return true;
  }

  async function handleOpen(message: ChatMessage) {
    const result = await openMessageAttachment(contractId, message.id);
    if (result.error) setError(result.error);
  }

  // El último mensaje mío que la otra persona ya leyó lleva "Visto".
  const lastSeenId = [...(messages ?? [])].reverse().find((message) => message.mine && message.read)?.id;

  return (
    <Card className="flex h-[calc(100dvh-7rem)] flex-col overflow-hidden lg:h-[calc(100vh-48px)] !p-0">
      <div className="flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-3 sm:px-5">
        <button
          type="button"
          onClick={onBack}
          aria-label="Volver a mensajes"
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <Avatar initials={counterpart.initials} name={counterpart.name} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{counterpart.name}</p>
          <p className="truncate text-[11px] text-slate-500">{title}</p>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-slate-50/70 px-4 py-5 sm:px-6">
        {messages === null ? (
          <p className="py-10 text-center text-sm text-slate-400">Cargando mensajes...</p>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <MessageCircle className="h-8 w-8 text-slate-300" />
            <p className="text-sm text-slate-500">Escribe el primer mensaje.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {messages.map((message, index) => (
              // Mensajes seguidos del mismo autor van más juntos que los de distinto autor.
              <div key={message.id} className={index === 0 ? "" : messages[index - 1].mine === message.mine ? "mt-1" : "mt-4"}>
                <MessageBubble message={message} seen={message.id === lastSeenId} onOpenAttachment={handleOpen} />
              </div>
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>

      {error && <p className="border-t border-red-100 bg-red-50 px-5 py-2 text-xs text-red-600">{error}</p>}
      <ChatComposer onSend={handleSend} />
    </Card>
  );
}
