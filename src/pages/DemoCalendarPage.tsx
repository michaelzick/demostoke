
import { useState, useEffect } from "react";
import usePageMetadata from "@/hooks/usePageMetadata";
import { useAuth } from "@/helpers";
import { useDemoEvents } from "@/hooks/useDemoEvents";
import { useCalendarNavigation } from "@/hooks/useCalendarNavigation";
import { useIsAdmin } from "@/hooks/useUserRole";
import { useIsMobile } from "@/hooks/use-mobile";
import { DemoEvent, DemoEventInput, CategoryFilter as CategoryFilterType } from "@/types/demo-calendar";
import CalendarGrid from "@/components/demo-calendar/CalendarGrid";
import CalendarList from "@/components/demo-calendar/CalendarList";
import CategoryFilter from "@/components/demo-calendar/CategoryFilter";
import AddEventModal from "@/components/demo-calendar/AddEventModal";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const DemoCalendarPage = () => {
  usePageMetadata({
    title: 'Demo Events Calendar | DemoStoke',
    description: 'Explore upcoming demo events and manage your own.'
  });
  const { isAuthenticated } = useAuth();
  const { isAdmin, isLoading: isLoadingRole } = useIsAdmin();
  const navigate = useNavigate();
  const { currentDate, goToPreviousMonth, goToNextMonth, goToToday } = useCalendarNavigation();
  const { events, createEvent, updateEvent, deleteEvent, isCreating, isUpdating, isDeleting } = useDemoEvents();
  const isMobile = useIsMobile();

  const [viewMode, setViewMode] = useState<'calendar' | 'list'>(isMobile ? 'list' : 'calendar');

  useEffect(() => {
    setViewMode(isMobile ? 'list' : 'calendar');
  }, [isMobile]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<DemoEvent | null>(null);

  const [categoryFilters, setCategoryFilters] = useState<CategoryFilterType[]>([
    { category: 'snowboards', name: 'Snowboards', color: 'bg-fuchsia-500', enabled: true },
    { category: 'skis', name: 'Skis', color: 'bg-green-400', enabled: true },
    { category: 'surfboards', name: 'Surfboards', color: 'bg-sky-500', enabled: true },
    { category: 'mountain-bikes', name: 'Mountain Bikes', color: 'bg-violet-400', enabled: true },
  ]);

  const handleToggleCategory = (category: string) => {
    setCategoryFilters(prev =>
      prev.map(filter =>
        filter.category === category
          ? { ...filter, enabled: !filter.enabled }
          : filter
      )
    );
  };

  const handleAddEvent = () => {
    if (!isAuthenticated) {
      navigate("/auth/signin");
      return;
    }
    if (!isAdmin) {
      return; // Only admins can add events
    }
    setIsAddModalOpen(true);
  };

  const handleEditEvent = (event: DemoEvent) => {
    if (!isAuthenticated) {
      navigate("/auth/signin");
      return;
    }
    if (!isAdmin) {
      return; // Only admins can edit events
    }
    setEditingEvent(event);
  };

  const handleSubmitEvent = (eventData: DemoEventInput) => {
    if (editingEvent) {
      updateEvent({ id: editingEvent.id, eventData });
      setEditingEvent(null);
    } else {
      createEvent(eventData);
      setIsAddModalOpen(false);
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    if (!isAdmin) {
      return; // Only admins can delete events
    }
    if (window.confirm('Are you sure you want to delete this event?')) {
      deleteEvent(eventId);
    }
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingEvent(null);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Demo Calendar</h1>
        <p className="text-muted-foreground">
          Schedule and manage demo events for outdoor gear rentals.
        </p>
      </div>

      {/* Uncomment this section if you want to show a sign-in prompt for unauthenticated users */}
      {/* {!isAuthenticated && (
        <div className="mb-8 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground mb-3">
            Sign in to add/edit demo events.
          </p>
          <Button onClick={() => navigate("/auth/signin")}>
            Sign In
          </Button>
        </div>
      )} */}

      {isAuthenticated && !isLoadingRole && !isAdmin && (
        <div className="mb-8 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            Only administrators can create and manage demo events.
          </p>
        </div>
      )}

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <CategoryFilter
            filters={categoryFilters}
            onToggle={handleToggleCategory}
          />
        </div>

        {/* Calendar / List */}
        <div className="lg:col-span-3">
          {viewMode === 'calendar' ? (
            <CalendarGrid
              currentDate={currentDate}
              events={events}
              categoryFilters={categoryFilters}
              onPreviousMonth={goToPreviousMonth}
              onNextMonth={goToNextMonth}
              onGoToToday={goToToday}
              onAddEvent={handleAddEvent}
              viewMode={viewMode}
              onChangeView={setViewMode}
              onEditEvent={handleEditEvent}
              onDeleteEvent={handleDeleteEvent}
              isDeleting={isDeleting}
              isAdmin={isAdmin}
              isLoadingRole={isLoadingRole}
            />
          ) : (
            <CalendarList
              currentDate={currentDate}
              events={events}
              categoryFilters={categoryFilters}
              onPreviousMonth={goToPreviousMonth}
              onNextMonth={goToNextMonth}
              onGoToToday={goToToday}
              onAddEvent={handleAddEvent}
              viewMode={viewMode}
              onChangeView={setViewMode}
              onEditEvent={handleEditEvent}
              onDeleteEvent={handleDeleteEvent}
              isDeleting={isDeleting}
              isAdmin={isAdmin}
              isLoadingRole={isLoadingRole}
            />
          )}
        </div>
      </div>

      {/* Add/Edit Event Modal */}
      <AddEventModal
        open={isAddModalOpen || !!editingEvent}
        onClose={handleCloseModal}
        onSubmit={handleSubmitEvent}
        editEvent={editingEvent}
        isSubmitting={isCreating || isUpdating}
      />
    </div>
  );
};

export default DemoCalendarPage;
