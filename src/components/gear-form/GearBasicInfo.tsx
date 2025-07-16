
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { generateGearDescription } from "@/services/equipment/descriptionAIService";
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
  address: string; // Changed from zipCode to address
  setAddress: (value: string) => void; // Changed from setZipCode to setAddress
}

const GearBasicInfo = ({
  gearName,
  setGearName,
  gearType,
  setGearType,
  description,
  setDescription,
  address, // Changed from zipCode to address
  setAddress // Changed from setZipCode to setAddress
}: GearBasicInfoProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerateDescription = async () => {
    if (!gearName.trim()) {
      toast({
        title: "Gear Name Required",
        description: "Please enter a gear name first.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    const generated = await generateGearDescription(gearName, gearType);
    setIsGenerating(false);

    if (generated) {
      setDescription(generated);
    } else {
      toast({
        title: "Error",
        description: "Failed to generate description.",
        variant: "destructive",
      });
    }
  };
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
        <Button
          type="button"
          variant="outline"
          onClick={handleGenerateDescription}
          disabled={isGenerating}
          className="mt-2 self-start"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Description
            </>
          )}
        </Button>
      </div>

      {/* Address / Location */}
      <div>
        <Label htmlFor="address" className="block text-lg font-medium mb-2">
          Address <span className="text-red-500">*</span>
        </Label>
        <Input
          id="address"
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter full address"
          required
        />
      </div>
    </>
  );
};

export default GearBasicInfo;
