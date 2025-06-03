import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface LocationSelectorProps {
  zipCode: string;
  setZipCode: (value: string) => void;
  lat: number | null;
  lng: number | null;
  setLat: (lat: number) => void;
  setLng: (lng: number) => void;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  zipCode,
  setZipCode,
  lat,
  lng,
  setLat,
  setLng,
}) => {
  return (
    <div>
      <Label htmlFor="zipCode" className="block text-lg font-medium mb-2">
        Zip Code <span className="text-red-500">*</span>
      </Label>
      <Input
        id="zipCode"
        type="text"
        value={zipCode}
        onChange={e => setZipCode(e.target.value)}
        placeholder="Enter a ZIP code"
        required
        pattern="[0-9]{5}(-[0-9]{4})?"
      />
      <div className="flex gap-4 mt-2">
        <div>
          <Label htmlFor="lat" className="block text-sm font-medium mb-1">Latitude</Label>
          <Input
            id="lat"
            type="number"
            value={lat ?? ''}
            onChange={e => setLat(Number(e.target.value))}
            step="any"
            required
          />
        </div>
        <div>
          <Label htmlFor="lng" className="block text-sm font-medium mb-1">Longitude</Label>
          <Input
            id="lng"
            type="number"
            value={lng ?? ''}
            onChange={e => setLng(Number(e.target.value))}
            step="any"
            required
          />
        </div>
      </div>
    </div>
  );
};

export default LocationSelector;
