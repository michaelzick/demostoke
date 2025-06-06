
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
          initialEquipment={[{
            id: equipment.id,
            name: equipment.name,
            category: equipment.category,
            price_per_day: equipment.price_per_day,
            location: {
              lat: equipment.location.lat,
              lng: equipment.location.lng
            }
          }]}
          activeCategory={null}
          isSingleView={true}
        />
      </div>
      <p className="text-sm text-muted-foreground">
        Exact location provided after booking confirmation.
      </p>
    </div>
  );
};

export default LocationTab;
