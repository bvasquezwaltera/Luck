import type { ReactNode } from "react";

export function InfoCard({
  icon,
  label,
  description,
  className = "",
}: {
  icon: ReactNode;
  label: string;
  description: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 ${className}`}
    >
      {icon}
      <div>
        <p className="text-xs font-bold text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
  );
}
