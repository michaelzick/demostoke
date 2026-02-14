import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Link } from "react-router-dom";
import { slugify } from "@/utils/slugify";
import { buildGearPath } from "@/utils/gearUrl";
import { Copy, Images, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SimilarGearItem {
  id: string;
  name: string;
  size?: string;
  category: string;
  status: string;
  owner_name?: string;
  images: string[];
}

interface SimilarGearImageCopyProps {
  gearName: string;
  currentGearId: string;
  currentImages: string[];
}

const SimilarGearImageCopy = ({ gearName, currentGearId, currentImages }: SimilarGearImageCopyProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [similarGear, setSimilarGear] = useState<SimilarGearItem[]>([]);
  const [selectedGearIds, setSelectedGearIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const { toast } = useToast();

  const handleOpen = async () => {
    if (!gearName.trim()) {
      toast({
        title: "No gear name",
        description: "Please enter a gear name first.",
        variant: "destructive",
      });
      return;
    }

    setIsOpen(true);
    setIsLoading(true);

    try {
      // Fetch gear with similar names (excluding current gear)
      const { data: gearData, error } = await supabase
        .from('equipment')
        .select(`
          id,
          name,
          size,
          category,
          status,
          profiles!equipment_user_id_fkey(name)
        `)
        .ilike('name', `%${gearName.trim()}%`)
        .neq('id', currentGearId);

      if (error) throw error;

      // Fetch images for each gear item
      const gearWithImages: SimilarGearItem[] = [];
      
      for (const gear of gearData || []) {
        const { data: imageData } = await supabase
          .from('equipment_images')
          .select('image_url')
          .eq('equipment_id', gear.id)
          .order('display_order');

        gearWithImages.push({
          id: gear.id,
          name: gear.name,
          size: gear.size || undefined,
          category: gear.category,
          status: gear.status || 'available',
          owner_name: (gear.profiles as any)?.name || 'Unknown',
          images: imageData?.map(img => img.image_url) || []
        });
      }

      setSimilarGear(gearWithImages);
    } catch (error) {
      console.error('Error fetching similar gear:', error);
      toast({
        title: "Error",
        description: "Failed to find similar gear items.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectGear = (gearId: string, checked: boolean) => {
    const newSelected = new Set(selectedGearIds);
    if (checked) {
      newSelected.add(gearId);
    } else {
      newSelected.delete(gearId);
    }
    setSelectedGearIds(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedGearIds(new Set(similarGear.map(gear => gear.id)));
    } else {
      setSelectedGearIds(new Set());
    }
  };

  const handleCopyImages = async () => {
    if (selectedGearIds.size === 0) {
      toast({
        title: "No gear selected",
        description: "Please select at least one gear item to copy images to.",
        variant: "destructive",
      });
      return;
    }

    if (currentImages.length === 0) {
      toast({
        title: "No images to copy",
        description: "The current gear item has no images to copy.",
        variant: "destructive",
      });
      return;
    }

    setIsCopying(true);

    try {
      let copiedCount = 0;

      for (const gearId of selectedGearIds) {
        // First, delete existing images for this gear
        const { error: deleteError } = await supabase
          .from('equipment_images')
          .delete()
          .eq('equipment_id', gearId);

        if (deleteError) {
          console.error(`Error deleting images for gear ${gearId}:`, deleteError);
          continue;
        }

        // Then, insert the new images
        const imagesToInsert = currentImages.map((imageUrl, index) => ({
          equipment_id: gearId,
          image_url: imageUrl,
          display_order: index,
          is_primary: index === 0
        }));

        const { error: insertError } = await supabase
          .from('equipment_images')
          .insert(imagesToInsert);

        if (insertError) {
          console.error(`Error inserting images for gear ${gearId}:`, insertError);
          continue;
        }

        // Update the has_multiple_images flag
        const { error: updateError } = await supabase
          .from('equipment')
          .update({ has_multiple_images: currentImages.length > 1 })
          .eq('id', gearId);

        if (updateError) {
          console.error(`Error updating gear ${gearId}:`, updateError);
        }

        copiedCount++;
      }

      toast({
        title: "Images copied successfully",
        description: `Images copied to ${copiedCount} gear item(s).`,
      });

      // Refresh the similar gear list to show updated images
      handleOpen();
    } catch (error) {
      console.error('Error copying images:', error);
      toast({
        title: "Error",
        description: "Failed to copy images to selected gear items.",
        variant: "destructive",
      });
    } finally {
      setIsCopying(false);
    }
  };

  const isAllSelected = similarGear.length > 0 && selectedGearIds.size === similarGear.length;
  const isIndeterminate = selectedGearIds.size > 0 && selectedGearIds.size < similarGear.length;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleOpen}
          className="flex items-center gap-2"
        >
          <Copy className="h-4 w-4" />
          Copy Images to Similar Gear
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Copy Images to Similar Gear</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Find gear items with similar names and copy the current images to them.
          </p>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Finding similar gear items...
          </div>
        ) : similarGear.length === 0 ? (
          <div className="text-center py-8">
            <Images className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No other gear items found with similar names to "{gearName}".
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  className={isIndeterminate ? "data-[state=checked]:bg-primary/50" : ""}
                />
                <label className="text-sm font-medium">
                  Select All ({similarGear.length} items)
                </label>
              </div>
              <Button
                onClick={handleCopyImages}
                disabled={selectedGearIds.size === 0 || isCopying}
                className="flex items-center gap-2"
              >
                {isCopying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Copying...
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy to Selected ({selectedGearIds.size})
                  </>
                )}
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Select</TableHead>
                  <TableHead>Gear Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Current Images</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {similarGear.map((gear) => (
                  <TableRow key={gear.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedGearIds.has(gear.id)}
                        onCheckedChange={(checked) => handleSelectGear(gear.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link
                        to={buildGearPath({
                          id: gear.id,
                          name: gear.name,
                          size: gear.size,
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {gear.name}
                      </Link>
                    </TableCell>
                    <TableCell>{gear.category}</TableCell>
                    <TableCell>
                      <Link
                        to={`/user-profile/${slugify(gear.owner_name || '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {gear.owner_name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {gear.images.length === 0 ? (
                        <span className="text-sm text-muted-foreground">No images</span>
                      ) : gear.images.length === 1 ? (
                        <img
                          src={gear.images[0]}
                          alt="Gear"
                          className="w-16 h-16 object-cover rounded border"
                        />
                      ) : (
                        <Card className="w-48">
                          <CardContent className="p-2">
                            <Carousel className="w-full">
                              <CarouselContent>
                                {gear.images.map((imageUrl, index) => (
                                  <CarouselItem key={index}>
                                    <img
                                      src={imageUrl}
                                      alt={`${gear.name} ${index + 1}`}
                                      className="w-full h-16 object-cover rounded"
                                    />
                                  </CarouselItem>
                                ))}
                              </CarouselContent>
                              <CarouselPrevious className="left-1" />
                              <CarouselNext className="right-1" />
                            </Carousel>
                            <p className="text-xs text-center mt-1 text-muted-foreground">
                              {gear.images.length} images
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SimilarGearImageCopy;
