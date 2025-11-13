import { DemoEvent, CategoryFilter } from "@/types/demo-calendar";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

interface EventListItemProps {
  event: DemoEvent;
  categoryColors: CategoryFilter[];
  onEdit: (event: DemoEvent) => void;
  onDelete: (eventId: string) => void;
  onEventClick: (event: DemoEvent) => void;
  isDeleting?: boolean;
  isAdmin: boolean;
}

const EventListItem = ({
  event,
  categoryColors,
  onEdit,
  onDelete,
  onEventClick,
  isDeleting,
  isAdmin
}: EventListItemProps) => {
  const categoryFilter = categoryColors.find(c => c.category === event.gear_category);
  const colorClass = categoryFilter?.color || 'bg-gray-500';

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

  return (
    <div className="flex items-center justify-between gap-2 py-2">
      <button
        className="flex-1 text-left"
        onClick={() => onEventClick(event)}
      >
        <p className={`font-semibold text-sm truncate hover:underline ${textColorClass}`}>{event.title}</p>
        {event.company && (
          <p className="text-sm font-semibold text-foreground truncate">{event.company}</p>
        )}
      </button>
      {isAdmin && (
        <div className="flex gap-1">
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
            {isDeleting ? '...' : <Trash2 className="h-3 w-3" />}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EventListItem;
