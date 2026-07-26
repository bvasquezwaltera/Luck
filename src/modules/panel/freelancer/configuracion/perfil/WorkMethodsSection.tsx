import { useState, type Dispatch, type KeyboardEvent, type SetStateAction } from "react";
import { X } from "lucide-react";
import type { FreelancerProfile } from "@/types/freelancerProfile";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { Input } from "@/ui/Input";

export function WorkMethodsSection({
  draftProfile,
  setDraftProfile,
}: {
  draftProfile: FreelancerProfile;
  setDraftProfile: Dispatch<SetStateAction<FreelancerProfile>>;
}) {
  const [pendingItems, setPendingItems] = useState<Record<number, string>>({});

  function addItem(categoryIndex: number) {
    const value = (pendingItems[categoryIndex] ?? "").trim();
    if (!value) return;

    setDraftProfile((current) => ({
      ...current,
      workMethods: current.workMethods.map((category, index) =>
        index === categoryIndex ? { ...category, items: [...category.items, value] } : category,
      ),
    }));
    setPendingItems((current) => ({ ...current, [categoryIndex]: "" }));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>, categoryIndex: number) {
    if (event.key === "Enter") {
      event.preventDefault();
      addItem(categoryIndex);
    }
  }

  return (
    <Card className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-900">Métodos de trabajo</h4>
      <p className="text-xs text-gray-500">
        Agrega tus propias categorías (ej. Comunicación, Analítica, Diseño) y las herramientas que usas en cada
        una.
      </p>

      <div className="space-y-3">
        {draftProfile.workMethods.map((category, categoryIndex) => (
          <div key={categoryIndex} className="rounded-lg border border-gray-200 p-3">
            <div className="flex items-center gap-2">
              <Input
                label="Categoría"
                value={category.label}
                onChange={(event) =>
                  setDraftProfile((current) => ({
                    ...current,
                    workMethods: current.workMethods.map((value, valueIndex) =>
                      valueIndex === categoryIndex ? { ...value, label: event.target.value } : value,
                    ),
                  }))
                }
              />
              <Button
                variant="outline-neutral"
                className="!mt-6 !min-w-0 !border-red-200 !px-3 !text-red-600"
                onClick={() =>
                  setDraftProfile((current) => ({
                    ...current,
                    workMethods: current.workMethods.filter((_, valueIndex) => valueIndex !== categoryIndex),
                  }))
                }
              >
                Eliminar categoría
              </Button>
            </div>

            {category.items.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {category.items.map((item, itemIndex) => (
                  <span
                    key={`${item}-${itemIndex}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 py-1 pl-3 pr-1.5 text-xs text-gray-700"
                  >
                    {item}
                    <button
                      type="button"
                      aria-label={`Quitar ${item}`}
                      className="rounded-full p-0.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                      onClick={() =>
                        setDraftProfile((current) => ({
                          ...current,
                          workMethods: current.workMethods.map((value, valueIndex) =>
                            valueIndex === categoryIndex
                              ? { ...value, items: value.items.filter((_, valueItemIndex) => valueItemIndex !== itemIndex) }
                              : value,
                          ),
                        }))
                      }
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="mt-3 flex items-center gap-2">
              <Input
                id={`work-method-new-${categoryIndex}`}
                label=""
                hideLabel
                placeholder="Agregar herramienta..."
                value={pendingItems[categoryIndex] ?? ""}
                onChange={(event) =>
                  setPendingItems((current) => ({ ...current, [categoryIndex]: event.target.value }))
                }
                onKeyDown={(event) => handleKeyDown(event, categoryIndex)}
                onBlur={() => addItem(categoryIndex)}
              />
              <Button
                variant="outline-neutral"
                className="!min-w-0 !px-3"
                onClick={() => addItem(categoryIndex)}
              >
                + Agregar herramienta
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
            workMethods: [...current.workMethods, { label: "", items: [] }],
          }))
        }
      >
        + Agregar categoría
      </Button>
    </Card>
  );
}
