"use client";

import { useEffect, useState } from "react";
import { FolderOpen, Trash2 } from "lucide-react";
import { PortfolioProjectCard } from "@/modules/perfil/PortfolioProjectCard";
import { NewProjectForm } from "@/modules/panel/freelancer/configuracion/proyecto/NewProjectForm";
import {
  addPortfolioProject,
  deletePortfolioProject,
  getPortfolioProjects,
} from "@/lib/api/client/portfolioProjects";
import type { PortfolioProject } from "@/types/portfolioProject";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { Modal } from "@/ui/Modal";

export function ProjectsSection({ freelancerId }: { freelancerId: string }) {
  const [projectList, setProjectList] = useState<PortfolioProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    getPortfolioProjects(freelancerId).then((data) => {
      setProjectList(data);
      setIsLoading(false);
    });
  }, [freelancerId]);

  async function handleCreate(project: PortfolioProject) {
    setShowForm(false);
    setProjectList((current) => [project, ...current]);
    await addPortfolioProject(freelancerId, project);
  }

  async function handleDelete(projectId: string) {
    setProjectList((current) => current.filter((project) => project.id !== projectId));
    await deletePortfolioProject(freelancerId, projectId);
  }

  if (isLoading) {
    return <p className="text-xs text-gray-500">Cargando proyectos...</p>;
  }

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
            <div key={project.id} className="relative">
              <PortfolioProjectCard project={project} />
              <button
                type="button"
                aria-label="Eliminar proyecto"
                onClick={() => handleDelete(project.id)}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-red-600 shadow"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)}>
        <NewProjectForm onCancel={() => setShowForm(false)} onCreate={handleCreate} />
      </Modal>
    </Card>
  );
}
