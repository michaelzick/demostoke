import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";
import { useDemoEvents } from "@/hooks/useDemoEvents";
import { generateEventSlug } from "@/utils/eventSlug";
import { format } from "date-fns";
import { HorizontalScrollSection } from "./HorizontalScrollSection";

const FeaturedEventsSection = () => {
  const { events } = useDemoEvents();

  const featured = useMemo(() => {
    return events
      .filter((e) => e.is_featured)
      .slice(0, 5);
  }, [events]);

  if (!featured || featured.length === 0) return null;

  return (
    <>
      <HorizontalScrollSection
        title="Featured Demo Events"
        items={featured}
        sectionClassName="pt-10 pb-5 bg-white dark:bg-muted/50"
        desktopCols={{ md: 3, lg: 5 }}
        renderItem={(ev) => {
          const href = `/event/${generateEventSlug(ev)}`;
          const thumb = ev.thumbnail_url || "/placeholder.svg";

          return (
            <Link 
              key={ev.id} 
              to={href} 
              className="group block snap-start w-[208px] min-w-[208px] shrink-0 md:w-full md:min-w-0"
            >
              <div className="aspect-square overflow-hidden rounded-lg mb-2">
                <img
                  src={thumb}
                  alt={`${ev.title} demo event thumbnail`}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h3 className="text-sm font-medium leading-tight group-hover:text-primary transition-colors line-clamp-1 text-left">
                {ev.title}
              </h3>
              {(ev.event_date || ev.event_time) && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1 text-left">
                  {[
                    ev.event_date ? format(new Date(ev.event_date + 'T00:00:00'), 'MMM d, yyyy') : '',
                    ev.event_time ? format(new Date(`1970-01-01T${ev.event_time}`), 'h:mm a') : ''
                  ].filter(Boolean).join(' • ')}
                </p>
              )}
            </Link>
          );
        }}
      />

      {/* View All Events button */}
      <div className="bg-white dark:bg-muted/50 pb-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/demo-calendar">
            <Button
              size="lg"
              variant="outline"
              className="bg-white/20 dark:bg-zinc-900/50 dark:border-white border-zinc-600 dark:hover:bg-white/30 dark:hover:bg-zinc-500/40 transition-colors"
            >
              View All Events
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default FeaturedEventsSection;
