import { useState, useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AdvancedFilters, PRICE_RANGES, RATING_RANGES } from "@/types/advancedFilters";

interface AdvancedFilterDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: AdvancedFilters;
  onFiltersChange: (filters: AdvancedFilters) => void;
}

export function AdvancedFilterDrawer({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
}: AdvancedFilterDrawerProps) {
  const [tempFilters, setTempFilters] = useState<AdvancedFilters>(filters);

  // Sync tempFilters with filters prop when it changes (e.g., when pills are removed)
  useEffect(() => {
    setTempFilters(filters);
  }, [filters]);

  const handlePriceRangeChange = (rangeId: string, checked: boolean) => {
    setTempFilters(prev => ({
      ...prev,
      priceRanges: checked
        ? [...prev.priceRanges, rangeId]
        : prev.priceRanges.filter(id => id !== rangeId)
    }));
  };

  const handleRatingRangeChange = (rangeId: string, checked: boolean) => {
    setTempFilters(prev => ({
      ...prev,
      ratingRanges: checked
        ? [...prev.ratingRanges, rangeId]
        : prev.ratingRanges.filter(id => id !== rangeId)
    }));
  };

  const handleApply = () => {
    onFiltersChange(tempFilters);
    onOpenChange(false);
  };

  const handleClearAll = () => {
    const clearedFilters = { priceRanges: [], ratingRanges: [] };
    setTempFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setTempFilters(filters); // Reset to current filters
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Advanced Filters</DrawerTitle>
            <DrawerDescription>
              Refine your search with price and rating filters
            </DrawerDescription>
          </DrawerHeader>
          
          <div className="p-4 pb-0 space-y-6">
            {/* Price Range Section */}
            <div>
              <h3 className="font-medium mb-3">Price Range</h3>
              <div className="space-y-3">
                {PRICE_RANGES.map((range) => (
                  <div key={range.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={range.id}
                      checked={tempFilters.priceRanges.includes(range.id)}
                      onCheckedChange={(checked) => 
                        handlePriceRangeChange(range.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={range.id} className="text-sm">
                      {range.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Rating Section */}
            <div>
              <h3 className="font-medium mb-3">Rating</h3>
              <div className="space-y-3">
                {RATING_RANGES.map((range) => (
                  <div key={range.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={range.id}
                      checked={tempFilters.ratingRanges.includes(range.id)}
                      onCheckedChange={(checked) => 
                        handleRatingRangeChange(range.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={range.id} className="text-sm">
                      {range.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DrawerFooter>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel} className="flex-1">
                Cancel
              </Button>
              <Button variant="outline" onClick={handleClearAll} className="flex-1">
                Clear All
              </Button>
              <Button onClick={handleApply} className="flex-1">
                Apply
              </Button>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}