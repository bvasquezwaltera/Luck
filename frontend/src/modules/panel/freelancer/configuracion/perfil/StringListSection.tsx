"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { AddItemButton, ProfileCard, RemoveIconButton } from "@/modules/panel/freelancer/configuracion/perfil/ProfileBlocks";
import { Input } from "@/ui/Input";

// Lista de textos cortos que se agregan y se quitan (diferenciadores, habilidades, herramientas).
// Solo cambia cómo se ve: el padre sigue recibiendo la lista completa en cada cambio.
export function StringListSection({
  icon,
  title,
  description,
  itemLabel,
  placeholder,
  addLabel,
  emptyText,
  items,
  onChange,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  itemLabel: string;
  placeholder: string;
  addLabel: string;
  emptyText: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  // La fila recién agregada recibe el cursor, para escribir directo.
  const [focusIndex, setFocusIndex] = useState<number | null>(null);

  return (
    <ProfileCard icon={icon} title={title} description={description} count={items.length}>
      <div className="space-y-2">
        {items.length === 0 && (
          <p className="rounded-xl bg-slate-50 px-3 py-3 text-center text-xs text-slate-500">{emptyText}</p>
        )}
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <Input
              label={`${itemLabel} ${index + 1}`}
              hideLabel
              className="min-w-0 flex-1"
              placeholder={placeholder}
              autoFocus={focusIndex === index}
              value={item}
              onChange={(event) =>
                onChange(items.map((value, valueIndex) => (valueIndex === index ? event.target.value : value)))
              }
            />
            <RemoveIconButton
              label={`Quitar ${itemLabel.toLowerCase()} ${index + 1}`}
              onClick={() => onChange(items.filter((_, valueIndex) => valueIndex !== index))}
            />
          </div>
        ))}
      </div>

      <div className="mt-3">
        <AddItemButton
          onClick={() => {
            setFocusIndex(items.length);
            onChange([...items, ""]);
          }}
        >
          {addLabel}
        </AddItemButton>
      </div>
    </ProfileCard>
  );
}
