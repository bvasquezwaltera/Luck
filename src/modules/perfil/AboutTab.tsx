import { BookOpen, Star, Briefcase, GraduationCap, Code2, CheckCircle2, UserCircle } from "lucide-react";
import type { FreelancerProfile } from "@/types/freelancerProfile";
import { Card } from "@/ui/Card";
import { Badge } from "@/ui/Badge";

export function AboutTab({ profile }: { profile: FreelancerProfile }) {
  const isEmpty =
    !profile.bio &&
    profile.differentiators.length === 0 &&
    profile.experience.length === 0 &&
    profile.education.length === 0 &&
    profile.tools.length === 0;

  if (isEmpty) {
    return (
      <Card className="flex flex-col items-center justify-center gap-2 py-12 text-center">
        <UserCircle className="h-8 w-8 text-gray-300" />
        <p className="text-sm text-gray-500">Este freelancer aún no completó su perfil.</p>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-6">
      <h2 className="text-lg font-bold text-gray-900">Sobre mí</h2>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <BookOpen className="h-4 w-4 text-gray-400" />
            Mi historia
          </h3>
          <p className="text-xs leading-relaxed text-gray-600">{profile.bio}</p>
        </div>

        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Star className="h-4 w-4 text-gray-400" />
            Lo que me diferencia
          </h3>
          <ul className="flex flex-col gap-2">
            {profile.differentiators.map((item) => (
              <li key={item} className="flex items-start gap-2 text-xs text-gray-600">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 border-t border-gray-200 pt-6 md:grid-cols-3">
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Briefcase className="h-4 w-4 text-gray-400" />
            Experiencia
          </h3>
          <ul className="flex flex-col gap-4 border-l border-gray-200 pl-4">
            {profile.experience.map((entry) => (
              <li key={`${entry.role}-${entry.period}`} className="relative">
                <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-indigo-500" />
                <p className="text-[11px] text-gray-400">{entry.period}</p>
                <p className="text-xs font-semibold text-gray-900">{entry.role}</p>
                <p className="text-xs text-gray-500">{entry.company}</p>
                <p className="mt-1 text-xs leading-relaxed text-gray-600">
                  {entry.description}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <GraduationCap className="h-4 w-4 text-gray-400" />
            Educación
          </h3>
          <ul className="flex flex-col gap-4 border-l border-gray-200 pl-4">
            {profile.education.map((entry) => (
              <li key={`${entry.degree}-${entry.period}`} className="relative">
                <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-indigo-500" />
                <p className="text-[11px] text-gray-400">{entry.period}</p>
                <p className="text-xs font-semibold text-gray-900">{entry.degree}</p>
                <p className="text-xs text-gray-500">{entry.institution}</p>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Code2 className="h-4 w-4 text-gray-400" />
            Herramientas y tecnologías
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {profile.tools.map((tool) => (
              <Badge key={tool} className="!px-2 !py-0.5 !text-[10px]">
                {tool}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
