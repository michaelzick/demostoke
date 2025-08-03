import { Search, SortAsc, SortDesc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarContent, SidebarHeader, useSidebar } from "@/components/ui/sidebar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

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
}: BlogFilterSidebarProps) {
  const { setOpen, setOpenMobile } = useSidebar();

  const closeSidebar = () => {
    setOpen(false);
    setOpenMobile(false);
  };

  const hasActiveFilters =
    !!searchQuery ||
    !!selectedFilter ||
    !!selectedDateFilter ||
    sortBy !== "latest";

  return (
    <>
      <SidebarHeader className="p-6">
        <h2 className="text-lg font-semibold">Search & Filter Posts</h2>
      </SidebarHeader>
      <SidebarContent className="p-6 pb-32">
        <div className="space-y-6">
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
      {hasActiveFilters && (
        <div className="space-y-2 fixed bottom-0 left-0 w-[--sidebar-width] p-6 bg-sidebar">
          <Button onClick={closeSidebar} className="w-full">
            Go
          </Button>
          <Button variant="outline" onClick={clearSearch} className="w-full">
            Clear All Filters
          </Button>
        </div>
      )}
    </>
  );
}

export default BlogFilterSidebar;
