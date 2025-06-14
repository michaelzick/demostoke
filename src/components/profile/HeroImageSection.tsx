
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Trash2, ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface HeroImageSectionProps {
  heroImage: string | null;
  role: string;
  isUploadingHeroImage: boolean;
  isDeletingHeroImage: boolean;
  onHeroImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteHeroImage: () => void;
}

export const HeroImageSection = ({
  heroImage,
  role,
  isUploadingHeroImage,
  isDeletingHeroImage,
  onHeroImageUpload,
  onDeleteHeroImage,
}: HeroImageSectionProps) => {
  const heroFileInputRef = useRef<HTMLInputElement>(null);

  const handleHeroImageClick = () => {
    heroFileInputRef.current?.click();
  };

  // Only show for business profiles (non-private party)
  if (role === 'private-party') {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Hero Image
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {heroImage ? (
          <div className="relative">
            <img
              src={heroImage}
              alt="Hero image"
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        ) : (
          <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No hero image uploaded</p>
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            type="button"
            size="sm"
            onClick={handleHeroImageClick}
            disabled={isUploadingHeroImage || isDeletingHeroImage}
          >
            {isUploadingHeroImage ? (
              <>
                <Upload className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                {heroImage ? 'Change Hero Image' : 'Upload Hero Image'}
              </>
            )}
          </Button>
          
          {heroImage && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  type="button"
                  size="sm"
                  disabled={isUploadingHeroImage || isDeletingHeroImage}
                >
                  {isDeletingHeroImage ? (
                    <>
                      <Trash2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove Hero Image
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove Hero Image</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to remove your hero image? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onDeleteHeroImage}>
                    Remove Image
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        
        <input
          ref={heroFileInputRef}
          type="file"
          accept="image/*"
          onChange={onHeroImageUpload}
          className="hidden"
        />
        
        <p className="text-xs text-muted-foreground">
          Recommended size: 1200x400 pixels. Max file size: 10MB.
        </p>
      </CardContent>
    </Card>
  );
};
