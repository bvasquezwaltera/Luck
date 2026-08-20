import type { InputHTMLAttributes, ReactNode } from "react";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  children: ReactNode;
}

export function Checkbox({ children, id, name, className = "", ...props }: CheckboxProps) {
  const inputId = id ?? name;

  return (
    <label htmlFor={inputId} className="flex items-start gap-2 text-xs text-gray-600">
      <input
        type="checkbox"
        id={inputId}
        name={name}
        className={`mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-600 ${className}`}
        {...props}
      />
      <span>{children}</span>
    </label>
  );
}
