import type { PortfolioProject } from "@/types/portfolioProject";

export type PortfolioSortOrder = "recent" | "oldest";

export function filterPortfolioProjects(
  projects: PortfolioProject[],
  category: string,
  sortOrder: PortfolioSortOrder,
): PortfolioProject[] {
  const filtered =
    category === "all" ? projects : projects.filter((p) => p.category === category);

  const sorted = [...filtered].sort((a, b) => a.dateValue.localeCompare(b.dateValue));

  return sortOrder === "recent" ? sorted.reverse() : sorted;
}
