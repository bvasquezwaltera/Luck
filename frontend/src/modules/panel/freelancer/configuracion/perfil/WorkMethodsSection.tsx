import { useState, type Dispatch, type KeyboardEvent, type SetStateAction } from "react";
import { Layers, X } from "lucide-react";
import { AddItemButton, EntryCard, ProfileCard } from "@/modules/panel/freelancer/configuracion/perfil/ProfileBlocks";
import type { FreelancerProfile } from "@/types/freelancerProfile";
import { Button } from "@/ui/Button";
import { Input } from "@/ui/Input";

export function WorkMethodsSection({
  draftProfile,
  setDraftProfile,
}: {
  draftProfile: FreelancerProfile;
  setDraftProfile: Dispatch<SetStateAction<FreelancerProfile>>;
}) {
  const [pendingItems, setPendingItems] = useState<Record<number, string>>({});
  const { workMethods } = draftProfile;

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
    <ProfileCard
      icon={Layers}
      title="Métodos de trabajo"
      description="Agrega tus propias categorías (ej. Comunicación, Analítica, Diseño) y las herramientas que usas en cada una."
      count={workMethods.length}
    >
      <div className="space-y-3">
        {workMethods.length === 0 && (
          <p className="rounded-xl bg-slate-50 px-3 py-4 text-center text-xs text-slate-500">
            Aún no agregaste categorías.
          </p>
        )}

        {workMethods.map((category, categoryIndex) => (
          <EntryCard
            key={categoryIndex}
            title={`Categoría ${categoryIndex + 1}`}
            removeLabel={`Eliminar categoría ${categoryIndex + 1}`}
            onRemove={() =>
              setDraftProfile((current) => ({
                ...current,
                workMethods: current.workMethods.filter((_, valueIndex) => valueIndex !== categoryIndex),
              }))
            }
          >
            <Input
              label="Nombre de la categoría"
              placeholder="Ej.: Comunicación"
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

            {category.items.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {category.items.map((item, itemIndex) => (
                  <span
                    key={`${item}-${itemIndex}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 py-1 pl-3 pr-1.5 text-xs font-medium text-indigo-700"
                  >
                    {item}
                    <button
                      type="button"
                      aria-label={`Quitar ${item}`}
                      className="rounded-full p-0.5 text-indigo-400 transition hover:bg-indigo-100 hover:text-indigo-700"
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
                label="Agregar herramienta"
                hideLabel
                className="min-w-0 flex-1"
                placeholder="Agregar herramienta..."
                value={pendingItems[categoryIndex] ?? ""}
                onChange={(event) =>
                  setPendingItems((current) => ({ ...current, [categoryIndex]: event.target.value }))
                }
                onKeyDown={(event) => handleKeyDown(event, categoryIndex)}
                onBlur={() => addItem(categoryIndex)}
              />
              <Button variant="outline-neutral" className="!min-w-0 shrink-0 !px-3" onClick={() => addItem(categoryIndex)}>
                Agregar
              </Button>
            </div>
          </EntryCard>
        ))}
      </div>

      <div className="mt-3">
        <AddItemButton
          onClick={() =>
            setDraftProfile((current) => ({
              ...current,
              workMethods: [...current.workMethods, { label: "", items: [] }],
            }))
          }
        >
          Agregar categoría
        </AddItemButton>
      </div>
    </ProfileCard>
  );
}
