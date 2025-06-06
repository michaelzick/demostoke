import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/helpers';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import type { Database } from '@/types/supabase';

export const useMockData = () => {
  const { toast } = useToast();
  const [showMockData, setShowMockData] = useState(() => {
    const stored = localStorage.getItem('showMockData');
    return stored ? JSON.parse(stored) : true;
  });
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Load preference from Supabase on mount
  useEffect(() => {
    const loadPreference = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('user_preferences')
        .select()
        .eq('user_id', user.id)
        .single();

      if (error) {
        // If the error is that no rows were returned, create a new preference
        if (error.code === 'PGRST116') {
          console.log('No preference found, creating default preference');
          const { error: insertError } = await supabase
            .from('user_preferences')
            .upsert({
              user_id: user.id,
              show_mock_data: true
            }, {
              onConflict: 'user_id',
              ignoreDuplicates: false
            });
          
          if (insertError) {
            console.error('Error creating default preference:', insertError);
          }
          return;
        }
        
        console.error('Error loading mock data preference:', error);
        return;
      }

      if (data) {
        console.log('Loaded preference:', data);
        setShowMockData(data.show_mock_data);
        localStorage.setItem('showMockData', JSON.stringify(data.show_mock_data));
      }
    };

    loadPreference();
  }, [user]);

  // Update both localStorage and Supabase when preference changes
  const toggleMockData = async () => {
    try {
      const newValue = !showMockData;

      // Update local state first for immediate feedback
      setShowMockData(newValue);
      localStorage.setItem('showMockData', JSON.stringify(newValue));
      
      if (user) {
        // Set loading state in toast
        toast({
          title: "Saving preference...",
          description: newValue ? "Enabling mock data..." : "Disabling mock data..."
        });

        console.log('Saving preference:', { user_id: user.id, show_mock_data: newValue });
        const { data, error } = await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            show_mock_data: newValue
          }, {
            onConflict: 'user_id',
            ignoreDuplicates: false
          })

        if (error) {
          console.error('Error saving mock data preference:', error);
          // Log more details about the error
          if (error.details) console.error('Error details:', error.details);
          if (error.hint) console.error('Error hint:', error.hint);
          if (error.code) console.error('Error code:', error.code);
          
          // Revert local state
          setShowMockData(!newValue);
          localStorage.setItem('showMockData', JSON.stringify(!newValue));
          
          toast({
            title: "Error Saving Preference",
            description: error.message || "There was an error saving your mock data preference. Please try again.",
            variant: "destructive"
          });
          return;
        }

        // Show success toast
        toast({
          title: "Preference Saved",
          description: newValue ? "Mock data is now enabled" : "Mock data is now disabled"
        });

        // Invalidate specific queries that depend on mock data
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['map-equipment'] }),
          queryClient.invalidateQueries({ queryKey: ['equipment'] })
        ]);
      }
    } catch (error) {
      console.error('Failed to toggle mock data:', error);
      // Revert local state
      setShowMockData(!showMockData);
      localStorage.setItem('showMockData', JSON.stringify(!showMockData));
      
      toast({
        title: "Error",
        description: "Failed to update mock data preference. Please try again.",
        variant: "destructive"
      });
    }
  };

  return { showMockData, toggleMockData };
};
