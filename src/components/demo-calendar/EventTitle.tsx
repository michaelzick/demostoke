import { Link } from "@/lib/navigation";
import { buildDemoEventPath } from "@/utils/eventSlug";
import { DemoEvent, CategoryFilter } from "@/types/demo-calendar";
import { getDemoEventCategoryMeta } from "@/utils/demoEventPresentation";

interface EventTitleProps {
  event: DemoEvent;
  categoryColors: CategoryFilter[];
}

const EventTitle = ({ event }: EventTitleProps) => {
  const categoryMeta = getDemoEventCategoryMeta(event.gear_category);

  return (
    <Link
      to={buildDemoEventPath(event)}
      className={`text-xs ${categoryMeta.textColorClass} hover:underline block text-left w-full truncate font-medium`}
      title={event.title}
    >
      {event.title}
    </Link>
  );
};

export default EventTitle;