import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Building2, CalendarDays, Clock, ExternalLink, MapPin, Package, Pencil, Trash2 } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import AddEventModal from "@/components/demo-calendar/AddEventModal";
import DemoEventThumbnail from "@/components/demo-calendar/DemoEventThumbnail";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import usePageMetadata from "@/hooks/usePageMetadata";
import useScrollToTop from "@/hooks/useScrollToTop";
import { useDemoEvents } from "@/hooks/useDemoEvents";
import { useIsAdmin } from "@/hooks/useUserRole";
import { DemoEvent, DemoEventInput } from "@/types/demo-calendar";
import {
  buildDemoEventMapHref,
  formatDemoEventDate,
  formatDemoEventTime,
  getDemoEventCategoryMeta,
} from "@/utils/demoEventPresentation";
import { buildDemoEventPath, findEventBySlug } from "@/utils/eventSlug";
import {
  PUBLIC_SITE_URL,
  buildDemoEventDescription,
  buildDemoEventTitle,
} from "@/lib/seo/publicMetadata";

const buildEventStartDate = (event: DemoEvent) => {
  if (!event.event_date) return undefined;
  return event.event_time
    ? `${event.event_date}T${event.event_time}`
    : event.event_date;
};

const DemoEventPage = () => {
  useScrollToTop();

  const navigate = useNavigate();
  const { eventSlug } = useParams<{ eventSlug: string }>();
  const { events, isLoading, updateEventAsync, deleteEventAsync, isUpdating, isDeleting } = useDemoEvents();
  const { isAdmin, isLoading: isLoadingRole } = useIsAdmin();
  const [editingEvent, setEditingEvent] = useState<DemoEvent | null>(null);

  const event = useMemo(
    () => (eventSlug ? findEventBySlug(events, eventSlug) : null),
    [eventSlug, events],
  );
  const categoryMeta = getDemoEventCategoryMeta(event?.gear_category);
  const canonicalPath = event ? buildDemoEventPath(event) : eventSlug ? `/demo-events/${eventSlug}` : "";
  const canonicalUrl = canonicalPath ? `${PUBLIC_SITE_URL}${canonicalPath}` : undefined;
  const eventDescription = event
    ? buildDemoEventDescription({
        title: event.title,
        company: event.company,
        gearCategory: event.gear_category,
        eventDate: event.event_date,
        eventTime: event.event_time,
        location: event.location,
        equipmentAvailable: event.equipment_available,
      })
    : "View upcoming demo event details on DemoStoke.";

  const schema = useMemo(() => {
    if (!event || !canonicalUrl) {
      return undefined;
    }

    return [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${PUBLIC_SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Demo Calendar", item: `${PUBLIC_SITE_URL}/demo-calendar` },
          { "@type": "ListItem", position: 3, name: event.title, item: canonicalUrl },
        ],
      },
      {
        "@context": "https://schema.org",
        "@type": "Event",
        name: event.title,
        description: eventDescription,
        startDate: buildEventStartDate(event),
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        image: event.thumbnail_url || `${PUBLIC_SITE_URL}/img/demostoke-square-transparent.webp`,
        url: canonicalUrl,
        location: event.location
          ? {
              "@type": "Place",
              name: event.location,
              address: event.location,
            }
          : undefined,
        organizer: event.company
          ? {
              "@type": "Organization",
              name: event.company,
            }
          : undefined,
      },
    ];
  }, [canonicalUrl, event, eventDescription]);

  usePageMetadata({
    title: event ? buildDemoEventTitle(event.title) : "Demo Event | DemoStoke",
    description: eventDescription,
    image: event?.thumbnail_url || `${PUBLIC_SITE_URL}/img/demostoke-square-transparent.webp`,
    canonicalUrl,
    schema,
    trackingReady: Boolean(event),
  });

  const handleDelete = async () => {
    if (!event || !isAdmin) return;

    if (!window.confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      await deleteEventAsync(event.id);
      navigate("/demo-calendar");
    } catch {
      // Toast handled in hook.
    }
  };

  const handleSubmitEvent = async (eventData: DemoEventInput) => {
    if (!editingEvent) return;

    try {
      const updatedEvent = await updateEventAsync({ id: editingEvent.id, eventData });
      setEditingEvent(null);
      navigate(buildDemoEventPath(updatedEvent), { replace: true });
    } catch {
      // Toast handled in hook.
    }
  };

  if (isLoading) {
    return (
      <div className="container px-4 py-8 md:px-6">
        <Skeleton className="mb-4 h-5 w-64" />
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <Skeleton className="aspect-[16/9] w-full rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container px-4 py-8 md:px-6">
        <Breadcrumbs
          items={[
            { label: "Home", path: "/" },
            { label: "Demo Calendar", path: "/demo-calendar" },
            { label: "Event Not Found", path: "/demo-calendar" },
          ]}
        />
        <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold">Demo event not found</h1>
          <p className="mt-3 text-muted-foreground">
            This event may have been removed or the URL may be outdated.
          </p>
          <Button asChild className="mt-6">
            <Link to="/demo-calendar">
              <ArrowLeft className="h-4 w-4" />
              Back to Demo Calendar
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 md:px-6">
      <Breadcrumbs
        items={[
          { label: "Home", path: "/" },
          { label: "Demo Calendar", path: "/demo-calendar" },
          { label: event.title, path: canonicalPath },
        ]}
        lastItemClassName="max-w-[220px] truncate sm:max-w-none"
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="outline">
          <Link to="/demo-calendar">
            <ArrowLeft className="h-4 w-4" />
            Back to Demo Calendar
          </Link>
        </Button>
        {event.source_primary_url && (
          <Button asChild variant="outline">
            <a href={event.source_primary_url} target="_blank" rel="noopener noreferrer">
              Event Website
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="aspect-[16/9] overflow-hidden rounded-2xl">
          <DemoEventThumbnail event={event} imageClassName="rounded-2xl" />
        </div>

        <div className="space-y-6">
          <div>
            <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${categoryMeta.colorClass} ${categoryMeta.placeholderTextClass}`}>
              {categoryMeta.name}
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{event.title}</h1>
            <p className="mt-3 text-base text-muted-foreground">{eventDescription}</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Event Details</CardTitle>
              <CardDescription>Everything you need before heading to the demo day.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Building2 className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Host</div>
                  <div className="text-muted-foreground">{event.company}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CalendarDays className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Date</div>
                  <div className="text-muted-foreground">{formatDemoEventDate(event.event_date)}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Time</div>
                  <div className="text-muted-foreground">{formatDemoEventTime(event.event_time)}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Location</div>
                  {event.location ? (
                    <a
                      href={buildDemoEventMapHref(event.location)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground underline underline-offset-2 hover:text-foreground"
                    >
                      {event.location}
                    </a>
                  ) : (
                    <div className="text-muted-foreground">Location TBD</div>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Package className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Gear & Notes</div>
                  <div className="whitespace-pre-line text-muted-foreground">
                    {event.equipment_available || "Details coming soon."}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {isAdmin && !isLoadingRole && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Admin Actions</CardTitle>
                <CardDescription>Manage this event directly from its public page.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => setEditingEvent(event)}>
                  <Pencil className="h-4 w-4" />
                  Edit Event
                </Button>
                <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                  <Trash2 className="h-4 w-4" />
                  {isDeleting ? "Deleting..." : "Delete Event"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <AddEventModal
        open={!!editingEvent}
        onClose={() => setEditingEvent(null)}
        onSubmit={handleSubmitEvent}
        editEvent={editingEvent}
        isSubmitting={isUpdating}
      />
    </div>
  );
};

export default DemoEventPage;
