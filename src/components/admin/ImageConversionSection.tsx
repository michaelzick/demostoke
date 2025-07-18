import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, Download, CheckCircle, AlertCircle } from "lucide-react";
import { slugify } from "@/utils/slugify";
import ImageResultsTable from "./ImageResultsTable";
import { scanImages } from "./utils/imageScanner";

export interface ImageRecord {
  id: string;
  url: string;
  source_table: string;
  source_column: string;
  source_record_id?: string;
  equipment_id?: string; // For equipment_images table
  category?: string;
  name?: string;
  owner_name?: string;
  file_type?: string;
  dimensions?: { width: number; height: number };
  already_processed?: boolean;
}

const ImageConversionSection = () => {
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState<Set<string>>(new Set());
  const [scanComplete, setScanComplete] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds(prev => {
      if (prev.size === images.length) {
        return new Set();
      }
      return new Set(images.map(img => img.id));
    });
  };

  const scanForImages = async () => {
    setLoading(true);
    setScanComplete(false);

    try {
      const foundImages = await scanImages();

      setImages(foundImages);
      setSelectedIds(new Set(foundImages.map((img) => img.id)));
      setScanComplete(true);

      toast({
        title: "Scan Complete",
        description: `Found ${foundImages.length} images that can be downloaded and stored`,
      });
    } catch (error) {
      console.error("Error scanning images:", error);
      toast({
        title: "Scan Error",
        description: "Failed to scan for images",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processImage = async (imageRecord: ImageRecord) => {
    setConverting(prev => new Set([...prev, imageRecord.id]));
    
    try {
      const { data, error } = await supabase.functions.invoke('download-store-image', {
        body: {
          imageUrl: imageRecord.url,
          sourceTable: imageRecord.source_table,
          sourceColumn: imageRecord.source_column,
          sourceRecordId: imageRecord.source_record_id
        }
      });

      if (error) throw error;

      toast({
        title: "Download Successful",
        description: `Image downloaded and stored`,
      });

      // Mark the processed image as completed
      setImages(prev =>
        prev.map(img =>
          img.id === imageRecord.id ? { ...img, already_processed: true } : img
        )
      );
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(imageRecord.id);
        return newSet;
      });
      
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download and store image",
        variant: "destructive",
      });
    } finally {
      setConverting(prev => {
        const newSet = new Set(prev);
        newSet.delete(imageRecord.id);
        return newSet;
      });
    }
  };

  const processAllImages = async () => {
    for (const image of images) {
      if (
        selectedIds.has(image.id) &&
        !converting.has(image.id) &&
        !image.already_processed
      ) {
        await processImage(image);
        // Add small delay between operations to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  };

  const getSourceDisplayName = (table: string, column: string) => {
    const mapping: Record<string, string> = {
      'equipment.image_url': 'Equipment Primary Image',
      'equipment_images.image_url': 'Equipment Gallery Image',
      'profiles.avatar_url': 'Profile Avatar',
      'profiles.hero_image_url': 'Profile Hero Image',
    };
    return mapping[`${table}.${column}`] || `${table}.${column}`;
  };

  const loadImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      img.src = url;
    });
  };

  const getGearDetailLink = (image: ImageRecord): string | null => {
    if (image.category && image.name && image.owner_name) {
      return `/${image.category}/${slugify(image.owner_name)}/${slugify(image.name)}`;
    }
    return null;
  };

  // Load dimensions for images when they are scanned
  useEffect(() => {
    const loadDimensions = async () => {
      const updatedImages = [...images];
      let hasUpdates = false;

      for (const image of updatedImages) {
        if (!image.dimensions) {
          try {
            const dimensions = await loadImageDimensions(image.url);
            image.dimensions = dimensions;
            hasUpdates = true;
          } catch (error) {
            console.warn(`Failed to load dimensions for ${image.url}:`, error);
          }
        }
      }

      if (hasUpdates) {
        setImages(updatedImages);
      }
    };

    if (images.length > 0) {
      loadDimensions();
    }
  }, [images.length]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Image Download & Store Utility
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Find and download external images to store them in Supabase. This will improve loading times and reduce external dependencies.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            onClick={scanForImages}
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            {loading ? "Scanning..." : "Scan for Images"}
          </Button>
          
          {scanComplete && images.length > 0 && (
            <Button
              onClick={processAllImages}
              variant="outline"
              disabled={converting.size > 0 || selectedIds.size === 0}
              className="flex items-center gap-2"
            >
              {converting.size > 0 ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Process Selected ({selectedIds.size})
            </Button>
          )}
        </div>

        {scanComplete && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Found {images.length} images that can be downloaded and stored
            </span>
          </div>
        )}

        {images.length > 0 && (
          <ImageResultsTable
            images={images}
            converting={converting}
            processImage={processImage}
            getGearDetailLink={getGearDetailLink}
            getSourceDisplayName={getSourceDisplayName}
            selectedIds={selectedIds}
            toggleSelectOne={toggleSelectOne}
            toggleSelectAll={toggleSelectAll}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ImageConversionSection;