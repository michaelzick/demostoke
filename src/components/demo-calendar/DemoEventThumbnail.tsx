import { cn } from "@/lib/utils";
import { DemoEvent } from "@/types/demo-calendar";
import { getDemoEventCategoryMeta } from "@/utils/demoEventPresentation";

interface DemoEventThumbnailProps {
  event: Pick<DemoEvent, "title" | "thumbnail_url" | "gear_category">;
  className?: string;
  imageClassName?: string;
}

const DemoEventThumbnail = ({
  event,
  className,
  imageClassName,
}: DemoEventThumbnailProps) => {
  const categoryMeta = getDemoEventCategoryMeta(event.gear_category);

  if (event.thumbnail_url) {
    return (
      <img
        src={event.thumbnail_url}
        alt={`${event.title} demo event thumbnail`}
        loading="lazy"
        className={cn("h-full w-full object-cover", imageClassName)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center",
        categoryMeta.placeholderClass,
        className,
      )}
      aria-label={`${categoryMeta.singularName} demo event placeholder`}
      role="img"
    >
      <div className={cn("px-4 text-center uppercase tracking-[0.25em]", categoryMeta.placeholderTextClass)}>
        <div className="text-[10px] font-semibold opacity-80">DemoStoke</div>
        <div className="mt-2 text-lg font-bold sm:text-xl">Demo Event</div>
      </div>
    </div>
  );
};

export default DemoEventThumbnail;
