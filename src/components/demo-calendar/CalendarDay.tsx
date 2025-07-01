
import { format, isSameMonth, isToday } from "date-fns";
import { DemoEvent, CategoryFilter } from "@/types/demo-calendar";
import EventCard from "./EventCard";
import EventTitle from "./EventTitle";
import { useIsMobile } from "@/hooks/use-mobile";

interface CalendarDayProps {
  day: Date;
  currentDate: Date;
  dayEvents: DemoEvent[];
  categoryFilters: CategoryFilter[];
  onEditEvent: (event: DemoEvent) => void;
  onDeleteEvent: (eventId: string) => void;
  onEventClick: (event: DemoEvent) => void;
  isDeleting?: boolean;
  isAdmin: boolean;
}

const CalendarDay = ({
  day,
  currentDate,
  dayEvents,
  categoryFilters,
  onEditEvent,
  onDeleteEvent,
  onEventClick,
  isDeleting,
  isAdmin
}: CalendarDayProps) => {
  const isMobile = useIsMobile();
  const isCurrentMonth = isSameMonth(day, currentDate);
  const isTodayDate = isToday(day);

  return (
    <div
      className={`${isMobile ? 'min-h-[80px]' : 'min-h-[120px]'} p-2 border-r border-b last:border-r-0 ${
        !isCurrentMonth ? 'bg-muted/30' : ''
      }`}
    >
      <div className={`text-sm font-medium mb-2 ${
        isTodayDate 
          ? 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center'
          : !isCurrentMonth
          ? 'text-muted-foreground'
          : ''
      }`}>
        {format(day, 'd')}
      </div>
      
      <div className="space-y-1">
        {dayEvents.map((event) => (
          isMobile ? (
            <EventTitle
              key={event.id}
              event={event}
              categoryColors={categoryFilters}
              onClick={() => onEventClick(event)}
            />
          ) : (
            <EventCard
              key={event.id}
              event={event}
              categoryColors={categoryFilters}
              onEdit={onEditEvent}
              onDelete={onDeleteEvent}
              isDeleting={isDeleting}
              isAdmin={isAdmin}
            />
          )
        ))}
      </div>
    </div>
  );
};

export default CalendarDay;
