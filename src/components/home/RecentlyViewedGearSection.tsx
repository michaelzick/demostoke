import { Link } from "react-router-dom";
import { useRecentlyViewedEquipment } from "@/hooks/useRecentlyViewedEquipment";
import { slugify } from "@/utils/slugify";

interface RecentlyViewedGearSectionProps {
  userId?: string;
}

export default function RecentlyViewedGearSection({ userId }: RecentlyViewedGearSectionProps) {
  const { data: equipment, isLoading } = useRecentlyViewedEquipment(userId);

  // Don't show section if not logged in or no equipment viewed
  if (!userId || isLoading || !equipment || equipment.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-white dark:bg-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold mb-6">Recently Viewed</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {equipment.map((item) => {
            const ownerSlug = slugify(item.owner.name);
            const equipmentSlug = slugify(item.name);
            const detailUrl = `/gear/${item.category}/${ownerSlug}/${equipmentSlug}?id=${item.id}`;

            return (
              <Link
                key={item.id}
                to={detailUrl}
                className="group block max-w-[208px]"
              >
                <div className="aspect-square overflow-hidden rounded-lg mb-2 max-w-[208px] max-h-[208px]">
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
