"use client";

import { useRouter } from "next/navigation";
import { LogOut, type LucideIcon } from "lucide-react";
import { PanelBrandHeader } from "@/modules/panel/PanelBrandHeader";
import { signOut } from "@/lib/api/client/auth";

export interface PanelMenuItem<T extends string = string> {
  id: T;
  label: string;
  icon: LucideIcon;
}

export function PanelSidebar<T extends string>({
  menuItems,
  activeSection,
  onSectionChange,
  showHeader = false,
  className = "",
}: {
  menuItems: PanelMenuItem<T>[];
  activeSection: T;
  onSectionChange: (section: T) => void;
  showHeader?: boolean;
  className?: string;
}) {
  const router = useRouter();

  return (
    <aside className={`flex flex-col lg:sticky lg:top-0 lg:h-screen lg:self-start lg:overflow-y-auto ${className}`}>
      {showHeader && <PanelBrandHeader className="px-5 py-5" />}

      <nav className={showHeader ? "flex-1 space-y-1 px-3 pb-4" : "space-y-2"}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activeSection;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSectionChange(item.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-medium transition ${
                isActive ? "bg-indigo-600 text-white" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {showHeader && (
        <div className="border-t border-slate-200 px-3 py-4">
          <button
            type="button"
            onClick={() => signOut().then(() => router.push("/login"))}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <LogOut className="h-4 w-4" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      )}
    </aside>
  );
}
