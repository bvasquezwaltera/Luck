import type { Dispatch, SetStateAction } from "react";
import type { FreelancerProfile } from "@/types/freelancerProfile";
import { Card } from "@/ui/Card";
import { Input } from "@/ui/Input";
import { Select } from "@/ui/Select";
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

          <Input
            label="País"
            value={draftProfile.country}
            onChange={(event) =>
              setDraftProfile((current) => ({ ...current, country: event.target.value }))
            }
          />

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
      </div>
    </Card>
  );
}
