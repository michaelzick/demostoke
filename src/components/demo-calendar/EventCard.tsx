
import { DemoEvent, CategoryFilter } from "@/types/demo-calendar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useDemoEvents } from "@/hooks/useDemoEvents";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2 } from "lucide-react";

interface EventCardProps {
  event: DemoEvent;
  categoryColors: CategoryFilter[];
  onEdit: (event: DemoEvent) => void;
  onDelete: (eventId: string) => void;
  onEventClick: (event: DemoEvent) => void;
  isDeleting?: boolean;
  isAdmin: boolean;
}

const EventCard = ({
  event,
  categoryColors,
  onEdit,
  onDelete,
  onEventClick,
  isDeleting,
  isAdmin
}: EventCardProps) => {
  const categoryFilter = categoryColors.find(c => c.category === event.gear_category);
  const colorClass = categoryFilter?.color || 'bg-gray-500';

  // Map background colors to their corresponding text colors
  const getTextColor = (bgColor: string) => {
    switch (bgColor) {
      case 'bg-rose-500':
        return 'text-rose-500';
      case 'bg-fuchsia-500':
        return 'text-fuchsia-500';
      case 'bg-sky-500':
        return 'text-sky-500';
      case 'bg-orange-400':
        return 'text-orange-400';
      default:
        return 'text-gray-500';
    }
  };

  const textColorClass = getTextColor(colorClass);
  const { events, updateEvent } = useDemoEvents();
  const { toast } = useToast();
  const featuredCount = (events || []).filter((e) => e.is_featured).length;
  const disableFeature = featuredCount >= 5 && !event.is_featured;

  return (
    <div className="bg-card rounded-lg p-3 shadow-sm border hover:shadow-md transition-shadow">
      <div className="mb-2">
        <h4
          className={`font-semibold text-sm cursor-pointer hover:underline truncate ${textColorClass}`}
          onClick={() => onEventClick(event)}
          title={event.title}
        >
          {event.title}
        </h4>
        {event.company && (
          <p className="text-sm font-semibold text-foreground truncate" title={event.company}>
            {event.company}
          </p>
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
