import type { Dispatch, SetStateAction } from "react";
import type { FreelancerProfile } from "@/types/freelancerProfile";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { Input } from "@/ui/Input";

export function SkillsSection({
  draftProfile,
  setDraftProfile,
}: {
  draftProfile: FreelancerProfile;
  setDraftProfile: Dispatch<SetStateAction<FreelancerProfile>>;
}) {
  return (
    <Card className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-900">Habilidades</h4>

      <div className="space-y-3">
        {draftProfile.skills.map((skill, index) => (
          <div key={`${skill}-${index}`} className="rounded-lg border border-gray-200 p-3">
            <Input
              label="Habilidad"
              value={skill}
              onChange={(event) =>
                setDraftProfile((current) => ({
                  ...current,
                  skills: current.skills.map((value, valueIndex) =>
                    valueIndex === index ? event.target.value : value,
                  ),
                }))
              }
            />
            <div className="mt-3 flex justify-end">
              <Button
                variant="outline-neutral"
                className="!min-w-0 !border-red-200 !px-3 !text-red-600"
                onClick={() =>
                  setDraftProfile((current) => ({
                    ...current,
                    skills: current.skills.filter((_, valueIndex) => valueIndex !== index),
                  }))
                }
              >
                Quitar
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="outline-neutral"
        className="!min-w-0 !px-3"
        onClick={() =>
          setDraftProfile((current) => ({
            ...current,
            skills: [...current.skills, ""],
          }))
        }
      >
        + Agregar habilidad
      </Button>
    </Card>
  );
}
