import { useState, useEffect } from "react";
import { useLocation, useSearchParams, useMatch } from "react-router-dom";
import { mockEquipment } from "@/lib/mockData";
import MapComponent from "@/components/MapComponent";
import EquipmentCard from "@/components/EquipmentCard";
import FilterBar from "@/components/FilterBar";
import { Equipment } from "@/types";
import { useToast } from "@/hooks/use-toast";

const ExplorePage = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const isSearchRoute = !!useMatch("/search");

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("distance");
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>([]);

  // Update active category when URL changes
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const categoryFromUrl = queryParams.get("category");
    setActiveCategory(categoryFromUrl);
  }, [location.search]);

  // Apply filters, sorting, and search
  useEffect(() => {
    let results = [...mockEquipment];
    const searchQuery = searchParams.get("q")?.toLowerCase();

    // Apply search filter first
    if (searchQuery) {
      results = results.filter(item =>
        item.name.toLowerCase().includes(searchQuery) ||
        item.description?.toLowerCase().includes(searchQuery) ||
        item.category.toLowerCase().includes(searchQuery)
      );
    }

    // Apply category filter
    if (activeCategory) {
      results = results.filter(item => item.category === activeCategory);
    }

    // Apply sorting
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

    setFilteredEquipment(results);
  }, [activeCategory, sortBy, searchParams, viewMode]);

  // Handle reset
  const handleReset = () => {
    setActiveCategory(null);
    setSortBy("distance");
    toast({
      title: "Filters Reset",
      description: "All filters have been cleared.",
    });
  };

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
        <div className="h-[calc(100vh-12rem)]">
          <MapComponent
            activeCategory={activeCategory}
            initialEquipment={
              filteredEquipment.length > 0
                ? filteredEquipment
                    .filter(item => item.location && typeof item.location.lat === 'number' && typeof item.location.lng === 'number')
                    .map(item => ({
                      id: item.id,
                      name: item.name,
                      category: item.category,
                      price_per_day: item.price_per_day,
                      location: {
                        lat: item.location.lat,
                        lng: item.location.lng,
                      },
                    }))
                : undefined
            }
            searchQuery={searchParams.get("q")?.toLowerCase()}
          />
        </div>
      ) : (
        <div className="container px-4 md:px-6 py-8">
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
