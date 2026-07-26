import type { Dispatch, SetStateAction } from "react";
import type { FreelancerProfile } from "@/types/freelancerProfile";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { Input } from "@/ui/Input";

export function DifferentiatorsSection({
  draftProfile,
  setDraftProfile,
}: {
  draftProfile: FreelancerProfile;
  setDraftProfile: Dispatch<SetStateAction<FreelancerProfile>>;
}) {
  return (
    <Card className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-900">Lo que me diferencia</h4>

      <div className="space-y-3">
        {draftProfile.differentiators.map((item, index) => (
          <div key={index} className="rounded-lg border border-gray-200 p-3">
            <Input
              label="Diferenciador"
              value={item}
              onChange={(event) =>
                setDraftProfile((current) => ({
                  ...current,
                  differentiators: current.differentiators.map((value, valueIndex) =>
                    valueIndex === index ? event.target.value : value,
                  ),
                }))
              }
            />
            <div className="mt-3 flex justify-end">
              <Button
                variant="outline-neutral"
                className="!min-w-0 !border-red-200 !px-3 !text-red-600"
                onClick={() =>
                  setDraftProfile((current) => ({
                    ...current,
                    differentiators: current.differentiators.filter((_, valueIndex) => valueIndex !== index),
                  }))
                }
              >
                Quitar
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="outline-neutral"
        className="!min-w-0 !px-3"
        onClick={() =>
          setDraftProfile((current) => ({
            ...current,
            differentiators: [...current.differentiators, ""],
          }))
        }
      >
        + Agregar diferenciador
      </Button>
    </Card>
  );
}
