
import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { CalendarIcon } from "lucide-react";

interface DateRangeSelectorProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
}

const DateRangeSelector = ({ dateRange, onDateRangeChange }: DateRangeSelectorProps) => {
  const handleQuickSelect = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    onDateRangeChange({ from: start, to: end });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-6">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full sm:w-auto justify-start text-left font-normal">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} -{" "}
                  {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Select date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={onDateRangeChange}
            numberOfMonths={2}
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleQuickSelect(1)}
        >
          Last 24 hours
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleQuickSelect(7)}
        >
          Last 7 days
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleQuickSelect(30)}
        >
          Last 30 days
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleQuickSelect(90)}
        >
          Last 90 days
        </Button>
      </div>
    </div>
  );
};

export default DateRangeSelector;
