
import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO, startOfWeek, endOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoEvent, CategoryFilter } from "@/types/demo-calendar";
import EventCard from "./EventCard";
import EventTitle from "./EventTitle";
import EventModal from "./EventModal";
import { useIsMobile } from "@/hooks/use-mobile";

interface CalendarGridProps {
  currentDate: Date;
  events: DemoEvent[];
  categoryFilters: CategoryFilter[];
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onGoToToday: () => void;
  onAddEvent: () => void;
  onEditEvent: (event: DemoEvent) => void;
  onDeleteEvent: (eventId: string) => void;
  isDeleting?: boolean;
  isAdmin: boolean;
  isLoadingRole: boolean;
}

// Helper function to parse date strings as local dates
const parseLocalDate = (dateStr: string) => {
  // Parse date as local by appending 'T00:00:00' to force local timezone interpretation
  return new Date(dateStr + 'T00:00:00');
};

const CalendarGrid = ({
  currentDate,
  events,
  categoryFilters,
  onPreviousMonth,
  onNextMonth,
  onGoToToday,
  onAddEvent,
  onEditEvent,
  onDeleteEvent,
  isDeleting,
  isAdmin,
  isLoadingRole
}: CalendarGridProps) => {
  const isMobile = useIsMobile();
  const [selectedEvent, setSelectedEvent] = useState<DemoEvent | null>(null);

  console.log('CalendarGrid - Current date:', currentDate);
  console.log('CalendarGrid - All events:', events);
  console.log('CalendarGrid - Category filters:', categoryFilters);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  // Get the full calendar view - start from Sunday of the week containing the first day
  // and end on Saturday of the week containing the last day
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Filter events based on enabled categories
  const enabledCategories = categoryFilters.filter(f => f.enabled).map(f => f.category);
  const filteredEvents = events.filter(event => enabledCategories.includes(event.gear_category));

  console.log('CalendarGrid - Enabled categories:', enabledCategories);
  console.log('CalendarGrid - Filtered events:', filteredEvents);

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    const dayEvents = filteredEvents.filter(event => {
      if (!event.event_date) return false;
      try {
        // Parse the date as a local date to avoid timezone issues
        const eventDate = parseLocalDate(event.event_date);
        const isSame = isSameDay(eventDate, date);
        console.log(`Checking event "${event.title}" (${event.event_date}) against date ${format(date, 'yyyy-MM-dd')}: ${isSame}`);
        return isSame;
      } catch (error) {
        console.error('Error parsing event date:', event.event_date, error);
        return false;
      }
    });
    console.log(`Events for ${format(date, 'yyyy-MM-dd')}:`, dayEvents);
    return dayEvents;
  };

  // Get events without dates (TBD events)
  const tbdEvents = filteredEvents.filter(event => !event.event_date);

  const handleEventClick = (event: DemoEvent) => {
    if (isMobile) {
      setSelectedEvent(event);
    }
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  const handleEditFromModal = (event: DemoEvent) => {
    setSelectedEvent(null);
    onEditEvent(event);
  };

  const handleDeleteFromModal = (eventId: string) => {
    setSelectedEvent(null);
    onDeleteEvent(eventId);
  };

  return (
    <div className="bg-card rounded-lg shadow-sm border">
      {/* Calendar Header */}
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

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 border-b">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground border-r last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, index) => {
          const dayEvents = getEventsForDate(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isTodayDate = isToday(day);

          return (
            <div
              key={day.toISOString()}
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
                      onClick={() => handleEventClick(event)}
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
        })}
      </div>

      {/* TBD Events Section */}
      {tbdEvents.length > 0 && (
        <div className="p-4 border-t bg-muted/20">
          <h3 className="font-semibold text-sm mb-3">Events with Date TBD</h3>
          <div className="grid gap-2">
            {tbdEvents.map((event) => (
              isMobile ? (
                <EventTitle
                  key={event.id}
                  event={event}
                  categoryColors={categoryFilters}
                  onClick={() => handleEventClick(event)}
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
      )}

      {/* Event Modal for Mobile */}
      {isMobile && (
        <EventModal
          event={selectedEvent}
          categoryColors={categoryFilters}
          onClose={handleCloseModal}
          onEdit={handleEditFromModal}
          onDelete={handleDeleteFromModal}
          isDeleting={isDeleting}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
};

export default CalendarGrid;
