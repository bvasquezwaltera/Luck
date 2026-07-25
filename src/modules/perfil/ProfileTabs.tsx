import { Tabs, type TabItem } from "@/ui/Tabs";
import type { ProfileTab } from "@/types/profileTab";

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
  const tabs: TabItem<ProfileTab>[] = TAB_ORDER.map((tab) => ({
    id: tab,
    label: tab === "resenas" ? `${TAB_LABELS[tab]} (${reviewCount})` : TAB_LABELS[tab],
  }));

  return <Tabs tabs={tabs} activeTab={activeTab} onChange={onChange} />;
}
