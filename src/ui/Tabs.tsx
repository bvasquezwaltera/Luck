export interface TabItem<T extends string = string> {
  id: T;
  label: string;
}

export function Tabs<T extends string>({
  tabs,
  activeTab,
  onChange,
}: {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (tab: T) => void;
}) {
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
