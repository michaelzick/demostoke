
import { format } from "date-fns";
import { Clock, MapPin, Package, Pencil, Trash2 } from "lucide-react";
import { DemoEvent, CategoryFilter } from "@/types/demo-calendar";
import { Button } from "@/components/ui/button";

interface EventCardProps {
  event: DemoEvent;
  categoryColors: CategoryFilter[];
  onEdit: (event: DemoEvent) => void;
  onDelete: (eventId: string) => void;
  isDeleting?: boolean;
  isAdmin: boolean;
}

// Helper function to parse date strings as local dates
const parseLocalDate = (dateStr: string) => {
  // Parse date as local by appending 'T00:00:00' to force local timezone interpretation
  return new Date(dateStr + 'T00:00:00');
};

const EventCard = ({ event, categoryColors, onEdit, onDelete, isDeleting, isAdmin }: EventCardProps) => {
  const categoryFilter = categoryColors.find(c => c.category === event.gear_category);
  const colorClass = categoryFilter?.color || 'bg-gray-500';

  // Map background colors to their corresponding text colors
  const getTextColor = (bgColor: string) => {
    switch (bgColor) {
      case 'bg-fuchsia-500':
        return 'text-fuchsia-500';
      case 'bg-green-400':
        return 'text-green-400';
      case 'bg-sky-500':
        return 'text-sky-500';
      case 'bg-violet-400':
        return 'text-violet-400';
      default:
        return 'text-gray-500';
    }
  };

  const textColorClass = getTextColor(colorClass);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Date TBD";
    try {
      // Parse the date as a local date to avoid timezone issues
      const eventDate = parseLocalDate(dateStr);
      return format(eventDate, 'MMM d, yyyy');
    } catch {
      return "Date TBD";
    }
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return "Time TBD";
    try {
      // Handle time format from database (HH:mm:ss)
      const [hours, minutes] = timeStr.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return format(date, 'h:mm a');
    } catch {
      return "Time TBD";
    }
  };

  return (
    <div className="bg-card rounded-lg p-3 shadow-sm border hover:shadow-md transition-shadow">
      <div className="mb-2">
        <h4 className={`font-semibold text-sm ${textColorClass}`}>{event.title}</h4>
        {event.company && (
          <p className="text-sm font-semibold text-foreground">{event.company}</p>
        )}
      </div>

      <div className="space-y-1 text-xs text-muted-foreground mb-3">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{formatDate(event.event_date)} • {formatTime(event.event_time)}</span>
        </div>

        {event.location && (
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>{event.location}</span>
          </div>
        )}

        {event.equipment_available && (
          <div className="flex items-center gap-1">
            <Package className="h-3 w-3" />
            <span>{event.equipment_available}</span>
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="flex justify-end gap-1 pt-2 border-t">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(event)}
            className="h-7 w-7 p-0"
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(event.id)}
            disabled={isDeleting}
            className="h-7 w-7 p-0 text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            {isDeleting ? "..." : <Trash2 className="h-3 w-3" />}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EventCard;
