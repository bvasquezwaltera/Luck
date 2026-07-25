"use client";

import { useState } from "react";
import { FolderOpen } from "lucide-react";
import { PortfolioProjectCard } from "@/modules/perfil/PortfolioProjectCard";
import { NewProjectForm } from "@/modules/panel/freelancer/configuracion/proyecto/NewProjectForm";
import type { PortfolioProject } from "@/types/portfolioProject";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { Modal } from "@/ui/Modal";

export function ProjectsSection() {
  const [projectList, setProjectList] = useState<PortfolioProject[]>([]);
  const [showForm, setShowForm] = useState(false);

  return (
    <Card className="flex min-h-[calc(100vh-160px)] flex-col space-y-3">
      <div className="flex items-center justify-end">
        <Button
          variant="primary"
          className="!min-w-0 !px-4 bg-indigo-600 hover:bg-indigo-700"
          onClick={() => setShowForm(true)}
        >
          Nuevo proyecto
        </Button>
      </div>

      {projectList.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
          <FolderOpen className="h-8 w-8 text-gray-300" />
          <p className="text-sm text-gray-500">Aún no tienes proyectos en tu portafolio.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {projectList.map((project) => (
            <PortfolioProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)}>
        <NewProjectForm
          onCancel={() => setShowForm(false)}
          onCreate={(project) => {
            setProjectList((current) => [project, ...current]);
            setShowForm(false);
          }}
        />
      </Modal>
    </Card>
  );
}
