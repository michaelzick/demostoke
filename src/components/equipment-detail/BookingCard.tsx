import React, { useEffect, useState } from "react";
import { Equipment } from "@/types";
import { toast } from "@/hooks/use-toast";
import { AddOn, calculateTotalPrice, getAddOnsForCategory } from "@/lib/addOns";
import PriceDisplay from "./PriceDisplay";
import DateSelection from "./DateSelection";
import AddOnSelection from "./AddOnSelection";
import PriceSummary from "./PriceSummary";
import BookingActions from "./BookingActions";
import { buildGearDisplayName } from "@/utils/gearUrl";
import { useSearchParams } from "react-router-dom";

interface BookingCardProps {
  equipment: Equipment;
  waiverCompleted?: boolean;
  onWaiverClick?: () => void;
}

const parseQueryDate = (value: string | null): Date | undefined => {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const toDateParam = (value?: Date): string | null => {
  if (!value) return null;
  return value.toISOString().slice(0, 10);
};

const BookingCard = ({ equipment, waiverCompleted = false, onWaiverClick }: BookingCardProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStartDate =
    parseQueryDate(searchParams.get("start")) ||
    parseQueryDate(searchParams.get("startDate")) ||
    parseQueryDate(searchParams.get("from")) ||
    parseQueryDate(searchParams.get("checkin"));
  const initialEndDate =
    parseQueryDate(searchParams.get("end")) ||
    parseQueryDate(searchParams.get("endDate")) ||
    parseQueryDate(searchParams.get("to")) ||
    parseQueryDate(searchParams.get("checkout"));

  const [startDate, setStartDate] = useState<Date | undefined>(initialStartDate);
  const [endDate, setEndDate] = useState<Date | undefined>(initialEndDate);
  const [numDays, setNumDays] = useState(1);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  // Add-ons state
  const addOns = getAddOnsForCategory(equipment.category);
  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>([...addOns]);
  const totalPrice = calculateTotalPrice(equipment.price_per_day, selectedAddOns);

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams);
    const startValue = toDateParam(startDate);
    const endValue = toDateParam(endDate);

    if (startValue) {
      nextParams.set("start", startValue);
    } else {
      nextParams.delete("start");
    }

    if (endValue) {
      nextParams.set("end", endValue);
    } else {
      nextParams.delete("end");
    }

    // Normalize onto start/end for a single source of truth.
    nextParams.delete("startDate");
    nextParams.delete("endDate");
    nextParams.delete("from");
    nextParams.delete("to");
    nextParams.delete("checkin");
    nextParams.delete("checkout");

    if (nextParams.toString() !== searchParams.toString()) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [startDate, endDate, searchParams, setSearchParams]);

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
        trackingProperties={{
          gear_id: equipment.id,
          gear_name: buildGearDisplayName(
            equipment.name,
            equipment.specifications?.size,
          ),
          gear_category: equipment.category,
          owner_id: equipment.owner.id,
          owner_name: equipment.owner.name,
        }}
      />
    </div>
  );
};

export default BookingCard;
