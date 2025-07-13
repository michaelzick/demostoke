import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, Download, CheckCircle, AlertCircle } from "lucide-react";
import { slugify } from "@/utils/slugify";
import ImageResultsTable from "./ImageResultsTable";

export interface ImageRecord {
  id: string;
  url: string;
  source_table: string;
  source_column: string;
  source_record_id?: string;
  equipment_id?: string; // For equipment_images table
  category?: string;
  name?: string;
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
      const foundImages: ImageRecord[] = [];
      
      console.log('Starting comprehensive image scan...');
      
      // Helper function to check if URL can be processed
      const isProcessableImage = (url: string): boolean => {
        if (!url || url.trim() === '') return false;
        // Skip internal/generated images
        if (url.includes('supabase') || url.includes('dicebear') || url.startsWith('/img/')) return false;
        // Include all common image formats
        return /\.(jpg|jpeg|png|gif|bmp|tiff|webp)(\?.*)?$/i.test(url) || 
               url.includes('unsplash') || 
               url.includes('pexels') || 
               url.includes('images') ||
               url.includes('photo');
      };

      // Helper function to detect file type from URL
      const getFileType = (url: string): string => {
        const match = url.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|tiff|webp)(\?.*)?$/i);
        if (match) return match[1].toUpperCase();
        if (url.includes('unsplash')) return 'JPG';
        if (url.includes('pexels')) return 'JPG';
        return 'UNKNOWN';
      };

      // Scan equipment table - primary images
      console.log('Scanning equipment table...');
      const { data: equipmentData } = await supabase
        .from('equipment')
        .select('id, image_url, category, name')
        .not('image_url', 'is', null);

      equipmentData?.forEach(item => {
        if (item.image_url && isProcessableImage(item.image_url)) {
          foundImages.push({
            id: `equipment-${item.id}`,
            url: item.image_url,
            source_table: 'equipment',
            source_column: 'image_url',
            source_record_id: item.id,
            equipment_id: item.id,
            category: item.category,
            name: item.name,
            file_type: getFileType(item.image_url)
          });
        }
      });
      console.log(`Found ${equipmentData?.filter(item => item.image_url && isProcessableImage(item.image_url)).length || 0} equipment images`);

      // Scan equipment_images table - gallery images
      console.log('Scanning equipment_images table...');
      const { data: equipmentImagesData } = await supabase
        .from('equipment_images')
        .select('id, image_url, equipment_id, equipment(category, name)')
        .not('image_url', 'is', null);

      equipmentImagesData?.forEach(item => {
        if (isProcessableImage(item.image_url)) {
          foundImages.push({
            id: `equipment_images-${item.id}`,
            url: item.image_url,
            source_table: 'equipment_images',
            source_column: 'image_url',
            source_record_id: item.id,
            equipment_id: item.equipment_id,
            category: (item as any).equipment?.category,
            name: (item as any).equipment?.name,
            file_type: getFileType(item.image_url)
          });
        }
      });
      console.log(`Found ${equipmentImagesData?.filter(item => isProcessableImage(item.image_url)).length || 0} equipment gallery images`);

      // Scan profiles table for avatars
      console.log('Scanning profile avatars...');
      const { data: profileAvatars } = await supabase
        .from('profiles')
        .select('id, avatar_url')
        .not('avatar_url', 'is', null);

      profileAvatars?.forEach(item => {
        if (item.avatar_url && isProcessableImage(item.avatar_url)) {
          foundImages.push({
            id: `profiles-avatar-${item.id}`,
            url: item.avatar_url,
            source_table: 'profiles',
            source_column: 'avatar_url',
            source_record_id: item.id,
            file_type: getFileType(item.avatar_url)
          });
        }
      });
      console.log(`Found ${profileAvatars?.filter(item => item.avatar_url && isProcessableImage(item.avatar_url)).length || 0} profile avatars`);

      // Scan profiles table for hero images
      console.log('Scanning profile hero images...');
      const { data: profileHeros } = await supabase
        .from('profiles')
        .select('id, hero_image_url')
        .not('hero_image_url', 'is', null);

      profileHeros?.forEach(item => {
        if (item.hero_image_url && isProcessableImage(item.hero_image_url)) {
          foundImages.push({
            id: `profiles-hero-${item.id}`,
            url: item.hero_image_url,
            source_table: 'profiles',
            source_column: 'hero_image_url',
            source_record_id: item.id,
            file_type: getFileType(item.hero_image_url)
          });
        }
      });
      console.log(`Found ${profileHeros?.filter(item => item.hero_image_url && isProcessableImage(item.hero_image_url)).length || 0} profile hero images`);

      // Log final results
      console.log(`Total processable images found: ${foundImages.length}`);
      foundImages.forEach(img => {
        console.log(`- ${img.source_table}.${img.source_column}: ${img.url} (${img.file_type})`);
      });

      setImages(foundImages);
      setSelectedIds(new Set(foundImages.map(img => img.id)));
      setScanComplete(true);
      
      toast({
        title: "Scan Complete",
        description: `Found ${foundImages.length} images that can be downloaded and stored`,
      });
    } catch (error) {
      console.error('Error scanning images:', error);
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
    if (image.category && image.name) {
      return `/${image.category}/${slugify(image.name)}`;
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