
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarHeaderProps {
  currentDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onGoToToday: () => void;
  onAddEvent: () => void;
  isAdmin: boolean;
  isLoadingRole: boolean;
}

const CalendarHeader = ({
  currentDate,
  onPreviousMonth,
  onNextMonth,
  onGoToToday,
  onAddEvent,
  isAdmin,
  isLoadingRole
}: CalendarHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={onPreviousMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onGoToToday}
            className="ml-2"
          >
            <Calendar className="h-4 w-4 mr-1" />
            Today
          </Button>
        </div>
      </div>
      {isAdmin && !isLoadingRole && (
        <Button onClick={onAddEvent} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Event
        </Button>
      )}
    </div>
  );
};

export default CalendarHeader;
