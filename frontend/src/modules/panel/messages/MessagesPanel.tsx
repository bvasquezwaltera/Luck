"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronRight, MessageCircle } from "lucide-react";
import { PanelSectionHeader } from "@/modules/panel/PanelSectionHeader";
import { ChatView } from "@/modules/panel/messages/ChatView";
import { fetchConversations } from "@/lib/api/client/messages";
import { formatConversationTime } from "@/lib/formatMessageTime";
import type { Conversation } from "@/types/message";
import { Avatar } from "@/ui/Avatar";
import { Card } from "@/ui/Card";

const POLL_MS = 8000;

// Pantalla de Mensajes, igual para cliente y freelancer: un chat por contrato.
export function MessagesPanel({ subtitle }: { subtitle: string }) {
  const [conversations, setConversations] = useState<Conversation[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const result = await fetchConversations();
    if (result) {
      setConversations(result);
      setFailed(false);
    } else {
      setFailed(true);
    }
  }, []);

  // Se consulta al entrar y cada pocos segundos mientras la pestaña está visible.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial desde el servidor
    void refresh();
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [refresh]);

  const active = conversations?.find((conversation) => conversation.contractId === activeId) ?? null;

  if (active) {
    return (
      <ChatView
        conversation={active}
        onBack={() => {
          setActiveId(null);
          void refresh();
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
        <PanelSectionHeader icon={MessageCircle} subtitle={subtitle} title="Mensajes" />
      </div>

      <Card className="flex flex-col !p-0">
        {conversations === null ? (
          <div className="p-10 text-center text-sm text-slate-500">
            {failed ? "No se pudieron cargar tus conversaciones." : "Cargando conversaciones..."}
            {failed && (
              <button
                type="button"
                onClick={() => void refresh()}
                className="mt-2 block w-full text-xs font-medium text-indigo-600 hover:text-indigo-700"
              >
                Reintentar
              </button>
            )}
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex min-h-[calc(100vh-260px)] flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
            <MessageCircle className="h-8 w-8 text-slate-300" />
            <p className="text-sm font-medium text-slate-700">Aún no tienes conversaciones</p>
            <p className="max-w-sm text-xs text-slate-500">
              El chat con un freelancer o un cliente se abre cuando hay un contrato activo entre ustedes.
            </p>
          </div>
        ) : (
          conversations.map((conversation) => {
            const { lastMessage, unread } = conversation;
            return (
              <button
                type="button"
                key={conversation.contractId}
                onClick={() => setActiveId(conversation.contractId)}
                className="group flex w-full items-center gap-4 border-b border-slate-100 px-5 py-4 text-left transition-colors last:border-b-0 hover:bg-indigo-50/40 focus-visible:bg-indigo-50/40 focus-visible:outline-none"
              >
                <Avatar initials={conversation.counterpart.initials} name={conversation.counterpart.name} size="md" />

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate text-sm font-semibold text-slate-900">{conversation.counterpart.name}</p>
                    {lastMessage && (
                      <span className="shrink-0 text-[11px] text-slate-400">
                        {formatConversationTime(lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-[11px] text-indigo-600">{conversation.title}</p>
                  <div className="mt-0.5 flex items-center gap-2">
                    {unread > 0 && <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-600" aria-label="Sin leer" />}
                    <p className={`truncate text-sm ${unread > 0 ? "font-medium text-slate-800" : "text-slate-500"}`}>
                      {lastMessage
                        ? `${lastMessage.mine ? "Tú: " : ""}${lastMessage.text}`
                        : "Aún no hay mensajes. Escribe el primero."}
                    </p>
                  </div>
                </div>

                {unread > 0 ? (
                  <span className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-xs font-semibold text-white">
                    {unread}
                  </span>
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-indigo-500" />
                )}
              </button>
            );
          })
        )}
      </Card>
    </div>
  );
}
