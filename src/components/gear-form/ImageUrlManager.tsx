import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X, Search, Globe, Plus, Loader2, ImagePlus } from "lucide-react";
import { useState, useEffect } from "react";
import ImageSearchDialog from "./ImageSearchDialog";

interface ImageUrlManagerProps {
  imageUrls: string[];
  setImageUrls: (urls: string[]) => void;
  gearName?: string;
  gearType?: string;
  showLabel?: boolean;
  className?: string;
  showSaveButton?: boolean;
  onSave?: () => void;
  isSaving?: boolean;
}

const ImageUrlManager = ({
  imageUrls,
  setImageUrls,
  gearName = '',
  gearType = '',
  showLabel = true,
  className = "",
  showSaveButton = false,
  onSave,
  isSaving = false
}: ImageUrlManagerProps) => {
  const [showImageSearch, setShowImageSearch] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<Record<number, { width: number; height: number }>>({});

  useEffect(() => {
    setImageDimensions({});
  }, [imageUrls]);



  const addImageUrl = () => {
    setImageUrls([...imageUrls, ""]);
  };

  const removeImageUrl = (index: number) => {
    const newUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newUrls);
  };

  const updateImageUrl = (index: number, url: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = url;
    setImageUrls(newUrls);
  };

  const handleImagesSelected = (selectedImageUrls: string[]) => {
    // Filter out empty URLs and add new ones
    const existingUrls = imageUrls.filter(url => url.trim() !== '');
    const newUrls = [...existingUrls, ...selectedImageUrls];
    setImageUrls(newUrls);
  };

  const handleImageLoad = (
    index: number,
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setImageDimensions((dims) => ({
      ...dims,
      [index]: { width: naturalWidth, height: naturalHeight },
    }));
  };

  const validImageUrls = imageUrls.filter(url => url.trim() !== '');

  return (
    <div className={`space-y-3 ${className}`}>
      {showLabel && (
        <Label className="text-sm font-medium">Image URLs</Label>
      )}

      {/* URL Input Fields */}
      <div className="space-y-2">
        {imageUrls.map((url, index) => (
          <div key={index} className="flex gap-2">
            <Input
              type="url"
              placeholder={`Image URL ${index + 1}`}
              value={url}
              onChange={(e) => updateImageUrl(index, e.target.value)}
              className="flex-1"
              size="sm"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeImageUrl(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addImageUrl}
            className="flex items-center gap-1"
          >
            <Plus className="h-3 w-3" />
            Add URL
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowImageSearch(true)}
            className="flex items-center gap-1"
          >
            <Search className="h-3 w-3" />
            Search Images
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const searchQuery = encodeURIComponent(gearName || '');
              const newWindow = window.open(`https://www.google.com/search?q=${searchQuery}`, '_blank', 'noopener,noreferrer');
              if (newWindow) newWindow.opener = null;
            }}
            className="flex items-center gap-1"
            disabled={!gearName?.trim()}
          >
            <Globe className="h-3 w-3" />
            Search on Google
          </Button>
        </div>
      </div>

      {/* Image Thumbnails */}
      {validImageUrls.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Image previews:</p>
          <div className="flex flex-wrap gap-2">
            {validImageUrls.map((imageUrl, index) => {
              const originalIndex = imageUrls.findIndex(url => url === imageUrl);
              return (
                <div key={originalIndex} className="relative group">
                  <img
                    src={imageUrl}
                    alt={`Image ${index + 1}`}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md border"
                    onLoad={(e) => handleImageLoad(originalIndex, e)}
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    onClick={() => removeImageUrl(originalIndex)}
                    className="absolute -top-1 -right-1 h-5 w-5 opacity-80 group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  {imageDimensions[originalIndex] && (
                    <p className="text-xs mt-1 text-center text-muted-foreground">
                      {imageDimensions[originalIndex].width} x {imageDimensions[originalIndex].height}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Save Button */}
      {showSaveButton && validImageUrls.length > 0 && (
        <Button
          onClick={onSave}
          disabled={isSaving}
          size="sm"
          className="flex items-center gap-2"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImagePlus className="h-4 w-4" />
          )}
          Save Images
        </Button>
      )}

      {/* Image Search Dialog */}
      <ImageSearchDialog
        open={showImageSearch}
        onOpenChange={setShowImageSearch}
        onImagesSelected={handleImagesSelected}
        defaultQuery={gearName}
        gearType={gearType}
      />
    </div>
  );
};

export default ImageUrlManager;
