
import { DemoEvent, CategoryFilter } from "@/types/demo-calendar";

interface EventTitleProps {
  event: DemoEvent;
  categoryColors: CategoryFilter[];
  onClick: () => void;
}

const EventTitle = ({ event, categoryColors, onClick }: EventTitleProps) => {
  const categoryFilter = categoryColors.find(c => c.category === event.gear_category);
  const colorClass = categoryFilter?.color || 'bg-gray-500';
  
  // Convert bg-color to text-color for better readability
  const textColorClass = colorClass.replace('bg-', 'text-').replace('-500', '-600').replace('-400', '-500');

  return (
    <button
      onClick={onClick}
      className={`text-xs ${textColorClass} hover:underline text-left w-full truncate font-medium`}
      title={event.title}
    >
      {event.title}
    </button>
  );
};

export default EventTitle;
