import { Select } from "@/ui/Select";
import { Button } from "@/ui/Button";
import type { PortfolioSortOrder } from "@/lib/filterPortfolioProjects";

export function PortfolioFilters({
  categories,
  activeCategory,
  onCategoryChange,
  sortOrder,
  onSortOrderChange,
}: {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  sortOrder: PortfolioSortOrder;
  onSortOrderChange: (order: PortfolioSortOrder) => void;
}) {
  const pills = ["all", ...categories];

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        {pills.map((category) => (
          <Button
            key={category}
            pill
            variant={activeCategory === category ? "primary" : "outline-neutral"}
            onClick={() => onCategoryChange(category)}
          >
            {category === "all" ? "Todos" : category}
          </Button>
        ))}
      </div>

      <Select
        value={sortOrder}
        onChange={(e) => onSortOrderChange(e.target.value as PortfolioSortOrder)}
        className="w-full sm:w-auto"
      >
        <option value="recent">Más recientes</option>
        <option value="oldest">Más antiguos</option>
      </Select>
    </div>
  );
}
