
import { format } from "date-fns";
import { Clock, MapPin, Package } from "lucide-react";
import { DemoEvent, CategoryFilter } from "@/types/demo-calendar";
import { Button } from "@/components/ui/button";

interface EventCardProps {
  event: DemoEvent;
  categoryColors: CategoryFilter[];
  onEdit: (event: DemoEvent) => void;
  onDelete: (eventId: string) => void;
  isDeleting?: boolean;
}

const EventCard = ({ event, categoryColors, onEdit, onDelete, isDeleting }: EventCardProps) => {
  const categoryColor = categoryColors.find(c => c.category === event.gear_category)?.color || 'bg-gray-500';
  
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Date TBD";
    try {
      return format(new Date(dateStr), 'MMM d, yyyy');
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
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`h-3 w-3 rounded-full ${categoryColor}`} />
          <h4 className="font-semibold text-sm">{event.title}</h4>
        </div>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(event)}
            className="h-6 px-2 text-xs"
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(event.id)}
            disabled={isDeleting}
            className="h-6 px-2 text-xs text-destructive hover:text-destructive"
          >
            {isDeleting ? "..." : "Delete"}
          </Button>
        </div>
      </div>
      
      <div className="space-y-1 text-xs text-muted-foreground">
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
    </div>
  );
};

export default EventCard;
