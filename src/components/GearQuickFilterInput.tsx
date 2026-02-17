import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface GearQuickFilterInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
  className?: string;
}

const GearQuickFilterInput = ({
  value,
  onChange,
  onClear,
  placeholder = "Filter shown gear...",
  className,
}: GearQuickFilterInputProps) => {
  return (
    <div className={cn("flex items-center gap-2 w-full sm:max-w-md", className)}>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value.trim() && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onClear}
          aria-label="Clear quick gear filter"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default GearQuickFilterInput;
