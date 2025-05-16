
import { useState } from "react";
import { Calendar as CalendarIcon, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar, type DateRange } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Equipment } from "@/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import FrequentlyPairedTogether from "./FrequentlyPairedTogether";
import { format } from "date-fns";

interface BookingCardProps {
  equipment: Equipment;
}

const BookingCard = ({ equipment }: BookingCardProps) => {
  const [selectedRange, setSelectedRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Today";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  // Handle demo request with selected range
  const handleDemoRequest = () => {
    if (!selectedRange.from || !selectedRange.to) {
      toast({
        title: "Please select a date range",
        description: "You need to select a date range for your demo request",
        variant: "destructive",
      });
      return;
    }
    setDialogOpen(true);
  };

  const confirmDemoRequest = () => {
    toast({
      title: "Demo Requested!",
      description: `Your demo for ${equipment.name} is scheduled from ${format(selectedRange.from!, "MMMM d, yyyy")} to ${format(selectedRange.to!, "MMMM d, yyyy")}`,
    });
    setDialogOpen(false);
  };

  return (
    <>
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">Book a Demo</h3>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-primary">${equipment.pricePerDay}</span>
            <span className="ml-1 text-base text-muted-foreground">per day</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center text-sm mb-2">
            <CalendarIcon className="h-4 w-4 mr-2" />
            <span>
              {equipment.availability.available
                ? "Available now"
                : `Available from ${formatDate(equipment.availability.nextAvailableDate)}`
              }
            </span>
          </div>
        </div>

        {/* Date Range Picker */}
        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">Select a date range for your demo</label>
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedRange.from && "text-muted-foreground"
                )}
                disabled={!equipment.availability.available}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedRange.from && selectedRange.to
                  ? `${format(selectedRange.from, "PPP")} - ${format(selectedRange.to, "PPP")}`
                  : <span>Pick a date range</span>
                }
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
              <Calendar
                mode="range"
                selected={selectedRange}
                onSelect={range => setSelectedRange(range ?? { from: undefined, to: undefined })}
                initialFocus
                className="p-3 pointer-events-auto"
                disabled={date => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);

                  const nextAvailable = equipment.availability.nextAvailableDate
                    ? new Date(equipment.availability.nextAvailableDate)
                    : today;

                  return date < nextAvailable;
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <FrequentlyPairedTogether
        equipment={equipment}
        onDemoRequest={handleDemoRequest}
        selectedRange={selectedRange}
        isDateSelected={!!selectedRange.from && !!selectedRange.to}
      />

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Demo Request</DialogTitle>
            <DialogDescription>
              You're about to request a demo for {equipment.name} from{" "}
              {selectedRange.from && format(selectedRange.from, "MMMM d, yyyy")} to{" "}
              {selectedRange.to && format(selectedRange.to, "MMMM d, yyyy")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmDemoRequest}>Confirm Request</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BookingCard;
