import type { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;
}

export function Input({
  label,
  error,
  leftIcon,
  rightSlot,
  required,
  className = "",
  id,
  name,
  ...props
}: InputProps) {
  const inputId = id ?? name ?? label;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-xs font-semibold text-gray-900">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute inset-y-0 left-3 my-auto flex h-4 w-4 items-center text-gray-400">
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          name={name}
          required={required}
          className={`w-full rounded-lg border py-2.5 text-xs outline-none ${leftIcon ? "pl-9" : "pl-3"} ${rightSlot ? "pr-9" : "pr-3"} ${error ? "border-red-400" : "border-gray-200"} ${className}`}
          {...props}
        />
        {rightSlot && (
          <span className="absolute inset-y-0 right-3 my-auto flex h-4 w-4 items-center">
            {rightSlot}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
