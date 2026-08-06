"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { CheckCircle2, UploadCloud, X, UserCircle2 } from "lucide-react";
import { Button } from "@/ui/Button";
import { Input } from "@/ui/Input";
import { Modal } from "@/ui/Modal";
import { Textarea } from "@/ui/Textarea";
import type { SolicitudCategory } from "@/types/solicitud";

export interface NewSolicitudData {
  freelancerId: string;
  freelancerName: string;
  freelancerRole: string;
  title: string;
  description: string;
  characteristics: string;
  category: SolicitudCategory;
  planName: string;
  requestedDeliveries: number;
  attachmentNames: string[];
  desiredDate?: string;
}

const availableFreelancers = [
  {
    id: "freelancer-1",
    name: "Laura G.",
    role: "Desarrolladora Full Stack",
    description: "Especialista en apps web y móviles con UI amigable.",
  },
  {
    id: "freelancer-2",
    name: "Samuel R.",
    role: "Diseñador UX/UI",
    description: "Crea experiencias visuales modernas y efectivas.",
  },
  {
    id: "freelancer-3",
    name: "María P.",
    role: "Especialista en Marketing Digital",
    description: "Estrategias para lanzar tu marca y mejorar conversiones.",
  },
];

const categoryOptions: Array<{ value: SolicitudCategory; label: string }> = [
  { value: "desarrollo", label: "Desarrollo" },
  { value: "movil", label: "Móvil" },
  { value: "diseno", label: "Diseño" },
  { value: "marketing", label: "Marketing" },
  { value: "arquitectura", label: "Arquitectura" },
  { value: "hogar", label: "Hogar" },
  { value: "restaurantes", label: "Restaurantes" },
  { value: "moda", label: "Moda" },
  { value: "reposteria", label: "Repostería" },
  { value: "servicios_generales", label: "Servicios generales" },
];

// plan selection removed: clients already have a plan. Keep defaults but not editable.
const fixedDateCategories: SolicitudCategory[] = [
  "hogar",
  "restaurantes",
  "moda",
  "reposteria",
  "servicios_generales",
];

export function CreateSolicitudModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (newSolicitud: NewSolicitudData) => void;
}) {
  const [selectedFreelancer, setSelectedFreelancer] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState<SolicitudCategory>("desarrollo");
  const [planName] = useState("Plan Estándar"); // read-only: client plan is assumed
  const [requestedDeliveries, setRequestedDeliveries] = useState(3);
  const [desiredDate, setDesiredDate] = useState<string | undefined>(undefined);
  const [step, setStep] = useState<"selectFreelancer" | "form" | "success">("selectFreelancer");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [characteristics, setCharacteristics] = useState("");
  const [attachmentNames, setAttachmentNames] = useState<string[]>([]);

  const freelancer = useMemo(
    () => availableFreelancers.find((item) => item.id === selectedFreelancer) ?? availableFreelancers[0],
    [selectedFreelancer],
  );

  const filteredFreelancers = useMemo(
    () =>
      availableFreelancers.filter((freelancerOption) => {
        const query = searchTerm.toLowerCase().trim();
        return (
          freelancerOption.name.toLowerCase().includes(query) ||
          freelancerOption.role.toLowerCase().includes(query) ||
          freelancerOption.description.toLowerCase().includes(query)
        );
      }),
    [searchTerm],
  );

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = event.currentTarget.files;
    if (!files) {
      setAttachmentNames([]);
      return;
    }

    setAttachmentNames(Array.from(files).map((file) => file.name));
  }

  function handleSelectFreelancer(freelancerId: string) {
    setSelectedFreelancer(freelancerId);
    setStep("form");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedFreelancer || !title.trim() || !description.trim()) {
      return;
    }

    onCreate({
      freelancerId: freelancer.id,
      freelancerName: freelancer.name,
      freelancerRole: freelancer.role,
      title: title.trim(),
      description: description.trim(),
      characteristics: characteristics.trim(),
      category,
      planName,
      requestedDeliveries: fixedDateCategories.includes(category) ? 1 : requestedDeliveries,
      attachmentNames,
      desiredDate: fixedDateCategories.includes(category) ? desiredDate : undefined,
    });

    setStep("success");
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setCharacteristics("");
    setAttachmentNames([]);
    setSelectedFreelancer("");
    setCategory("desarrollo");
    setRequestedDeliveries(3);
    setDesiredDate(undefined);
    setStep("selectFreelancer");
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  if (!open) return null;

  return (
    <Modal open={open} onClose={handleClose}>
      <div className="p-6">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Nueva solicitud</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Crear solicitud de servicio</h2>
            <p className="mt-2 text-sm text-slate-600">
              Selecciona un freelancer y describe con claridad los requerimientos para que el servicio sea entregado a tiempo.
            </p>
          </div>
          <button type="button" onClick={handleClose} className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
            <X className="h-4 w-4" />
          </button>
        </div>

        {step === "success" ? (
          <div className="mt-6 rounded-3xl border border-emerald-100 bg-emerald-50 p-6 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
            <h3 className="mt-4 text-xl font-semibold text-slate-900">Solicitud creada</h3>
            <p className="mt-2 text-sm text-slate-600">
              Tu solicitud ya fue registrada de forma visual. Cuando el freelancer revise las solicitudes, verá este requerimiento.
            </p>
            <Button variant="primary" className="mt-6" onClick={handleClose}>
              Cerrar
            </Button>
          </div>
        ) : step === "selectFreelancer" ? (
          <div className="mt-6 space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Selecciona un freelancer</p>
                    <p className="mt-1 text-xs text-slate-500">Busca en la lista y elige al profesional que mejor se adapte a tu proyecto.</p>
                </div>
                  <Input
                    label="Buscar freelancer"
                    hideLabel
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Nombre, especialidad o descripción"
                    className="max-w-xs"
                  />
                </div>

                <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-white">
                  <div className="hidden grid-cols-[1.5fr_1fr_1fr] bg-slate-100 px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 sm:grid">
                    <div>Freelancer</div>
                    <div>Especialidad</div>
                    <div>Estado</div>
                  </div>
                  <div className="divide-y divide-slate-200">
                    {filteredFreelancers.length > 0 ? (
                      filteredFreelancers.map((freelancerOption) => (
                        <button
                          key={freelancerOption.id}
                          type="button"
                          onClick={() => handleSelectFreelancer(freelancerOption.id)}
                          className={`flex w-full flex-col gap-3 px-4 py-4 text-left transition ${
                            selectedFreelancer === freelancerOption.id
                              ? "bg-indigo-50"
                              : "hover:bg-slate-50"
                          } sm:grid sm:grid-cols-[1.5fr_1fr_1fr] sm:items-center`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white">
                              <UserCircle2 className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{freelancerOption.name}</p>
                              <p className="text-xs text-slate-500 sm:hidden">{freelancerOption.role}</p>
                            </div>
                          </div>
                          <div className="hidden text-xs text-slate-500 sm:block">{freelancerOption.role}</div>
                          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-600">Activo</div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center text-sm text-slate-500">
                        No se encontró ningún freelancer con ese término de búsqueda.
                      </div>
                    )}
                  </div>
                </div>
              </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">Puedes cambiar tu selección antes de continuar con la descripción de la solicitud.</p>
              <Button
                type="button"
                variant="primary"
                onClick={() => setStep("form")}
                disabled={!selectedFreelancer}
              >
                Continuar
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Freelancer seleccionado</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{freelancer.name}</p>
                    <p className="text-xs text-slate-500">{freelancer.role}</p>
                  </div>
                  <Button type="button" variant="soft" className="text-indigo-600" onClick={() => setStep("selectFreelancer")}>Cambiar</Button>
                </div>
                <p className="mt-4 text-sm text-slate-600">{freelancer.description}</p>
              </div>

              <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <Input
                  label="Título de la solicitud"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Por ejemplo: Rediseño web corporativo"
                  required
                />
                <Textarea
                  label="Descripción del pedido"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Describe qué necesitas y cuál es el resultado esperado."
                  rows={5}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr]">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <label className="text-sm font-semibold text-slate-900">Plan que respalda la solicitud</label>
                <p className="mt-3 text-sm font-semibold text-slate-900">{planName}</p>
                <p className="mt-1 text-xs text-slate-500">(El cliente ya cuenta con este plan; no es editable)</p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <label className="text-sm font-semibold text-slate-900" htmlFor="category">
                  Categoría
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value as SolicitudCategory)}
                  className="mt-3 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none"
                >
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <label className="text-sm font-semibold text-slate-900" htmlFor="requestedDeliveries">
                    Entregas solicitadas
                  </label>
                  <span className="text-xs text-slate-500">Incluye el número de partes del proyecto</span>
                </div>

                {fixedDateCategories.includes(category) ? (
                  <div className="mt-3">
                    <label className="text-xs text-slate-500">Fecha deseada</label>
                    <input
                      type="date"
                      value={desiredDate ?? ""}
                      onChange={(e) => setDesiredDate(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none"
                    />
                    <p className="mt-2 text-xs text-slate-500">Para servicios físicos (repostería, hogar, restaurantes) ingresa la fecha en la que necesitas el servicio.</p>
                  </div>
                ) : (
                  <input
                    id="requestedDeliveries"
                    type="number"
                    min={1}
                    max={10}
                    value={requestedDeliveries}
                    onChange={(event) => setRequestedDeliveries(Number(event.target.value) || 1)}
                    className="mt-3 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none"
                  />
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Características o requerimientos</p>
              <Textarea
                label="Características principales"
                value={characteristics}
                onChange={(event) => setCharacteristics(event.target.value)}
                placeholder="Ejemplo: diseño responsive, formulario de contacto, carga de catálogos, integración con redes sociales."
                rows={3}
              />
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Archivos de referencia</p>
                  <p className="text-xs text-slate-500">Puedes subir archivos para compartir ideas, contenidos o bocetos.</p>
                </div>
                <div className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-500">Opcional</div>
              </div>
              <label className="mt-4 flex cursor-pointer items-center justify-between rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-4 text-sm text-slate-600 transition hover:border-indigo-500 hover:text-slate-900">
                <span className="flex items-center gap-2">
                  <UploadCloud className="h-4 w-4" />
                  Seleccionar archivos
                </span>
                <input type="file" multiple className="hidden" onChange={handleFileChange} />
              </label>
              {attachmentNames.length > 0 && (
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  {attachmentNames.map((fileName) => (
                    <li key={fileName} className="rounded-xl bg-slate-100 px-3 py-2">
                      {fileName}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">El freelancer recibirá tu solicitud como parte de la lista de solicitudes disponibles.</p>
              <div className="flex items-center gap-3">
                <Button type="button" variant="outline" onClick={() => setStep("selectFreelancer")}>Volver</Button>
                <Button type="submit" variant="primary">
                  Enviar solicitud
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
