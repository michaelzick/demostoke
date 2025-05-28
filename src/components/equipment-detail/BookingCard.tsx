
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
import { AddOn, calculateTotalPrice, getAddOnsForCategory } from "@/lib/addOns";
import { Checkbox } from "@/components/ui/checkbox";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface BookingCardProps {
  equipment: Equipment;
  waiverCompleted?: boolean;
  onWaiverClick?: () => void;
}

const BookingCard = ({ equipment, waiverCompleted = false, onWaiverClick }: BookingCardProps) => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [numDays, setNumDays] = useState(1);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  
  // Add-ons state
  const addOns = getAddOnsForCategory(equipment.category);
  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>([...addOns]);
  const totalPrice = calculateTotalPrice(equipment.pricePerDay, selectedAddOns);
  
  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);
    setStartDateOpen(false);
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
    setEndDateOpen(false);
    if (startDate && date) {
      const daysDiff = Math.ceil((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      setNumDays(Math.max(1, daysDiff));
    }
  };

  const handleAddOnToggle = (addOn: AddOn, checked: boolean) => {
    if (checked) {
      setSelectedAddOns([...selectedAddOns, addOn]);
    } else {
      setSelectedAddOns(selectedAddOns.filter(item => item.name !== addOn.name));
    }
  };

  const handleBooking = () => {
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

  // Form validation check - need both dates
  const formIsValid = startDate && endDate;

  // Format the availability status text
  const getAvailabilityStatusText = () => {
    if (equipment.availability.available) {
      return "Available";
    } else if (equipment.availability.nextAvailableDate) {
      return `Unavailable until ${equipment.availability.nextAvailableDate}`;
    } else {
      return "Currently Unavailable";
    }
  };

  // Helper function to format currency with proper decimal places
  const formatCurrency = (amount: number): string => {
    return parseFloat(amount.toFixed(2)).toFixed(2);
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
          {getAvailabilityStatusText()}
        </span>
      </div>

      <Card className="p-4 bg-muted/50">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium">START DATE</label>
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
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
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="text-xs font-medium">END DATE</label>
              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
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
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </Card>

      {/* Frequently Paired Together */}
      {addOns.length > 0 && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Frequently Paired Together</h3>
          <div className="flex flex-wrap items-start gap-3 mb-4">
            {/* Main equipment */}
            <div className="relative flex flex-col items-center mb-4 w-24">
              <div className="w-16 h-16 overflow-hidden rounded-md mb-2">
                <AspectRatio ratio={1}>
                  <img
                    src={equipment.imageUrl}
                    alt={equipment.name}
                    className="w-full h-full object-cover"
                  />
                </AspectRatio>
              </div>
              <span className="text-xs text-center font-medium">{equipment.name}</span>
            </div>

            {/* Add-on items */}
            {addOns.map((addOn) => {
              const isSelected = selectedAddOns.some(item => item.name === addOn.name);

              return (
                <div key={addOn.name} className="relative flex flex-col items-center w-24">
                  <div className="absolute -left-2 z-10">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => handleAddOnToggle(addOn, checked === true)}
                      className="absolute"
                    />
                  </div>
                  <div className={`w-16 h-16 overflow-hidden rounded-md mb-2 ${!isSelected ? 'opacity-50' : ''}`}>
                    <AspectRatio ratio={1}>
                      <img
                        src={addOn.imageUrl}
                        alt={addOn.name}
                        className="w-full h-full object-cover"
                      />
                    </AspectRatio>
                  </div>
                  <span className={`text-xs text-center font-medium ${!isSelected ? 'text-gray-400' : ''}`}>
                    {addOn.name}
                  </span>
                  <span className="text-xs text-muted-foreground">${formatCurrency(addOn.pricePerDay)}/day</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Dynamic Price calculation */}
      {startDate && endDate && (
        <div className="space-y-2 pt-2">
          <div className="p-3 bg-muted/50 rounded-md">
            <div className="font-medium mb-2">Price Summary:</div>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>{equipment.name}</span>
                <span>${formatCurrency(equipment.pricePerDay)} x {numDays} days = ${formatCurrency(equipment.pricePerDay * numDays)}</span>
              </div>
              {selectedAddOns.map((addOn) => (
                <div key={addOn.name} className="flex justify-between">
                  <span>{addOn.name}</span>
                  <span>${formatCurrency(addOn.pricePerDay)} x {numDays} days = ${formatCurrency(addOn.pricePerDay * numDays)}</span>
                </div>
              ))}
              <div className="flex justify-between">
                <span>Service fee</span>
                <span>${formatCurrency(totalPrice * numDays * 0.1)}</span>
              </div>
              <div className="border-t pt-2 mt-2 font-medium flex justify-between">
                <span>Total</span>
                <span>${formatCurrency(totalPrice * numDays + totalPrice * numDays * 0.1)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Waiver button */}
      <Button 
        onClick={onWaiverClick}
        variant="outline"
        className="w-full"
      >
        {waiverCompleted ? "View/Edit Waiver" : "Complete Liability Waiver"}
      </Button>

      {/* Book button - disabled until waiver is completed */}
      <Button 
        onClick={handleBooking} 
        className="w-full"
        disabled={!waiverCompleted || !formIsValid}
      >
        Request Demo
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
