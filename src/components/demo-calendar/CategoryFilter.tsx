
import { Switch } from "@/components/ui/switch";
import { CategoryFilter as CategoryFilterType } from "@/types/demo-calendar";

interface CategoryFilterProps {
  filters: CategoryFilterType[];
  onToggle: (category: string) => void;
}

const CategoryFilter = ({ filters, onToggle }: CategoryFilterProps) => {
  return (
    <div className="bg-card rounded-lg p-4 shadow-sm border">
      <h3 className="font-semibold text-sm mb-3">Filter by Category</h3>
      <div className="space-y-3">
        {filters.map((filter) => (
          <div key={filter.category} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${filter.color}`} />
              <span className="text-sm font-medium">{filter.name}</span>
            </div>
            <Switch
              checked={filter.enabled}
              onCheckedChange={() => onToggle(filter.category)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
