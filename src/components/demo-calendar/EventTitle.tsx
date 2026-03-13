
import { DemoEvent, CategoryFilter } from "@/types/demo-calendar";
import { getDemoEventCategoryMeta } from "@/utils/demoEventPresentation";

interface EventTitleProps {
  event: DemoEvent;
  categoryColors: CategoryFilter[];
  onClick: () => void;
}

const EventTitle = ({ event, onClick }: EventTitleProps) => {
  const categoryMeta = getDemoEventCategoryMeta(event.gear_category);

  return (
    <button
      onClick={onClick}
      className={`text-xs ${categoryMeta.textColorClass} hover:underline text-left w-full truncate font-medium`}
      title={event.title}
    >
      {event.title}
    </button>
  );
};

export default EventTitle;
