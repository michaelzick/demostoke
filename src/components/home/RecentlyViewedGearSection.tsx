import { Link } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRecentlyViewedEquipment } from "@/hooks/useRecentlyViewedEquipment";
import { slugify } from "@/utils/slugify";

interface RecentlyViewedGearSectionProps {
  userId?: string;
}

export default function RecentlyViewedGearSection({ userId }: RecentlyViewedGearSectionProps) {
  const { data: equipment, isLoading } = useRecentlyViewedEquipment(userId);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = () => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;

    // Can scroll left if not at the start (with small threshold for rounding)
    setCanScrollLeft(scrollLeft > 1);

    // Can scroll right if not at the end (with small threshold for rounding)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  const scrollLeft = () => {
    if (!scrollContainerRef.current) return;

    // Scroll by card width (208px) + gap (20px) = 228px
    scrollContainerRef.current.scrollBy({
      left: -228,
      behavior: 'smooth'
    });
  };

  const scrollRight = () => {
    if (!scrollContainerRef.current) return;

    // Scroll by card width (208px) + gap (20px) = 228px
    scrollContainerRef.current.scrollBy({
      left: 228,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Initial check
    updateScrollButtons();

    // Update on scroll
    container.addEventListener('scroll', updateScrollButtons);

    // Update on resize (important for responsive behavior)
    window.addEventListener('resize', updateScrollButtons);

    return () => {
      container.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [equipment]);

  // Reset scroll position when equipment changes to show newest item
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
  }, [equipment]);

  // Don't show section if no equipment viewed
  if (isLoading || !equipment || equipment.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-muted/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Recently Viewed</h2>

          {/* Navigation buttons - only visible on mobile */}
          <div className="flex gap-2 md:hidden">
            <Button
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              variant="outline"
              size="icon"
              className="rounded-full w-10 h-10 shadow-md hover:shadow-lg transition-shadow"
              aria-label="Scroll left"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button
              onClick={scrollRight}
              disabled={!canScrollRight}
              variant="outline"
              size="icon"
              className="rounded-full w-10 h-10 shadow-md hover:shadow-lg transition-shadow"
              aria-label="Scroll right"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-5 pb-4 snap-x snap-mandatory md:grid md:grid-cols-3 lg:grid-cols-5 md:gap-6 md:overflow-visible md:snap-none scrollbar-hide"
        >
          {equipment.map((item) => {
            const ownerSlug = slugify(item.owner.name);
            const equipmentSlug = slugify(item.name);
            const detailUrl = `/${item.category}/${ownerSlug}/${equipmentSlug}`;

            return (
              <Link
                key={item.id}
                to={detailUrl}
                className="group block snap-start w-[208px] min-w-[208px] shrink-0 md:w-full"
              >
                <div className="aspect-square overflow-hidden rounded-lg mb-2">
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <h3 className="text-sm font-medium leading-tight group-hover:text-primary transition-colors line-clamp-1 text-left">
                  {item.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1 text-left">
                  {item.owner.name}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
