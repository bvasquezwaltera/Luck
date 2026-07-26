import type { Dispatch, SetStateAction } from "react";
import { parsePeriod, formatPeriod, PRESENT } from "@/lib/periodFormat";
import type { FreelancerProfile } from "@/types/freelancerProfile";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { Input } from "@/ui/Input";
import { Select } from "@/ui/Select";
import { Textarea } from "@/ui/Textarea";

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 40 }, (_, index) => String(CURRENT_YEAR - index));

export function ExperienceSection({
  draftProfile,
  setDraftProfile,
}: {
  draftProfile: FreelancerProfile;
  setDraftProfile: Dispatch<SetStateAction<FreelancerProfile>>;
}) {
  return (
    <Card className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-900">Experiencia</h4>
      <div className="space-y-3">
        {draftProfile.experience.map((entry, index) => {
          const { from, to } = parsePeriod(entry.period);

          const updatePeriod = (nextFrom: string, nextTo: string) =>
            setDraftProfile((current) => ({
              ...current,
              experience: current.experience.map((value, valueIndex) =>
                valueIndex === index ? { ...value, period: formatPeriod(nextFrom, nextTo) } : value,
              ),
            }));

          return (
            <div key={index} className="rounded-lg border border-gray-200 p-3">
              <div className="grid gap-3 md:grid-cols-4">
                <Select label="Desde" value={from} onChange={(event) => updatePeriod(event.target.value, to)}>
                  <option value="" disabled>
                    Año
                  </option>
                  {YEARS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </Select>
                <Select label="Hasta" value={to} onChange={(event) => updatePeriod(from, event.target.value)}>
                  <option value={PRESENT}>Presente</option>
                  {YEARS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </Select>
                <Input
                  label="Rol"
                  value={entry.role}
                  onChange={(event) =>
                    setDraftProfile((current) => ({
                      ...current,
                      experience: current.experience.map((value, valueIndex) =>
                        valueIndex === index ? { ...value, role: event.target.value } : value,
                      ),
                    }))
                  }
                />
                <Input
                  label="Empresa"
                  value={entry.company}
                  onChange={(event) =>
                    setDraftProfile((current) => ({
                      ...current,
                      experience: current.experience.map((value, valueIndex) =>
                        valueIndex === index ? { ...value, company: event.target.value } : value,
                      ),
                    }))
                  }
                />
              </div>
              <div className="mt-3">
                <Textarea
                  label="Descripción"
                  value={entry.description}
                  onChange={(event) =>
                    setDraftProfile((current) => ({
                      ...current,
                      experience: current.experience.map((value, valueIndex) =>
                        valueIndex === index ? { ...value, description: event.target.value } : value,
                      ),
                    }))
                  }
                  rows={3}
                />
              </div>
              <div className="mt-3 flex justify-end">
                <Button
                  variant="outline-neutral"
                  className="!min-w-0 !border-red-200 !px-3 !text-red-600"
                  onClick={() =>
                    setDraftProfile((current) => ({
                      ...current,
                      experience: current.experience.filter((_, valueIndex) => valueIndex !== index),
                    }))
                  }
                >
                  Eliminar experiencia
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      <Button
        variant="outline-neutral"
        className="!min-w-0 !px-3"
        onClick={() =>
          setDraftProfile((current) => ({
            ...current,
            experience: [
              ...current.experience,
              {
                period: "",
                role: "",
                company: "",
                description: "",
              },
            ],
          }))
        }
      >
        + Agregar experiencia
      </Button>
    </Card>
  );
}
