"use client";

import { useState } from "react";
import { ChevronRight, MessageCircle } from "lucide-react";
import { PanelSectionHeader } from "@/modules/panel/PanelSectionHeader";
import { ChatView, type ChatMessage } from "@/modules/panel/client/messages/chat/ChatView";
import { Avatar } from "@/ui/Avatar";
import { Card } from "@/ui/Card";

const conversations = [
  {
    name: "Diego B.",
    initials: "DB",
    body: "Ya subí el primer avance del dashboard.",
    time: "Hace 10 min",
    history: [
      { from: "them", text: "Hola! Arrancando con el dashboard, te aviso avances.", time: "10:02" },
      { from: "them", text: "Ya subí el primer avance del dashboard.", time: "10:05" },
    ] as ChatMessage[],
  },
  {
    name: "Camila S.",
    initials: "CS",
    body: "Te comparto las 3 propuestas de diseño.",
    time: "Hace 2 horas",
    history: [
      { from: "them", text: "Te comparto las 3 propuestas de diseño.", time: "08:15" },
    ] as ChatMessage[],
  },
  {
    name: "Lucas L.",
    initials: "LL",
    body: "Confirmamos el cronograma de la campaña.",
    time: "Ayer",
    history: [
      { from: "them", text: "Confirmamos el cronograma de la campaña.", time: "Ayer, 18:40" },
    ] as ChatMessage[],
  },
];

export function MessagesSection() {
  const [activeContact, setActiveContact] = useState<string | null>(null);

  const activeConversation = conversations.find((c) => c.name === activeContact);

  return (
    <div className="space-y-4">
      {!activeConversation && (
        <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
          <PanelSectionHeader icon={MessageCircle} subtitle="Conversa con tus freelancers." title="Mensajes" />
        </div>
      )}

      {activeConversation ? (
        <ChatView
          contactName={activeConversation.name}
          contactInitials={activeConversation.initials}
          initialMessages={activeConversation.history}
          onBack={() => setActiveContact(null)}
        />
      ) : (
        <Card className="flex flex-col !p-0">
          {conversations.length === 0 ? (
            <div className="flex min-h-[calc(100vh-160px)] flex-1 flex-col items-center justify-center gap-2 text-center">
              <MessageCircle className="h-8 w-8 text-gray-300" />
              <p className="text-sm text-gray-500">Aún no tienes mensajes.</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <button
                type="button"
                key={conversation.name}
                onClick={() => setActiveContact(conversation.name)}
                className="group flex w-full items-center gap-4 border-b border-slate-100 px-5 py-4 text-left transition-colors last:border-b-0 hover:bg-indigo-50/40 focus-visible:bg-indigo-50/40 focus-visible:outline-none"
              >
                <Avatar initials={conversation.initials} name={conversation.name} size="md" />

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate text-sm font-semibold text-slate-900">{conversation.name}</p>
                    <span className="shrink-0 text-[11px] text-slate-400">{conversation.time}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-600" aria-label="Sin leer" />
                    <p className="truncate text-sm font-medium text-slate-700">{conversation.body}</p>
                  </div>
                </div>

                <span className="hidden shrink-0 items-center gap-1 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition group-hover:bg-indigo-600 group-hover:text-white sm:inline-flex">
                  Responder
                  <ChevronRight className="h-3.5 w-3.5" />
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 sm:hidden" />
              </button>
            ))
          )}
        </Card>
      )}
    </div>
  );
}
