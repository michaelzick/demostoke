import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
import { slugify } from "@/utils/slugify";
import { Copy, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SimilarGearItem {
  id: string;
  name: string;
  category: string;
  status: string;
  owner_name?: string;
  description?: string;
}

interface SimilarGearDescriptionCopyProps {
  gearName: string;
  currentGearId: string;
  currentDescription: string;
}

const SimilarGearDescriptionCopy = ({
  gearName,
  currentGearId,
  currentDescription
}: SimilarGearDescriptionCopyProps) => {
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
          category,
          status,
          description,
          profiles!equipment_user_id_fkey(name)
        `)
        .ilike('name', `%${gearName.trim()}%`)
        .neq('id', currentGearId);

      if (error) throw error;

      const gearItems: SimilarGearItem[] = (gearData || []).map(gear => ({
        id: gear.id,
        name: gear.name,
        category: gear.category,
        status: gear.status || 'available',
        owner_name: (gear.profiles as any)?.name || 'Unknown',
        description: gear.description || ''
      }));

      setSimilarGear(gearItems);
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

  const handleCopyDescription = async () => {
    if (selectedGearIds.size === 0) {
      toast({
        title: "No gear selected",
        description: "Please select at least one gear item to copy description to.",
        variant: "destructive",
      });
      return;
    }

    if (!currentDescription.trim()) {
      toast({
        title: "No description to copy",
        description: "The current gear item has no description to copy.",
        variant: "destructive",
      });
      return;
    }

    setIsCopying(true);

    try {
      let copiedCount = 0;

      for (const gearId of selectedGearIds) {
        const { error: updateError } = await supabase
          .from('equipment')
          .update({ description: currentDescription })
          .eq('id', gearId);

        if (updateError) {
          console.error(`Error updating description for gear ${gearId}:`, updateError);
          continue;
        }

        copiedCount++;
      }

      toast({
        title: "Description copied successfully",
        description: `Description copied to ${copiedCount} gear item(s).`,
      });

      // Refresh the similar gear list to show updated descriptions
      handleOpen();
    } catch (error) {
      console.error('Error copying description:', error);
      toast({
        title: "Error",
        description: "Failed to copy description to selected gear items.",
        variant: "destructive",
      });
    } finally {
      setIsCopying(false);
    }
  };

  const truncateDescription = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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
          Copy Description to Similar Gear
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Copy Description to Similar Gear</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Find gear items with similar names and copy the current description to them.
          </p>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Finding similar gear items...
          </div>
        ) : similarGear.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
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
                onClick={handleCopyDescription}
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
                  <TableHead>Current Description</TableHead>
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
                        to={`/${gear.category}/${slugify(gear.owner_name || '')}/${slugify(gear.name)}`}
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
                    <TableCell className="max-w-xs">
                      {gear.description ? (
                        <div className="text-sm">
                          <p className="text-white">
                            {truncateDescription(gear.description)}
                          </p>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">No description</span>
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

export default SimilarGearDescriptionCopy;
