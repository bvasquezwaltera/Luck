import type { LucideIcon } from "lucide-react";

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  icon?: LucideIcon;
}

export function Tabs<T extends string>({
  tabs,
  activeTab,
  onChange,
  variant = "underline",
}: {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (tab: T) => void;
  variant?: "underline" | "pill";
}) {
  if (variant === "pill") {
    return (
      <div className="overflow-x-auto">
        <div className="flex w-full min-w-max gap-1" role="tablist">
          {tabs.map((tab) => {
            const active = tab.id === activeTab;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onChange(tab.id)}
                className={`inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-2.5 py-2 text-[13px] font-semibold transition-colors sm:flex-none sm:gap-2 sm:px-3.5 sm:text-sm ${
                  active ? "bg-indigo-50 text-indigo-700" : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                }`}
              >
                {Icon && <Icon className="hidden h-4 w-4 min-[430px]:block" />}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border-b border-gray-200">
      <div className="flex w-max gap-6">
        {tabs.map((tab) => {
          const active = tab.id === activeTab;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`whitespace-nowrap border-b-2 pb-3 text-sm font-semibold transition-colors ${
                active
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
