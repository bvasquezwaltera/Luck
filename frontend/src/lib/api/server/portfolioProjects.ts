import "server-only";
import { apiFetchServer } from "@/lib/api/server/httpServer";
import type { PortfolioProject } from "@/types/portfolioProject";

export async function getPortfolioProjects(freelancerId: string): Promise<PortfolioProject[]> {
  const response = await apiFetchServer(`/api/portfolio-projects/${freelancerId}`);
  const { projects } = (await response.json()) as { projects: PortfolioProject[] };
  return projects;
}
