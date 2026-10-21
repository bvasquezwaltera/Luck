import { describe, expect, it } from "vitest";
import { DELIVERY_MAX_FILE_BYTES, pickDeliveryFiles, resolveAttachments, validateLink } from "@/lib/deliveryFiles";

function file(name: string, size = 100) {
  return new File([new Uint8Array(size)], name);
}

describe("pickDeliveryFiles", () => {
  it("acepta los formatos permitidos", () => {
    const { accepted, error } = pickDeliveryFiles([], [file("a.pdf"), file("b.ZIP"), file("c.docx")]);
    expect(accepted.map((value) => value.name)).toEqual(["a.pdf", "b.ZIP", "c.docx"]);
    expect(error).toBe("");
  });

  it("rechaza ejecutables, vacíos y archivos de más de 25 MB", () => {
    expect(pickDeliveryFiles([], [file("virus.exe")]).error).toMatch(/formato no permitido/);
    expect(pickDeliveryFiles([], [file("a.pdf", 0)]).error).toMatch(/vacío/);
    expect(pickDeliveryFiles([], [file("a.zip", DELIVERY_MAX_FILE_BYTES + 1)]).error).toMatch(/25 MB/);
  });

  it("limita a 5 archivos y a 50 MB por envío, sin duplicados", () => {
    const six = Array.from({ length: 6 }, (_, index) => file(`${index}.pdf`));
    const { accepted, error } = pickDeliveryFiles([], six);
    expect(accepted).toHaveLength(5);
    expect(error).toMatch(/hasta 5/);

    const big = [file("a.zip", 20 * 1024 * 1024), file("b.zip", 20 * 1024 * 1024), file("c.zip", 20 * 1024 * 1024)];
    const result = pickDeliveryFiles([], big);
    expect(result.accepted).toHaveLength(2);
    expect(result.error).toMatch(/50 MB/);

    expect(pickDeliveryFiles(pickDeliveryFiles([], [file("a.pdf")]).accepted, [file("a.pdf")]).accepted).toHaveLength(1);
  });
});

describe("validateLink", () => {
  it("acepta http y https", () => {
    expect(validateLink("https://www.figma.com/proto/abc")).toBeNull();
    expect(validateLink("http://localhost:3000/x")).toBeNull();
  });

  it("rechaza otros protocolos y texto suelto", () => {
    expect(validateLink("javascript:alert(1)")).not.toBeNull();
    expect(validateLink("ftp://x.com/a")).not.toBeNull();
    expect(validateLink("figma.com/proto")).not.toBeNull();
    expect(validateLink("   ")).not.toBeNull();
  });
});

describe("resolveAttachments", () => {
  const empty = { files: [], links: [], pendingLink: "" };

  it("sin enlace pendiente deja los adjuntos como están", () => {
    expect(resolveAttachments({ ...empty, links: ["https://a.com/x"] })).toEqual({ files: [], links: ["https://a.com/x"] });
  });

  it("incluye el enlace escrito que no se agregó con el botón", () => {
    expect(resolveAttachments({ ...empty, pendingLink: " https://figma.com/proto/abc " })).toEqual({
      files: [],
      links: ["https://figma.com/proto/abc"],
    });
  });

  it("no lo duplica si ya estaba agregado", () => {
    const result = resolveAttachments({ ...empty, links: ["https://a.com/x"], pendingLink: "https://a.com/x" });
    expect(result).toEqual({ files: [], links: ["https://a.com/x"] });
  });

  it("avisa en vez de perder en silencio un enlace inválido o de más", () => {
    expect(resolveAttachments({ ...empty, pendingLink: "figma.com/proto" })).toHaveProperty("error");
    const five = Array.from({ length: 5 }, (_, index) => `https://a.com/${index}`);
    expect(resolveAttachments({ ...empty, links: five, pendingLink: "https://a.com/otro" })).toHaveProperty("error");
  });
});
