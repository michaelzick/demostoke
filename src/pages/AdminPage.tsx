import { useState } from "react";
import { useAuth } from "@/helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { uploadVideoToSupabase } from "@/utils/videoUpload";
import { Navigate } from "react-router-dom";
import { Upload, Video, Database } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useMockData } from "@/hooks/useMockData";

interface FileInputEvent extends React.ChangeEvent<HTMLInputElement> {
  target: HTMLInputElement & {
    files: FileList;
  };
}

const AdminPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { showMockData, toggleMockData } = useMockData();

  // Check if user is admin (only your email)
  const isAdmin = isAuthenticated && user?.email === "michaelzick@gmail.com";

  // Redirect if not admin
  if (!isAuthenticated) {
    return <Navigate to="/auth/signin" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleFileSelect = (event: FileInputEvent) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Set default filename from the file name
      setFileName(file.name);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !fileName) {
      toast({
        title: "Error",
        description: "Please select a file and provide a filename",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      const publicUrl = await uploadVideoToSupabase(selectedFile, fileName);

      toast({
        title: "Upload Successful",
        description: `Video uploaded successfully: ${fileName}`,
      });

      // Reset form
      setSelectedFile(null);
      setFileName("");
      // Reset file input
      const fileInput = document.getElementById('video-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to upload video";
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleMockDataChange = () => {
    toggleMockData();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
      {/* Mock Data Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-6 w-6" />
            Data Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-mock-data"
              checked={showMockData}
              onCheckedChange={handleMockDataChange}
            />
            <Label htmlFor="show-mock-data" className="text-sm font-medium">
              Show Mock Data?
            </Label>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Enable this option to show mock data throughout the application for testing purposes.
          </p>
        </CardContent>
      </Card>

      {/* Video Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-6 w-6" />
            Video Upload
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="video-file">Select Video File</Label>
            <Input
              id="video-file"
              type="file"
              accept="video/mp4,video/webm,video/ogg"
              onChange={handleFileSelect}
              disabled={isUploading}
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="filename">Filename (with extension)</Label>
            <Input
              id="filename"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="e.g., surfers_compressed.mp4"
              disabled={isUploading}
            />
          </div>

          <Button
            onClick={handleUpload}
            disabled={!selectedFile || !fileName || isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Upload className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Video
              </>
            )}
          </Button>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Current Hero Videos:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• surfers_compressed.mp4</li>
              <li>• snowboarder_compressed.mp4</li>
              <li>• skier_compressed.mp4</li>
              <li>• skater_compressed.mp4</li>
              <li>• sup_compressed.mp4</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPage;
