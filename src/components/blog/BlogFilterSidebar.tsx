import { Search, SortAsc, SortDesc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarContent, SidebarHeader, useSidebar } from "@/components/ui/sidebar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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
      <SidebarContent className="p-6">
        <div className="space-y-6 pb-6">
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
                variant={sortBy === "latest" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("latest")}
                className="gap-2"
              >
                <SortDesc className="h-3 w-3" />
                Latest
              </Button>
              <Button
                variant={sortBy === "oldest" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("oldest")}
                className="gap-2"
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
                    variant={selectedFilter === "" ? "default" : "outline"}
                    size="sm"
                    onClick={() => applyFilter("")}
                    className="justify-start"
                  >
                    All Posts
                  </Button>
                  {filters.map((filter) => (
                    <Button
                      key={filter.value}
                      variant={selectedFilter === filter.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => applyFilter(filter.value)}
                      className="justify-start"
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
                    variant={selectedDateFilter === "" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedDateFilter("")}
                    className="justify-start text-xs"
                  >
                    All Dates
                  </Button>
                  {getDateOptions().map((dateOption) => (
                    <Button
                      key={dateOption.value}
                      variant={selectedDateFilter === dateOption.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedDateFilter(dateOption.value)}
                      className="justify-start text-xs"
                    >
                      {dateOption.label}
                    </Button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {hasActiveFilters && (
            <div className="space-y-2">
              <Button onClick={closeSidebar} className="w-full">
                Go
              </Button>
              <Button variant="outline" onClick={clearSearch} className="w-full">
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </SidebarContent>
    </>
  );
}

export default BlogFilterSidebar;
