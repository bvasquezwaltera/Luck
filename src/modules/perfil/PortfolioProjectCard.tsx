import { ExternalLink, Calendar, Clock } from "lucide-react";
import type { PortfolioProject } from "@/types/portfolioProject";
import { Card } from "@/ui/Card";
import { Badge } from "@/ui/Badge";

const CATEGORY_TEXT_CLASSES: Record<string, string> = {
  SaaS: "text-indigo-600",
  "Tienda Online": "text-pink-600",
  "Aplicación Web": "text-blue-600",
  "Aplicación Móvil": "text-amber-600",
  "Desarrollo Web": "text-teal-600",
};

export function PortfolioProjectCard({ project }: { project: PortfolioProject }) {
  return (
    <Card className="flex h-full flex-col gap-3 !p-0 overflow-hidden">
      <div className={`relative flex h-28 items-center justify-center px-4 ${project.bannerClassName}`}>
        <p className="text-center text-sm font-semibold text-white/90">{project.name}</p>
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Abrir ${project.name}`}
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="flex flex-1 flex-col gap-2 px-4 pb-4">
        <div className="flex flex-1 flex-col gap-2">
          <p
            className={`text-[11px] font-bold uppercase tracking-wide ${
              CATEGORY_TEXT_CLASSES[project.category] ?? "text-gray-500"
            }`}
          >
            {project.category}
          </p>
          <p className="text-sm font-bold text-gray-900">{project.name}</p>
          <p className="text-xs leading-relaxed text-gray-600">{project.description}</p>

          <div className="flex flex-wrap gap-1.5">
            {project.techStack.map((tech) => (
              <Badge key={tech} className="!px-2 !py-0.5 !text-[10px]">
                {tech}
              </Badge>
            ))}
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-2">
          <div className="flex items-center gap-3 text-[11px] text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {project.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {project.duration}
            </span>
          </div>

          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-semibold text-indigo-600"
          >
            Ver proyecto
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </Card>
  );
}
