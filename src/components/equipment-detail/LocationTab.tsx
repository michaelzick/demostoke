
import MapComponent from "@/components/MapComponent";
import { Equipment } from "@/types";
import { useAppSettings } from "@/hooks/useAppSettings";
import { useUserProfile } from "@/hooks/useUserProfile";

interface LocationTabProps {
  equipment: Equipment;
}

const LocationTab = ({ equipment }: LocationTabProps) => {
  const { data: appSettings } = useAppSettings();
  const isUserLocationMode = appSettings?.map_display_mode === 'user_locations';
  
  // Get the owner's profile data to show their location
  const { data: ownerProfile } = useUserProfile(equipment.owner.id);

  // Create user location data for the equipment owner if in user location mode
  const ownerUserLocation = isUserLocationMode && ownerProfile && ownerProfile.location_lat && ownerProfile.location_lng ? [{
    id: equipment.owner.id,
    name: equipment.owner.name,
    role: ownerProfile.role || 'private-party',
    address: ownerProfile.address || '',
    location: {
      lat: Number(ownerProfile.location_lat),
      lng: Number(ownerProfile.location_lng)
    },
    equipment_categories: [equipment.category]
  }] : [];

  return (
    <div className="pt-4">
      <div className="h-80 rounded-lg overflow-hidden mb-4">
        <MapComponent
          initialEquipment={isUserLocationMode ? [] : [{
            id: equipment.id,
            name: equipment.name,
            category: equipment.category,
            price_per_day: equipment.price_per_day,
            location: {
              lat: equipment.location.lat,
              lng: equipment.location.lng
            },
            ownerId: equipment.owner.id,
            ownerName: equipment.owner.name
          }]}
          userLocations={ownerUserLocation}
          activeCategory={null}
          isSingleView={true}
        />
      </div>
      <p className="text-sm text-muted-foreground">
        {isUserLocationMode 
          ? "Owner's location - exact address provided after booking confirmation."
          : "Equipment location - exact address provided after booking confirmation."
        }
      </p>
    </div>
  );
};

export default LocationTab;
