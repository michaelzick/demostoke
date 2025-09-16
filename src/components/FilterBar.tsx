import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RefreshCw, Filter } from "lucide-react";
import { AdvancedFilterDrawer } from "@/components/AdvancedFilterDrawer";
import { AdvancedFilterPills } from "@/components/AdvancedFilterPills";
import { AdvancedFilters } from "@/types/advancedFilters";

interface FilterBarProps {
  activeCategory: string | null;
  setActiveCategory: (category: string | null) => void;
  onSortChange: (value: string) => void;
  viewMode: 'map' | 'list' | 'hybrid';
  setViewMode: (mode: 'map' | 'list' | 'hybrid') => void;
  onReset?: () => void;
  advancedFilters?: AdvancedFilters;
  onAdvancedFiltersChange?: (filters: AdvancedFilters) => void;
  onRemovePriceRange?: (rangeId: string) => void;
  onRemoveRatingRange?: (rangeId: string) => void;
  onRemoveFeatured?: () => void;
  currentSortBy?: string;
  showRelevanceSort?: boolean;
}

const FilterBar = ({
  activeCategory,
  setActiveCategory,
  onSortChange,
  viewMode,
  setViewMode,
  onReset,
  advancedFilters = { priceRanges: [], ratingRanges: [], featured: false },
  onAdvancedFiltersChange,
  onRemovePriceRange,
  onRemoveRatingRange,
  onRemoveFeatured,
  currentSortBy = "distance",
  showRelevanceSort = false,
}: FilterBarProps) => {
  const [sortBy, setSortBy] = useState(currentSortBy);
  const [showAdvancedDrawer, setShowAdvancedDrawer] = useState(false);

  // Sync internal state with parent state
  useEffect(() => {
    setSortBy(currentSortBy);
  }, [currentSortBy]);

  // Shared styles for small screens to prevent filter overflow
  const smallButtonClasses =
    "max-[400px]:text-xs max-[400px]:px-2 max-[400px]:py-1 max-[400px]:h-7";

  const handleSortChange = (value: string) => {
    setSortBy(value);
    onSortChange(value);
  };

  const categoryLabels: Record<string, string> = {
    "snowboards": "Snowboards",
    "skis": "Skis",
    "surfboards": "Surfboards",
    "mountain-bikes": "Mountain Bikes",
  };

  const viewLabels: Record<'map' | 'list' | 'hybrid', string> = {
    map: "Map View",
    list: "List View",
    hybrid: "Hybrid View",
  };

  const categoryText =
    activeCategory === null ? "All Equipment" : categoryLabels[activeCategory];
  const viewText = viewLabels[viewMode];
  const sortText =
    sortBy === "distance"
      ? "Nearest"
      // : sortBy === "relevance"
      // ? "Relevance"
      : sortBy === "price_asc"
      ? "Price: Low to High"
      : sortBy === "rating"
      ? "Rating"
      : "Price: High to Low";

  return (
    <div className="border-b sticky top-16 z-30 bg-background pb-2">
      <div className="px-4 md:px-6 py-4">
        {/* Mobile layout */}
        <div className="flex flex-col gap-2 lg:hidden">
          <div className="flex gap-2 w-full">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn("flex-1 text-left", smallButtonClasses)}
                >
                  {`Category: ${categoryText}`}
                </Button>
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
                <Button
                  variant="outline"
                  size="sm"
                  className={cn("flex-1 text-left", smallButtonClasses)}
                >
                  {`View: ${viewText}`}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setViewMode('map')}>Map View</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewMode('list')}>List View</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewMode('hybrid')}>Hybrid View</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex gap-2 w-full">
            {(viewMode === 'hybrid' || viewMode === 'list') &&
              onAdvancedFiltersChange && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdvancedDrawer(true)}
                  className={cn("flex-1 flex items-center gap-1", smallButtonClasses)}
                >
                  <Filter className="h-3 w-3" />
                  Advanced Filter
                </Button>
              )}
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className={cn("flex-1 flex items-center gap-1", smallButtonClasses)}
            >
              <RefreshCw size={14} />
              Reset
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={viewMode === 'map'}
                  className={cn("flex-1 text-left", smallButtonClasses)}
                >
                  {`Sort: ${sortText}`}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup value={sortBy} onValueChange={handleSortChange}>
                  {showRelevanceSort && <DropdownMenuRadioItem value="relevance">Relevance</DropdownMenuRadioItem>}
                  <DropdownMenuRadioItem value="distance">Nearest</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="rating">Rating</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="price_asc">Price: Low to High</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="price_desc">Price: High to Low</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Advanced Filter Section - Only show for hybrid and list views */}
          {(viewMode === 'hybrid' || viewMode === 'list') && onAdvancedFiltersChange && (
            <div className="flex items-center gap-2 mt-2">
              {onRemovePriceRange && onRemoveRatingRange && onRemoveFeatured && (
                <AdvancedFilterPills
                  filters={advancedFilters}
                  onRemovePriceRange={onRemovePriceRange}
                  onRemoveRatingRange={onRemoveRatingRange}
                  onRemoveFeatured={onRemoveFeatured}
                />
              )}
            </div>
          )}
        </div>

        {/* Desktop layout */}
        <div className="hidden lg:flex flex-col gap-3">
          <div className="flex justify-between">
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
                    {`Sort: ${sortText}`}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuRadioGroup value={sortBy} onValueChange={handleSortChange}>
                    {/* {showRelevanceSort && <DropdownMenuRadioItem value="relevance">Relevance</DropdownMenuRadioItem>} */}
                    <DropdownMenuRadioItem value="distance">Nearest</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="rating">Rating</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="price_asc">Price: Low to High</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="price_desc">Price: High to Low</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Advanced Filter and Reset buttons - Second line */}
          {(viewMode === 'hybrid' || viewMode === 'list') && onAdvancedFiltersChange && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex items-center gap-1 text-xs px-2 py-1 h-7"
                onClick={() => setShowAdvancedDrawer(true)}
              >
                <Filter className="h-3 w-3" />
                Advanced Filter
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-1 text-xs px-2 py-1 h-7"
                onClick={onReset}
              >
                <RefreshCw size={12} />
                Reset
              </Button>
            </div>
          )}

          {/* Advanced Filter Link and Pills - Only show for hybrid and list views */}
          {(viewMode === 'hybrid' || viewMode === 'list') && onAdvancedFiltersChange && (
            <div className="flex items-center gap-2">
              {onRemovePriceRange && onRemoveRatingRange && onRemoveFeatured && (
                <AdvancedFilterPills
                  filters={advancedFilters}
                  onRemovePriceRange={onRemovePriceRange}
                  onRemoveRatingRange={onRemoveRatingRange}
                  onRemoveFeatured={onRemoveFeatured}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Advanced Filter Drawer */}
      {onAdvancedFiltersChange && (
        <AdvancedFilterDrawer
          open={showAdvancedDrawer}
          onOpenChange={setShowAdvancedDrawer}
          filters={advancedFilters}
          onFiltersChange={onAdvancedFiltersChange}
        />
      )}
    </div>
  );
};

export default FilterBar;
