
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
        Update Images
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
        multiple
        accept="image/*"
        onChange={handleImageUpload}
      />
    </div>
  );
};

export default GearMedia;
