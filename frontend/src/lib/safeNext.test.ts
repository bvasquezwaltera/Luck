import { describe, expect, it } from "vitest";
import { getSafeNext, withNext } from "@/lib/safeNext";

describe("getSafeNext", () => {
  it("acepta rutas internas, con query", () => {
    expect(getSafeNext("/perfil/abc?plan=1&tab=suscripciones")).toBe("/perfil/abc?plan=1&tab=suscripciones");
  });

  it("rechaza URLs absolutas y rutas que salen del sitio", () => {
    expect(getSafeNext("https://malo.com")).toBeNull();
    expect(getSafeNext("//malo.com")).toBeNull();
    expect(getSafeNext("/\\malo.com")).toBeNull();
    expect(getSafeNext("javascript:alert(1)")).toBeNull();
  });

  it("rechaza valores vacíos o que no son texto", () => {
    expect(getSafeNext(undefined)).toBeNull();
    expect(getSafeNext(null)).toBeNull();
    expect(getSafeNext(["/a", "/b"])).toBeNull();
    expect(getSafeNext("")).toBeNull();
  });
});

describe("withNext", () => {
  it("agrega next codificado solo si existe", () => {
    expect(withNext("/login", "/perfil/a?plan=1")).toBe("/login?next=%2Fperfil%2Fa%3Fplan%3D1");
    expect(withNext("/login", null)).toBe("/login");
  });
});
