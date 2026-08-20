import type { Dispatch, SetStateAction } from "react";
import { parsePeriod, formatPeriod } from "@/lib/periodFormat";
import type { FreelancerProfile } from "@/types/freelancerProfile";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { Input } from "@/ui/Input";
import { Select } from "@/ui/Select";

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 40 }, (_, index) => String(CURRENT_YEAR - index));

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
        {draftProfile.education.map((entry, index) => {
          const { from, to } = parsePeriod(entry.period);

          const updatePeriod = (nextFrom: string, nextTo: string) =>
            setDraftProfile((current) => ({
              ...current,
              education: current.education.map((value, valueIndex) =>
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
                  <option value="" disabled>
                    Año
                  </option>
                  {YEARS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </Select>
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
          );
        })}
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
