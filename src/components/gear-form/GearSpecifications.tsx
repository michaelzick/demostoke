
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect } from "react";

interface GearSpecificationsProps {
  measurementUnit: string;
  setMeasurementUnit: (value: string) => void;
  dimensions: {
    length: string;
    width: string;
  };
  setDimensions: (value: { length: string; width: string }) => void;
  skillLevel: string;
  setSkillLevel: (value: string) => void;
  gearType: string;
}

const GearSpecifications = ({
  measurementUnit,
  setMeasurementUnit,
  dimensions,
  setDimensions,
  skillLevel,
  setSkillLevel,
  gearType
}: GearSpecificationsProps) => {
  const skillLevels = {
    snowboard: ["Beginner", "Intermediate", "Advanced", "Park Rider"],
    skis: ["Beginner", "Intermediate", "Advanced", "Park Rider"],
    surfboard: ["Beginner", "Intermediate", "Advanced", "All Levels"],
    sup: ["Flat Water", "Surf", "Racing", "Yoga"],
    skateboard: ["Beginner", "Intermediate", "Advanced", "All Levels"],
  };

  // Reset skill level if it's not valid for the current gear type
  useEffect(() => {
    if (gearType && skillLevel) {
      const validLevels = skillLevels[gearType as keyof typeof skillLevels] || [];
      if (!validLevels.includes(skillLevel)) {
        console.log('Resetting skill level - not valid for gear type:', gearType, skillLevel);
        setSkillLevel("");
      }
    }
  }, [gearType, skillLevel, setSkillLevel]);

  console.log('GearSpecifications render - gearType:', gearType, 'skillLevel:', skillLevel);

  return (
    <>
      {/* Measurement Unit */}
      <div>
        <Label htmlFor="measurementUnit" className="block text-lg font-medium mb-2">
          Measurement Unit <span className="text-red-500">*</span>
        </Label>
        <Select value={measurementUnit} onValueChange={(value) => setMeasurementUnit(value)} required>
          <SelectTrigger id="measurementUnit">
            <SelectValue placeholder="Select Measurement Unit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="inches">Inches</SelectItem>
            <SelectItem value="centimeters">Centimeters</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Dimensions */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="length" className="block text-lg font-medium mb-2">
            Length <span className="text-red-500">*</span>
          </Label>
          <Input
            id="length"
            type="text"
            value={dimensions.length}
            onChange={(e) =>
              setDimensions({ ...dimensions, length: e.target.value })
            }
            required
          />
        </div>
        <div>
          <Label htmlFor="width" className="block text-lg font-medium mb-2">
            Width <span className="text-red-500">*</span>
          </Label>
          <Input
            id="width"
            type="text"
            value={dimensions.width}
            onChange={(e) =>
              setDimensions({ ...dimensions, width: e.target.value })
            }
            required
          />
        </div>
      </div>

      {/* Skill Level */}
      <div>
        <Label htmlFor="skillLevel" className="block text-lg font-medium mb-2">
          Skill Level <span className="text-red-500">*</span>
        </Label>
        <Select
          key={`${gearType}-${skillLevel}`}
          value={skillLevel}
          onValueChange={(value) => {
            console.log('Skill level changed:', value);
            setSkillLevel(value);
          }}
          disabled={!gearType}
          required
        >
          <SelectTrigger id="skillLevel">
            <SelectValue placeholder={
              gearType ? "Select Skill Level" : "Select Gear Type First"
            } />
          </SelectTrigger>
          <SelectContent>
            {gearType &&
              skillLevels[gearType as keyof typeof skillLevels]?.map(
                (level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                )
              )}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default GearSpecifications;
