import { supabase } from "@/integrations/supabase/client";

interface ImageMetadata {
  url: string;
  equipmentId?: string;
  size?: number;
  width?: number;
  height?: number;
  originalUrl?: string;
}

export const deduplicateImages = async (imageUrls: string[]): Promise<string[]> => {
  if (imageUrls.length <= 1) return imageUrls;

  console.log('🔍 Starting image deduplication for:', imageUrls.length, 'images');

  // Get WebP metadata to help with deduplication
  const webpMetadata = await getWebPMetadata(imageUrls);
  
  const uniqueImages: string[] = [];
  const processedImages = new Set<string>();

  for (const url of imageUrls) {
    if (processedImages.has(url)) continue;

    // Check if this image has a WebP equivalent or original
    const metadata = webpMetadata.find(m => m.url === url);
    let isDuplicate = false;

    for (const existingUrl of uniqueImages) {
      const existingMetadata = webpMetadata.find(m => m.url === existingUrl);
      
      if (areDuplicateImages(url, existingUrl, metadata, existingMetadata)) {
        isDuplicate = true;
        
        // If current image is WebP and existing is not, replace it
        if (isWebPImage(url) && !isWebPImage(existingUrl)) {
          const index = uniqueImages.indexOf(existingUrl);
          uniqueImages[index] = url;
          processedImages.add(existingUrl);
          processedImages.add(url);
        } else {
          processedImages.add(url);
        }
        break;
      }
    }

    if (!isDuplicate) {
      uniqueImages.push(url);
      processedImages.add(url);
    }
  }

  console.log('✅ Deduplication complete:', imageUrls.length, '→', uniqueImages.length, 'images');
  return uniqueImages;
};

const areDuplicateImages = (
  url1: string, 
  url2: string, 
  metadata1?: ImageMetadata, 
  metadata2?: ImageMetadata
): boolean => {
  // Check if one is the WebP version of the other
  if (metadata1?.originalUrl === url2 || metadata2?.originalUrl === url1) {
    return true;
  }

  // Check if they have similar dimensions and sizes (within 10% tolerance)
  if (metadata1 && metadata2) {
    const sizeSimilar = metadata1.size && metadata2.size && 
      Math.abs(metadata1.size - metadata2.size) / Math.max(metadata1.size, metadata2.size) < 0.1;
    
    const dimensionsSimilar = metadata1.width && metadata1.height && 
      metadata2.width && metadata2.height &&
      Math.abs(metadata1.width - metadata2.width) <= 50 &&
      Math.abs(metadata1.height - metadata2.height) <= 50;

    if (sizeSimilar || dimensionsSimilar) {
      return true;
    }
  }

  // Check filename patterns (same equipment ID and similar timestamps)
  const pattern1 = extractImagePattern(url1);
  const pattern2 = extractImagePattern(url2);

  if (pattern1.equipmentId && pattern2.equipmentId && 
      pattern1.equipmentId === pattern2.equipmentId) {
    
    // If timestamps are within 5 minutes, likely the same image
    if (pattern1.timestamp && pattern2.timestamp &&
        Math.abs(pattern1.timestamp - pattern2.timestamp) < 300000) {
      return true;
    }
  }

  return false;
};

const extractImagePattern = (url: string) => {
  const urlParts = url.split('/');
  const fileName = urlParts[urlParts.length - 1];
  
  // Extract equipment ID from path
  const equipmentMatch = url.match(/(?:equipment|equipment_images)\/([a-f0-9-]{36})/);
  const equipmentId = equipmentMatch ? equipmentMatch[1] : null;
  
  // Extract timestamp from filename
  const timestampMatch = fileName.match(/(\d{13})/);
  const timestamp = timestampMatch ? parseInt(timestampMatch[1]) : null;

  return { equipmentId, timestamp };
};

const isWebPImage = (url: string): boolean => {
  return url.includes('/webp-images/') || url.endsWith('.webp');
};

const getWebPMetadata = async (imageUrls: string[]): Promise<ImageMetadata[]> => {
  try {
    const { data, error } = await supabase
      .from('webp_images')
      .select('original_url, webp_url, original_size, webp_size, original_width, original_height, webp_width, webp_height')
      .in('webp_url', imageUrls.filter(isWebPImage));

    if (error) {
      console.error('Error fetching WebP metadata:', error);
      return [];
    }

    return data?.map(item => ({
      url: item.webp_url,
      originalUrl: item.original_url,
      size: item.webp_size || undefined,
      width: item.webp_width || undefined,
      height: item.webp_height || undefined,
    })) || [];
  } catch (error) {
    console.error('Exception fetching WebP metadata:', error);
    return [];
  }
};

export const fetchEquipmentImagesUnified = async (equipmentId: string): Promise<string[]> => {
  console.log('🖼️ Fetching unified images for equipment:', equipmentId);

  try {
    // Get equipment primary image
    const { data: equipmentData, error: equipmentError } = await supabase
      .from('equipment')
      .select('image_url')
      .eq('id', equipmentId)
      .single();

    if (equipmentError) {
      console.error('Error fetching equipment primary image:', equipmentError);
    }

    // Get additional images from equipment_images table
    const { data: additionalImages, error: imagesError } = await supabase
      .from('equipment_images')
      .select('image_url')
      .eq('equipment_id', equipmentId)
      .order('display_order', { ascending: true });

    if (imagesError) {
      console.error('Error fetching additional images:', imagesError);
    }

    // Combine all images
    const allImages: string[] = [];
    
    if (equipmentData?.image_url) {
      allImages.push(equipmentData.image_url);
    }
    
    if (additionalImages) {
      allImages.push(...additionalImages.map(img => img.image_url));
    }

    // Remove empty/null values and deduplicate
    const cleanImages = allImages.filter(Boolean);
    const deduplicatedImages = await deduplicateImages(cleanImages);

    console.log('✅ Unified images fetched:', cleanImages.length, '→', deduplicatedImages.length, 'after deduplication');
    return deduplicatedImages;
  } catch (error) {
    console.error('Exception fetching unified equipment images:', error);
    return [];
  }
};