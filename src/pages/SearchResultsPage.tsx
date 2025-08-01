import { useState, useEffect } from "react";
import usePageMetadata from "@/hooks/usePageMetadata";
import { useSearchParams } from "react-router-dom";
import { searchEquipmentWithNLP, getEquipmentData } from "@/services/searchService";
import { AISearchResult } from "@/services/equipment/aiSearchService";
import EquipmentCard from "@/components/EquipmentCard";
import MapComponent from "@/components/MapComponent";
import MapLegend from "@/components/map/MapLegend";
import FilterBar from "@/components/FilterBar";
import HybridView from "@/components/HybridView";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
// Note: AdvancedFilterDrawer and AdvancedFilterPills are handled in FilterBar component
import { AdvancedFilters } from "@/types/advancedFilters";
import { applyAdvancedFilters } from "@/utils/advancedFiltering";

import { useEquipmentWithDynamicDistance } from "@/hooks/useEquipmentWithDynamicDistance";
import { useUserLocations } from "@/hooks/useUserLocations";
import { parseQueryForLocation } from "@/utils/queryParsing";
import useScrollToTop from "@/hooks/useScrollToTop";

const SearchResultsPage = () => {
  usePageMetadata({
    title: 'Search Results | DemoStoke',
    description: 'Find gear near you with DemoStoke search.'
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<AISearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"map" | "list" | "hybrid">("hybrid");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const parsedQuery = parseQueryForLocation(query);
  const [sortBy, setSortBy] = useState<string>(
    parsedQuery.location || parsedQuery.nearMe ? "relevance" : "distance"
  );
  const [searchInput, setSearchInput] = useState(query);
  const [isAISearch, setIsAISearch] = useState(false);
  const { toast } = useToast();
  
  const { data: userLocations = [] } = useUserLocations();
  const [resetCounter, setResetCounter] = useState(0);
  
  // Advanced filters state
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    priceRanges: [],
    ratingRanges: [],
    featured: false
  });

  // Perform search when query changes
  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        // If no query, get all equipment based on global app setting
        try {
          const equipmentResults = await getEquipmentData();
          // Convert Equipment[] to AISearchResult[] for consistency
          const aiSearchResults: AISearchResult[] = equipmentResults.map(item => ({
            ...item,
            ai_relevance_score: undefined,
            ai_reasoning: undefined
          }));
          setResults(aiSearchResults);
          setIsAISearch(false);
        } catch (error) {
          console.error("Failed to load equipment:", error);
          setResults([]);
        }
        return;
      }

      setIsLoading(true);
      setIsAISearch(true);
      try {
        // Get user location if query contains "near me" or lacks an explicit location
        let userLocation;
        const needsLocation =
          query.toLowerCase().includes('near me') || !/\bin\s+/i.test(query);
        if (needsLocation) {
          try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
            });
            userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            console.log('🌍 User location obtained for search:', userLocation);
          } catch (locationError) {
            console.log('📍 Could not get user location:', locationError);
          }
        }

        const equipmentResults = await searchEquipmentWithNLP(query, userLocation);
        setResults(equipmentResults);
      } catch (error) {
        console.error("Search failed:", error);
        toast({
          title: "Search Error",
          description: "Failed to process your search. Please try again.",
          variant: "destructive",
        });
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query, toast]);

  // Update default sorting when query changes
  useEffect(() => {
    const parsed = parseQueryForLocation(query);
    setSortBy(parsed.location || parsed.nearMe ? "relevance" : "distance");
  }, [query]);

  // Get equipment with dynamic distances
  const { equipment: equipmentWithDynamicDistances, isLocationBased } = useEquipmentWithDynamicDistance(results);

  // Filter results by category if selected
  const categoryFilteredResults = activeCategory
    ? equipmentWithDynamicDistances.filter(item => item.category === activeCategory)
    : equipmentWithDynamicDistances;

  // Apply advanced filters
  const filteredResults = applyAdvancedFilters(categoryFilteredResults, advancedFilters);

  // Sort results based on selected option
  const sortedResults = [...filteredResults].sort((a, b) => {
    switch (sortBy) {
      case "price_asc":
        return a.price_per_day - b.price_per_day;
      case "price_desc":
        return b.price_per_day - a.price_per_day;
      case "distance":
        return a.distance - b.distance;
      case "rating":
        return b.rating - a.rating;
      default: // relevance - use AI score if available, otherwise keep original order
        if (isAISearch && 'ai_relevance_score' in a && 'ai_relevance_score' in b) {
          const aScore = typeof a.ai_relevance_score === 'number' ? a.ai_relevance_score : 0;
          const bScore = typeof b.ai_relevance_score === 'number' ? b.ai_relevance_score : 0;
          return bScore - aScore;
        }
        return 0;
    }
  });

  // Add debug logging for distance sorting
  useEffect(() => {
    if (sortBy === "distance") {
      console.log('Sorting by distance. First 5 items:',
        sortedResults.slice(0, 5).map(item => ({
          name: item.name,
          distance: item.distance,
          category: item.category
        }))
      );
    }
  }, [sortBy, sortedResults]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    }
  };

  const handleReset = () => {
    setSearchInput("");
    setSearchParams({});
    setActiveCategory(null);
    setSortBy("relevance");
    setAdvancedFilters({ priceRanges: [], ratingRanges: [], featured: false });
    setResetCounter((c) => c + 1);
    toast({
      title: "Filters Reset",
      description: "All filters and search query have been cleared.",
    });
  };

  const handleAdvancedFiltersChange = (filters: AdvancedFilters) => {
    setAdvancedFilters(filters);
  };

  const handleRemovePriceRange = (rangeId: string) => {
    setAdvancedFilters(prev => ({
      ...prev,
      priceRanges: prev.priceRanges.filter(id => id !== rangeId)
    }));
  };

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

  const handleSuggestionClick = (searchQuery: string) => {
    // Clear existing filters and search, then perform new search
    setSearchInput(searchQuery);
    setActiveCategory(null);
    setAdvancedFilters({ priceRanges: [], ratingRanges: [], featured: false });
    setSearchParams({ q: searchQuery });
  };

  // Scroll to top on mount
  useScrollToTop();

  // Convert AISearchResult[] to MapEquipment[] for the map component
  const mapEquipment = sortedResults
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
    }));

  // Get user locations that have equipment matching the current filters
  const ownerIds = Array.from(new Set(mapEquipment.map(item => item.ownerId)));
  const filteredUserLocations = userLocations.filter(user => ownerIds.includes(user.id));

  return (
    <div className="min-h-screen">
      <div className="bg-muted py-5">
        <div className="container px-4 md:px-6">
          <div className="flex items-center gap-2 mb-4">
            <h1 className="text-3xl font-bold">Search Results</h1>
            {/* {isAISearch && (
              <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-full">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-primary">AI-Enhanced</span>
              </div>
            )} */}
          </div>

          {/* Search form */}
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
                placeholder="What can I help you find?"
              />
            </div>
            <Button type="submit" disabled={isLoading || !searchInput.trim()}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Search"}
            </Button>
          </form>

          {query && (
            <div className="mb-2">
              <p className="text-sm text-muted-foreground">
                Showing results for: <span className="font-medium">{query}</span>
                {/* {isAISearch && <span className="ml-2 text-primary">✨ AI-powered search</span>} */}
              </p>
              {!isLoading && (
                <p className="text-sm">
                  Found {filteredResults.length} {filteredResults.length === 1 ? "item" : "items"}
                </p>
              )}
            </div>
          )}

          {!query && !isLoading && (
            <div className="mb-2">
              <p className="text-sm text-muted-foreground">
                Showing all equipment
              </p>
              <p className="text-sm">
                Found {filteredResults.length} {filteredResults.length === 1 ? "item" : "items"}
              </p>
            </div>
          )}
        </div>
      </div>

      <FilterBar
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        onSortChange={setSortBy}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onReset={handleReset}
        advancedFilters={advancedFilters}
        onAdvancedFiltersChange={handleAdvancedFiltersChange}
        onRemovePriceRange={handleRemovePriceRange}
        onRemoveRatingRange={handleRemoveRatingRange}
        onRemoveFeatured={handleRemoveFeatured}
      />

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <span className="ml-4 text-lg">Processing your search...</span>
        </div>
      ) : viewMode === "map" ? (
        <div className="h-[calc(100vh-14rem)] relative">
          <MapComponent
            activeCategory={activeCategory}
            searchQuery={query?.toLowerCase()}
            isEquipmentLoading={isLoading}
            ownerIds={ownerIds}
            viewMode={viewMode}
            filteredUserLocations={filteredUserLocations}
          />
          <MapLegend activeCategory={activeCategory} viewMode={viewMode} />
        </div>
      ) : viewMode === "hybrid" ? (
        <HybridView
          filteredEquipment={sortedResults}
          activeCategory={activeCategory}
          isLocationBased={isLocationBased}
          userLocations={filteredUserLocations}
          viewMode={viewMode}
          resetSignal={resetCounter}
        />
      ) : (
        <div className="container px-4 md:px-6 py-8">
          {isLocationBased && sortBy === "distance" && (
            <div className="mb-4 text-sm text-muted-foreground">
              Distances calculated from your location
            </div>
          )}
          {sortedResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedResults.map((equipment) => (
                <div key={equipment.id} className="relative">
                  <EquipmentCard equipment={equipment} />
                  {'ai_relevance_score' in equipment && 
                   typeof equipment.ai_relevance_score === 'number' && 
                   equipment.ai_relevance_score > 70 && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      {equipment.ai_relevance_score}%
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">No equipment found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search terms or browse our categories below.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button variant="outline" onClick={() => handleSuggestionClick("DHD surfboard")}>
                  DHD Surfboards
                </Button>
                <Button variant="outline" onClick={() => handleSuggestionClick("beginner mountain bike")}>
                  Beginner Mountain Bikes
                </Button>
                <Button variant="outline" onClick={() => handleSuggestionClick("advanced snowboard")}>
                  Advanced Snowboards
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;
