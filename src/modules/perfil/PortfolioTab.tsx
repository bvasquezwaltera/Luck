"use client";

import { useMemo, useState } from "react";
import type { PortfolioProject } from "@/types/portfolioProject";
import { filterPortfolioProjects, type PortfolioSortOrder } from "@/lib/filterPortfolioProjects";
import { PortfolioFilters } from "@/modules/perfil/PortfolioFilters";
import { PortfolioProjectCard } from "@/modules/perfil/PortfolioProjectCard";
import { PortfolioContactBanner } from "@/modules/perfil/PortfolioContactBanner";

export function PortfolioTab({
  projects,
  email,
}: {
  projects: PortfolioProject[];
  email: string;
}) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState<PortfolioSortOrder>("recent");

  const categories = useMemo(
    () => Array.from(new Set(projects.map((p) => p.category))),
    [projects],
  );

  const visibleProjects = useMemo(
    () => filterPortfolioProjects(projects, activeCategory, sortOrder),
    [projects, activeCategory, sortOrder],
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Portafolio</h2>
        <p className="text-xs text-gray-500">
          Una selección de proyectos en los que he trabajado.
        </p>
      </div>

      <PortfolioFilters
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {visibleProjects.map((project) => (
          <PortfolioProjectCard key={project.id} project={project} />
        ))}
      </div>

      <PortfolioContactBanner email={email} />
    </div>
  );
}
