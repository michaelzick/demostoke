import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface PhysicalStatsProps {
  height: string;
  weight: string;
  age: string;
  sex: string;
  onChange: (field: string, value: string) => void;
}

const PhysicalStats = ({ height, weight, age, sex, onChange }: PhysicalStatsProps) => {
  const heights = [
    "4'8\"", "4'9\"", "4'10\"", "4'11\"", "5'0\"", "5'1\"", "5'2\"", "5'3\"", "5'4\"", "5'5\"",
    "5'6\"", "5'7\"", "5'8\"", "5'9\"", "5'10\"", "5'11\"", "6'0\"", "6'1\"", "6'2\"", "6'3\"",
    "6'4\"", "6'5\"", "6'6\"", "6'7\"", "6'8\""
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="height">Height</Label>
          <Select value={height} onValueChange={(value) => onChange('height', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select your height" />
            </SelectTrigger>
            <SelectContent>
              {heights.map((h) => (
                <SelectItem key={h} value={h}>{h}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="weight">Weight (lbs)</Label>
          <Input
            id="weight"
            type="number"
            placeholder="150"
            value={weight}
            onChange={(e) => onChange('weight', e.target.value)}
            min="50"
            max="400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            placeholder="25"
            value={age}
            onChange={(e) => onChange('age', e.target.value)}
            min="5"
            max="100"
          />
        </div>

        <div className="space-y-3">
          <Label>Sex</Label>
          <RadioGroup
            value={sex}
            onValueChange={(value) => onChange('sex', value)}
            className="flex flex-row gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="male" />
              <Label htmlFor="male">Male</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="female" />
              <Label htmlFor="female">Female</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="other" id="other" />
              <Label htmlFor="other">Other</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg">
        <p className="font-medium mb-1">Why we ask for this information:</p>
        <p>Physical characteristics help us recommend gear with appropriate sizing, flex patterns, and weight specifications that match your body type and riding style.</p>
      </div>
    </div>
  );
};

export default PhysicalStats;