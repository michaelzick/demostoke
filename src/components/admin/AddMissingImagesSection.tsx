import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, ImagePlus, AlertCircle, ExternalLink, X, Globe } from "lucide-react";
import { buildGearPath } from "@/utils/gearUrl";
import ImageSearchDialog from "@/components/gear-form/ImageSearchDialog";
import ImageUrlManager from "@/components/gear-form/ImageUrlManager";
import { deleteEquipmentImage, addEquipmentImages } from "@/utils/multipleImageHandling";

interface GearWithoutImages {
  id: string;
  name: string;
  size?: string;
  category: string;
  owner_name: string;
  image_count: number;
  current_images: string[];
}

interface GearImageUrls {
  [gearId: string]: string[];
}

const AddMissingImagesSection = () => {
  const [gearItems, setGearItems] = useState<GearWithoutImages[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [showImageSearch, setShowImageSearch] = useState(false);
  const [selectedGear, setSelectedGear] = useState<GearWithoutImages | null>(null);
  const [updatingImages, setUpdatingImages] = useState<Set<string>>(new Set());
  const [gearImageUrls, setGearImageUrls] = useState<GearImageUrls>({});
  const { toast } = useToast();

  const scanForNoImages = async () => {
    setLoading(true);
    setScanComplete(false);

    try {
      // Query for gear items with no primary image
      const { data: gearWithoutImages, error } = await supabase
        .from('equipment')
        .select(`
          id,
          name,
          size,
          category,
          user_id,
          profiles!equipment_user_id_fkey(name)
        `);

      if (error) throw error;

      // For each gear item, check if it has any images in equipment_images table
      const gearPromises = (gearWithoutImages || []).map(async (gear) => {
        const { data: images, error: imagesError } = await supabase
          .from('equipment_images')
          .select('image_url')
          .eq('equipment_id', gear.id);

        if (imagesError) {
          console.error('Error fetching images for gear:', gear.id, imagesError);
          return null;
        }

        const imageUrls = images?.map(img => img.image_url) || [];

        // Only include gear with no images at all
        if (imageUrls.length === 0) {
          return {
            id: gear.id,
            name: gear.name,
            size: gear.size || undefined,
            category: gear.category,
            owner_name: (gear as any).profiles?.name || 'Unknown',
            image_count: 0,
            current_images: []
          };
        }

        return null;
      });

      const results = await Promise.all(gearPromises);
      const filteredResults = results.filter((item): item is GearWithoutImages => item !== null);

      setGearItems(filteredResults);
      setScanComplete(true);

      // Initialize empty URL arrays for each gear item
      const initialUrls: GearImageUrls = {};
      filteredResults.forEach(gear => {
        initialUrls[gear.id] = [];
      });
      setGearImageUrls(initialUrls);

      toast({
        title: "Scan Complete",
        description: `Found ${filteredResults.length} gear items with no images`,
      });
    } catch (error) {
      console.error("Error scanning for gear without images:", error);
      toast({
        title: "Scan Error",
        description: "Failed to scan for gear without images",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchImages = (gear: GearWithoutImages) => {
    setSelectedGear(gear);
    setShowImageSearch(true);
  };

  const handleImagesSelected = async (selectedImageUrls: string[]) => {
    if (!selectedGear) return;

    setUpdatingImages(prev => new Set([...prev, selectedGear.id]));

    try {
      // Add images to the gear item
      await addEquipmentImages(selectedGear.id, selectedImageUrls);

      // Update the gear item in our state
      setGearItems(prev => prev.map(item =>
        item.id === selectedGear.id
          ? {
            ...item,
            current_images: [...item.current_images, ...selectedImageUrls],
            image_count: item.current_images.length + selectedImageUrls.length
          }
          : item
      ));

      toast({
        title: "Images Added",
        description: `Added ${selectedImageUrls.length} image${selectedImageUrls.length > 1 ? 's' : ''} to ${selectedGear.name}`,
      });
    } catch (error) {
      console.error('Error adding images:', error);
      toast({
        title: "Error",
        description: "Failed to add images to gear item",
        variant: "destructive",
      });
    } finally {
      setUpdatingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedGear.id);
        return newSet;
      });
    }
  };

  const handleRemoveImage = async (gearId: string, imageUrl: string) => {
    setUpdatingImages(prev => new Set([...prev, gearId]));

    try {
      await deleteEquipmentImage(imageUrl);

      // Update the gear item in our state
      setGearItems(prev => prev.map(item =>
        item.id === gearId
          ? {
            ...item,
            current_images: item.current_images.filter(url => url !== imageUrl),
            image_count: Math.max(0, item.image_count - 1)
          }
          : item
      ));

      toast({
        title: "Image Removed",
        description: "Image has been deleted from the gear item",
      });
    } catch (error) {
      console.error('Error removing image:', error);
      toast({
        title: "Error",
        description: "Failed to remove image",
        variant: "destructive",
      });
    } finally {
      setUpdatingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(gearId);
        return newSet;
      });
    }
  };

  const setGearUrls = (gearId: string, urls: string[]) => {
    setGearImageUrls(prev => ({
      ...prev,
      [gearId]: urls
    }));
  };

  const saveUrlImages = async (gearId: string) => {
    const urls = gearImageUrls[gearId] || [];
    const validUrls = urls.filter(url => url.trim() !== '');

    if (validUrls.length === 0) {
      toast({
        title: "No URLs",
        description: "Please add at least one valid image URL",
        variant: "destructive",
      });
      return;
    }

    setUpdatingImages(prev => new Set([...prev, gearId]));

    try {
      await addEquipmentImages(gearId, validUrls);

      // Update the gear item in our state
      setGearItems(prev => prev.map(item =>
        item.id === gearId
          ? {
            ...item,
            current_images: [...item.current_images, ...validUrls],
            image_count: item.current_images.length + validUrls.length
          }
          : item
      ));

      // Clear the URL fields after successful save
      setGearImageUrls(prev => ({
        ...prev,
        [gearId]: []
      }));

      toast({
        title: "Images Added",
        description: `Added ${validUrls.length} image${validUrls.length > 1 ? 's' : ''} from URLs`,
      });
    } catch (error) {
      console.error('Error adding images from URLs:', error);
      toast({
        title: "Error",
        description: "Failed to add images from URLs",
        variant: "destructive",
      });
    } finally {
      setUpdatingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(gearId);
        return newSet;
      });
    }
  };

  const getGearDetailLink = (gear: GearWithoutImages): string => {
    return buildGearPath({
      id: gear.id,
      name: gear.name,
      size: gear.size,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImagePlus className="h-5 w-5" />
          Add Missing Images Utility
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Find gear items with no images and add images using Google Images search.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            onClick={scanForNoImages}
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            {loading ? "Scanning..." : "Scan for Missing Images"}
          </Button>
        </div>

        {scanComplete && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Found {gearItems.length} gear items with no images
            </span>
          </div>
        )}

        {gearItems.length > 0 && (
          <div className="space-y-4">
            <div className="grid gap-4">
              {gearItems.map((gear) => (
                <div key={gear.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium">{gear.name}</h3>
                        <Badge variant="outline">{gear.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Owner: {gear.owner_name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="flex items-center gap-1"
                      >
                        <a
                          href={getGearDetailLink(gear)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View Gear
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const searchQuery = encodeURIComponent(gear.name);
                          window.open(`https://www.google.com/search?q=${searchQuery}`, '_blank');
                        }}
                        className="flex items-center gap-1"
                      >
                        <Globe className="h-3 w-3" />
                        Search on Google
                      </Button>
                      <Button
                        onClick={() => handleSearchImages(gear)}
                        disabled={updatingImages.has(gear.id)}
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        {updatingImages.has(gear.id) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Search className="h-4 w-4" />
                        )}
                        Search Images
                      </Button>
                    </div>
                  </div>

                  {/* Current Images */}
                  {gear.current_images.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Current Images:</p>
                      <div className="flex flex-wrap gap-2">
                        {gear.current_images.map((imageUrl, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={imageUrl}
                              alt={`${gear.name} image ${index + 1}`}
                              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md border"
                            />
                            <Button
                              type="button"
                              size="icon"
                              variant="destructive"
                              onClick={() => handleRemoveImage(gear.id, imageUrl)}
                              disabled={updatingImages.has(gear.id)}
                              className="absolute -top-1 -right-1 h-5 w-5 opacity-80 group-hover:opacity-100"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Image URL Manager */}
                  <div className="border-t pt-3">
                    <div className="bg-muted/30 p-3 rounded-md space-y-3">
                      <ImageUrlManager
                        imageUrls={gearImageUrls[gear.id] || []}
                        setImageUrls={(urls) => setGearUrls(gear.id, urls)}
                        gearName={gear.name}
                        gearType={gear.category}
                        showLabel={true}
                        showSaveButton={true}
                        onSave={() => saveUrlImages(gear.id)}
                        isSaving={updatingImages.has(gear.id)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Image Search Dialog */}
        <ImageSearchDialog
          open={showImageSearch}
          onOpenChange={setShowImageSearch}
          onImagesSelected={handleImagesSelected}
          defaultQuery={selectedGear?.name || ''}
          gearType={selectedGear?.category || ''}
        />
      </CardContent>
    </Card>
  );
};

export default AddMissingImagesSection;
