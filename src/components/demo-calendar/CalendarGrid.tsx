
import { useState } from "react";
import { startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, startOfWeek, endOfWeek } from "date-fns";
import { DemoEvent, CategoryFilter } from "@/types/demo-calendar";
import CalendarHeader from "./CalendarHeader";
import CalendarDaysHeader from "./CalendarDaysHeader";
import CalendarDay from "./CalendarDay";
import TBDEventsSection from "./TBDEventsSection";
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
        console.log(`Checking event "${event.title}" (${event.event_date}) against date ${date.toISOString().split('T')[0]}: ${isSame}`);
        return isSame;
      } catch (error) {
        console.error('Error parsing event date:', event.event_date, error);
        return false;
      }
    });
    console.log(`Events for ${date.toISOString().split('T')[0]}:`, dayEvents);
    return dayEvents;
  };

  // Get events without dates (TBD events)
  const tbdEvents = filteredEvents.filter(event => !event.event_date);

  const handleEventClick = (event: DemoEvent) => {
    setSelectedEvent(event);
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
      <CalendarHeader
        currentDate={currentDate}
        onPreviousMonth={onPreviousMonth}
        onNextMonth={onNextMonth}
        onGoToToday={onGoToToday}
        onAddEvent={onAddEvent}
        isAdmin={isAdmin}
        isLoadingRole={isLoadingRole}
      />

      <CalendarDaysHeader />

      {/* Calendar Days */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day) => {
          const dayEvents = getEventsForDate(day);

          return (
            <CalendarDay
              key={day.toISOString()}
              day={day}
              currentDate={currentDate}
              dayEvents={dayEvents}
              categoryFilters={categoryFilters}
              onEditEvent={onEditEvent}
              onDeleteEvent={onDeleteEvent}
              onEventClick={handleEventClick}
              isDeleting={isDeleting}
              isAdmin={isAdmin}
            />
          );
        })}
      </div>

      <TBDEventsSection
        tbdEvents={tbdEvents}
        categoryFilters={categoryFilters}
        onEditEvent={onEditEvent}
        onDeleteEvent={onDeleteEvent}
        onEventClick={handleEventClick}
        isDeleting={isDeleting}
        isAdmin={isAdmin}
      />

      {/* Event Modal */}
      <EventModal
        event={selectedEvent}
        categoryColors={categoryFilters}
        onClose={handleCloseModal}
        onEdit={handleEditFromModal}
        onDelete={handleDeleteFromModal}
        isDeleting={isDeleting}
        isAdmin={isAdmin}
      />
    </div>
  );
};

export default CalendarGrid;
