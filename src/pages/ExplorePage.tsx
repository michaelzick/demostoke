
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { mockEquipment } from "@/lib/mockData";
import MapComponent from "@/components/MapComponent";
import EquipmentCard from "@/components/EquipmentCard";
import FilterBar from "@/components/FilterBar";
import { Equipment } from "@/types";

const ExplorePage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get("category");

  const [activeCategory, setActiveCategory] = useState<string | null>(initialCategory);
  const [sortBy, setSortBy] = useState<string>("distance");
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>(mockEquipment);

  // Apply filters and sorting
  useEffect(() => {
    let results = [...mockEquipment];
    
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
        results.sort((a, b) => a.pricePerDay - b.pricePerDay);
        break;
      case "price_desc":
        results.sort((a, b) => b.pricePerDay - a.pricePerDay);
        break;
      default:
        break;
    }
    
    setFilteredEquipment(results);
  }, [activeCategory, sortBy]);

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
      />
      
      {viewMode === "map" ? (
        <div className="h-[calc(100vh-12rem)]">
          <MapComponent equipment={filteredEquipment} activeCategory={activeCategory} />
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
