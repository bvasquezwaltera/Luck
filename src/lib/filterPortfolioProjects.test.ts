import { describe, expect, it } from "vitest";
import { filterPortfolioProjects } from "@/lib/filterPortfolioProjects";
import type { PortfolioProject } from "@/types/portfolioProject";

function makeProject(overrides: Partial<PortfolioProject>): PortfolioProject {
  return {
    id: "p-1",
    name: "Project",
    category: "SaaS",
    description: "Description",
    techStack: [],
    date: "Ene 2024",
    dateValue: "2024-01",
    duration: "1 semana",
    url: "https://example.com",
    bannerClassName: "bg-indigo-600",
    ...overrides,
  };
}

const projects: PortfolioProject[] = [
  makeProject({ id: "p-1", category: "SaaS", dateValue: "2024-05" }),
  makeProject({ id: "p-2", category: "Tienda Online", dateValue: "2024-01" }),
  makeProject({ id: "p-3", category: "SaaS", dateValue: "2024-03" }),
];

describe("filterPortfolioProjects", () => {
  it("returns all projects sorted by most recent when category is 'all'", () => {
    const result = filterPortfolioProjects(projects, "all", "recent");
    expect(result.map((p) => p.id)).toEqual(["p-1", "p-3", "p-2"]);
  });

  it("filters by category", () => {
    const result = filterPortfolioProjects(projects, "SaaS", "recent");
    expect(result.map((p) => p.id)).toEqual(["p-1", "p-3"]);
  });

  it("sorts by oldest first when requested", () => {
    const result = filterPortfolioProjects(projects, "all", "oldest");
    expect(result.map((p) => p.id)).toEqual(["p-2", "p-3", "p-1"]);
  });
});
