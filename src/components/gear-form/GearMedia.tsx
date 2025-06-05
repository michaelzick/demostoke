
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface GearMediaProps {
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  currentImageUrl?: string;
  duplicatedImageUrl?: string;
  imageUrl: string;
  setImageUrl: (value: string) => void;
  useImageUrl: boolean;
  setUseImageUrl: (value: boolean) => void;
}

const GearMedia = ({
  handleImageUpload,
  currentImageUrl,
  duplicatedImageUrl,
  imageUrl,
  setImageUrl,
  useImageUrl,
  setUseImageUrl
}: GearMediaProps) => {
  const displayImageUrl = useImageUrl ? imageUrl : currentImageUrl || duplicatedImageUrl;

  return (
    <div className="space-y-4">
      <Label htmlFor="images" className="block text-lg font-medium">
        Gear Images
      </Label>

      {/* Image URL input section */}
      <div className="space-y-2">
        <Label htmlFor="imageUrl" className="text-sm">
          Image URL (optional)
        </Label>
        <div className="space-y-2">
          <Input
            id="imageUrl"
            type="url"
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className={cn(useImageUrl && "focus:ring-2 focus:ring-offset-2")}
          />
          <div className="flex items-center space-x-2">
            <Checkbox
              id="useImageUrl"
              checked={useImageUrl}
              onCheckedChange={(checked) => setUseImageUrl(checked as boolean)}
            />
            <Label htmlFor="useImageUrl" className="text-sm font-normal">
              Use image URL instead of uploaded image
            </Label>
          </div>
        </div>
      </div>

      {/* Preview of current/duplicated image */}
      {displayImageUrl && (
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            {useImageUrl ? "Image URL preview:" : currentImageUrl ? "Current image:" : "Image from duplicated gear:"}
          </p>
          <img
            src={displayImageUrl}
            alt="Current gear"
            className="w-32 h-32 object-cover rounded-md border"
          />
        </div>
      )}

      {/* File upload section */}
      <div className={cn("space-y-2", useImageUrl && "opacity-50")}>
        <Input
          id="images"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          disabled={useImageUrl}
        />
        <p className="text-sm text-muted-foreground">
          {useImageUrl ?
            "File upload is disabled while using image URL" :
            displayImageUrl ?
              "Upload a new image to replace the current one, or leave empty to keep the existing image." :
              "Upload a high-quality image of your gear. Supported formats: JPEG, PNG, WebP, GIF (max 5MB)"
          }
        </p>
      </div>
    </div>
  );
};

export default GearMedia;
