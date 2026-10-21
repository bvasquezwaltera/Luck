import type { Dispatch, SetStateAction } from "react";
import { UserRound } from "lucide-react";
import { ProfileCard } from "@/modules/panel/freelancer/configuracion/perfil/ProfileBlocks";
import type { FreelancerProfile } from "@/types/freelancerProfile";
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
    <ProfileCard
      icon={UserRound}
      title="Información personal"
      description="Es lo primero que ven los clientes en tu perfil público."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Input
          label="Nombre"
          value={draftProfile.name}
          onChange={(event) => setDraftProfile((current) => ({ ...current, name: event.target.value }))}
        />

        <Select
          label="Categoría"
          fieldSize="md"
          value={draftProfile.category}
          onChange={(event) => setDraftProfile((current) => ({ ...current, category: event.target.value }))}
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
          placeholder="Ej.: Full Stack developer"
          value={draftProfile.specialty}
          onChange={(event) => setDraftProfile((current) => ({ ...current, specialty: event.target.value }))}
        />

        <Select
          label="País"
          fieldSize="md"
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
          fieldSize="md"
          value={draftProfile.timezone}
          onChange={(event) => setDraftProfile((current) => ({ ...current, timezone: event.target.value }))}
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
          placeholder="Cuéntales a tus clientes quién eres, cómo trabajas y qué te apasiona."
          value={draftProfile.bio}
          onChange={(event) => setDraftProfile((current) => ({ ...current, bio: event.target.value }))}
          rows={5}
        />
        <p className="mt-1.5 text-right text-[11px] text-slate-400">{draftProfile.bio.length} caracteres</p>
      </div>
    </ProfileCard>
  );
}
