import { Link } from "react-router-dom";
import { useRecentlyViewedEquipment } from "@/hooks/useRecentlyViewedEquipment";
import { slugify } from "@/utils/slugify";

interface RecentlyViewedSectionProps {
  userId?: string;
}

export default function RecentlyViewedSection({ userId }: RecentlyViewedSectionProps) {
  const { data: equipment, isLoading } = useRecentlyViewedEquipment(userId);

  // Don't show section if not logged in or no equipment viewed
  if (!userId || isLoading || !equipment || equipment.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <h3 className="text-sm font-medium text-foreground mb-3 px-1">Recently Viewed</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {equipment.map((item) => {
          const ownerSlug = slugify(item.owner.name);
          const equipmentSlug = slugify(item.name);
          const detailUrl = `/gear/${item.category}/${ownerSlug}/${equipmentSlug}?id=${item.id}`;

          return (
            <Link
              key={item.id}
              to={detailUrl}
              className="group block"
            >
              <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                <img
                  src={item.images[0]}
                  alt={item.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
              <div className="mt-2 space-y-0.5">
                <p className="text-sm font-medium text-foreground line-clamp-1">
                  {item.name}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {item.owner.name}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
