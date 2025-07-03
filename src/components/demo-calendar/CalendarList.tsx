import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { DemoEvent, CategoryFilter } from "@/types/demo-calendar";
import CalendarHeader from "./CalendarHeader";
import TBDEventsSection from "./TBDEventsSection";
import EventModal from "./EventModal";
import EventListItem from "./EventListItem";

interface CalendarListProps {
  currentDate: Date;
  events: DemoEvent[];
  categoryFilters: CategoryFilter[];
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onGoToToday: () => void;
  onAddEvent: () => void;
  viewMode: 'calendar' | 'list';
  onChangeView: (mode: 'calendar' | 'list') => void;
  onEditEvent: (event: DemoEvent) => void;
  onDeleteEvent: (eventId: string) => void;
  isDeleting?: boolean;
  isAdmin: boolean;
  isLoadingRole: boolean;
}

const parseLocalDate = (dateStr: string) => {
  return new Date(dateStr + 'T00:00:00');
};

const CalendarList = ({
  currentDate,
  events,
  categoryFilters,
  onPreviousMonth,
  onNextMonth,
  onGoToToday,
  onAddEvent,
  viewMode,
  onChangeView,
  onEditEvent,
  onDeleteEvent,
  isDeleting,
  isAdmin,
  isLoadingRole
}: CalendarListProps) => {
  const [selectedEvent, setSelectedEvent] = useState<DemoEvent | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  const enabledCategories = categoryFilters.filter(f => f.enabled).map(f => f.category);
  const filteredEvents = events.filter(event => enabledCategories.includes(event.gear_category));

  const eventsInMonth = filteredEvents.filter(event => {
    if (!event.event_date) return false;
    const eventDate = parseLocalDate(event.event_date);
    return eventDate >= monthStart && eventDate <= monthEnd;
  });

  const tbdEvents = filteredEvents.filter(event => !event.event_date);

  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const eventsByDay = daysInMonth.map(day => {
    const dayEvents = eventsInMonth.filter(event => {
      if (!event.event_date) return false;
      const eventDate = parseLocalDate(event.event_date);
      return isSameDay(eventDate, day);
    });
    return { day, events: dayEvents };
  }).filter(group => group.events.length > 0);

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
        viewMode={viewMode}
        onChangeView={onChangeView}
        isAdmin={isAdmin}
        isLoadingRole={isLoadingRole}
      />

      <div className="p-4 space-y-4">
        {eventsByDay.map(({ day, events }) => (
          <div key={day.toISOString()} className="border rounded-lg overflow-hidden">
            <div className="bg-muted px-3 py-2 text-sm font-semibold">
              {format(day, 'EEE, MMM d')}
            </div>
            <div className="px-3 divide-y">
              {events.map(event => (
                <EventListItem
                  key={event.id}
                  event={event}
                  categoryColors={categoryFilters}
                  onEdit={onEditEvent}
                  onDelete={onDeleteEvent}
                  onEventClick={handleEventClick}
                  isDeleting={isDeleting}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          </div>
        ))}
        {eventsByDay.length === 0 && (
          <p className="text-sm text-muted-foreground">No events this month.</p>
        )}
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

export default CalendarList;
