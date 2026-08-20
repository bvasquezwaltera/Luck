import { useState } from "react";
import type { PortfolioProject } from "@/types/portfolioProject";
import { Button } from "@/ui/Button";
import { Input } from "@/ui/Input";
import { Select } from "@/ui/Select";
import { Textarea } from "@/ui/Textarea";

const MONTH_LABELS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, index) => CURRENT_YEAR - index);

const BANNER_COLORS = ["bg-indigo-900", "bg-emerald-900", "bg-amber-900", "bg-rose-900", "bg-slate-900"];
const DURATION_UNITS = ["días", "semanas", "meses"];

export function NewProjectForm({
  onCreate,
  onCancel,
}: {
  onCreate: (project: PortfolioProject) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [techStack, setTechStack] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [durationAmount, setDurationAmount] = useState("");
  const [durationUnit, setDurationUnit] = useState("semanas");
  const [imageLink, setImageLink] = useState("");
  const [uploadedImage, setUploadedImage] = useState("");

  const handleFileChange = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setUploadedImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;

    onCreate({
      id: `project-${Date.now()}`,
      name,
      category,
      description,
      techStack: techStack
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      date: month && year ? `${MONTH_LABELS[Number(month) - 1]} ${year}` : "",
      dateValue: month && year ? `${year}-${month}` : "",
      duration: durationAmount ? `${durationAmount} ${durationUnit}` : "",
      url,
      bannerClassName: BANNER_COLORS[Math.floor(Math.random() * BANNER_COLORS.length)],
      imageUrl: uploadedImage || imageLink || undefined,
    });
  };

  return (
    <div className="space-y-4 p-5">
      <h4 className="text-sm font-semibold text-gray-900">Nuevo proyecto</h4>

      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Título" value={name} onChange={(event) => setName(event.target.value)} />
        <Input label="Categoría" value={category} onChange={(event) => setCategory(event.target.value)} />
      </div>

      <Textarea
        label="Descripción"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        rows={3}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Enlace" type="url" value={url} onChange={(event) => setUrl(event.target.value)} />
        <Input
          label="Herramientas utilizadas"
          value={techStack}
          onChange={(event) => setTechStack(event.target.value)}
          placeholder="Separadas por coma"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Select label="Mes" value={month} onChange={(event) => setMonth(event.target.value)}>
          <option value="" disabled>
            Mes
          </option>
          {MONTH_LABELS.map((label, index) => (
            <option key={label} value={String(index + 1).padStart(2, "0")}>
              {label}
            </option>
          ))}
        </Select>

        <Select label="Año" value={year} onChange={(event) => setYear(event.target.value)}>
          <option value="" disabled>
            Año
          </option>
          {YEARS.map((yearOption) => (
            <option key={yearOption} value={yearOption}>
              {yearOption}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Duración"
          type="number"
          min={1}
          value={durationAmount}
          onChange={(event) => setDurationAmount(event.target.value)}
        />

        <Select label="Unidad" value={durationUnit} onChange={(event) => setDurationUnit(event.target.value)}>
          {DURATION_UNITS.map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Imagen (enlace)"
          type="url"
          value={imageLink}
          onChange={(event) => setImageLink(event.target.value)}
        />
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-gray-900">Imagen (subir)</span>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => handleFileChange(event.target.files?.[0])}
            className="text-xs text-gray-600 file:mr-3 file:rounded-lg file:border file:border-gray-300 file:bg-white file:px-3 file:py-2 file:text-xs file:font-semibold file:text-black/70 hover:file:border-indigo-600 hover:file:text-indigo-600"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline-neutral" className="!min-w-0 !px-4" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          className="!min-w-0 !px-4 bg-indigo-600 hover:bg-indigo-700"
          onClick={handleSubmit}
        >
          Crear proyecto
        </Button>
      </div>
    </div>
  );
}
