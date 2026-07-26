import type { Dispatch, SetStateAction } from "react";
import type { FreelancerProfile } from "@/types/freelancerProfile";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
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
  return (
    <Card className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-900">Idiomas</h4>

      <div className="space-y-3">
        {draftProfile.languages.map((language, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              id={`language-name-${index}`}
              label=""
              hideLabel
              className="flex-1"
              placeholder="Idioma"
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
            <Button
              variant="outline-neutral"
              className="!min-w-0 !border-red-200 !px-3 !text-red-600"
              onClick={() =>
                setDraftProfile((current) => ({
                  ...current,
                  languages: current.languages.filter((_, valueIndex) => valueIndex !== index),
                }))
              }
            >
              Quitar
            </Button>
          </div>
        ))}
      </div>

      <Button
        variant="outline-neutral"
        className="!min-w-0 !px-3"
        onClick={() =>
          setDraftProfile((current) => ({
            ...current,
            languages: [...current.languages, { name: "", level: "" }],
          }))
        }
      >
        + Agregar idioma
      </Button>
    </Card>
  );
}
