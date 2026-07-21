import type { FreelancerFilters, PriceRange } from "@/types/freelancer";
import { Search } from "@/ui/Search";
import { Select } from "@/ui/Select";

const PRICE_RANGE_LABELS: Record<PriceRange, string> = {
  any: "Cualquier precio",
  under200: "Hasta $200/mes",
  "200to300": "$200 - $300/mes",
  over300: "Más de $300/mes",
};

export function SearchBar({
  filters,
  onChange,
  categories,
  countries,
}: {
  filters: FreelancerFilters;
  onChange: (filters: FreelancerFilters) => void;
  categories: string[];
  countries: string[];
}) {
  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:inline-flex sm:w-auto sm:flex-row">
      <Search
        placeholder="Buscar freelancers..."
        value={filters.query}
        onChange={(e) => onChange({ ...filters, query: e.target.value })}
        className="w-full sm:w-[400px] lg:w-[600px]"
      />

      <Select
        value={filters.category}
        onChange={(e) => onChange({ ...filters, category: e.target.value })}
        className="w-full sm:w-auto"
      >
        <option value="all">Todas las categorías</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </Select>

      <Select
        value={filters.country}
        onChange={(e) => onChange({ ...filters, country: e.target.value })}
        className="w-full sm:w-auto"
      >
        <option value="all">Todos los países</option>
        {countries.map((country) => (
          <option key={country} value={country}>
            {country}
          </option>
        ))}
      </Select>

      <Select
        value={filters.priceRange}
        onChange={(e) =>
          onChange({ ...filters, priceRange: e.target.value as PriceRange })
        }
        className="w-full sm:w-auto"
      >
        {(Object.keys(PRICE_RANGE_LABELS) as PriceRange[]).map((range) => (
          <option key={range} value={range}>
            {PRICE_RANGE_LABELS[range]}
          </option>
        ))}
      </Select>
    </div>
  );
}
