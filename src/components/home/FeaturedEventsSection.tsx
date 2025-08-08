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
    <section className="py-10 bg-white dark:bg-muted/50">
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
                  size="lg"
                  variant="outline"
                  className="bg-white/20 dark:bg-zinc-900/50 border-white dark:border-zinc-600 hover:bg-white/30 hover:text-white dark:hover:bg-zinc-500/40 transition-colors"
                >
                  View All Events
                </Button>
              </Link>
            </div>
            </div>
          <div className="flex justify-end mt-12 md:mt-0">
            <div className="relative">
              <div className="absolute -top-6 -left-6 bg-white/10 dark:bg-white/20 rounded-full w-40 h-40 animate-float homepage-float-1"></div>
              <div className="absolute -bottom-4 -right-4 bg-white/10 dark:bg-white/20 rounded-full w-24 h-24 animate-float"></div>
              <img
                src="https://today.usc.edu/wp-content/uploads/2023/03/skiteam_web-768x432.jpg"
                alt="Person on surfboard"
                loading="lazy"
                className="rounded-lg relative z-10 max-h-80 object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedEventsSection;
