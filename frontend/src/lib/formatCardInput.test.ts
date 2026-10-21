import { describe, expect, it } from "vitest";
import { formatCardNumber, formatCvc, formatExpiry, validateCardForm } from "@/lib/formatCardInput";

describe("formatos de tarjeta", () => {
  it("agrupa el número de a 4 y descarta lo que no son dígitos", () => {
    expect(formatCardNumber("4242424242424242")).toBe("4242 4242 4242 4242");
    expect(formatCardNumber("4242-abc 4242")).toBe("4242 4242");
    expect(formatCardNumber("12345678901234567890123")).toBe("1234 5678 9012 3456 789");
  });

  it("pone la barra del vencimiento", () => {
    expect(formatExpiry("1")).toBe("1");
    expect(formatExpiry("12")).toBe("12");
    expect(formatExpiry("1230")).toBe("12/30");
    expect(formatExpiry("12/3099")).toBe("12/30");
  });

  it("limita el código a 4 dígitos", () => {
    expect(formatCvc("12a345")).toBe("1234");
  });
});

describe("validateCardForm", () => {
  const now = new Date(2026, 9, 21); // 21 oct 2026
  const valid = { name: "Ana Pérez", number: "4242 4242 4242 4242", expiry: "12/30", cvc: "123" };

  it("acepta datos válidos", () => {
    expect(validateCardForm(valid, now)).toEqual({});
  });

  it("marca cada campo inválido", () => {
    const errors = validateCardForm({ name: " ", number: "4242", expiry: "1", cvc: "1" }, now);
    expect(Object.keys(errors).sort()).toEqual(["cvc", "expiry", "name", "number"]);
  });

  it("rechaza meses imposibles y tarjetas vencidas", () => {
    expect(validateCardForm({ ...valid, expiry: "13/30" }, now).expiry).toMatch(/mes/);
    expect(validateCardForm({ ...valid, expiry: "09/26" }, now).expiry).toMatch(/vencida/);
    expect(validateCardForm({ ...valid, expiry: "10/26" }, now).expiry).toBeUndefined();
  });
});
