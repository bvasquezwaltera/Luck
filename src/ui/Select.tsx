import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

export function Select({ className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={`relative ${className}`}>
      <select
        className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-4 pr-9 text-xs"
        {...props}
      />
      <ChevronDown
        className="pointer-events-none absolute inset-y-0 right-3 my-auto h-4 w-4 text-gray-400"
      />
    </div>
  );
}
