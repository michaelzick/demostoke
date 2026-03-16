
import { useDynamicDistance } from '@/hooks/useDynamicDistance';
import { Button } from '@/components/ui/button';

interface Equipment {
  location?: {
    lat?: number;
    lng?: number;
  };
  distance?: number;
}

interface DistanceDisplayProps {
  equipment: Equipment;
  className?: string;
}

const DistanceDisplay = ({ equipment, className = "" }: DistanceDisplayProps) => {
  const { distance, permissionState, requestLocation } = useDynamicDistance(equipment);

  // Geolocation unsupported
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return (
      <span className={`text-muted-foreground ${className}`}>
        Distance not available
      </span>
    );
  }

  if (permissionState === 'idle') {
    return (
      <Button variant="outline" size="sm" onClick={requestLocation} className={`text-xs px-2 py-0.5 h-auto ${className}`}>
        Calculate Distance
      </Button>
    );
  }

  if (permissionState === 'loading') {
    return (
      <span className={`text-muted-foreground ${className}`}>
        Calculating distance...
      </span>
    );
  }

  if (permissionState === 'denied') {
    return (
      <span className={`text-muted-foreground ${className}`}>
        Distance not available
      </span>
    );
  }

  // granted
  if (distance !== null && distance !== undefined) {
    const displayDistance = distance < 0.1 ? '< 0.1' : distance.toString();
    return (
      <span className={className}>
        {displayDistance}mi away
      </span>
    );
  }

  return (
    <span className={`text-muted-foreground ${className}`}>
      Distance not available
    </span>
  );
};

export default DistanceDisplay;
