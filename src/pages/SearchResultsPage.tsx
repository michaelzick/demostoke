
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { searchEquipmentWithNLP } from "@/services/searchService";
import { Equipment } from "@/types";
import EquipmentCard from "@/components/EquipmentCard";
import MapComponent from "@/components/MapComponent";
import FilterBar from "@/components/FilterBar";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { mockEquipment } from "@/lib/mockData";

const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"map" | "list">("list");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("relevance");
  const [searchInput, setSearchInput] = useState(query);
  const { toast } = useToast();

  // Perform search when query changes
  useEffect(() => {
    if (!query) {
      setResults(mockEquipment);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const equipmentResults = await searchEquipmentWithNLP(query);
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

  // Filter results by category if selected
  const filteredResults = activeCategory
    ? results.filter(item => item.category === activeCategory)
    : results;

  // Sort results based on selected option
  const sortedResults = [...filteredResults].sort((a, b) => {
    switch (sortBy) {
      case "price_asc":
        return a.pricePerDay - b.pricePerDay;
      case "price_desc":
        return b.pricePerDay - a.pricePerDay;
      case "distance":
        return a.distance - b.distance;
      case "rating":
        return b.rating - a.rating;
      default: // relevance - keep original order from search
        return 0;
    }
  });

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
    setResults(mockEquipment);
    toast({
      title: "Filters Reset",
      description: "All filters and search query have been cleared.",
    });
  };

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen">
      <div className="bg-muted py-8">
        <div className="container px-4 md:px-6">
          <h1 className="text-3xl font-bold mb-4">Search Results</h1>
          
          {/* Search form */}
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
                placeholder="Search using natural language..."
              />
            </div>
            <Button type="submit" disabled={isLoading || !searchInput.trim()}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Search"}
            </Button>
          </form>

          {query && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                Showing results for: <span className="font-medium">{query}</span>
              </p>
              {!isLoading && (
                <p className="text-sm">
                  Found {filteredResults.length} {filteredResults.length === 1 ? "item" : "items"}
                </p>
              )}
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
      />

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <span className="ml-4 text-lg">Processing your search...</span>
        </div>
      ) : viewMode === "map" ? (
        <div className="h-[calc(100vh-14rem)]">
          <MapComponent equipment={sortedResults} activeCategory={activeCategory} />
        </div>
      ) : (
        <div className="container px-4 md:px-6 py-8">
          {sortedResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedResults.map((equipment) => (
                <EquipmentCard key={equipment.id} equipment={equipment} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">No equipment found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search terms or browse our categories below.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button variant="outline" onClick={() => setSearchParams({ q: "beginner surfboard" })}>
                  Beginner Surfboards
                </Button>
                <Button variant="outline" onClick={() => setSearchParams({ q: "all-mountain snowboard" })}>
                  All-Mountain Snowboards
                </Button>
                <Button variant="outline" onClick={() => setSearchParams({ q: "skateboard in Venice" })}>
                  Skateboards in Venice
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
