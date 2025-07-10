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
  file_type?: string;
  already_processed?: boolean;
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
        .select('id, image_url')
        .not('image_url', 'is', null);

      equipmentData?.forEach(item => {
        if (item.image_url && isProcessableImage(item.image_url)) {
          foundImages.push({
            id: `equipment-${item.id}`,
            url: item.image_url,
            source_table: 'equipment',
            source_column: 'image_url',
            source_record_id: item.id,
            file_type: getFileType(item.image_url)
          });
        }
      });
      console.log(`Found ${equipmentData?.filter(item => item.image_url && isProcessableImage(item.image_url)).length || 0} equipment images`);

      // Scan equipment_images table - gallery images
      console.log('Scanning equipment_images table...');
      const { data: equipmentImagesData } = await supabase
        .from('equipment_images')
        .select('id, image_url, equipment_id')
        .not('image_url', 'is', null);

      equipmentImagesData?.forEach(item => {
        if (isProcessableImage(item.image_url)) {
          foundImages.push({
            id: `equipment_images-${item.id}`,
            url: item.image_url,
            source_table: 'equipment_images',
            source_column: 'image_url',
            source_record_id: item.id,
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
      setScanComplete(true);
      
      toast({
        title: "Scan Complete",
        description: `Found ${foundImages.length} images that can be downloaded and resized`,
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
      const { data, error } = await supabase.functions.invoke('download-resize-image', {
        body: {
          imageUrl: imageRecord.url,
          sourceTable: imageRecord.source_table,
          sourceColumn: imageRecord.source_column,
          sourceRecordId: imageRecord.source_record_id
        }
      });

      if (error) throw error;

      toast({
        title: "Processing Successful",
        description: `Image downloaded and resized`,
      });

      // Remove the processed image from the list
      setImages(prev => prev.filter(img => img.id !== imageRecord.id));
      
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: "Processing Failed",
        description: "Failed to download and resize image",
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
      if (!converting.has(image.id)) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Image Download & Resize Utility
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Find and download external images with optional resizing to 2000px width. This will improve loading times and reduce bandwidth usage.
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
              disabled={converting.size > 0}
              className="flex items-center gap-2"
            >
              {converting.size > 0 ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Process All ({images.length})
            </Button>
          )}
        </div>

        {scanComplete && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Found {images.length} images that can be downloaded and resized
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
                  <TableHead>File Type</TableHead>
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
                      <Badge variant="secondary">
                        {image.file_type || 'UNKNOWN'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {converting.has(image.id) ? (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Processing...
                        </Badge>
                      ) : (
                        <Badge variant="outline">Ready</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => processImage(image)}
                        disabled={converting.has(image.id)}
                      >
                        {converting.has(image.id) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Download & Resize"
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