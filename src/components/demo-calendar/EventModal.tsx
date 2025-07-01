
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Clock, MapPin, Package, X } from "lucide-react";
import { DemoEvent, CategoryFilter } from "@/types/demo-calendar";
import { Button } from "@/components/ui/button";

interface EventModalProps {
  event: DemoEvent | null;
  categoryColors: CategoryFilter[];
  onClose: () => void;
  onEdit: (event: DemoEvent) => void;
  onDelete: (eventId: string) => void;
  isDeleting?: boolean;
  isAdmin: boolean;
}

// Helper function to parse date strings as local dates
const parseLocalDate = (dateStr: string) => {
  return new Date(dateStr + 'T00:00:00');
};

const EventModal = ({ 
  event, 
  categoryColors, 
  onClose, 
  onEdit, 
  onDelete, 
  isDeleting, 
  isAdmin 
}: EventModalProps) => {
  if (!event) return null;

  const categoryColor = categoryColors.find(c => c.category === event.gear_category)?.color || 'bg-gray-500';
  
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Date TBD";
    try {
      const eventDate = parseLocalDate(dateStr);
      return format(eventDate, 'MMM d, yyyy');
    } catch {
      return "Date TBD";
    }
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return "Time TBD";
    try {
      const [hours, minutes] = timeStr.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return format(date, 'h:mm a');
    } catch {
      return "Time TBD";
    }
  };

  return (
    <Dialog open={!!event} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`h-4 w-4 rounded-full ${categoryColor}`} />
            <div>
              <DialogTitle className="text-lg">{event.title}</DialogTitle>
              {event.company && (
                <p className="text-sm font-semibold text-foreground">{event.company}</p>
              )}
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{formatDate(event.event_date)} • {formatTime(event.event_time)}</span>
            </div>
            
            {event.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{event.location}</span>
              </div>
            )}
            
            {event.equipment_available && (
              <div className="flex items-start gap-2 text-sm">
                <Package className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span>{event.equipment_available}</span>
              </div>
            )}
          </div>

          {isAdmin && (
            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => onEdit(event)}
                className="flex-1"
              >
                Edit Event
              </Button>
              <Button
                variant="destructive"
                onClick={() => onDelete(event.id)}
                disabled={isDeleting}
                className="flex-1"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventModal;
