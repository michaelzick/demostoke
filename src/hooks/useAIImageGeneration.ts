
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useAIImageGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateImageForEquipment = async (equipmentId: string, gearName: string, category: string, description?: string) => {
    setIsGenerating(true);
    
    try {
      console.log(`Starting AI image generation for ${gearName}`);
      
      toast({
        title: "Generating Image",
        description: `Creating AI-generated image for ${gearName}...`,
      });

      const { data, error } = await supabase.functions.invoke('generate-gear-image', {
        body: {
          equipmentId,
          gearName,
          category,
          description
        }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.details || data.error);
      }

      toast({
        title: "Image Generated Successfully",
        description: `AI-generated image has been applied to ${gearName}`,
      });

      console.log('AI image generation completed successfully');
      return data.imageUrl;

    } catch (error) {
      console.error('Error generating AI image:', error);
      
      let errorMessage = 'Failed to generate AI image';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        title: "Image Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateImageForEquipment,
    isGenerating
  };
};
