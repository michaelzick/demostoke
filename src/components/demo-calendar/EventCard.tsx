
import { DemoEvent, CategoryFilter } from "@/types/demo-calendar";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { getDemoEventCategoryMeta } from "@/utils/demoEventPresentation";

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
  onEdit,
  onDelete,
  onEventClick,
  isDeleting,
  isAdmin
}: EventCardProps) => {
  const categoryMeta = getDemoEventCategoryMeta(event.gear_category);

  return (
    <div className="bg-card rounded-lg p-3 shadow-sm border hover:shadow-md transition-shadow">
      <div className="mb-2">
        <h4
          className={`font-semibold text-sm cursor-pointer hover:underline truncate ${categoryMeta.textColorClass}`}
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
