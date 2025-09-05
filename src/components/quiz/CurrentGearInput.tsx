import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Package } from "lucide-react";

interface CurrentGearInputProps {
  value: string;
  onChange: (value: string) => void;
  category: string;
}

const getCurrentGearPlaceholder = (category: string) => {
  switch (category) {
    case 'snowboards':
      return "e.g., Burton Custom 158cm (love the responsiveness), tried K2 Manifest (too stiff), currently own a Capita DOA 156cm...";
    case 'skis':
      return "e.g., Rossignol Experience 88 170cm (great all-mountain), tried Salomon QST 92 (loved in powder), looking for something more versatile...";
    case 'surfboards':
      return "e.g., 6'2\" Lost Mayhem (favorite shortboard), tried 9'0\" Noserider (fun but want something shorter), looking for better small wave performance...";
    case 'mountain-bikes':
      return "e.g., Trek Fuel EX 8 (love the suspension), borrowed Specialized Stumpjumper (great climbing), want something more aggressive for descents...";
    default:
      return "Describe any gear you currently own, have tried, or are interested in...";
  }
};

const getCurrentGearTitle = (category: string) => {
  switch (category) {
    case 'snowboards':
      return "What snowboards do you own or have tried?";
    case 'skis':
      return "What skis do you own or have tried?";
    case 'surfboards':
      return "What surfboards do you own or have tried?";
    case 'mountain-bikes':
      return "What mountain bikes do you own or have tried?";
    default:
      return "What gear do you currently have experience with?";
  }
};

const CurrentGearInput = ({ value, onChange, category }: CurrentGearInputProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Package className="w-5 h-5 text-primary" />
        <div>
          <h3 className="text-lg font-semibold">{getCurrentGearTitle(category)}</h3>
          <p className="text-muted-foreground">Share details about gear you like, dislike, or want to improve upon</p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground mb-2">
          Include brands, models, sizes, what you love or dislike about each piece. Even gear you've just tried or borrowed is helpful!
        </p>
        
        <div className="bg-muted/30 p-4 rounded-lg mb-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Be specific:</span> Include details like flex patterns, sizes, what conditions you used them in, 
            and how they performed. This helps us understand your preferences and recommend similar or upgraded options.
          </p>
        </div>

        <Label htmlFor="currentGear">Current Gear & Preferences</Label>
        <Textarea
          id="currentGear"
          placeholder={getCurrentGearPlaceholder(category)}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[120px] resize-none"
          maxLength={1000}
        />
      </div>
    </div>
  );
};

export default CurrentGearInput;