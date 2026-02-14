import { Link } from "react-router-dom";
import { useRecentlyViewedEquipment } from "@/hooks/useRecentlyViewedEquipment";
import { buildGearPath } from "@/utils/gearUrl";
import { useAuth } from "@/contexts/auth";
import { cn } from "@/lib/utils";

export function RecentlyViewedCompact() {
  const { user } = useAuth();
  const { data: equipment, isLoading } = useRecentlyViewedEquipment(user?.id);

  if (isLoading || !equipment || equipment.length === 0) {
    return null;
  }

  // Max 5 items as requested
  const items = equipment.slice(0, 5);

  return (
    <div className="mt-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        Recently Viewed
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 snap-x">
        {items.map((item) => {
          const detailUrl = buildGearPath({
            id: item.id,
            name: item.name,
            size: item.specifications?.size,
          });

          return (
            <Link
              key={item.id}
              to={detailUrl}
              className="group flex-shrink-0 snap-start"
              title={item.name}
            >
              <div className="w-14 h-14 rounded-md overflow-hidden bg-muted border border-border group-hover:border-primary transition-colors">
                <img
                  src={item.images?.[0] || item.image_url || "/placeholder.svg"}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
