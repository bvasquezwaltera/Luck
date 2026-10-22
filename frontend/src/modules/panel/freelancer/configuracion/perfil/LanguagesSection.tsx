"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { Languages } from "lucide-react";
import { AddItemButton, ProfileCard, RemoveIconButton } from "@/modules/panel/freelancer/configuracion/perfil/ProfileBlocks";
import type { FreelancerProfile } from "@/types/freelancerProfile";
import { useProfileErrors } from "@/modules/panel/profileErrors";
import { Input } from "@/ui/Input";
import { Select } from "@/ui/Select";

const LEVELS = ["Básico", "Intermedio", "Avanzado", "Nativo"];

export function LanguagesSection({
  draftProfile,
  setDraftProfile,
}: {
  draftProfile: FreelancerProfile;
  setDraftProfile: Dispatch<SetStateAction<FreelancerProfile>>;
}) {
  // La fila recién agregada recibe el cursor, para escribir directo.
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const { languages } = draftProfile;
  const errors = useProfileErrors();

  return (
    <ProfileCard icon={Languages} title="Idiomas" description="Los que hablas y su nivel." count={languages.length}>
      <div className="space-y-2">
        {languages.length === 0 && (
          <p className="rounded-xl bg-slate-50 px-3 py-3 text-center text-xs text-slate-500">
            Aún no agregaste ninguno.
          </p>
        )}
        {languages.map((language, index) => (
          <div key={index}>
          <div className="flex items-center gap-1.5">
            <Input
              id={`language-name-${index}`}
              label={`Idioma ${index + 1}`}
              hideLabel
              className="min-w-0 flex-1"
              placeholder="Idioma"
              maxLength={40}
              autoFocus={focusIndex === index}
              value={language.name}
              onChange={(event) =>
                setDraftProfile((current) => ({
                  ...current,
                  languages: current.languages.map((value, valueIndex) =>
                    valueIndex === index ? { ...value, name: event.target.value } : value,
                  ),
                }))
              }
            />
            <Select
              id={`language-level-${index}`}
              aria-label={`Nivel del idioma ${index + 1}`}
              fieldSize="md"
              className="w-28 shrink-0"
              value={language.level}
              onChange={(event) =>
                setDraftProfile((current) => ({
                  ...current,
                  languages: current.languages.map((value, valueIndex) =>
                    valueIndex === index ? { ...value, level: event.target.value } : value,
                  ),
                }))
              }
            >
              <option value="" disabled>
                Nivel
              </option>
              {LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </Select>
            <RemoveIconButton
              label={`Quitar idioma ${index + 1}`}
              onClick={() =>
                setDraftProfile((current) => ({
                  ...current,
                  languages: current.languages.filter((_, valueIndex) => valueIndex !== index),
                }))
              }
            />
          </div>
          {(errors[`languages.${index}.name`] || errors[`languages.${index}.level`]) && (
            <p className="mt-1 text-xs text-red-500">
              {errors[`languages.${index}.name`] ?? errors[`languages.${index}.level`]}
            </p>
          )}
          </div>
        ))}
      </div>

      {errors.languages && <p className="mt-2 text-xs text-red-500">{errors.languages}</p>}

      <div className="mt-3">
        <AddItemButton
          onClick={() => {
            setFocusIndex(languages.length);
            setDraftProfile((current) => ({
              ...current,
              languages: [...current.languages, { name: "", level: "" }],
            }));
          }}
        >
          Agregar idioma
        </AddItemButton>
      </div>
    </ProfileCard>
  );
}
