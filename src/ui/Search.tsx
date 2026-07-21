import type { InputHTMLAttributes } from "react";
import { Search as SearchIcon } from "lucide-react";

export function Search({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={`relative ${className}`}>
      <SearchIcon
        className="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-gray-400"
      />
      <input
        type="text"
        className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-4 text-xs outline-none"
        {...props}
      />
    </div>
  );
}
