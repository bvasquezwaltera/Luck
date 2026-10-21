import { useRef, useState } from "react";
import { Paperclip, Send } from "lucide-react";
import { Input } from "@/ui/Input";

export function ChatComposer({
  onSendText,
  onSendFile,
}: {
  onSendText: (text: string) => void;
  onSendFile: (file: File) => void;
}) {
  const [draft, setDraft] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!draft.trim()) return;
    onSendText(draft);
    setDraft("");
  };

  const handleFileChange = (file: File | undefined) => {
    if (!file) return;
    onSendFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const canSend = draft.trim().length > 0;

  return (
    <div className="flex items-center gap-2 border-t border-slate-100 bg-white p-3 sm:p-4">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(event) => handleFileChange(event.target.files?.[0])}
      />
      <button
        type="button"
        aria-label="Adjuntar archivo"
        onClick={() => fileInputRef.current?.click()}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
      >
        <Paperclip className="h-4 w-4" />
      </button>

      <Input
        label="Mensaje"
        hideLabel
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => event.key === "Enter" && handleSend()}
        placeholder="Escribe un mensaje..."
        className="min-w-0 flex-1"
      />
      <button
        type="button"
        aria-label="Enviar mensaje"
        onClick={handleSend}
        disabled={!canSend}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
      >
        <Send className="h-4 w-4" />
      </button>
    </div>
  );
}
