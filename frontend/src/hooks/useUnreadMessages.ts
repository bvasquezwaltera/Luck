"use client";

import { useEffect, useState } from "react";
import { fetchUnreadCount, MESSAGES_CHANGED_EVENT } from "@/lib/api/client/messages";

const POLL_MS = 15000;

// Total de mensajes sin leer, para la insignia del menú. Se actualiza cada rato y al instante cuando se lee un chat.
export function useUnreadMessages(enabled: boolean): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let active = true;

    async function refresh() {
      const result = await fetchUnreadCount();
      // Si falla, se conserva el último número en vez de borrar la insignia.
      if (active && result !== null) setCount(result);
    }

    void refresh();
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, POLL_MS);
    window.addEventListener(MESSAGES_CHANGED_EVENT, refresh);
    return () => {
      active = false;
      clearInterval(timer);
      window.removeEventListener(MESSAGES_CHANGED_EVENT, refresh);
    };
  }, [enabled]);

  return count;
}
