import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { X, Search } from "lucide-react";
import { useState } from "react";
import { deleteEquipmentImage } from "@/utils/multipleImageHandling";
import ImageSearchDialog from "./ImageSearchDialog";
import SimilarGearImageCopy from "./SimilarGearImageCopy";

interface MultipleGearMediaProps {
  handleMultipleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  currentImages?: string[];
  setCurrentImages?: (images: string[]) => void;
  duplicatedImageUrls?: string[];
  imageUrls: string[];
  setImageUrls: (urls: string[]) => void;
  useImageUrls: boolean;
  setUseImageUrls: (value: boolean) => void;
  selectedFiles: File[];
  setSelectedFiles: (files: File[]) => void;
  gearName?: string;
  gearType?: string;
  currentGearId?: string;
}

const MultipleGearMedia = ({
  handleMultipleImageUpload,
  currentImages,
  setCurrentImages,
  duplicatedImageUrls,
  imageUrls,
  setImageUrls,
  useImageUrls,
  setUseImageUrls,
  selectedFiles,
  setSelectedFiles,
  gearName = '',
  gearType = '',
  currentGearId
}: MultipleGearMediaProps) => {
  const [showImageSearch, setShowImageSearch] = useState(false);
  const displayImages = useImageUrls ? imageUrls : currentImages || duplicatedImageUrls || [];

  const addImageUrl = () => {
    setImageUrls([...imageUrls, ""]);
  };

  const removeImageUrl = (index: number) => {
    const newUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newUrls);
  };

  const handleRemoveImage = async (index: number) => {
    const imageUrl = displayImages[index];

    if (!useImageUrls && currentImages) {
      // Remove image from database and state
      await deleteEquipmentImage(imageUrl);
      setCurrentImages?.(currentImages.filter((_, i) => i !== index));
    } else {
      // Removing URL from input-based images
      removeImageUrl(index);
    }
  };

  const updateImageUrl = (index: number, url: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = url;
    setImageUrls(newUrls);
  };

  const removeSelectedFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
  };

  const handleImagesSelected = (selectedImageUrls: string[]) => {
    // Filter out empty URLs and add new ones
    const existingUrls = imageUrls.filter(url => url.trim() !== '');
    const newUrls = [...existingUrls, ...selectedImageUrls];
    setImageUrls(newUrls);

    // Enable image URLs if not already enabled
    if (!useImageUrls) {
      setUseImageUrls(true);
    }
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="images" className="block text-lg font-medium">
        Gear Images
      </Label>

      {/* Image URLs input section */}
      <div className="space-y-2">
        <Label className="text-sm">Image URLs (optional)</Label>
        <div className="flex items-center space-x-2 mb-2">
          <Checkbox
            id="useImageUrls"
            checked={useImageUrls}
            onCheckedChange={(checked) => setUseImageUrls(checked as boolean)}
          />
          <Label htmlFor="useImageUrls" className="text-sm font-normal">
            Use image URLs instead of uploaded files
          </Label>
        </div>

        {useImageUrls && (
          <div className="space-y-2">
            {imageUrls.map((url, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  type="url"
                  placeholder={`Image URL ${index + 1}`}
                  value={url}
                  onChange={(e) => updateImageUrl(index, e.target.value)}
                  className="flex-1"
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
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addImageUrl}
              >
                Add Another URL
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowImageSearch(true)}
                className="flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                Search Google Images
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Copy Images to Similar Gear - Always available when there are current images */}
      {currentGearId && currentImages && currentImages.length > 0 && (
        <div className="flex justify-center">
          <SimilarGearImageCopy
            gearName={gearName}
            currentGearId={currentGearId}
            currentImages={currentImages}
          />
        </div>
      )}

      {/* Preview of current/duplicated images */}
      {displayImages.length > 0 && (
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            {useImageUrls ? "Image URL previews:" : currentImages ? "Current images:" : "Images from duplicated gear:"}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {displayImages.map((imageUrl, index) => (
              <div key={index} className="relative group w-24">
                <img
                  src={imageUrl}
                  alt={`Gear image ${index + 1}`}
                  className="w-24 h-24 object-cover rounded-md border"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-0 right-0 m-1 h-5 w-5 opacity-80 group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File upload section */}
      <div className={cn("space-y-2", useImageUrls && "opacity-50")}>
        <Input
          id="images"
          type="file"
          accept="image/*"
          multiple
          onChange={handleMultipleImageUpload}
          disabled={useImageUrls}
        />

        {/* Show selected files */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Selected files:</p>
            <div className="space-y-1">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between text-sm bg-muted p-2 rounded">
                  <span>{file.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSelectedFile(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-sm text-muted-foreground">
          {useImageUrls ?
            "File upload is disabled while using image URLs" :
            displayImages.length > 0 ?
              "Upload new images to replace the current ones, or leave empty to keep the existing images." :
              "Upload high-quality images of your gear. Supported formats: JPEG, PNG, WebP, GIF (max 5MB each). You can select multiple images."
          }
        </p>
      </div>

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

export default MultipleGearMedia;
