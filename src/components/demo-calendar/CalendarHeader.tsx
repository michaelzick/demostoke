
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Calendar, LayoutList, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarHeaderProps {
  currentDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onGoToToday: () => void;
  onAddEvent: () => void;
  viewMode: 'calendar' | 'list';
  onChangeView: (mode: 'calendar' | 'list') => void;
  isAdmin: boolean;
  isLoadingRole: boolean;
}

const CalendarHeader = ({
  currentDate,
  onPreviousMonth,
  onNextMonth,
  onGoToToday,
  onAddEvent,
  viewMode,
  onChangeView,
  isAdmin,
  isLoadingRole
}: CalendarHeaderProps) => {
  return (
    <div className="flex flex-col gap-2 p-4 border-b">
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="outline"
          onClick={onGoToToday}
        >
          <Calendar className="h-4 w-4 mr-1" />
          Today
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onPreviousMonth}
          className="ml-2"
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
      </div>
      
      <h2 className="text-xl font-semibold">
        {format(currentDate, 'MMMM yyyy')}
      </h2>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            onClick={() => onChangeView('calendar')}
            aria-label="Calendar view"
          >
            <CalendarDays className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => onChangeView('list')}
            aria-label="List view"
          >
            <LayoutList className="h-4 w-4" />
          </Button>
        </div>
        {isAdmin && !isLoadingRole && (
          <Button onClick={onAddEvent} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Event
          </Button>
        )}
      </div>
    </div>
  );
};

export default CalendarHeader;
