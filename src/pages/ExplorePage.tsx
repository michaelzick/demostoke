
import { useState, useEffect, useMemo, useRef } from "react";
import { Loader2 } from "lucide-react";
import usePageMetadata from "@/hooks/usePageMetadata";
import { useLocation, useSearchParams } from "react-router-dom";
import { getEquipmentData } from "@/services/searchService";
import MapComponent from "@/components/MapComponent";
import MapLegend from "@/components/map/MapLegend";
import EquipmentCard from "@/components/EquipmentCard";
import FilterBar from "@/components/FilterBar";
import HybridView from "@/components/HybridView";
import SortDropdown from "@/components/SortDropdown";
import GearQuickFilterInput from "@/components/GearQuickFilterInput";
import { Equipment } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useEquipmentWithDynamicDistance } from "@/hooks/useEquipmentWithDynamicDistance";
import useScrollToTop from "@/hooks/useScrollToTop";
import { useScrollToTopButton } from "@/hooks/useScrollToTopButton";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { useUserLocations } from "@/hooks/useUserLocations";
import { getFilteredUserLocations } from "@/utils/equipmentLocationMapping";
import { useIsAdmin } from "@/hooks/useUserRole";
import { AdvancedFilters } from "@/types/advancedFilters";
import { applyAdvancedFilters } from "@/utils/advancedFiltering";
import { filterGearByQuickQuery } from "@/utils/gearQuickFilter";
import { useFavorites } from "@/contexts/FavoritesContext";

const ExplorePage = () => {
  usePageMetadata({
    title: 'Explore Gear | DemoStoke',
    description: 'Find gear near you and book demos on DemoStoke.'
  });
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuickFilterFromUrl = searchParams.get("q") ?? "";
  const { toast } = useToast();

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("distance");
  const [viewMode, setViewMode] = useState<"map" | "list" | "hybrid">("hybrid");
  const [quickFilter, setQuickFilter] = useState(initialQuickFilterFromUrl);
  const lastSyncedUrlQRef = useRef(initialQuickFilterFromUrl);
  const [allEquipment, setAllEquipment] = useState<Equipment[]>([]);
  const [isEquipmentLoading, setIsEquipmentLoading] = useState(true);
  const [hasShownNoEquipmentToast, setHasShownNoEquipmentToast] = useState(false);
  const { data: userLocations = [] } = useUserLocations();
  const [resetCounter, setResetCounter] = useState(0);
  const { isAdmin } = useIsAdmin();
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    priceRanges: [],
    ratingRanges: [],
    featured: false,
    myFavorites: false
  });
  const { favorites: favoriteIds } = useFavorites();

  // Scroll to top on mount
  useScrollToTop();

  // Scroll to top button for list view
  const { showButton: showScrollButton, scrollToTop: scrollListToTop } = useScrollToTopButton({
    threshold: 300
  });

  // Load equipment data using global app settings
  useEffect(() => {
    const loadEquipment = async () => {
      setIsEquipmentLoading(true);
      try {
        const equipment = await getEquipmentData();
        setAllEquipment(equipment);
      } catch (error) {
        console.error("Failed to load equipment:", error);
        setAllEquipment([]);
      } finally {
        setIsEquipmentLoading(false);
      }
    };

    loadEquipment();
  }, []);

  // Update active category when URL changes
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const categoryFromUrl = queryParams.get("category");
    const myFavoritesFromUrl = queryParams.get("myFavorites") === "true";
    const viewFromUrl = queryParams.get("view") as "map" | "list" | "hybrid" | null;
    
    setActiveCategory(categoryFromUrl);
    
    if (myFavoritesFromUrl) {
      setAdvancedFilters(prev => ({ ...prev, myFavorites: true }));
    }
    
    if (viewFromUrl) {
      setViewMode(viewFromUrl);
    }
    
    setHasShownNoEquipmentToast(false);
  }, [location.search]);

  // Sync quick filter from URL `q` only when URL query actually changes externally.
  useEffect(() => {
    const urlQ = searchParams.get("q") ?? "";

    if (urlQ !== lastSyncedUrlQRef.current) {
      setQuickFilter(urlQ);
      lastSyncedUrlQRef.current = urlQ;
    }
  }, [searchParams]);

  // Get equipment with dynamic distances
  const { equipment: equipmentWithDynamicDistances, isLocationBased } = useEquipmentWithDynamicDistance(allEquipment);

  const handleCategoryChange = (category: string | null) => {
    setActiveCategory(category);
    if (category === null) {
      const newParams = new URLSearchParams(location.search);
      newParams.delete('category');
      setSearchParams(newParams);
    }
  };

  const baseFilteredEquipment = useMemo(() => {
    let results = [...equipmentWithDynamicDistances];

    if (activeCategory) {
      results = results.filter(item => item.category === activeCategory);
    }

    // Apply advanced filters
    results = applyAdvancedFilters(results, advancedFilters, favoriteIds);

    return results;
  }, [activeCategory, equipmentWithDynamicDistances, advancedFilters, favoriteIds]);

  // Apply quick filter and sorting to avoid stale data when switching categories.
  const filteredEquipment = useMemo(() => {
    const quickFiltered = filterGearByQuickQuery(baseFilteredEquipment, quickFilter);
    const results = [...quickFiltered];

    switch (sortBy) {
      case "distance":
        results.sort((a, b) => a.distance - b.distance);
        break;
      case "price_asc":
        results.sort((a, b) => a.price_per_day - b.price_per_day);
        break;
      case "price_desc":
        results.sort((a, b) => b.price_per_day - a.price_per_day);
        break;
      default:
        break;
    }

    console.log("Sorting by:", sortBy);
    console.log(
      "First 3 items after sorting:",
      results.slice(0, 3).map(item => ({
        name: item.name,
        distance: item.distance,
        category: item.category,
      }))
    );

    return results;
  }, [baseFilteredEquipment, quickFilter, sortBy]);

  const isQuickFilterActive = quickFilter.trim().length > 0;

  // Filter user locations to only show those that have equipment in the filtered results
  const filteredUserLocations = getFilteredUserLocations(filteredEquipment, userLocations);

  // Show toast when no equipment is found after filtering
  useEffect(() => {
    if (!isEquipmentLoading && filteredEquipment.length === 0 && activeCategory && !hasShownNoEquipmentToast) {
      toast({
        title: "No equipment found",
        description: `No ${activeCategory.toLowerCase()} available in this area. Try expanding your search or browse other categories.`,
      });
      setHasShownNoEquipmentToast(true);
    }
  }, [filteredEquipment.length, activeCategory, isEquipmentLoading, hasShownNoEquipmentToast, toast]);

  // Handle reset
  const handleReset = () => {
    setActiveCategory(null);
    setSortBy("distance");
    setQuickFilter("");
    lastSyncedUrlQRef.current = "";
    setAdvancedFilters({ priceRanges: [], ratingRanges: [], featured: false, myFavorites: false });
    setHasShownNoEquipmentToast(false);
    setResetCounter((c) => c + 1);
    const newParams = new URLSearchParams(location.search);
    newParams.delete('category');
    newParams.delete('q');
    setSearchParams(newParams);
    toast({
      title: "Filters Reset",
      description: "All filters have been cleared.",
    });
  };

  // Handle advanced filter changes
  const handleAdvancedFiltersChange = (filters: AdvancedFilters) => {
    setAdvancedFilters(filters);
    setHasShownNoEquipmentToast(false);
  };

  // Handle removing individual filters
  const handleRemoveFilter = (filterType: 'priceRange' | 'ratingRange' | 'featured' | 'myFavorites', value?: string) => {
    switch (filterType) {
      case 'priceRange':
        if (value) {
          setAdvancedFilters(prev => ({
            ...prev,
            priceRanges: prev.priceRanges.filter(id => id !== value)
          }));
        }
        break;
      case 'ratingRange':
        if (value) {
          setAdvancedFilters(prev => ({
            ...prev,
            ratingRanges: prev.ratingRanges.filter(id => id !== value)
          }));
        }
        break;
      case 'featured':
        setAdvancedFilters(prev => ({ ...prev, featured: false }));
        break;
      case 'myFavorites':
        setAdvancedFilters(prev => ({ ...prev, myFavorites: false }));
        break;
    }
    setHasShownNoEquipmentToast(false);
  };

  // Handle removing individual price range filters
  const handleRemovePriceRange = (rangeId: string) => {
    setAdvancedFilters(prev => ({
      ...prev,
      priceRanges: prev.priceRanges.filter(id => id !== rangeId)
    }));
  };

  // Handle removing individual rating range filters  
  const handleRemoveRatingRange = (rangeId: string) => {
    setAdvancedFilters(prev => ({
      ...prev,
      ratingRanges: prev.ratingRanges.filter(id => id !== rangeId)
    }));
  };

  const handleRemoveFeatured = () => {
    setAdvancedFilters(prev => ({
      ...prev,
      featured: false
    }));
  };


  return (
    <div className="min-h-screen">
      <FilterBar
        activeCategory={activeCategory}
        setActiveCategory={handleCategoryChange}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onReset={handleReset}
        advancedFilters={advancedFilters}
        onAdvancedFiltersChange={handleAdvancedFiltersChange}
        onRemovePriceRange={(id) => handleRemoveFilter('priceRange', id)}
        onRemoveRatingRange={(id) => handleRemoveFilter('ratingRange', id)}
        onRemoveFeatured={() => handleRemoveFilter('featured')}
        recentlyViewedRightContent={
          <div className="flex w-full flex-col gap-1">
            <GearQuickFilterInput
              value={quickFilter}
              onChange={setQuickFilter}
              onClear={() => setQuickFilter("")}
              placeholder="Filter shown gear..."
              className="sm:max-w-none"
            />
            {!isEquipmentLoading && isQuickFilterActive && (
              <p className="text-sm text-muted-foreground">
                Showing {filteredEquipment.length} of {baseFilteredEquipment.length} items
              </p>
            )}
          </div>
        }
      />

      {isEquipmentLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <span className="ml-4 text-lg">Loading gear...</span>
        </div>
      ) : viewMode === "map" ? (
        <div className="h-[calc(100vh-12rem)] relative">
          <MapComponent
            activeCategory={activeCategory}
            searchQuery={searchParams.get("q")?.toLowerCase()}
            viewMode={viewMode}
            filteredUserLocations={filteredUserLocations}
          />
          <MapLegend activeCategory={activeCategory} viewMode={viewMode} />
        </div>
      ) : viewMode === "hybrid" ? (
        <HybridView
          filteredEquipment={filteredEquipment}
          activeCategory={activeCategory}
          isLocationBased={isLocationBased}
          userLocations={filteredUserLocations}
          viewMode={viewMode}
          resetSignal={resetCounter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          emptyMessage={
            isQuickFilterActive
              ? "No gear matches your quick filter. Clear the filter or try different terms."
              : undefined
          }
        />
      ) : (
        <div className="container px-4 md:px-6 pt-4 pb-8">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {isLocationBased && (
              <div className="text-sm text-muted-foreground">
                Distances calculated from your location
              </div>
            )}
            <div className="w-full lg:w-auto lg:ml-auto mt-2 lg:mt-0">
              <SortDropdown sortBy={sortBy} onSortChange={setSortBy} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEquipment.map((equipment) => (
              <EquipmentCard 
                key={equipment.id} 
                equipment={equipment} 
                showAdminControls={viewMode === 'list' && isAdmin}
              />
            ))}
          </div>
          {filteredEquipment.length === 0 && !isEquipmentLoading && (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">No equipment found</h3>
              <p className="text-muted-foreground">
                {isQuickFilterActive
                  ? "No gear matches your quick filter. Clear the filter or try different terms."
                  : "Try changing your filters or explore a different category."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Scroll to top button - only show in list view */}
      {viewMode === "list" && (
        <ScrollToTopButton show={showScrollButton} onClick={scrollListToTop} />
      )}
    </div>
  );
};

export default ExplorePage;
