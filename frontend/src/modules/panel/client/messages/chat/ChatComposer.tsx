import { useRef, useState } from "react";
import { Paperclip, Send } from "lucide-react";
import { Button } from "@/ui/Button";
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

  return (
    <div className="flex items-end gap-2 border-t border-gray-100 p-4">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(event) => handleFileChange(event.target.files?.[0])}
      />
      <Button variant="outline-neutral" className="!min-w-0 !px-3" onClick={() => fileInputRef.current?.click()}>
        <Paperclip className="h-3.5 w-3.5" />
      </Button>

      <Input
        label="Mensaje"
        hideLabel
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => event.key === "Enter" && handleSend()}
        placeholder="Escribe un mensaje..."
        className="flex-1"
      />
      <Button
        variant="primary"
        className="!min-w-0 bg-indigo-600 !px-3 hover:bg-indigo-700"
        onClick={handleSend}
      >
        <Send className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
