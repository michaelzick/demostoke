import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin } from "lucide-react";

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
}

const LocationInput = ({ value, onChange }: LocationInputProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-primary" />
        <div>
          <h3 className="text-lg font-semibold">Where do you typically ride?</h3>
          <p className="text-muted-foreground">List your favorite locations, mountain ranges, or regions</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="locations">Riding Locations</Label>
        <Textarea
          id="locations"
          placeholder="e.g., Whistler, BC; Lake Tahoe, CA; Colorado Rockies; local beaches; Pacific Northwest mountains..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[120px] resize-none"
        />
        <p className="text-sm text-muted-foreground">
          Separate multiple locations with commas. Include details about terrain types, conditions, or specific mountains/beaches.
        </p>
      </div>

      <div className="bg-muted/30 p-4 rounded-lg">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium">Tip:</span> Include information about typical conditions, elevation, terrain type, 
          or any unique characteristics of where you ride. This helps us recommend gear suited to your local environment.
        </p>
      </div>
    </div>
  );
};

export default LocationInput;