import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload } from "lucide-react";

const ImageUploadSection = () => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedBucket, setSelectedBucket] = useState<string>("gear-images");
  const [uploading, setUploading] = useState(false);

  const imageBuckets = [
    { value: "gear-images", label: "Gear Images" },
    { value: "profile-images", label: "Profile Images" },
    { value: "blog-images", label: "Blog Images" }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a valid image file.",
        variant: "destructive"
      });
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select an image file to upload.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedBucket) {
      toast({
        title: "No Bucket Selected",
        description: "Please select a storage bucket.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `admin-image-${Date.now()}-${selectedFile.name}`;
      
      const { data, error } = await supabase.storage
        .from(selectedBucket)
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(selectedBucket)
        .getPublicUrl(data.path);
      
      toast({
        title: "Upload Successful",
        description: `Image uploaded successfully to ${selectedBucket}. URL: ${urlData.publicUrl}`,
      });
      
      setSelectedFile(null);
      // Reset the file input
      const fileInput = document.getElementById('image-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Image Upload</CardTitle>
        <CardDescription>
          Upload images to the application storage buckets
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="bucket-select" className="text-base">
            Storage Bucket
          </Label>
          <Select value={selectedBucket} onValueChange={setSelectedBucket}>
            <SelectTrigger>
              <SelectValue placeholder="Select a storage bucket" />
            </SelectTrigger>
            <SelectContent>
              {imageBuckets.map((bucket) => (
                <SelectItem key={bucket.value} value={bucket.value}>
                  {bucket.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="image-upload" className="text-base">
            Select Image File
          </Label>
          <Input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
          />
          {selectedFile && (
            <p className="text-sm text-muted-foreground">
              Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>
        <Button 
          onClick={handleImageUpload}
          disabled={!selectedFile || !selectedBucket || uploading}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          {uploading ? "Uploading..." : "Upload Image"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ImageUploadSection;