
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Equipment } from "@/types";
import { toast } from "@/hooks/use-toast";

interface BookingCardProps {
  equipment: Equipment;
  waiverCompleted?: boolean;
  onWaiverClick?: () => void;
}

const BookingCard = ({ equipment, waiverCompleted = false, onWaiverClick }: BookingCardProps) => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [numDays, setNumDays] = useState(1);
  
  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);
    if (date && endDate && date > endDate) {
      setEndDate(undefined);
      setNumDays(1);
    } else if (date && endDate) {
      const daysDiff = Math.ceil((endDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      setNumDays(daysDiff);
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
    if (startDate && date) {
      const daysDiff = Math.ceil((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      setNumDays(Math.max(1, daysDiff));
    }
  };

  const handleBooking = () => {
    if (!waiverCompleted && onWaiverClick) {
      onWaiverClick();
      return;
    }
    
    if (!startDate || !endDate) {
      toast({
        title: "Please select dates",
        description: "You need to select both start and end dates to book this equipment.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Booking Request Sent",
      description: "Your booking request has been sent to the owner for approval.",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-2xl font-bold">${equipment.pricePerDay} <span className="text-sm font-normal">/ day</span></p>
          <div className="flex items-center mt-1">
            <span className="text-sm">★ {equipment.rating}</span>
            <span className="mx-1">·</span>
            <span className="text-sm">{equipment.reviewCount} reviews</span>
          </div>
        </div>
        <span className="text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 py-1 px-2 rounded">
          {equipment.availability.available ? "Available" : "Unavailable until " + equipment.availability.nextAvailableDate}
        </span>
      </div>

      <Card className="p-4 bg-muted/50">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium">START DATE</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal mt-1 h-9"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={handleStartDateChange}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="text-xs font-medium">END DATE</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal mt-1 h-9"
                    disabled={!startDate}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={handleEndDateChange}
                    disabled={(date) => !startDate || date < startDate}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </Card>

      {startDate && endDate && (
        <div className="space-y-2 pt-2">
          <div className="flex justify-between">
            <span>${equipment.pricePerDay} x {numDays} days</span>
            <span>${equipment.pricePerDay * numDays}</span>
          </div>
          <div className="flex justify-between">
            <span>Service fee</span>
            <span>${Math.round(equipment.pricePerDay * numDays * 0.1)}</span>
          </div>
          <div className="flex justify-between font-bold pt-2 border-t">
            <span>Total</span>
            <span>${equipment.pricePerDay * numDays + Math.round(equipment.pricePerDay * numDays * 0.1)}</span>
          </div>
        </div>
      )}

      <Button 
        onClick={handleBooking} 
        className="w-full"
      >
        {!waiverCompleted ? "Complete Waiver & Book" : "Request Demo"}
      </Button>

      {!waiverCompleted && (
        <p className="text-xs text-center text-muted-foreground">
          You must complete a liability waiver before booking
        </p>
      )}

      <p className="text-xs text-center text-muted-foreground">
        You won't be charged yet. Booking requests require owner confirmation.
      </p>
    </div>
  );
};

export default BookingCard;
