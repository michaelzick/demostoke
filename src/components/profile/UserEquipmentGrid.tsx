import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import CompactEquipmentCard from "@/components/CompactEquipmentCard";

import type { UserEquipment } from "@/types/equipment";
import type { GearOwner, Equipment } from "@/types";

interface UserEquipmentGridProps {
  userEquipment: UserEquipment[] | undefined;
  owner: GearOwner;
  stats?: {
    averageRating: number;
    totalReviews: number;
  } | null;
  isLoading?: boolean;
  isMockUser?: boolean;
}

export const UserEquipmentGrid = ({
  userEquipment,
  owner,
  stats,
  isLoading,
  isMockUser,
}: UserEquipmentGridProps) => {
  if (isLoading && !isMockUser) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardContent className="p-4">
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-3" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!userEquipment || userEquipment.length === 0) {
    return (
      <p className="text-muted-foreground dark:text-white">
        No gear currently listed.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {userEquipment.map((item: UserEquipment) => {
        const equipment = { ...(item as any), owner } as Equipment;
        return <CompactEquipmentCard key={item.id} equipment={equipment} />;
      })}
    </div>
  );
};
