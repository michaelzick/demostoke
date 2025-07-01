
import { DemoEvent, CategoryFilter } from "@/types/demo-calendar";
import EventCard from "./EventCard";
import EventTitle from "./EventTitle";
import { useIsMobile } from "@/hooks/use-mobile";

interface TBDEventsSectionProps {
  tbdEvents: DemoEvent[];
  categoryFilters: CategoryFilter[];
  onEditEvent: (event: DemoEvent) => void;
  onDeleteEvent: (eventId: string) => void;
  onEventClick: (event: DemoEvent) => void;
  isDeleting?: boolean;
  isAdmin: boolean;
}

const TBDEventsSection = ({
  tbdEvents,
  categoryFilters,
  onEditEvent,
  onDeleteEvent,
  onEventClick,
  isDeleting,
  isAdmin
}: TBDEventsSectionProps) => {
  const isMobile = useIsMobile();

  if (tbdEvents.length === 0) return null;

  return (
    <div className="p-4 border-t bg-muted/20">
      <h3 className="font-semibold text-sm mb-3">Events with Date TBD</h3>
      <div className="grid gap-2">
        {tbdEvents.map((event) => (
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

export default TBDEventsSection;
