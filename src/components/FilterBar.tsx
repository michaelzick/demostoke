import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RefreshCw } from "lucide-react";

interface FilterBarProps {
  activeCategory: string | null;
  setActiveCategory: (category: string | null) => void;
  onSortChange: (value: string) => void;
  viewMode: 'map' | 'list' | 'hybrid';
  setViewMode: (mode: 'map' | 'list' | 'hybrid') => void;
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
        {/* Mobile layout */}
        <div className="flex flex-col gap-2 lg:hidden">
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">Category</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setActiveCategory(null)}>All Equipment</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveCategory('snowboards')}>Snowboards</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveCategory('skis')}>Skis</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveCategory('surfboards')}>Surfboards</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveCategory('mountain-bikes')}>Mountain Bikes</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">View</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setViewMode('map')}>Map View</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewMode('list')}>List View</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewMode('hybrid')}>Hybrid View</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="flex items-center gap-1"
            >
              <RefreshCw size={14} />
              Reset
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={viewMode === 'map'}>
                  Sort
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

        {/* Desktop layout */}
        <div className="hidden lg:flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            <Button
              variant={activeCategory === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory(null)}
              className="whitespace-nowrap category-filter-button"
            >
              All Equipment
            </Button>
            <Button
              variant={activeCategory === 'snowboards' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory('snowboards')}
              className="whitespace-nowrap category-filter-button"
            >
              Snowboards
            </Button>
            <Button
              variant={activeCategory === 'skis' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory('skis')}
              className="whitespace-nowrap gap-1 category-filter-button"
            >
              Skis
            </Button>
            <Button
              variant={activeCategory === 'surfboards' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory('surfboards')}
              className="whitespace-nowrap gap-1 category-filter-button"
            >
              Surfboards
            </Button>
            <Button
              variant={activeCategory === 'mountain-bikes' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory('mountain-bikes')}
              className="whitespace-nowrap gap-1 category-filter-button"
            >
              Mountain Bikes
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="whitespace-nowrap flex items-center gap-1 category-filter-button"
            >
              <RefreshCw size={14} />
              Reset
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'map' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('map')}
            >
              Map View
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              List View
            </Button>
            <Button
              variant={viewMode === 'hybrid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('hybrid')}
            >
              Hybrid View
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={viewMode === 'map'}>
                  Sort: {sortBy === 'distance' ? 'Nearest' : sortBy === 'price_asc' ? 'Price: Low to High' : 'Price: High to Low'}
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
