
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Search, Loader2, X } from 'lucide-react';

interface SearchResult {
  url: string;
  thumbnail: string;
  title: string;
  source: string;
  width?: number;
  height?: number;
}

interface ImageSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImagesSelected: (imageUrls: string[]) => void;
  defaultQuery?: string;
  gearType?: string;
}

const ImageSearchDialog = ({
  open,
  onOpenChange,
  onImagesSelected,
  defaultQuery = '',
  gearType
}: ImageSearchDialogProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  // Pre-populate the search field when dialog opens or defaultQuery changes
  useEffect(() => {
    if (open && defaultQuery) {
      setQuery(defaultQuery);
    }
  }, [open, defaultQuery]);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({
        title: "Search Required",
        description: "Please enter a search term",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-image-search', {
        body: {
          query: query.trim(),
          gearType,
          count: 30
        }
      });

      if (error) throw error;

      setResults(data.results || []);
      setSelectedImages(new Set());
      
      if (data.results?.length === 0) {
        toast({
          title: "No Images Found",
          description: "Try a different search term or check your spelling",
        });
      }
    } catch (error) {
      console.error('Image search error:', error);
      toast({
        title: "Search Failed",
        description: "Failed to search for images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const toggleImageSelection = (imageUrl: string) => {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(imageUrl)) {
      newSelected.delete(imageUrl);
    } else {
      newSelected.add(imageUrl);
    }
    setSelectedImages(newSelected);
  };

  const handleAddSelected = () => {
    const selectedUrls = Array.from(selectedImages);
    if (selectedUrls.length === 0) {
      toast({
        title: "No Images Selected",
        description: "Please select at least one image to add",
        variant: "destructive",
      });
      return;
    }

    onImagesSelected(selectedUrls);
    onOpenChange(false);
    setResults([]);
    setSelectedImages(new Set());
    
    toast({
      title: "Images Added",
      description: `Added ${selectedUrls.length} image${selectedUrls.length > 1 ? 's' : ''} to your gear`,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Search for Gear Images</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Search Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter gear name (e.g., Burton Flight Attendant)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button 
              onClick={handleSearch} 
              disabled={isSearching}
              className="px-6"
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Results Grid */}
          {results.length > 0 && (
            <div className="flex-1 overflow-auto">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 pb-4">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`relative border rounded-lg overflow-hidden cursor-pointer transition-all ${
                      selectedImages.has(result.url)
                        ? 'ring-2 ring-primary border-primary'
                        : 'hover:border-gray-400'
                    }`}
                    onClick={() => toggleImageSelection(result.url)}
                  >
                    <div className="aspect-square">
                      <img
                        src={result.url}
                        alt={result.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="absolute top-1 right-1">
                      <Checkbox
                        checked={selectedImages.has(result.url)}
                        onChange={() => toggleImageSelection(result.url)}
                        className="bg-white shadow-sm"
                      />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1">
                      <div className="truncate" title={result.source}>
                        {result.source}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {selectedImages.size > 0 && (
              <Button onClick={handleAddSelected}>
                Add Selected ({selectedImages.size})
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageSearchDialog;
