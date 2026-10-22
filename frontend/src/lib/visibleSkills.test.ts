import { describe, expect, it } from "vitest";
import { visibleSkills } from "@/lib/visibleSkills";

describe("visibleSkills", () => {
  it("shows the first two and hides the rest", () => {
    const skills = ["Full Stack", "Aplicaciones web", "SaaS", "Landing pages", "APIs"];
    expect(visibleSkills(skills)).toEqual({ shown: ["Full Stack", "Aplicaciones web"], hidden: ["SaaS", "Landing pages", "APIs"] });
  });

  it("hides nothing when they fit", () => {
    expect(visibleSkills(["Python"])).toEqual({ shown: ["Python"], hidden: [] });
    expect(visibleSkills([])).toEqual({ shown: [], hidden: [] });
  });

  it("ignores empty entries and spaces", () => {
    expect(visibleSkills([" Python ", "", "  ", "React", "SQL"])).toEqual({ shown: ["Python", "React"], hidden: ["SQL"] });
  });
});
