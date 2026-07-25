import { useState } from "react";
import { Button } from "@/ui/Button";
import { Textarea } from "@/ui/Textarea";

export function ReplyForm({
  initialValue,
  onSave,
}: {
  initialValue: string;
  onSave: (value: string) => void;
}) {
  const [value, setValue] = useState(initialValue);
  const [isSaved, setIsSaved] = useState(Boolean(initialValue));

  return (
    <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
      <Textarea
        label="Tu respuesta"
        hideLabel
        value={value}
        onChange={(event) => setValue(event.target.value)}
        disabled={isSaved}
        rows={3}
        placeholder="Escribe una respuesta pública a esta reseña..."
        className={isSaved ? "bg-gray-100 text-gray-500" : ""}
      />
      <div className="flex justify-end">
        <Button
          variant="primary"
          className="!min-w-0 !px-3 bg-indigo-600 hover:bg-indigo-700"
          onClick={() => {
            if (isSaved) {
              setIsSaved(false);
            } else {
              onSave(value);
              setIsSaved(true);
            }
          }}
        >
          {isSaved ? "Editar" : "Guardar"}
        </Button>
      </div>
    </div>
  );
}
