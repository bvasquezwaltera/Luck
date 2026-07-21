export interface Freelancer {
  id: string;
  name: string;
  initials: string;
  rating: number;
  reviewCount: number;
  specialty: string;
  category: string;
  country: string;
  countryCode: string; // ISO 3166-1 alpha-2, e.g. "BR" — used to render the flag icon
  skills: string[];
  projectCount: number;
  monthlyPriceFrom: number;
}

export type PriceRange = "any" | "under200" | "200to300" | "over300";

export interface FreelancerFilters {
  query: string;
  category: string;
  country: string;
  priceRange: PriceRange;
}
