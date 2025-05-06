
import MapComponent from "@/components/MapComponent";
import { Equipment } from "@/types";

interface LocationTabProps {
  equipment: Equipment;
}

const LocationTab = ({ equipment }: LocationTabProps) => {
  return (
    <div className="pt-4">
      <div className="h-80 rounded-lg overflow-hidden mb-4">
        <MapComponent
          equipment={[equipment]}
          activeCategory={null}
        />
      </div>
      <p className="text-sm text-muted-foreground">
        Exact location provided after booking confirmation.
      </p>
    </div>
  );
};

export default LocationTab;
