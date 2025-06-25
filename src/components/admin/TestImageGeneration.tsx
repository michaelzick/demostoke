
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAIImageGeneration } from '@/hooks/useAIImageGeneration';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface Equipment {
  id: string;
  name: string;
  category: string;
  description?: string;
  image_url?: string;
}

const TestImageGeneration = () => {
  const [surfboards, setSurfboards] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const { generateImageForEquipment, isGenerating } = useAIImageGeneration();
  const { toast } = useToast();

  useEffect(() => {
    fetchSurfboards();
  }, []);

  const fetchSurfboards = async () => {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('id, name, category, description, image_url')
        .eq('category', 'surfboards')
        .limit(5);

      if (error) throw error;

      setSurfboards(data || []);
    } catch (error) {
      console.error('Error fetching surfboards:', error);
      toast({
        title: "Error",
        description: "Failed to fetch surfboards",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = async (equipment: Equipment) => {
    try {
      await generateImageForEquipment(
        equipment.id,
        equipment.name,
        equipment.category,
        equipment.description
      );
      
      // Refresh the data to show the new image
      await fetchSurfboards();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Test AI Image Generation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test AI Image Generation</CardTitle>
        <p className="text-sm text-muted-foreground">
          Generate AI images for surfboard items to test the functionality
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {surfboards.length === 0 ? (
          <p className="text-muted-foreground">No surfboards found in the database.</p>
        ) : (
          surfboards.map((equipment) => (
            <div key={equipment.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium">{equipment.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {equipment.description?.substring(0, 100)}...
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Current image: {equipment.image_url?.includes('base64') ? 'AI Generated' : 
                                equipment.image_url?.includes('demostoke') ? 'Default Logo' : 'Custom URL'}
                </p>
              </div>
              <div className="ml-4">
                {equipment.image_url && (
                  <img 
                    src={equipment.image_url} 
                    alt={equipment.name}
                    className="w-16 h-16 object-cover rounded mr-4"
                  />
                )}
                <Button
                  onClick={() => handleGenerateImage(equipment)}
                  disabled={isGenerating}
                  variant="outline"
                  size="sm"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    'Generate AI Image'
                  )}
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default TestImageGeneration;
