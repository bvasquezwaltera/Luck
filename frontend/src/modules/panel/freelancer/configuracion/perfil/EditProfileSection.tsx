import type { Dispatch, SetStateAction } from "react";
import type { FreelancerProfile } from "@/types/freelancerProfile";
import { Card } from "@/ui/Card";
import { Input } from "@/ui/Input";
import { Select } from "@/ui/Select";
import { Textarea } from "@/ui/Textarea";
import categories from "@/data/categories.json";
import countries from "@/data/countries.json";
import timezones from "@/data/timezones.json";

export function EditProfileSection({
  draftProfile,
  setDraftProfile,
}: {
  draftProfile: FreelancerProfile;
  setDraftProfile: Dispatch<SetStateAction<FreelancerProfile>>;
}) {
  return (
    <Card className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900">Información personal</h3>

      <div className="rounded-lg border border-gray-200 p-3">
        <div className="grid gap-4 md:grid-cols-3">
          <Input
            label="Nombre"
            value={draftProfile.name}
            onChange={(event) =>
              setDraftProfile((current) => ({ ...current, name: event.target.value }))
            }
          />

          <Select
            label="Categoría"
            value={draftProfile.category}
            onChange={(event) =>
              setDraftProfile((current) => ({ ...current, category: event.target.value }))
            }
          >
            <option value="" disabled>
              Selecciona una categoría
            </option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>

          <Input
            label="Especialidad"
            value={draftProfile.specialty}
            onChange={(event) =>
              setDraftProfile((current) => ({ ...current, specialty: event.target.value }))
            }
          />

          <Select
            label="País"
            value={draftProfile.countryCode}
            onChange={(event) => {
              const country = countries.find((value) => value.code === event.target.value);
              setDraftProfile((current) => ({
                ...current,
                countryCode: event.target.value,
                country: country?.name ?? "",
              }));
            }}
          >
            <option value="" disabled>
              Selecciona un país
            </option>
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </Select>

          <Select
            label="Zona horaria"
            value={draftProfile.timezone}
            onChange={(event) =>
              setDraftProfile((current) => ({ ...current, timezone: event.target.value }))
            }
          >
            <option value="" disabled>
              Selecciona una zona horaria
            </option>
            {timezones.map((timezone) => (
              <option key={timezone} value={timezone}>
                {timezone}
              </option>
            ))}
          </Select>
        </div>

        <div className="mt-4">
          <Textarea
            label="Sobre mí"
            value={draftProfile.bio}
            onChange={(event) =>
              setDraftProfile((current) => ({ ...current, bio: event.target.value }))
            }
            rows={5}
          />
        </div>
      </div>
    </Card>
  );
}
