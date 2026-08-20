import { apiFetch } from "@/lib/api/httpClient";
import type { PortfolioProject } from "@/types/portfolioProject";

export async function getPortfolioProjects(freelancerId: string): Promise<PortfolioProject[]> {
  const response = await apiFetch(`/api/portfolio-projects/${freelancerId}`);
  const { projects } = await response.json();
  return projects;
}

export async function addPortfolioProject(
  freelancerId: string,
  project: PortfolioProject,
): Promise<{ error?: string }> {
  const response = await apiFetch(`/api/portfolio-projects/${freelancerId}`, {
    method: "POST",
    body: JSON.stringify(project),
  });
  return response.json();
}

export async function deletePortfolioProject(
  freelancerId: string,
  projectId: string,
): Promise<{ error?: string }> {
  const response = await apiFetch(`/api/portfolio-projects/${freelancerId}/${projectId}`, {
    method: "DELETE",
  });
  return response.json();
}
