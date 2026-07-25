import type { Dispatch, SetStateAction } from "react";
import type { FreelancerProfile } from "@/types/freelancerProfile";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { Input } from "@/ui/Input";

export function ToolsSection({
  draftProfile,
  setDraftProfile,
}: {
  draftProfile: FreelancerProfile;
  setDraftProfile: Dispatch<SetStateAction<FreelancerProfile>>;
}) {
  return (
    <Card className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-900">Herramientas y tecnologías</h4>

      <div className="space-y-3">
        {draftProfile.tools.map((tool, index) => (
          <div key={`${tool}-${index}`} className="rounded-lg border border-gray-200 p-3">
            <Input
              label="Herramienta"
              value={tool}
              onChange={(event) =>
                setDraftProfile((current) => ({
                  ...current,
                  tools: current.tools.map((value, valueIndex) =>
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
                    tools: current.tools.filter((_, valueIndex) => valueIndex !== index),
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
            tools: [...current.tools, ""],
          }))
        }
      >
        + Agregar herramienta
      </Button>
    </Card>
  );
}
