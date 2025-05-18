
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  return (
    <>
      {/* Measurement Unit */}
      <div>
        <Label htmlFor="measurementUnit" className="block text-lg font-medium mb-2">
          Measurement Unit
        </Label>
        <Select value={measurementUnit} onValueChange={(value) => setMeasurementUnit(value)}>
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
            Length
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
            Width
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
          Skill Level
        </Label>
        <Select
          value={skillLevel}
          onValueChange={(value) => setSkillLevel(value)}
          disabled={!gearType}
        >
          <SelectTrigger id="skillLevel">
            <SelectValue placeholder="Select Skill Level" />
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
