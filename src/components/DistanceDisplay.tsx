
import { useDynamicDistance } from '@/hooks/useDynamicDistance';

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
  showUnit?: boolean;
  unitText?: string;
}

const DistanceDisplay = ({ 
  equipment, 
  className = "", 
  showUnit = true,
  unitText = "away"
}: DistanceDisplayProps) => {
  const { distance, loading, isLocationBased, permissionDenied } = useDynamicDistance(equipment);

  if (loading) {
    return (
      <span className={`text-muted-foreground ${className}`}>
        Calculating distance...
      </span>
    );
  }

  if (permissionDenied) {
    return (
      <span className={`text-muted-foreground ${className}`}>
        Distance not available
      </span>
    );
  }

  if (distance === null || distance === undefined) {
    return (
      <span className={`text-muted-foreground ${className}`}>
        Distance unknown
      </span>
    );
  }

  const displayDistance = distance < 0.1 ? '< 0.1' : distance.toString();
  const unit = showUnit ? (distance === 1 ? ' mile' : ' miles') : 'mi';
  const fullText = showUnit ? `${displayDistance} ${unit} ${unitText}` : `${displayDistance}${unit} ${unitText}`;

  return (
    <span className={className} title={isLocationBased ? "Distance calculated from your location" : "Approximate distance"}>
      {fullText}
    </span>
  );
};

export default DistanceDisplay;
