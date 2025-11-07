import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { DemoEvent, CategoryFilter } from "@/types/demo-calendar";
import { calculateDistance, isValidCoordinate } from "@/utils/distanceCalculation";
import CalendarHeader from "./CalendarHeader";
import TBDEventsSection from "./TBDEventsSection";
import EventListItem from "./EventListItem";

interface CalendarListProps {
  currentDate: Date;
  events: DemoEvent[];
  categoryFilters: CategoryFilter[];
  proximityRadius: number | null;
  userLatitude: number | null;
  userLongitude: number | null;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onGoToToday: () => void;
  onAddEvent: () => void;
  viewMode: 'calendar' | 'list';
  onChangeView: (mode: 'calendar' | 'list') => void;
  onEditEvent: (event: DemoEvent) => void;
  onDeleteEvent: (eventId: string) => void;
  onEventClick: (event: DemoEvent) => void;
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
  proximityRadius,
  userLatitude,
  userLongitude,
  onPreviousMonth,
  onNextMonth,
  onGoToToday,
  onAddEvent,
  viewMode,
  onChangeView,
  onEditEvent,
  onDeleteEvent,
  onEventClick,
  isDeleting,
  isAdmin,
  isLoadingRole
}: CalendarListProps) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  const enabledCategories = categoryFilters.filter(f => f.enabled).map(f => f.category);
  let filteredEvents = events.filter(event => enabledCategories.includes(event.gear_category));

  // Apply proximity filter if active
  if (proximityRadius !== null && userLatitude && userLongitude) {
    filteredEvents = filteredEvents.filter(event => {
      if (!isValidCoordinate(event.location_lat, event.location_lng)) return false;
      const distance = calculateDistance(
        userLatitude,
        userLongitude,
        event.location_lat!,
        event.location_lng!
      );
      return distance <= proximityRadius;
    });
  }

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
                  onEventClick={onEventClick}
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
        onEventClick={onEventClick}
        isDeleting={isDeleting}
        isAdmin={isAdmin}
      />
    </div>
  );
};

export default CalendarList;
