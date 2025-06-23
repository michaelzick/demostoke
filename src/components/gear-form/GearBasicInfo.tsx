
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GearBasicInfoProps {
  gearName: string;
  setGearName: (value: string) => void;
  gearType: string;
  setGearType: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  zipCode: string;
  setZipCode: (value: string) => void;
}

const GearBasicInfo = ({
  gearName,
  setGearName,
  gearType,
  setGearType,
  description,
  setDescription,
  zipCode,
  setZipCode
}: GearBasicInfoProps) => {
  return (
    <>
      {/* Gear Name */}
      <div>
        <Label htmlFor="gearName" className="block text-lg font-medium mb-2">
          Gear Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="gearName"
          type="text"
          value={gearName}
          onChange={(e) => setGearName(e.target.value)}
          required
        />
      </div>

      {/* Gear Type */}
      <div>
        <Label htmlFor="gearType" className="block text-lg font-medium mb-2">
          Gear Type <span className="text-red-500">*</span>
        </Label>
        <Select value={gearType} onValueChange={(value) => setGearType(value)} required>
          <SelectTrigger id="gearType">
            <SelectValue placeholder="Select Gear Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="snowboard">Snowboard</SelectItem>
            <SelectItem value="skis">Skis</SelectItem>
            <SelectItem value="surfboard">Surfboard</SelectItem>
            <SelectItem value="mountain-bike">Mountain Bike</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description" className="block text-lg font-medium mb-2">
          Description <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          required
        />
      </div>

      {/* Zip Code/Location */}
      <div>
        <Label htmlFor="zipCode" className="block text-lg font-medium mb-2">
          Zip Code <span className="text-red-500">*</span>
        </Label>
        <Input
          id="zipCode"
          type="text"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          required
        />
      </div>
    </>
  );
};

export default GearBasicInfo;
