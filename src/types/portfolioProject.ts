export interface PortfolioProject {
  id: string;
  name: string;
  category: string;
  description: string;
  techStack: string[];
  date: string;
  dateValue: string; // ISO-sortable value (e.g. "2024-05"), used for sorting by date
  duration: string;
  url: string;
  bannerClassName: string; // Tailwind background classes for the card banner
}
