import { cn } from "@/lib/utils";

interface CategorySelectProps {
  categories: string[];
  selected: string;
  onChange: (category: string) => void;
  className?: string;
}

const formatCategory = (str: string) => 
  str.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const CategorySelect = ({ categories, selected, onChange, className }: CategorySelectProps) => {
  return (
    <select
      value={selected}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "cursor-pointer px-3 py-2 border border-input bg-background rounded-md text-sm",
        className,
      )}
    >
      <option value="all">All Categories</option>
      {categories.map((category) => (
        <option key={category} value={category}>
          {formatCategory(category)}
        </option>
      ))}
    </select>
  );
};

export default CategorySelect;
