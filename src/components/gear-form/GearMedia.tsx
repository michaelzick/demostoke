
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface GearMediaProps {
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  currentImageUrl?: string;
}

const GearMedia = ({ handleImageUpload, currentImageUrl }: GearMediaProps) => {
  return (
    <div>
      <Label htmlFor="images" className="block text-lg font-medium mb-2">
        Gear Images
      </Label>
      {currentImageUrl && (
        <div className="mb-2">
          <p className="text-sm text-muted-foreground">
            Current image: ✓
          </p>
        </div>
      )}
      <Input
        id="images"
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="mb-2"
      />
      <p className="text-sm text-muted-foreground">
        Upload a high-quality image of your gear. Supported formats: JPEG, PNG, WebP, GIF (max 5MB)
      </p>
    </div>
  );
};

export default GearMedia;
