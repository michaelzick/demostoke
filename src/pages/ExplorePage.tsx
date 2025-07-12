
import { useState, useEffect, useMemo } from "react";
import usePageMetadata from "@/hooks/usePageMetadata";
import { useLocation, useSearchParams, useMatch } from "react-router-dom";
import { getEquipmentData } from "@/services/searchService";
import MapComponent from "@/components/MapComponent";
import MapLegend from "@/components/map/MapLegend";
import EquipmentCard from "@/components/EquipmentCard";
import FilterBar from "@/components/FilterBar";
import HybridView from "@/components/HybridView";
import { Equipment } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useEquipmentWithDynamicDistance } from "@/hooks/useEquipmentWithDynamicDistance";
import useScrollToTop from "@/hooks/useScrollToTop";

const ExplorePage = () => {
  usePageMetadata({
    title: 'Explore Gear | DemoStoke',
    description: 'Find gear near you and book demos on DemoStoke.'
  });
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const isSearchRoute = !!useMatch("/search");

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("distance");
  const [viewMode, setViewMode] = useState<"map" | "list" | "hybrid">("list");
  const [allEquipment, setAllEquipment] = useState<Equipment[]>([]);
  const [isEquipmentLoading, setIsEquipmentLoading] = useState(true);
  const [hasShownNoEquipmentToast, setHasShownNoEquipmentToast] = useState(false);

  // Scroll to top on mount
  useScrollToTop();

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
    setActiveCategory(categoryFromUrl);
    setHasShownNoEquipmentToast(false); // Reset toast flag when category changes
  }, [location.search]);

  // Get equipment with dynamic distances
  const { equipment: equipmentWithDynamicDistances, isLocationBased } = useEquipmentWithDynamicDistance(allEquipment);

  // Apply filters, sorting, and search synchronously to avoid stale data when
  // switching categories
  const filteredEquipment = useMemo(() => {
    let results = [...equipmentWithDynamicDistances];
    const searchQuery = searchParams.get("q")?.toLowerCase();

    if (searchQuery) {
      results = results.filter(item =>
        item.name.toLowerCase().includes(searchQuery) ||
        item.description?.toLowerCase().includes(searchQuery) ||
        item.category.toLowerCase().includes(searchQuery)
      );
    }

    if (activeCategory) {
      results = results.filter(item => item.category === activeCategory);
    }

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
  }, [activeCategory, sortBy, searchParams, viewMode, equipmentWithDynamicDistances]);

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
    setHasShownNoEquipmentToast(false);
    toast({
      title: "Filters Reset",
      description: "All filters have been cleared.",
    });
  };


  return (
    <div className="min-h-screen">
      <FilterBar
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        onSortChange={setSortBy}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onReset={handleReset}
      />

      {viewMode === "map" ? (
        <div className="h-[calc(100vh-12rem)] relative">
          <MapComponent
            activeCategory={activeCategory}
            searchQuery={searchParams.get("q")?.toLowerCase()}
          />
          <MapLegend activeCategory={activeCategory} />
        </div>
      ) : viewMode === "hybrid" ? (
        <HybridView
          filteredEquipment={filteredEquipment}
          activeCategory={activeCategory}
          isLocationBased={isLocationBased}
        />
      ) : (
        <div className="container px-4 md:px-6 py-8">
          {isLocationBased && (
            <div className="mb-4 text-sm text-muted-foreground">
              Distances calculated from your location
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEquipment.map((equipment) => (
              <EquipmentCard key={equipment.id} equipment={equipment} />
            ))}
          </div>
          {filteredEquipment.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">No equipment found</h3>
              <p className="text-muted-foreground">
                Try changing your filters or explore a different category.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
