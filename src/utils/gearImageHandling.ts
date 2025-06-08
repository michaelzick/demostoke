
import { uploadGearImage } from "./imageUpload";

interface ImageHandlingParams {
  useImageUrl: boolean;
  imageUrl: string;
  images: File[];
  userId: string;
  duplicatedImageUrl?: string;
  onProgress?: (message: string) => void;
}

export const handleGearImageUpload = async ({
  useImageUrl,
  imageUrl,
  images,
  userId,
  duplicatedImageUrl,
  onProgress,
}: ImageHandlingParams): Promise<string> => {
  // Default to DS logo
  let finalImageUrl = duplicatedImageUrl || '/img/demostoke-logo-ds-transparent-cropped.webp';

  // If using image URL, use that instead of uploading
  if (useImageUrl && imageUrl) {
    finalImageUrl = imageUrl;
    console.log('Using provided image URL:', finalImageUrl);
  } else if (images.length > 0) {
    console.log('Uploading image:', images[0].name);
    onProgress?.("Please wait while we upload your gear image...");

    try {
      finalImageUrl = await uploadGearImage(images[0], userId);
      console.log('Image uploaded successfully:', finalImageUrl);
    } catch (error: unknown) {
      console.error('Image upload failed:', error);
      throw new Error(error instanceof Error ? error.message : "Failed to upload image. Using DS logo instead.");
      // Continue with DS logo if upload fails
    }
  }

  return finalImageUrl;
};
