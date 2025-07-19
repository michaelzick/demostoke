
import { lazy, Suspense } from "react";
import LoadingSpinner from "./LoadingSpinner";
import { Equipment } from "@/types";
import { UserLocation } from "@/hooks/useUserLocations";

const HybridView = lazy(() => import("./HybridView"));

interface LazyHybridViewProps {
  filteredEquipment: Equipment[];
  activeCategory: string | null;
  isLocationBased: boolean;
  userLocations?: UserLocation[];
  viewMode?: 'map' | 'list' | 'hybrid';
  resetSignal?: number;
}

const LazyHybridView = (props: LazyHybridViewProps) => {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-96"><LoadingSpinner /></div>}>
      <HybridView {...props} />
    </Suspense>
  );
};

export default LazyHybridView;
