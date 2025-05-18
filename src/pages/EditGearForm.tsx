
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { mockUserEquipment } from "@/lib/userEquipment";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

const EditGearForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const location = useLocation();
  
  // Find the equipment by ID
  const equipment = mockUserEquipment.find(item => item.id === id);
  
  // Initialize state with equipment data or defaults
  const [gearName, setGearName] = useState(equipment?.name || "");
  const [gearType, setGearType] = useState(equipment?.category.slice(0, -1) || "");
  const [description, setDescription] = useState(equipment?.description || "");
  const [zipCode, setZipCode] = useState(equipment?.location?.name || "");
  const [measurementUnit, setMeasurementUnit] = useState("inches");
  
  // Extract size from specifications.size and try to parse dimensions
  const parseSize = () => {
    const sizeStr = equipment?.specifications?.size || "";
    if (sizeStr.includes("x")) {
      const [length, width] = sizeStr.split("x").map(s => s.trim().replace(/[^\d.]/g, ''));
      return { length, width };
    } else if (sizeStr.includes('"')) {
      return { length: sizeStr.replace(/[^0-9.]/g, ''), width: "" };
    } else if (sizeStr.includes('cm')) {
      return { length: sizeStr.replace(/[^0-9.]/g, ''), width: "" };
    }
    return { length: "", width: "" };
  };
  
  const [dimensions, setDimensions] = useState(parseSize());
  
  const [skillLevel, setSkillLevel] = useState(equipment?.specifications?.suitable || "");
  const [images, setImages] = useState<File[]>([]);
  const [price, setPrice] = useState(equipment?.pricePerDay?.toString() || "");
  const [duration, setDuration] = useState("day");
  const [damageDeposit, setDamageDeposit] = useState("100"); // Default deposit
  const [role, setRole] = useState("private-party");

  const skillLevels = {
    snowboard: ["Beginner", "Intermediate", "Advanced", "Park Rider"],
    skis: ["Beginner", "Intermediate", "Advanced", "Park Rider"],
    surfboard: ["Beginner", "Intermediate", "Advanced", "All Levels"],
    sup: ["Flat Water", "Surf", "Racing", "Yoga"],
    skateboard: ["Beginner", "Intermediate", "Advanced", "All Levels"],
  };

  // If no equipment is found, redirect to My Equipment page
  useEffect(() => {
    if (!equipment && id) {
      toast({
        title: "Equipment Not Found",
        description: "The equipment you're trying to edit could not be found.",
        variant: "destructive",
      });
      navigate("/my-equipment");
    }
  }, [equipment, id, navigate, toast]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: "Equipment Updated",
      description: `${gearName} has been successfully updated.`,
    });
    
    // Navigate back to My Equipment page
    navigate("/my-equipment");
  };

  const handleCancel = () => {
    navigate("/my-equipment");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" asChild className="mr-4 p-2">
          <Link to="/my-equipment" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to My Equipment
          </Link>
        </Button>
      </div>
      
      <h1 className="text-4xl font-bold mb-6">
        Edit {equipment?.name || "Equipment"}
      </h1>
      
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
        {/* Gear Name */}
        <div>
          <Label htmlFor="gearName" className="block text-lg font-medium mb-2">
            Gear Name
          </Label>
          <Input
            id="gearName"
            type="text"
            value={gearName}
            onChange={(e) => setGearName(e.target.value)}
            required
          />
        </div>
        
        {/* Your Role */}
        <div>
          <Label htmlFor="role" className="block text-lg font-medium mb-2">
            Your Role
          </Label>
          <Select value={role} onValueChange={(value) => setRole(value)}>
            <SelectTrigger id="role">
              <SelectValue placeholder="Select Your Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="private-party">Private Party</SelectItem>
              <SelectItem value="builder">Builder (Surfboard Shaper, Etc.)</SelectItem>
              <SelectItem value="retail-store">Retail Store</SelectItem>
              <SelectItem value="retail-website">Retail Website</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Gear Type */}
        <div>
          <Label htmlFor="gearType" className="block text-lg font-medium mb-2">
            Gear Type
          </Label>
          <Select value={gearType} onValueChange={(value) => setGearType(value)}>
            <SelectTrigger id="gearType">
              <SelectValue placeholder="Select Gear Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="snowboard">Snowboard</SelectItem>
              <SelectItem value="skis">Skis</SelectItem>
              <SelectItem value="surfboard">Surfboard</SelectItem>
              <SelectItem value="sup">SUP</SelectItem>
              <SelectItem value="skateboard">Skateboard</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Description */}
        <div>
          <Label htmlFor="description" className="block text-lg font-medium mb-2">
            Description
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            required
          />
        </div>

        {/* Zip Code */}
        <div>
          <Label htmlFor="zipCode" className="block text-lg font-medium mb-2">
            Location
          </Label>
          <Input
            id="zipCode"
            type="text"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            required
          />
        </div>

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

        {/* Image Upload */}
        <div>
          <Label htmlFor="images" className="block text-lg font-medium mb-2">
            Update Images
          </Label>
          <div className="mb-2">
            <p className="text-sm text-muted-foreground">Current image: {equipment?.imageUrl ? "✓" : "None"}</p>
          </div>
          <Input
            id="images"
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
          />
        </div>

        {/* Price and Duration */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price" className="block text-lg font-medium mb-2">
              Price
            </Label>
            <Input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="duration" className="block text-lg font-medium mb-2">
              Duration
            </Label>
            <Select value={duration} onValueChange={(value) => setDuration(value)}>
              <SelectTrigger id="duration">
                <SelectValue placeholder="Select Duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="hour">Hour</SelectItem>
                <SelectItem value="week">Week</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Refundable Damage Deposit */}
        <div>
          <Label
            htmlFor="damageDeposit"
            className="block text-lg font-medium mb-2"
          >
            Refundable Damage Deposit
          </Label>
          <Input
            id="damageDeposit"
            type="number"
            value={damageDeposit}
            onChange={(e) => setDamageDeposit(e.target.value)}
            required
          />
        </div>

        {/* Submit and Cancel Buttons */}
        <div className="flex gap-4">
          <Button type="submit" size="lg" className="flex-1">
            Update Equipment
          </Button>
          <Button type="button" variant="outline" size="lg" className="flex-1" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditGearForm;
