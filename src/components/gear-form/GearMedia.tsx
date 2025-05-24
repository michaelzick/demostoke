
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface GearMediaProps {
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  currentImageUrl?: string;
  duplicatedImageUrl?: string;
}

const GearMedia = ({ handleImageUpload, currentImageUrl, duplicatedImageUrl }: GearMediaProps) => {
  const displayImageUrl = currentImageUrl || duplicatedImageUrl;

  return (
    <div>
      <Label htmlFor="images" className="block text-lg font-medium mb-2">
        Gear Images
      </Label>
      {displayImageUrl && (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">
            {currentImageUrl ? "Current image:" : "Image from duplicated gear:"}
          </p>
          <img 
            src={displayImageUrl} 
            alt="Current gear" 
            className="w-32 h-32 object-cover rounded-md border"
          />
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
        {displayImageUrl ? 
          "Upload a new image to replace the current one, or leave empty to keep the existing image." :
          "Upload a high-quality image of your gear. Supported formats: JPEG, PNG, WebP, GIF (max 5MB)"
        }
      </p>
    </div>
  );
};

export default GearMedia;
