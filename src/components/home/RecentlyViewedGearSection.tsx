import { Link } from "react-router-dom";
import { useRecentlyViewedEquipment } from "@/hooks/useRecentlyViewedEquipment";
import { buildGearPath } from "@/utils/gearUrl";
import { HorizontalScrollSection } from "./HorizontalScrollSection";

interface RecentlyViewedGearSectionProps {
  userId?: string;
}

export default function RecentlyViewedGearSection({ userId }: RecentlyViewedGearSectionProps) {
  const { data: equipment, isLoading } = useRecentlyViewedEquipment(userId);

  return (
    <HorizontalScrollSection
      title="Recently Viewed"
      items={equipment || []}
      isLoading={isLoading}
      sectionClassName="py-12 bg-muted/50"
      desktopCols={{ md: 3, lg: 5 }}
      renderItem={(item) => {
        const detailUrl = buildGearPath({
          id: item.id,
          name: item.name,
          size: item.specifications?.size,
        });

        return (
          <Link
            key={item.id}
            to={detailUrl}
            className="group block snap-start w-[208px] min-w-[208px] shrink-0 md:w-full md:min-w-0"
          >
            <div className="aspect-square overflow-hidden rounded-lg mb-2">
              <img
                src={item.images?.[0] || item.image_url || "/placeholder.svg"}
                alt={item.name}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
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
      }}
    />
  );
}
