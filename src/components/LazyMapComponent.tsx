
import { lazy, Suspense } from "react";
import LoadingSpinner from "./LoadingSpinner";

const MapComponent = lazy(() => import("./MapComponent"));

interface LazyMapComponentProps {
  activeCategory?: string | null;
  initialEquipment?: Array<{
    id: string;
    name: string;
    category: string;
    price_per_day: number;
    location: { lat: number; lng: number };
    ownerId: string;
    ownerName: string;
  }>;
  userRole?: string;
  searchQuery?: string;
  isEquipmentLoading?: boolean;
  interactive?: boolean;
  ownerIds?: string[];
  viewMode?: 'map' | 'list' | 'hybrid';
}

const LazyMapComponent = (props: LazyMapComponentProps) => {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><LoadingSpinner /></div>}>
      <MapComponent {...props} />
    </Suspense>
  );
};

export default LazyMapComponent;
