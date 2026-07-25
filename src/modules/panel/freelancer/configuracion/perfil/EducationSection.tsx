import type { Dispatch, SetStateAction } from "react";
import type { FreelancerProfile } from "@/types/freelancerProfile";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { Input } from "@/ui/Input";

export function EducationSection({
  draftProfile,
  setDraftProfile,
}: {
  draftProfile: FreelancerProfile;
  setDraftProfile: Dispatch<SetStateAction<FreelancerProfile>>;
}) {
  return (
    <Card className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-900">Educación</h4>
      <div className="space-y-3">
        {draftProfile.education.map((entry, index) => (
          <div key={`${entry.degree}-${index}`} className="rounded-lg border border-gray-200 p-3">
            <div className="grid gap-3 md:grid-cols-3">
              <Input
                label="Periodo"
                value={entry.period}
                onChange={(event) =>
                  setDraftProfile((current) => ({
                    ...current,
                    education: current.education.map((value, valueIndex) =>
                      valueIndex === index ? { ...value, period: event.target.value } : value,
                    ),
                  }))
                }
              />
              <Input
                label="Título"
                value={entry.degree}
                onChange={(event) =>
                  setDraftProfile((current) => ({
                    ...current,
                    education: current.education.map((value, valueIndex) =>
                      valueIndex === index ? { ...value, degree: event.target.value } : value,
                    ),
                  }))
                }
              />
              <Input
                label="Institución"
                value={entry.institution}
                onChange={(event) =>
                  setDraftProfile((current) => ({
                    ...current,
                    education: current.education.map((value, valueIndex) =>
                      valueIndex === index ? { ...value, institution: event.target.value } : value,
                    ),
                  }))
                }
              />
            </div>
            <div className="mt-3 flex justify-end">
              <Button
                variant="outline-neutral"
                className="!min-w-0 !border-red-200 !px-3 !text-red-600"
                onClick={() =>
                  setDraftProfile((current) => ({
                    ...current,
                    education: current.education.filter((_, valueIndex) => valueIndex !== index),
                  }))
                }
              >
                Eliminar educación
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
            education: [
              ...current.education,
              {
                period: "",
                degree: "",
                institution: "",
              },
            ],
          }))
        }
      >
        + Agregar educación
      </Button>
    </Card>
  );
}
