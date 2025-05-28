
import React, { useState } from "react";
import { Equipment } from "@/types";
import { toast } from "@/hooks/use-toast";
import { AddOn, calculateTotalPrice, getAddOnsForCategory } from "@/lib/addOns";
import PriceDisplay from "./PriceDisplay";
import DateSelection from "./DateSelection";
import AddOnSelection from "./AddOnSelection";
import PriceSummary from "./PriceSummary";
import BookingActions from "./BookingActions";

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

  // Form validation check - need both dates (convert to boolean)
  const formIsValid = Boolean(startDate && endDate);

  return (
    <div className="space-y-4">
      <PriceDisplay equipment={equipment} />

      <DateSelection
        startDate={startDate}
        endDate={endDate}
        startDateOpen={startDateOpen}
        endDateOpen={endDateOpen}
        onStartDateChange={handleStartDateChange}
        onEndDateChange={handleEndDateChange}
        onStartDateOpenChange={setStartDateOpen}
        onEndDateOpenChange={setEndDateOpen}
      />

      <AddOnSelection
        equipment={equipment}
        addOns={addOns}
        selectedAddOns={selectedAddOns}
        onAddOnToggle={handleAddOnToggle}
      />

      {/* Dynamic Price calculation */}
      {startDate && endDate && (
        <PriceSummary
          equipment={equipment}
          selectedAddOns={selectedAddOns}
          numDays={numDays}
          totalPrice={totalPrice}
        />
      )}

      <BookingActions
        waiverCompleted={waiverCompleted}
        formIsValid={formIsValid}
        onWaiverClick={onWaiverClick}
        onBooking={handleBooking}
      />
    </div>
  );
};

export default BookingCard;
