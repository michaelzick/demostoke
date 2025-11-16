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
      <h3 className="text-sm font-medium text-foreground mb-3">Recently Viewed</h3>
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
              <div className="aspect-square overflow-hidden rounded-lg mb-2">
                <img
                  src={item.images[0]}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <h3 className="text-sm font-medium leading-tight group-hover:text-primary transition-colors line-clamp-1">
                {item.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                {item.owner.name}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
