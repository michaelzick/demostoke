
import MapComponent from "@/components/MapComponent";
import { Equipment } from "@/types";
import SimilarEquipment from "./SimilarEquipment";

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
      <p className="text-sm text-muted-foreground mb-6">
        Exact location provided after booking confirmation.
      </p>
      
      {/* Similar Equipment section moved here */}
      {equipment.similarEquipment && equipment.similarEquipment.length > 0 && (
        <div className="mt-6">
          <SimilarEquipment similarEquipment={equipment.similarEquipment} />
        </div>
      )}
    </div>
  );
};

export default LocationTab;
