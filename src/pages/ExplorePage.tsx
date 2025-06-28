
import { useState, useEffect } from "react";
import { useLocation, useSearchParams, useMatch } from "react-router-dom";
import { getEquipmentData } from "@/services/searchService";
import MapComponent from "@/components/MapComponent";
import EquipmentCard from "@/components/EquipmentCard";
import FilterBar from "@/components/FilterBar";
import { Equipment } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { calculateDistance, isValidCoordinate } from "@/utils/distanceCalculation";

const ExplorePage = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const isSearchRoute = !!useMatch("/search");

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("distance");
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>([]);
  const [allEquipment, setAllEquipment] = useState<Equipment[]>([]);

  // Extract user location from URL parameters
  const userLocationFromUrl = (() => {
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      if (!isNaN(latitude) && !isNaN(longitude)) {
        return { lat: latitude, lng: longitude };
      }
    }
    return null;
  })();

  // Configure search radius based on user location (50 miles for location-based searches)
  const SEARCH_RADIUS_MILES = 50;

  // Load equipment data using global app settings
  useEffect(() => {
    const loadEquipment = async () => {
      try {
        const equipment = await getEquipmentData();
        setAllEquipment(equipment);
      } catch (error) {
        console.error("Failed to load equipment:", error);
        setAllEquipment([]);
      }
    };

    loadEquipment();
  }, []);

  // Update active category when URL changes
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const categoryFromUrl = queryParams.get("category");
    setActiveCategory(categoryFromUrl);
  }, [location.search]);

  // Apply filters, sorting, and search with radius-based filtering
  useEffect(() => {
    let results = [...allEquipment];
    const searchQuery = searchParams.get("q")?.toLowerCase();

    // Apply radius-based filtering when user location is available
    if (userLocationFromUrl && isValidCoordinate(userLocationFromUrl.lat, userLocationFromUrl.lng)) {
      results = results.filter(item => {
        if (!isValidCoordinate(item.location?.lat, item.location?.lng)) {
          return false;
        }
        
        const distance = calculateDistance(
          userLocationFromUrl.lat,
          userLocationFromUrl.lng,
          item.location!.lat!,
          item.location!.lng!
        );
        
        return distance <= SEARCH_RADIUS_MILES;
      });

      // Calculate and update distances for equipment within radius
      results = results.map(item => {
        if (isValidCoordinate(item.location?.lat, item.location?.lng)) {
          const distance = calculateDistance(
            userLocationFromUrl.lat,
            userLocationFromUrl.lng,
            item.location!.lat!,
            item.location!.lng!
          );
          return { ...item, distance };
        }
        return item;
      });
    }

    // Apply search filter
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

    // Apply sorting with priority for user location
    switch (sortBy) {
      case "distance":
        if (userLocationFromUrl) {
          // Sort by calculated distance when user location is available
          results.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        } else {
          // Fall back to original distance sorting
          results.sort((a, b) => a.distance - b.distance);
        }
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
  }, [activeCategory, sortBy, searchParams, viewMode, allEquipment, userLocationFromUrl]);

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
                      ownerId: item.owner.id,
                      ownerName: item.owner.name,
                    }))
                : undefined
            }
            searchQuery={searchParams.get("q")?.toLowerCase()}
            userLocation={userLocationFromUrl}
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
                {userLocationFromUrl 
                  ? `No equipment found within ${SEARCH_RADIUS_MILES} miles of your location. Try expanding your search or changing filters.`
                  : "Try changing your filters or explore a different category."
                }
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
