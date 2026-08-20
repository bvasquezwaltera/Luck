import type { Freelancer, FreelancerFilters } from "@/types/freelancer";

export const defaultFilters: FreelancerFilters = {
  query: "",
  category: "all",
  country: "all",
  priceRange: "any",
};

function matchesPriceRange(price: number, range: FreelancerFilters["priceRange"]): boolean {
  switch (range) {
    case "under200":
      return price < 200;
    case "200to300":
      return price >= 200 && price <= 300;
    case "over300":
      return price > 300;
    case "any":
    default:
      return true;
  }
}

export function filterFreelancers(
  freelancers: Freelancer[],
  filters: FreelancerFilters,
): Freelancer[] {
  const query = filters.query.trim().toLowerCase();

  return freelancers.filter((freelancer) => {
    const matchesQuery =
      query === "" ||
      freelancer.name.toLowerCase().includes(query) ||
      freelancer.specialty.toLowerCase().includes(query) ||
      freelancer.skills.some((skill) => skill.toLowerCase().includes(query));

    const matchesCategory =
      filters.category === "all" || freelancer.category === filters.category;

    const matchesCountry =
      filters.country === "all" || freelancer.country === filters.country;

    return (
      matchesQuery &&
      matchesCategory &&
      matchesCountry &&
      matchesPriceRange(freelancer.monthlyPriceFrom, filters.priceRange)
    );
  });
}
