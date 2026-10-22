import type { Dispatch, SetStateAction } from "react";
import { GraduationCap } from "lucide-react";
import { AddItemButton, EntryCard, ProfileCard } from "@/modules/panel/freelancer/configuracion/perfil/ProfileBlocks";
import { parsePeriod, formatPeriod } from "@/lib/periodFormat";
import type { FreelancerProfile } from "@/types/freelancerProfile";
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
  const { education } = draftProfile;

  return (
    <ProfileCard
      icon={GraduationCap}
      title="Educación"
      description="Tu formación académica."
      count={education.length}
    >
      <div className="space-y-3">
        {education.length === 0 && (
          <p className="rounded-xl bg-slate-50 px-3 py-4 text-center text-xs text-slate-500">
            Aún no agregaste formación académica.
          </p>
        )}

        {education.map((entry, index) => {
          const { from, to } = parsePeriod(entry.period);

          const updatePeriod = (nextFrom: string, nextTo: string) =>
            setDraftProfile((current) => ({
              ...current,
              education: current.education.map((value, valueIndex) =>
                valueIndex === index ? { ...value, period: formatPeriod(nextFrom, nextTo) } : value,
              ),
            }));

          return (
            <EntryCard
              key={index}
              title={`Formación ${index + 1}`}
              removeLabel={`Eliminar educación ${index + 1}`}
              onRemove={() =>
                setDraftProfile((current) => ({
                  ...current,
                  education: current.education.filter((_, valueIndex) => valueIndex !== index),
                }))
              }
            >
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[7.5rem_7.5rem_minmax(0,1fr)_minmax(0,1fr)]">
                <Select
                  label="Desde"
                  fieldSize="md"
                  value={from}
                  onChange={(event) => updatePeriod(event.target.value, to)}
                >
                  <option value="" disabled>
                    Año
                  </option>
                  {YEARS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </Select>
                <Select
                  label="Hasta"
                  fieldSize="md"
                  value={to}
                  onChange={(event) => updatePeriod(from, event.target.value)}
                >
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
                  placeholder="Ej.: Ingeniería de sistemas"
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
            </EntryCard>
          );
        })}
      </div>

      <div className="mt-3">
        <AddItemButton
          onClick={() =>
            setDraftProfile((current) => ({
              ...current,
              education: [...current.education, { period: "", degree: "", institution: "" }],
            }))
          }
        >
          Agregar educación
        </AddItemButton>
      </div>
    </ProfileCard>
  );
}
