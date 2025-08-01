import React from "react";
import { Equipment } from "@/types";
import { AddOn } from "@/lib/addOns";

interface PriceSummaryProps {
  equipment: Equipment;
  selectedAddOns: AddOn[];
  numDays: number;
  totalPrice: number;
}

const PriceSummary = ({ equipment, selectedAddOns, numDays, totalPrice }: PriceSummaryProps) => {
  const formatCurrency = (amount: number): string => {
    return parseFloat(amount.toFixed(2)).toFixed(2);
  };

  // Service fee is 10% of one day's total price (equipment + add-ons)
  const serviceFee = totalPrice * 0.1;
  const subtotal = totalPrice * numDays;
  const finalTotal = subtotal + serviceFee;

  return (
    <div className="space-y-2 pt-2">
      <div className="p-3 bg-muted/50 rounded-md">
        <div className="font-medium mb-2">Price Summary:</div>
        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span>{equipment.name}</span>
            <span>${formatCurrency(equipment.price_per_day)} x {numDays} days = ${formatCurrency(equipment.price_per_day * numDays)}</span>
          </div>
          {selectedAddOns.map((addOn) => (
            <div key={addOn.name} className="flex justify-between">
              <span>{addOn.name}</span>
              <span>${formatCurrency(addOn.price_per_day)} x {numDays} days = ${formatCurrency(addOn.price_per_day * numDays)}</span>
            </div>
          ))}
          <div className="flex justify-between">
            <span>Service fee</span>
            <span>${formatCurrency(serviceFee)}</span>
          </div>
          <div className="border-t pt-2 mt-2 font-medium flex justify-between">
            <span>Total</span>
            <span>${formatCurrency(finalTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceSummary;
