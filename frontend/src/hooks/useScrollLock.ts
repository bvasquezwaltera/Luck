"use client";

import { useEffect } from "react";
import { lockScroll } from "@/lib/scrollLock";

// Mientras `active` sea true, la página de atrás no se desplaza.
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    return lockScroll(document.body, scrollbarWidth);
  }, [active]);
}
