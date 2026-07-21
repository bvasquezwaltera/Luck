export type ProfileTab = "sobre-mi" | "portafolio" | "resenas" | "suscripciones";

const TAB_ORDER: ProfileTab[] = ["sobre-mi", "portafolio", "resenas", "suscripciones"];

const TAB_LABELS: Record<ProfileTab, string> = {
  "sobre-mi": "Sobre mí",
  portafolio: "Portafolio",
  resenas: "Reseñas",
  suscripciones: "Suscripciones",
};

export function ProfileTabs({
  activeTab,
  onChange,
  reviewCount,
}: {
  activeTab: ProfileTab;
  onChange: (tab: ProfileTab) => void;
  reviewCount: number;
}) {
  return (
    <div className="overflow-x-auto border-b border-gray-200">
      <div className="flex w-max gap-6">
        {TAB_ORDER.map((tab) => {
          const active = tab === activeTab;
          const label =
            tab === "resenas" ? `${TAB_LABELS[tab]} (${reviewCount})` : TAB_LABELS[tab];

          return (
            <button
              key={tab}
              type="button"
              onClick={() => onChange(tab)}
              className={`whitespace-nowrap border-b-2 pb-3 text-sm font-semibold transition-colors ${
                active
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
