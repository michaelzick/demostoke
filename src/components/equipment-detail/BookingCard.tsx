
import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Equipment } from "@/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface BookingCardProps {
  equipment: Equipment;
}

const BookingCard = ({ equipment }: BookingCardProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
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

  // Handle demo request with selected date
  const handleDemoRequest = () => {
    if (!selectedDate) {
      toast({
        title: "Please select a date",
        description: "You need to select a date for your demo request",
        variant: "destructive",
      });
      return;
    }

    setDialogOpen(true);
  };

  const confirmDemoRequest = () => {
    toast({
      title: "Demo Requested!",
      description: `Your demo for ${equipment.name} is scheduled on ${format(selectedDate!, "MMMM d, yyyy")}`,
    });
    setDialogOpen(false);
  };

  return (
    <>
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">Book a Demo</h3>
        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl font-bold">${equipment.pricePerDay}</div>
          <div className="text-sm text-muted-foreground">per day</div>
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

        {/* Date Picker */}
        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">Select a date for your demo</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
                disabled={!equipment.availability.available}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
                className="p-3 pointer-events-auto"
                disabled={date => {
                  // Disable dates before today or before next available date
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

      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Button
            className="w-full mb-4"
            disabled={!equipment.availability.available || !selectedDate}
            onClick={handleDemoRequest}
          >
            {equipment.availability.available ? "Request Demo" : "Not Available"}
          </Button>
        </TooltipTrigger>
        {!selectedDate && (
          <TooltipContent side="top">
            <p>Pick a date from the calendar above</p>
          </TooltipContent>
        )}
      </Tooltip>

      <Button variant="outline" className="w-full">
        <MessageSquare className="h-4 w-4 mr-2" />
        Contact Owner
      </Button>

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Demo Request</DialogTitle>
            <DialogDescription>
              You're about to request a demo for {equipment.name} on {selectedDate && format(selectedDate, "MMMM d, yyyy")}
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
