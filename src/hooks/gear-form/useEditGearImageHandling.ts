
import { useToast } from "@/hooks/use-toast";
import { uploadGearImage } from "@/utils/imageUpload";

interface ImageHandlingParams {
  useImageUrl: boolean;
  imageUrl: string;
  images: File[];
  currentImageUrl: string;
  userId: string;
}

export const useEditGearImageHandling = () => {
  const { toast } = useToast();

  const handleImageProcessing = async ({
    useImageUrl,
    imageUrl,
    images,
    currentImageUrl,
    userId
  }: ImageHandlingParams): Promise<string> => {
    let finalImageUrl = currentImageUrl; // Keep existing image by default

    // Handle image upload or URL
    if (useImageUrl && imageUrl) {
      finalImageUrl = imageUrl;
      console.log('Using provided image URL:', finalImageUrl);
    } else if (images.length > 0) {
      console.log('Uploading new image:', images[0].name);
      toast({
        title: "Uploading Image",
        description: "Please wait while we upload your gear image...",
      });

      try {
        finalImageUrl = await uploadGearImage(images[0], userId);
        console.log('Image uploaded successfully:', finalImageUrl);
      } catch (error: unknown) {
        console.error('Image upload failed:', error);
        toast({
          title: "Image Upload Failed",
          description: error instanceof Error ? error.message : "Failed to upload image. Keeping existing image.",
          variant: "destructive",
        });
      }
    }

    return finalImageUrl;
  };

  return { handleImageProcessing };
};
