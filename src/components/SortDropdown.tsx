import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface SortDropdownProps {
  sortBy: string;
  onSortChange: (value: string) => void;
  showRelevanceOption?: boolean;
  disabled?: boolean;
  className?: string;
}

const compactButtonClasses =
  "max-[400px]:text-xs max-[400px]:px-2 max-[400px]:py-1 max-[400px]:h-7";

const getSortLabel = (value: string) => {
  switch (value) {
    case "distance":
      return "Nearest";
    case "relevance":
      return "Relevance";
    case "price_asc":
      return "Price: Low to High";
    case "rating":
      return "Rating";
    case "price_desc":
      return "Price: High to Low";
    default:
      return "Nearest";
  }
};

export const SortDropdown = ({
  sortBy,
  onSortChange,
  showRelevanceOption = false,
  disabled = false,
  className,
}: SortDropdownProps) => {
  const sortLabel = getSortLabel(sortBy);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className={cn(
            "inline-flex justify-between text-left lg:w-auto",
            compactButtonClasses,
            className,
          )}
        >
          {`Sort: ${sortLabel}`}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuRadioGroup value={sortBy} onValueChange={onSortChange}>
          {showRelevanceOption && (
            <DropdownMenuRadioItem value="relevance">
              Relevance
            </DropdownMenuRadioItem>
          )}
          <DropdownMenuRadioItem value="distance">Nearest</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="rating">Rating</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="price_asc">
            Price: Low to High
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="price_desc">
            Price: High to Low
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SortDropdown;
