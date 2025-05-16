
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type SearchDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

const SearchDialog = ({ isOpen, onClose }: SearchDialogProps) => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Reset query when dialog is opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
    }
  }, [isOpen]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Perform the search
      navigate(`/search?q=${encodeURIComponent(query)}`);
      onClose();
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search Failed",
        description: "There was a problem processing your search. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={onClose}>
      <div className="flex items-center border-b px-3">
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <CommandInput 
          placeholder="Search for gear using natural language..." 
          value={query}
          onValueChange={setQuery}
          onKeyDown={handleKeyDown}
          className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none"
        />
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      </div>
      <CommandList>
        <CommandEmpty>Type to search for gear...</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem onSelect={() => setQuery("Surfboard for beginners in Santa Monica")}>
            Surfboard for beginners in Santa Monica
          </CommandItem>
          <CommandItem onSelect={() => setQuery("All-mountain snowboard near Downtown LA")}>
            All-mountain snowboard near Downtown LA
          </CommandItem>
          <CommandItem onSelect={() => setQuery("Skateboard for cruising in Venice Beach")}>
            Skateboard for cruising in Venice Beach
          </CommandItem>
        </CommandGroup>
        <div className="p-2">
          <Button 
            className="w-full" 
            onClick={handleSearch}
            disabled={!query.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>Search</>
            )}
          </Button>
        </div>
      </CommandList>
    </CommandDialog>
  );
};

export default SearchDialog;
