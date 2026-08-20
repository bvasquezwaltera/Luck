"use client";

import { useMemo, useState } from "react";
import { FolderOpen } from "lucide-react";
import type { PortfolioProject } from "@/types/portfolioProject";
import { filterPortfolioProjects, type PortfolioSortOrder } from "@/lib/filterPortfolioProjects";
import { PortfolioFilters } from "@/modules/perfil/PortfolioFilters";
import { PortfolioProjectCard } from "@/modules/perfil/PortfolioProjectCard";
import { PortfolioContactBanner } from "@/modules/perfil/PortfolioContactBanner";
import { Card } from "@/ui/Card";

export function PortfolioTab({
  projects,
  email,
  showContactBanner = true,
}: {
  projects: PortfolioProject[];
  email: string;
  showContactBanner?: boolean;
}) {
  const [sortOrder, setSortOrder] = useState<PortfolioSortOrder>("recent");

  const visibleProjects = useMemo(
    () => filterPortfolioProjects(projects, "all", sortOrder),
    [projects, sortOrder],
  );

  if (projects.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center gap-2 py-12 text-center">
        <FolderOpen className="h-8 w-8 text-gray-300" />
        <p className="text-sm text-gray-500">Aún no hay proyectos en el portafolio.</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Portafolio</h2>
        <p className="text-xs text-gray-500">
          Una selección de proyectos en los que he trabajado.
        </p>
      </div>

      <PortfolioFilters sortOrder={sortOrder} onSortOrderChange={setSortOrder} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {visibleProjects.map((project) => (
          <PortfolioProjectCard key={project.id} project={project} />
        ))}
      </div>

      {showContactBanner && <PortfolioContactBanner email={email} />}
    </div>
  );
}
