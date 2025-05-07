import React, { useState } from "react";
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

const AddGearForm = () => {
  const [gearType, setGearType] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [measurementUnit, setMeasurementUnit] = useState("");
  const [dimensions, setDimensions] = useState({ length: "", width: "" });
  const [skillLevel, setSkillLevel] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("day");
  const [damageDeposit, setDamageDeposit] = useState("");
  const [role, setRole] = useState("");

  const skillLevels = {
    snowboard: ["Beginner", "Intermediate", "Advanced", "Park Rider"],
    skis: ["Beginner", "Intermediate", "Advanced", "Park Rider"],
    surfboard: ["Beginner", "Intermediate", "Advanced", "All Levels"],
    sup: ["Flat Water", "Surf", "Racing", "Yoga"],
    skateboard: ["Beginner", "Intermediate", "Advanced", "All Levels"],
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      gearType,
      zipCode,
      measurementUnit,
      dimensions,
      skillLevel,
      images,
      price,
      duration,
      damageDeposit,
      role,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">List Your Gear</h1>
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
        {/* Your Role */}
        <div>
          <Label htmlFor="role" className="block text-lg font-medium mb-2">
            Your Role
          </Label>
          <Select onValueChange={(value) => setRole(value)}>
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
          <Select onValueChange={(value) => setGearType(value)}>
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

        {/* Zip Code */}
        <div>
          <Label htmlFor="zipCode" className="block text-lg font-medium mb-2">
            Your Zip Code
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
          <Select onValueChange={(value) => setMeasurementUnit(value)}>
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
            onValueChange={(value) => setSkillLevel(value)}
            disabled={!gearType}
          >
            <SelectTrigger id="skillLevel">
              <SelectValue placeholder="Select Skill Level" />
            </SelectTrigger>
            <SelectContent>
              {gearType &&
                skillLevels[gearType as keyof typeof skillLevels].map(
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
            Image Upload
          </Label>
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
            <Select onValueChange={(value) => setDuration(value)}>
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

        {/* Submit Button */}
        <Button type="submit" size="lg" className="w-full">
          Submit Gear
        </Button>
      </form>
    </div>
  );
};

export default AddGearForm;
