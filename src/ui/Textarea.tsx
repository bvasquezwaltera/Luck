import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hideLabel?: boolean;
  error?: string;
}

export function Textarea({
  label,
  hideLabel = false,
  error,
  required,
  className = "",
  id,
  name,
  ...props
}: TextareaProps) {
  const textareaId = id ?? name ?? label;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={textareaId} className={hideLabel ? "sr-only" : "text-xs font-semibold text-gray-900"}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        id={textareaId}
        name={name}
        required={required}
        className={`w-full rounded-lg border px-3 py-2.5 text-xs outline-none ${error ? "border-red-400" : "border-gray-200"} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
