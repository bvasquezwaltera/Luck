import { describe, expect, it } from "vitest";
import { lockScroll } from "@/lib/scrollLock";

function body(overflow = "", paddingRight = "") {
  return { style: { overflow, paddingRight } };
}

describe("lockScroll", () => {
  it("oculta el scroll y compensa el ancho de la barra; al soltar, deja todo como estaba", () => {
    const target = body("auto", "4px");
    const release = lockScroll(target, 15);
    expect(target.style).toEqual({ overflow: "hidden", paddingRight: "15px" });

    release();
    expect(target.style).toEqual({ overflow: "auto", paddingRight: "4px" });
  });

  it("no agrega padding si la página no tenía barra de scroll", () => {
    const target = body();
    const release = lockScroll(target, 0);
    expect(target.style).toEqual({ overflow: "hidden", paddingRight: "" });
    release();
  });

  it("con dos modales abiertos, solo se desbloquea al cerrar el último (en cualquier orden)", () => {
    const target = body("visible");
    const first = lockScroll(target, 15);
    const second = lockScroll(target, 15);

    first();
    expect(target.style.overflow).toBe("hidden"); // el segundo sigue abierto
    second();
    expect(target.style.overflow).toBe("visible");

    const a = lockScroll(target, 15);
    const b = lockScroll(target, 15);
    b();
    expect(target.style.overflow).toBe("hidden");
    a();
    expect(target.style.overflow).toBe("visible");
  });

  it("soltar dos veces el mismo bloqueo no desbloquea a otro modal que sigue abierto", () => {
    const target = body();
    const first = lockScroll(target, 15);
    const second = lockScroll(target, 15);

    first();
    first();
    expect(target.style.overflow).toBe("hidden");
    second();
    expect(target.style.overflow).toBe("");
  });
});
