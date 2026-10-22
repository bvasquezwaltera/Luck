import type { Dispatch, SetStateAction } from "react";
import { Briefcase } from "lucide-react";
import { AddItemButton, EntryCard, ProfileCard } from "@/modules/panel/freelancer/configuracion/perfil/ProfileBlocks";
import { parsePeriod, formatPeriod, PRESENT } from "@/lib/periodFormat";
import type { FreelancerProfile } from "@/types/freelancerProfile";
import { Input } from "@/ui/Input";
import { useProfileErrors } from "@/modules/panel/profileErrors";
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
  const { experience } = draftProfile;
  const errors = useProfileErrors();

  return (
    <ProfileCard
      icon={Briefcase}
      title="Experiencia"
      description="Dónde has trabajado, en orden de tu preferencia."
      count={experience.length}
    >
      <div className="space-y-3">
        {experience.length === 0 && (
          <p className="rounded-xl bg-slate-50 px-3 py-4 text-center text-xs text-slate-500">
            Aún no agregaste experiencia. Cuéntales a tus clientes dónde has trabajado.
          </p>
        )}

        {experience.map((entry, index) => {
          const { from, to } = parsePeriod(entry.period);

          const updatePeriod = (nextFrom: string, nextTo: string) =>
            setDraftProfile((current) => ({
              ...current,
              experience: current.experience.map((value, valueIndex) =>
                valueIndex === index ? { ...value, period: formatPeriod(nextFrom, nextTo) } : value,
              ),
            }));

          return (
            <EntryCard
              key={index}
              title={`Experiencia ${index + 1}`}
              removeLabel={`Eliminar experiencia ${index + 1}`}
              onRemove={() =>
                setDraftProfile((current) => ({
                  ...current,
                  experience: current.experience.filter((_, valueIndex) => valueIndex !== index),
                }))
              }
            >
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[7.5rem_7.5rem_minmax(0,1fr)_minmax(0,1fr)]">
                <Select
                  label="Desde"
                  fieldSize="md"
                  error={errors[`experience.${index}.period`]}
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
                  <option value={PRESENT}>Presente</option>
                  {YEARS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </Select>
                <Input
                  label="Rol"
                  maxLength={100}
                  error={errors[`experience.${index}.role`]}
                  placeholder="Ej.: Desarrollador full stack"
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
                  maxLength={100}
                  error={errors[`experience.${index}.company`]}
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
                  maxLength={1000}
                  error={errors[`experience.${index}.description`]}
                  placeholder="Qué hacías y qué lograste."
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
            </EntryCard>
          );
        })}
      </div>

      {errors.experience && <p className="mt-2 text-xs text-red-500">{errors.experience}</p>}

      <div className="mt-3">
        <AddItemButton
          onClick={() =>
            setDraftProfile((current) => ({
              ...current,
              experience: [...current.experience, { period: "", role: "", company: "", description: "" }],
            }))
          }
        >
          Agregar experiencia
        </AddItemButton>
      </div>
    </ProfileCard>
  );
}
