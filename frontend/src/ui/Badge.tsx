import type { ReactNode } from "react";

export function Badge({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 ${className}`}>
      {children}
    </span>
  );
}
