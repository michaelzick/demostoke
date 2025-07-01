
import { DemoEvent, CategoryFilter } from "@/types/demo-calendar";

interface EventTitleProps {
  event: DemoEvent;
  categoryColors: CategoryFilter[];
  onClick: () => void;
}

const EventTitle = ({ event, categoryColors, onClick }: EventTitleProps) => {
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
