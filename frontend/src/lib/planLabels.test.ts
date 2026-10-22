import { describe, expect, it } from "vitest";
import { activeProjectsLabel, planFeatureLines, revisionsLabel } from "@/lib/planLabels";

describe("plan labels", () => {
  it("turns a bare number into a sentence, with the right plural", () => {
    expect(activeProjectsLabel("2")).toBe("2 proyectos activos");
    expect(activeProjectsLabel("1")).toBe("1 proyecto activo");
    expect(revisionsLabel("2")).toBe("2 revisiones");
    expect(revisionsLabel("1")).toBe("1 revisión");
  });

  it("keeps free text but says what it is", () => {
    expect(activeProjectsLabel("Ilimitados")).toBe("Proyectos activos: Ilimitados");
    expect(revisionsLabel("Hasta 3 por entrega")).toBe("Revisiones: Hasta 3 por entrega");
  });

  it("ignores spaces and omits empty values", () => {
    expect(revisionsLabel("  4 ")).toBe("4 revisiones");
    expect(activeProjectsLabel("")).toBeNull();
    expect(revisionsLabel("   ")).toBeNull();
  });

  it("builds the lines shown to the client, without blank ones", () => {
    expect(
      planFeatureLines({
        activeProjects: "2",
        revisions: "2",
        features: [{ label: "Cambios de diseño", value: "10" }],
      }),
    ).toEqual(["2 proyectos activos", "2 revisiones", "Cambios de diseño: 10"]);

    expect(planFeatureLines({ activeProjects: "", revisions: "", features: [] })).toEqual([]);
  });
});
