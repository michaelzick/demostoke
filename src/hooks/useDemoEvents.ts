
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DemoEvent, DemoEventInput } from "@/types/demo-calendar";
import { useToast } from "@/hooks/use-toast";

export const useDemoEvents = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ['demo-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('demo_calendar')
        .select('*')
        .order('event_date', { ascending: true });

      if (error) throw error;
      return data as DemoEvent[];
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (eventData: DemoEventInput) => {
      const { data, error } = await supabase
        .from('demo_calendar')
        .insert([eventData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demo-events'] });
      toast({
        title: "Event created",
        description: "Your demo event has been successfully created.",
      });
    },
    onError: (error) => {
      console.error('Error creating event:', error);
      toast({
        title: "Error creating event",
        description: "There was a problem creating your event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ id, eventData }: { id: string; eventData: Partial<DemoEventInput> }) => {
      const { data, error } = await supabase
        .from('demo_calendar')
        .update(eventData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demo-events'] });
      toast({
        title: "Event updated",
        description: "Your demo event has been successfully updated.",
      });
    },
    onError: (error) => {
      console.error('Error updating event:', error);
      toast({
        title: "Error updating event",
        description: "There was a problem updating your event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('demo_calendar')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['demo-events'] });
      toast({
        title: "Event deleted",
        description: "Your demo event has been successfully deleted.",
      });
    },
    onError: (error) => {
      console.error('Error deleting event:', error);
      toast({
        title: "Error deleting event",
        description: "There was a problem deleting your event. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    events,
    isLoading,
    error,
    createEvent: createEventMutation.mutate,
    updateEvent: updateEventMutation.mutate,
    deleteEvent: deleteEventMutation.mutate,
    isCreating: createEventMutation.isPending,
    isUpdating: updateEventMutation.isPending,
    isDeleting: deleteEventMutation.isPending,
  };
};
