import type { Dispatch, SetStateAction } from "react";
import { UserRound } from "lucide-react";
import { ProfileCard } from "@/modules/panel/freelancer/configuracion/perfil/ProfileBlocks";
import type { FreelancerProfile } from "@/types/freelancerProfile";
import { useProfileErrors } from "@/modules/panel/profileErrors";
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
  const errors = useProfileErrors();

  return (
    <ProfileCard
      id="onboarding-info"
      icon={UserRound}
      title="Información personal"
      description="Es lo primero que ven los clientes en tu perfil público."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Input
          label="Nombre"
          maxLength={120}
          error={errors.name}
          value={draftProfile.name}
          onChange={(event) => setDraftProfile((current) => ({ ...current, name: event.target.value }))}
        />

        <Select
          label="Categoría"
          error={errors.category}
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
          maxLength={100}
          error={errors.specialty}
          placeholder="Ej.: Full Stack developer"
          value={draftProfile.specialty}
          onChange={(event) => setDraftProfile((current) => ({ ...current, specialty: event.target.value }))}
        />

        <Select
          label="País"
          error={errors.countryCode}
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
          error={errors.timezone}
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
          maxLength={1000}
          error={errors.bio}
          placeholder="Cuéntales a tus clientes quién eres, cómo trabajas y qué te apasiona."
          value={draftProfile.bio}
          onChange={(event) => setDraftProfile((current) => ({ ...current, bio: event.target.value }))}
          rows={5}
        />
        <p className="mt-1.5 text-right text-[11px] text-slate-400">{draftProfile.bio.length} / 1000 caracteres</p>
      </div>
    </ProfileCard>
  );
}
