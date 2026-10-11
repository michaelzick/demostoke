import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProximityFilterProps {
  selectedRadius: number | null;
  onRadiusChange: (radius: number | null) => void;
  hasUserLocation: boolean;
  loading: boolean;
  permissionDenied: boolean;
  locationUnavailable: boolean;
}

const ProximityFilter = ({
  selectedRadius,
  onRadiusChange,
  hasUserLocation,
  loading,
  permissionDenied,
  locationUnavailable,
}: ProximityFilterProps) => {
  const radiusOptions = [10, 25, 50, 100];

  return (
    <div className="border rounded-lg p-4 bg-card">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Filter by Proximity</h3>
      </div>

      {loading && (
        <p className="text-sm text-muted-foreground mb-3">
          Getting your location...
        </p>
      )}

      {permissionDenied && (
        <p className="text-sm text-muted-foreground mb-3">
          Enable location to use proximity filter
        </p>
      )}

      {locationUnavailable && !permissionDenied && !loading && (
        <p className="text-sm text-muted-foreground mb-3">
          Couldn't get your location. Pick a distance to try again.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {radiusOptions.map((radius) => (
          <Button
            key={radius}
            variant={selectedRadius === radius ? "default" : "outline"}
            size="sm"
            onClick={() => onRadiusChange(radius)}
            disabled={loading || permissionDenied}
            className="flex-1 min-w-[60px]"
          >
            {radius}
          </Button>
        ))}

        <Button
          variant={selectedRadius === null ? "default" : "outline"}
          size="sm"
          onClick={() => onRadiusChange(null)}
          className="flex-1 min-w-[60px]"
        >
          All
        </Button>
      </div>

      {hasUserLocation && !loading && (
        <p className="text-xs text-muted-foreground mt-2">
          {selectedRadius === null
            ? "Showing events at any distance"
            : `Showing events within ${selectedRadius} miles`}
        </p>
      )}
    </div>
  );
};

export default ProximityFilter;
