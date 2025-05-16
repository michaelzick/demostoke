
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RefreshCw } from "lucide-react";

interface FilterBarProps {
  activeCategory: string | null;
  setActiveCategory: (category: string | null) => void;
  onSortChange: (value: string) => void;
  viewMode: 'map' | 'list';
  setViewMode: (mode: 'map' | 'list') => void;
  onReset?: () => void;
}

const FilterBar = ({
  activeCategory,
  setActiveCategory,
  onSortChange,
  viewMode,
  setViewMode,
  onReset,
}: FilterBarProps) => {
  const [sortBy, setSortBy] = useState("distance");

  const handleSortChange = (value: string) => {
    setSortBy(value);
    onSortChange(value);
  };

  return (
    <div className="border-b sticky top-16 z-30 bg-background pb-2">
      <div className="container px-4 md:px-6 py-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            <Button
              variant={activeCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(null)}
              className="whitespace-nowrap"
            >
              All Equipment
            </Button>
            <Button
              variant={activeCategory === "snowboards" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory("snowboards")}
              className="whitespace-nowrap gap-1"
            >
              Snowboards
            </Button>
            <Button
              variant={activeCategory === "skis" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory("skis")}
              className="whitespace-nowrap gap-1"
            >
              Skis
            </Button>
            <Button
              variant={activeCategory === "surfboards" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory("surfboards")}
              className="whitespace-nowrap gap-1"
            >
              Surfboards
            </Button>
            <Button
              variant={activeCategory === "sups" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory("sups")}
              className="whitespace-nowrap gap-1"
            >
              SUPs
            </Button>
            <Button
              variant={activeCategory === "skateboards" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory("skateboards")}
              className="whitespace-nowrap gap-1"
            >
              Skateboards
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="whitespace-nowrap text-primary border-primary hover:bg-primary/10 flex items-center gap-1"
            >
              <RefreshCw size={14} />
              Reset
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === "map" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("map")}
            >
              Map View
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              List View
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Sort: {sortBy === "distance" ? "Nearest" : sortBy === "price_asc" ? "Price: Low to High" : "Price: High to Low"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup value={sortBy} onValueChange={handleSortChange}>
                  <DropdownMenuRadioItem value="distance">Nearest</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="price_asc">Price: Low to High</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="price_desc">Price: High to Low</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
