"use client";

import { useState } from "react";
import { FolderOpen } from "lucide-react";
import { PanelSectionHeader } from "@/modules/panel/PanelSectionHeader";
import { PortfolioProjectCard } from "@/modules/perfil/PortfolioProjectCard";
import type { PortfolioProject } from "@/types/portfolioProject";
import { Button } from "@/ui/Button";

export function ProjectsSection() {
  const [projects] = useState<PortfolioProject[]>([]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <PanelSectionHeader
          subtitle="Bienvenido de nuevo"
          title="Contratos"
          actions={
            <Button variant="primary" className="!min-w-0 !px-4 bg-indigo-600 hover:bg-indigo-700">
              Nuevo contrato
            </Button>
          }
        />
      </div>

      {projects.length === 0 ? (
        <div className="flex min-h-[calc(100vh-260px)] flex-col items-center justify-center gap-2 rounded-2xl bg-white text-center shadow-sm">
          <FolderOpen className="h-8 w-8 text-gray-300" />
          <p className="text-sm text-gray-500">Aún no tienes contratos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {projects.map((project) => (
            <PortfolioProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
