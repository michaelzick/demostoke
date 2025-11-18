import { useState, useRef, useEffect, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface HorizontalScrollSectionProps<T> {
  title: string;
  items: T[];
  isLoading?: boolean;
  renderItem: (item: T, index: number) => ReactNode;
  sectionClassName?: string;
  desktopCols?: { md: number; lg: number };
}

export function HorizontalScrollSection<T>({
  title,
  items,
  isLoading,
  renderItem,
  sectionClassName = "py-12 bg-muted/50",
  desktopCols = { md: 3, lg: 5 }
}: HorizontalScrollSectionProps<T>) {
  const mdGridClass =
    desktopCols.md === 2 ? "md:grid-cols-2" :
    desktopCols.md === 4 ? "md:grid-cols-4" :
    desktopCols.md === 5 ? "md:grid-cols-5" :
    "md:grid-cols-3";

  const lgGridClass =
    desktopCols.lg === 2 ? "lg:grid-cols-2" :
    desktopCols.lg === 3 ? "lg:grid-cols-3" :
    desktopCols.lg === 4 ? "lg:grid-cols-4" :
    desktopCols.lg === 6 ? "lg:grid-cols-6" :
    "lg:grid-cols-5";

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 1
      );
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -228, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 228, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    updateScrollButtons();
    container.addEventListener("scroll", updateScrollButtons);
    window.addEventListener("resize", updateScrollButtons);

    return () => {
      container.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [items]);

  // Reset scroll position when items change to show newest item
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
  }, [items]);

  // Don't show section if no items
  if (isLoading || !items || items.length === 0) {
    return null;
  }

  return (
    <section className={sectionClassName}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">{title}</h2>

          {/* Navigation arrows - mobile only */}
          <div className="flex gap-2 md:hidden">
            <Button
              variant="outline"
              size="icon"
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              className="h-8 w-8 border-zinc-500 text-zinc-700 dark:border-zinc-200 dark:text-zinc-100 hover:border-zinc-700 hover:text-zinc-900 dark:hover:border-zinc-50 dark:hover:text-white disabled:border-zinc-300 disabled:text-zinc-400 dark:disabled:border-zinc-700 dark:disabled:text-zinc-600"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={scrollRight}
              disabled={!canScrollRight}
              className="h-8 w-8 border-zinc-500 text-zinc-700 dark:border-zinc-200 dark:text-zinc-100 hover:border-zinc-700 hover:text-zinc-900 dark:hover:border-zinc-50 dark:hover:text-white disabled:border-zinc-300 disabled:text-zinc-400 dark:disabled:border-zinc-700 dark:disabled:text-zinc-600"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          className={cn(
            "flex overflow-x-auto gap-5 pb-4 snap-x snap-mandatory",
            "md:grid md:gap-6 md:overflow-visible md:snap-none scrollbar-hide",
            mdGridClass,
            lgGridClass
          )}
        >
          {items.map((item, index) => renderItem(item, index))}
        </div>
      </div>
    </section>
  );
}
