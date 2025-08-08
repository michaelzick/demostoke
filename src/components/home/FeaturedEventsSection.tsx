import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";
import { useDemoEvents } from "@/hooks/useDemoEvents";
import { generateEventSlug } from "@/utils/eventSlug";

const FeaturedEventsSection = () => {
  const { events } = useDemoEvents();

  const featured = useMemo(() => {
    return events
      .filter((e) => e.is_featured)
      .slice(0, 3);
  }, [events]);

  if (!featured || featured.length === 0) return null;

  return (
    <section className="py-10 bg-white dark:bg-muted/20">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-bold mb-6">Featured Demo Events</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {featured.map((ev) => {
                const href = `/event/${generateEventSlug(ev)}`;
                const thumb = ev.thumbnail_url || "/placeholder.svg";
                return (
                  <Link key={ev.id} to={href} className="group block">
                    <div className="aspect-square overflow-hidden rounded-lg mb-2">
                      <img
                        src={thumb}
                        alt={`${ev.title} demo event thumbnail`}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="text-sm font-medium leading-tight group-hover:text-primary transition-colors">
                      {ev.title}
                    </h3>
                  </Link>
                );
              })}
              <Link to={`/demo-calendar`}>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white/60 dark:bg-zinc-900/50 border-border hover:bg-muted/40 transition-colors"
                >
                  View Calendar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedEventsSection;
