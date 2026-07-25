import type { ReactNode, SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  icon?: ReactNode;
}

export function Select({ label, icon, className = "", id, name, children, ...props }: SelectProps) {
  const selectId = id ?? name ?? label;

  const select = (
    <div className="relative">
      {icon && (
        <span className="pointer-events-none absolute inset-y-0 left-2.5 my-auto flex h-3.5 w-3.5 items-center text-gray-400">
          {icon}
        </span>
      )}
      <select
        id={selectId}
        name={name}
        className={`w-full appearance-none rounded-lg border border-gray-200 bg-white py-1.5 text-xs ${icon ? "pl-7" : "pl-3"} pr-7`}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute inset-y-0 right-2 my-auto h-3.5 w-3.5 text-gray-400"
      />
    </div>
  );

  if (!label) {
    return <div className={className}>{select}</div>;
  }

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={selectId} className="text-xs font-semibold text-gray-900">
        {label}
      </label>
      {select}
    </div>
  );
}
