
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { uploadVideoToSupabase } from "@/utils/videoUpload";
import { Upload } from "lucide-react";

const VideoUploadSection = () => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a valid video file.",
        variant: "destructive"
      });
    }
  };

  const handleVideoUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a video file to upload.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const fileName = `admin-video-${Date.now()}-${selectedFile.name}`;
      const videoUrl = await uploadVideoToSupabase(selectedFile, fileName);
      
      toast({
        title: "Upload Successful",
        description: `Video uploaded successfully. URL: ${videoUrl}`,
      });
      
      setSelectedFile(null);
      // Reset the file input
      const fileInput = document.getElementById('video-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload video. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Video Upload</CardTitle>
        <CardDescription>
          Upload videos to the application storage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="video-upload" className="text-base">
            Select Video File
          </Label>
          <Input
            id="video-upload"
            type="file"
            accept="video/*"
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
          onClick={handleVideoUpload}
          disabled={!selectedFile || uploading}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          {uploading ? "Uploading..." : "Upload Video"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default VideoUploadSection;
