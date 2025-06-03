import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface LocationSelectorProps {
  locationName: string;
  setLocationName: (value: string) => void;
  lat: number | null;
  lng: number | null;
  setLat: (lat: number) => void;
  setLng: (lng: number) => void;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  locationName,
  setLocationName,
  lat,
  lng,
  setLat,
  setLng,
}) => {
  // For simplicity, use a text input for location name and two number inputs for lat/lng
  // In a real app, you could use a map picker or autocomplete
  return (
    <div>
      <Label htmlFor="locationName" className="block text-lg font-medium mb-2">
        Location Name <span className="text-red-500">*</span>
      </Label>
      <Input
        id="locationName"
        type="text"
        value={locationName}
        onChange={e => setLocationName(e.target.value)}
        placeholder="Enter a location (e.g. Paris, France)"
        required
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
