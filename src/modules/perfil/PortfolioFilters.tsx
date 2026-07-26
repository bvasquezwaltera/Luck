import { Select } from "@/ui/Select";
import type { PortfolioSortOrder } from "@/lib/filterPortfolioProjects";

export function PortfolioFilters({
  sortOrder,
  onSortOrderChange,
}: {
  sortOrder: PortfolioSortOrder;
  onSortOrderChange: (order: PortfolioSortOrder) => void;
}) {
  return (
    <div className="flex justify-end">
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
