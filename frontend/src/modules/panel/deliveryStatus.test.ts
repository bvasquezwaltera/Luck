import { describe, expect, it } from "vitest";
import { deliveryStatusFor, dueDateHint } from "@/modules/panel/deliveryStatus";

describe("dueDateHint", () => {
  const today = new Date(2026, 9, 21); // 21 oct 2026

  it("describe los días que faltan", () => {
    expect(dueDateHint("2026-10-21", today)).toEqual({ text: "Vence hoy", overdue: false });
    expect(dueDateHint("2026-10-22", today)).toEqual({ text: "Vence mañana", overdue: false });
    expect(dueDateHint("2026-10-26", today)).toEqual({ text: "Vence en 5 días", overdue: false });
  });

  it("marca como vencida una fecha pasada", () => {
    expect(dueDateHint("2026-10-20", today)).toEqual({ text: "Venció ayer", overdue: true });
    expect(dueDateHint("2026-10-10", today)).toEqual({ text: "Venció hace 11 días", overdue: true });
  });

  it("cuenta bien al cruzar de mes y de año", () => {
    expect(dueDateHint("2026-11-01", today).text).toBe("Vence en 11 días");
    expect(dueDateHint("2027-01-01", new Date(2026, 11, 31)).text).toBe("Vence mañana");
  });
});

describe("deliveryStatusFor", () => {
  it("el ámbar es para lo que le toca hacer a quien mira", () => {
    expect(deliveryStatusFor("en_revision", "client").tone).toBe("amber");
    expect(deliveryStatusFor("en_revision", "freelancer").tone).toBe("indigo");
    expect(deliveryStatusFor("cambios_solicitados", "freelancer").tone).toBe("amber");
    expect(deliveryStatusFor("cambios_solicitados", "client").tone).toBe("indigo");
  });

  it("nueva es neutra y aprobada es verde para los dos", () => {
    for (const viewer of ["client", "freelancer"] as const) {
      expect(deliveryStatusFor("pendiente", viewer).tone).toBe("slate");
      expect(deliveryStatusFor("aprobada", viewer)).toEqual({ tone: "emerald", label: "Culminado" });
    }
  });
});
