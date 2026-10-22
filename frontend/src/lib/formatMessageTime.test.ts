import { describe, expect, it } from "vitest";
import { formatConversationTime, formatMessageTime } from "@/lib/formatMessageTime";

// 15 de octubre de 2026, 15:00 en Lima (UTC-5).
const NOW = new Date("2026-10-15T20:00:00Z");

describe("formatMessageTime", () => {
  it("muestra solo la hora si es de hoy", () => {
    expect(formatMessageTime("2026-10-15T19:05:00Z", NOW)).toBe("14:05");
  });

  it("usa 'Ayer' para el día anterior y la fecha para los demás", () => {
    expect(formatMessageTime("2026-10-14T19:05:00Z", NOW)).toBe("Ayer, 14:05");
    expect(formatMessageTime("2026-10-10T19:05:00Z", NOW)).toMatch(/^10 oct\.?, 14:05$/);
  });

  it("cuenta el día en hora de Lima, no en UTC", () => {
    // 02:00 UTC del 16 sigue siendo el 15 en Lima.
    expect(formatMessageTime("2026-10-16T02:00:00Z", NOW)).toBe("21:00");
  });
});

describe("formatConversationTime", () => {
  it("hora, 'Ayer' o fecha corta", () => {
    expect(formatConversationTime("2026-10-15T19:05:00Z", NOW)).toBe("14:05");
    expect(formatConversationTime("2026-10-14T19:05:00Z", NOW)).toBe("Ayer");
    expect(formatConversationTime("2026-10-10T19:05:00Z", NOW)).toMatch(/^10 oct\.?$/);
  });
});
