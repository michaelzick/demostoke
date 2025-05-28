
import React from "react";
import { Button } from "@/components/ui/button";

interface BookingActionsProps {
  waiverCompleted: boolean;
  formIsValid: boolean;
  onWaiverClick: () => void;
  onBooking: () => void;
}

const BookingActions = ({ waiverCompleted, formIsValid, onWaiverClick, onBooking }: BookingActionsProps) => {
  return (
    <div className="space-y-4">
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
        onClick={onBooking} 
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

export default BookingActions;
