import { describe, expect, it } from "vitest";
import { describeDaysUntil } from "@/lib/relativeDays";

describe("describeDaysUntil", () => {
  const now = new Date("2026-10-21T12:00:00Z").getTime();

  it("describe fechas futuras", () => {
    expect(describeDaysUntil("2026-10-21T18:00:00Z", now)).toBe("Mañana"); // cuenta el día en curso
    expect(describeDaysUntil("2026-11-20T12:00:00Z", now)).toBe("Dentro de 30 días");
    expect(describeDaysUntil("2026-10-23T12:00:00Z", now)).toBe("Dentro de 2 días");
  });

  it("describe hoy y fechas pasadas", () => {
    expect(describeDaysUntil("2026-10-21T12:00:00Z", now)).toBe("Hoy");
    expect(describeDaysUntil("2026-10-20T06:00:00Z", now)).toBe("Ayer"); // hace 30 horas
    expect(describeDaysUntil("2026-10-21T06:00:00Z", now)).toBe("Hoy"); // hace 6 horas
    expect(describeDaysUntil("2026-10-19T12:00:00Z", now)).toBe("Hace 2 días");
  });
});
