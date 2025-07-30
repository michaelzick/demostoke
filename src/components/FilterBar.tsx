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
  showFeatured?: boolean;
  setShowFeatured?: (show: boolean) => void;
  advancedFilters?: AdvancedFilters;
  onAdvancedFiltersChange?: (filters: AdvancedFilters) => void;
  onRemovePriceRange?: (rangeId: string) => void;
  onRemoveRatingRange?: (rangeId: string) => void;
}

const FilterBar = ({
  activeCategory,
  setActiveCategory,
  onSortChange,
  viewMode,
  setViewMode,
  onReset,
  showFeatured = false,
  setShowFeatured,
  advancedFilters = { priceRanges: [], ratingRanges: [] },
  onAdvancedFiltersChange,
  onRemovePriceRange,
  onRemoveRatingRange,
}: FilterBarProps) => {
  const [sortBy, setSortBy] = useState("distance");
  const [showAdvancedDrawer, setShowAdvancedDrawer] = useState(false);

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
      : sortBy === "price_asc"
      ? "Price: Low to High"
      : "Price: High to Low";

  return (
    <div className="border-b sticky top-16 z-30 bg-background pb-2">
      <div className="px-4 md:px-6 py-4">
        {/* Mobile layout */}
        <div className="flex flex-col gap-2 lg:hidden">
          <div className="flex gap-2 w-full">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1 text-left">
                  {`Category: ${categoryText}`}
                </Button>
              </DropdownMenuTrigger>
               <DropdownMenuContent>
                 <DropdownMenuItem onClick={() => setActiveCategory(null)}>All Equipment</DropdownMenuItem>
                 <DropdownMenuItem onClick={() => setActiveCategory('snowboards')}>Snowboards</DropdownMenuItem>
                 <DropdownMenuItem onClick={() => setActiveCategory('skis')}>Skis</DropdownMenuItem>
                 <DropdownMenuItem onClick={() => setActiveCategory('surfboards')}>Surfboards</DropdownMenuItem>
                 <DropdownMenuItem onClick={() => setActiveCategory('mountain-bikes')}>Mountain Bikes</DropdownMenuItem>
                 {setShowFeatured && (
                   <DropdownMenuItem onClick={() => setShowFeatured(!showFeatured)}>
                     {showFeatured ? '✓ Featured' : 'Featured'}
                   </DropdownMenuItem>
                 )}
               </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1 text-left">
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
                  className="flex-1 flex items-center gap-1"
                >
                  <Filter className="h-3 w-3" />
                  Advanced Filter
                </Button>
              )}
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="flex-1 flex items-center gap-1"
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
                  className="flex-1 text-left"
                >
                  {`Sort: ${sortText}`}
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

          {/* Mobile Advanced Filter Section - Only show for hybrid and list views */}
          {(viewMode === 'hybrid' || viewMode === 'list') && onAdvancedFiltersChange && (
            <div className="flex items-center gap-2 mt-2">
              {onRemovePriceRange && onRemoveRatingRange && (
                <AdvancedFilterPills
                  filters={advancedFilters}
                  onRemovePriceRange={onRemovePriceRange}
                  onRemoveRatingRange={onRemoveRatingRange}
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
              {setShowFeatured && (
                <Button
                  variant={showFeatured ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowFeatured(!showFeatured)}
                  className="whitespace-nowrap category-filter-button"
                >
                  Featured
                </Button>
              )}
              {(viewMode === 'hybrid' || viewMode === 'list') &&
                onAdvancedFiltersChange && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAdvancedDrawer(true)}
                    className="whitespace-nowrap flex items-center gap-1 category-filter-button"
                  >
                    <Filter className="h-3 w-3" />
                    Advanced Filter
                  </Button>
                )}
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
                    {`Sort: ${sortText}`}
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

          {/* Advanced Filter Link and Pills - Only show for hybrid and list views */}
          {(viewMode === 'hybrid' || viewMode === 'list') && onAdvancedFiltersChange && (
            <div className="flex items-center gap-2">
              {onRemovePriceRange && onRemoveRatingRange && (
                <AdvancedFilterPills
                  filters={advancedFilters}
                  onRemovePriceRange={onRemovePriceRange}
                  onRemoveRatingRange={onRemoveRatingRange}
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
