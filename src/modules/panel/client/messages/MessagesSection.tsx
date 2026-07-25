"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { PanelSectionHeader } from "@/modules/panel/PanelSectionHeader";
import { ChatView, type ChatMessage } from "@/modules/panel/client/messages/chat/ChatView";
import { Avatar } from "@/ui/Avatar";
import { Button } from "@/ui/Button";
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
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <PanelSectionHeader subtitle="Bienvenido de nuevo" title="Mensajes" />
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
        <Card className="flex min-h-[calc(100vh-160px)] flex-col !p-0">
          {conversations.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
              <MessageCircle className="h-8 w-8 text-gray-300" />
              <p className="text-sm text-gray-500">Aún no tienes mensajes.</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.name}
                className="flex items-center gap-4 border-b border-gray-100 px-5 py-4 transition-colors last:border-b-0 hover:bg-gray-50"
              >
                <Avatar initials={conversation.initials} name={conversation.name} size="sm" />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-600" />
                    <p className="text-sm font-semibold text-gray-900">{conversation.name}</p>
                  </div>
                  <p className="truncate text-xs text-gray-600">{conversation.body}</p>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span className="text-[11px] text-gray-400">{conversation.time}</span>
                  <Button
                    variant="outline-neutral"
                    className="!min-w-0 !px-3"
                    onClick={() => setActiveContact(conversation.name)}
                  >
                    Responder
                  </Button>
                </div>
              </div>
            ))
          )}
        </Card>
      )}
    </div>
  );
}
