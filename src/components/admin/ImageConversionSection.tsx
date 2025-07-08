import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, Download, CheckCircle, AlertCircle } from "lucide-react";

interface ImageRecord {
  id: string;
  url: string;
  source_table: string;
  source_column: string;
  source_record_id?: string;
  already_converted?: boolean;
}

const ImageConversionSection = () => {
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState<Set<string>>(new Set());
  const [scanComplete, setScanComplete] = useState(false);
  const { toast } = useToast();

  const scanForImages = async () => {
    setLoading(true);
    setScanComplete(false);
    
    try {
      const foundImages: ImageRecord[] = [];
      
      console.log('Starting comprehensive image scan...');
      
      // Helper function to check if URL is convertible
      const isConvertibleImage = (url: string): boolean => {
        if (!url || url.trim() === '') return false;
        // Skip if already WebP
        if (url.toLowerCase().includes('.webp')) return false;
        // Skip internal/generated images
        if (url.includes('supabase') || url.includes('dicebear') || url.startsWith('/img/')) return false;
        // Only include common image formats
        return /\.(jpg|jpeg|png|gif|bmp|tiff)(\?.*)?$/i.test(url) || 
               url.includes('unsplash') || 
               url.includes('pexels') || 
               url.includes('images') ||
               url.includes('photo');
      };

      // Scan equipment table - primary images and images array
      console.log('Scanning equipment table...');
      const { data: equipmentData } = await supabase
        .from('equipment')
        .select('id, image_url, images')
        .not('image_url', 'is', null);

      equipmentData?.forEach(item => {
        if (item.image_url && isConvertibleImage(item.image_url)) {
          foundImages.push({
            id: `equipment-${item.id}`,
            url: item.image_url,
            source_table: 'equipment',
            source_column: 'image_url',
            source_record_id: item.id
          });
        }

        if (Array.isArray((item as any).images)) {
          (item as any).images.forEach((url: string, idx: number) => {
            if (isConvertibleImage(url)) {
              foundImages.push({
                id: `equipment-${item.id}-img-${idx}`,
                url,
                source_table: 'equipment',
                source_column: 'images',
                source_record_id: item.id
              });
            }
          });
        }
      });
      const equipmentImageCount =
        equipmentData?.filter(item => item.image_url && isConvertibleImage(item.image_url)).length || 0;
      const equipmentArrayCount =
        equipmentData?.reduce((acc, item) => {
          if (Array.isArray((item as any).images)) {
            acc += (item as any).images.filter((url: string) => isConvertibleImage(url)).length;
          }
          return acc;
        }, 0) || 0;
      console.log(`Found ${equipmentImageCount} equipment images and ${equipmentArrayCount} images in arrays`);

      // Scan equipment_images table - gallery images
      console.log('Scanning equipment_images table...');
      const { data: equipmentImagesData } = await supabase
        .from('equipment_images')
        .select('id, image_url, equipment_id')
        .not('image_url', 'is', null);

      equipmentImagesData?.forEach(item => {
        if (isConvertibleImage(item.image_url)) {
          foundImages.push({
            id: `equipment_images-${item.id}`,
            url: item.image_url,
            source_table: 'equipment_images',
            source_column: 'image_url',
            source_record_id: item.id
          });
        }
      });
      console.log(`Found ${equipmentImagesData?.filter(item => isConvertibleImage(item.image_url)).length || 0} equipment gallery images`);

      // Scan profiles table for avatars
      console.log('Scanning profile avatars...');
      const { data: profileAvatars } = await supabase
        .from('profiles')
        .select('id, avatar_url')
        .not('avatar_url', 'is', null);

      profileAvatars?.forEach(item => {
        if (item.avatar_url && isConvertibleImage(item.avatar_url)) {
          foundImages.push({
            id: `profiles-avatar-${item.id}`,
            url: item.avatar_url,
            source_table: 'profiles',
            source_column: 'avatar_url',
            source_record_id: item.id
          });
        }
      });
      console.log(`Found ${profileAvatars?.filter(item => item.avatar_url && isConvertibleImage(item.avatar_url)).length || 0} profile avatars`);

      // Scan profiles table for hero images
      console.log('Scanning profile hero images...');
      const { data: profileHeros } = await supabase
        .from('profiles')
        .select('id, hero_image_url')
        .not('hero_image_url', 'is', null);

      profileHeros?.forEach(item => {
        if (item.hero_image_url && isConvertibleImage(item.hero_image_url)) {
          foundImages.push({
            id: `profiles-hero-${item.id}`,
            url: item.hero_image_url,
            source_table: 'profiles',
            source_column: 'hero_image_url',
            source_record_id: item.id
          });
        }
      });
      console.log(`Found ${profileHeros?.filter(item => item.hero_image_url && isConvertibleImage(item.hero_image_url)).length || 0} profile hero images`);

      // Log final results
      console.log(`Total convertible images found: ${foundImages.length}`);
      foundImages.forEach(img => {
        console.log(`- ${img.source_table}.${img.source_column}: ${img.url}`);
      });

      setImages(foundImages);
      setScanComplete(true);
      
      toast({
        title: "Scan Complete",
        description: `Found ${foundImages.length} images that can be converted to WebP`,
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

  const convertImage = async (imageRecord: ImageRecord) => {
    setConverting(prev => new Set([...prev, imageRecord.id]));
    
    try {
      const { data, error } = await supabase.functions.invoke('convert-image-to-webp', {
        body: {
          imageUrl: imageRecord.url,
          sourceTable: imageRecord.source_table,
          sourceColumn: imageRecord.source_column,
          sourceRecordId: imageRecord.source_record_id
        }
      });

      if (error) throw error;

      toast({
        title: "Conversion Successful",
        description: `Image converted and saved as WebP`,
      });

      // Remove the converted image from the list
      setImages(prev => prev.filter(img => img.id !== imageRecord.id));
      
    } catch (error) {
      console.error('Error converting image:', error);
      toast({
        title: "Conversion Failed",
        description: "Failed to convert image to WebP",
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

  const convertAllImages = async () => {
    for (const image of images) {
      if (!converting.has(image.id)) {
        await convertImage(image);
        // Add small delay between conversions to avoid overwhelming the server
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Image WebP Conversion Utility
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Find and convert external images to optimized WebP format. This will improve loading times and reduce bandwidth usage.
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
              onClick={convertAllImages}
              variant="outline"
              disabled={converting.size > 0}
              className="flex items-center gap-2"
            >
              {converting.size > 0 ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Convert All ({images.length})
            </Button>
          )}
        </div>

        {scanComplete && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Found {images.length} images that can be converted to WebP format
            </span>
          </div>
        )}

        {images.length > 0 && (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Preview</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {images.map((image) => (
                  <TableRow key={image.id}>
                    <TableCell>
                      <img
                        src={image.url}
                        alt="Preview"
                        className="h-16 w-16 object-cover rounded border"
                        onError={(e) => {
                          e.currentTarget.src = '/img/demostoke-logo-ds-transparent-cropped.webp';
                        }}
                      />
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={image.url}>
                        {image.url}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getSourceDisplayName(image.source_table, image.source_column)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {converting.has(image.id) ? (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Converting...
                        </Badge>
                      ) : (
                        <Badge variant="outline">Ready</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => convertImage(image)}
                        disabled={converting.has(image.id)}
                      >
                        {converting.has(image.id) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Convert & Resize"
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImageConversionSection;