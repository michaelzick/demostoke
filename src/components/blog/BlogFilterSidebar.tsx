import { Search, SortAsc, SortDesc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarContent, SidebarHeader, useSidebar } from "@/components/ui/sidebar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useRef } from "react";

interface FilterOption {
  label: string;
  value: string;
}

interface DateOption {
  label: string;
  value: string;
}

interface BlogFilterSidebarProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  sortBy: "latest" | "oldest";
  setSortBy: (value: "latest" | "oldest") => void;
  selectedFilter: string;
  applyFilter: (filter: string) => void;
  selectedDateFilter: string;
  setSelectedDateFilter: (value: string) => void;
  getDateOptions: () => DateOption[];
  clearSearch: () => void;
  filters: FilterOption[];
  showFeaturedOnly: boolean;
  setShowFeaturedOnly: (value: boolean) => void;
  featuredPostIds: string[];
}

export function BlogFilterSidebar({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  selectedFilter,
  applyFilter,
  selectedDateFilter,
  setSelectedDateFilter,
  getDateOptions,
  clearSearch,
  filters,
  showFeaturedOnly,
  setShowFeaturedOnly,
  featuredPostIds,
}: BlogFilterSidebarProps) {
  const { setOpen, setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();
  const previousIsMobileRef = useRef(isMobile);

  const closeSidebar = () => {
    setOpenMobile(false);
  };

  // Reset sidebar visibility when switching from mobile to desktop
  useEffect(() => {
    const wasMobile = previousIsMobileRef.current;
    const isNowDesktop = !isMobile;
    
    if (wasMobile && isNowDesktop) {
      setOpen(true);
      setOpenMobile(false);
    }
    
    previousIsMobileRef.current = isMobile;
  }, [isMobile, setOpen, setOpenMobile]);

  const hasActiveFilters =
    !!searchQuery ||
    !!selectedFilter ||
    !!selectedDateFilter ||
    showFeaturedOnly ||
    sortBy !== "latest";

  const bottomPadding = isMobile
    ? hasActiveFilters
      ? "120px"
      : "80px"
    : hasActiveFilters
    ? "120px"
    : "24px";

  return (
    <>
      <SidebarHeader className="p-6">
        <h2 className="text-lg font-semibold">Search & Filter Posts</h2>
      </SidebarHeader>
      <SidebarContent>
        <div className="p-6 space-y-6" style={{ paddingBottom: bottomPadding }}>
          <div>
            <label className="text-sm font-medium mb-2 block">Search</label>
            <div className="relative">
              <Input
                type="text"
                placeholder="Search blog posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500" />
            </div>
          </div>

          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
              className={cn("w-full justify-start", showFeaturedOnly && "border-white text-white")}
            >
              Featured Posts
            </Button>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Sort by Date</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortBy("latest")}
                className={cn("gap-2", sortBy === "latest" && "border-white text-white")}
              >
                <SortDesc className="h-3 w-3" />
                Latest
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortBy("oldest")}
                className={cn("gap-2", sortBy === "oldest" && "border-white text-white")}
              >
                <SortAsc className="h-3 w-3" />
                Oldest
              </Button>
            </div>
          </div>

          <Accordion type="multiple" defaultValue={["category", "date"]} className="w-full space-y-0">
            <AccordionItem value="category" className="border-none">
              <AccordionTrigger className="text-sm font-medium py-3">
                Category
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => applyFilter("")}
                    className={cn("justify-start", selectedFilter === "" && "border-white text-white")}
                  >
                    All Posts
                  </Button>
                  {filters.map((filter) => (
                    <Button
                      key={filter.value}
                      variant="outline"
                      size="sm"
                      onClick={() => applyFilter(filter.value)}
                      className={cn("justify-start", selectedFilter === filter.value && "border-white text-white")}
                    >
                      {filter.label}
                    </Button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="date" className="border-none">
              <AccordionTrigger className="text-sm font-medium py-3">
                Filter by Month/Year
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 gap-1 max-h-40 overflow-y-auto pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDateFilter("")}
                    className={cn("justify-start text-xs", selectedDateFilter === "" && "border-white text-white")}
                  >
                    All Dates
                  </Button>
                  {getDateOptions().map((dateOption) => (
                    <Button
                      key={dateOption.value}
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedDateFilter(dateOption.value)}
                      className={cn("justify-start text-xs", selectedDateFilter === dateOption.value && "border-white text-white")}
                    >
                      {dateOption.label}
                    </Button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </SidebarContent>
      
      {(isMobile || hasActiveFilters) && (
        <div
          className="fixed bottom-0 left-0 p-6 bg-sidebar border-t space-y-2 z-10"
          style={{ width: 'var(--sidebar-width, 320px)' }}
        >
          {isMobile && (
            <Button onClick={closeSidebar} className="w-full">
              Close
            </Button>
          )}
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearSearch} className="w-full">
              Clear All Filters
            </Button>
          )}
        </div>
      )}
    </>
  );
}

export default BlogFilterSidebar;
