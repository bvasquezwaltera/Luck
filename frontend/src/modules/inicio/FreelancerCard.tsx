import { Star, Briefcase } from "lucide-react";
import * as Flags from "country-flag-icons/react/3x2";
import { visibleSkills } from "@/lib/visibleSkills";
import type { Freelancer } from "@/types/freelancer";
import { Card } from "@/ui/Card";
import { Avatar } from "@/ui/Avatar";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";

export function FreelancerCard({ freelancer }: { freelancer: Freelancer }) {
  const Flag = Flags[freelancer.countryCode as keyof typeof Flags];
  // Solo las primeras habilidades: si se mostraran todas, la tarjeta crecería con cada una que se agregue.
  const { shown, hidden } = visibleSkills(freelancer.skills);

  return (
    <Card className="flex h-full flex-col gap-3">
      <div className="flex flex-1 flex-col gap-3">
        <div className="flex items-start gap-3">
          <Avatar initials={freelancer.initials} name={freelancer.name} />
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-gray-900">{freelancer.name}</p>
            <p className="flex items-center gap-1 text-xs text-gray-600">
              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
              {freelancer.rating.toFixed(1)}{" "}
              <span className="text-gray-400">({freelancer.reviewCount})</span>
            </p>
            <p className="text-xs text-gray-700">{freelancer.specialty}</p>
            <p className="flex items-center gap-1.5 text-xs text-gray-500">
              {Flag && <Flag className="h-3 w-4 rounded-[1px]" />}
              {freelancer.country}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {shown.map((skill) => (
            <Badge key={skill} className="max-w-full !px-2 !py-0.5 !text-[10px]">
              <span className="block truncate" title={skill}>
                {skill}
              </span>
            </Badge>
          ))}
          {hidden.length > 0 && (
            <Badge className="!bg-indigo-50 !px-2 !py-0.5 !text-[10px] !text-indigo-600">
              <span title={hidden.join(", ")}>+{hidden.length} más</span>
            </Badge>
          )}
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between">
        <div>
          <p className="flex items-center gap-1.5 text-xs text-gray-500">
            <Briefcase className="h-3 w-3" />
            {freelancer.projectCount} proyectos
          </p>
          <p className="text-xs font-semibold text-gray-900">
            Desde ${freelancer.monthlyPriceFrom}/mes
          </p>
        </div>
        <Button variant="outline" href={`/perfil/${freelancer.id}`}>
          Ver perfil
        </Button>
      </div>
    </Card>
  );
}
