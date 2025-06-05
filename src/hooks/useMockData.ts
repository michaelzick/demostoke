import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/helpers';
import { useToast } from '@/hooks/use-toast';

export const useMockData = () => {
  const { toast } = useToast();
  const [showMockData, setShowMockData] = useState(() => {
    const stored = localStorage.getItem('showMockData');
    return stored ? JSON.parse(stored) : true;
  });
  const { user } = useAuth();

  // Load preference from Supabase on mount
  useEffect(() => {
    const loadPreference = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('user_preferences')
        .select('show_mock_data')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error loading mock data preference:', error);
        return;
      }

      if (data) {
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

        const { error } = await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            show_mock_data: newValue
          }, {
            onConflict: 'user_id'
          });

        if (error) {
          console.error('Error saving mock data preference:', error);
          // Revert local state
          setShowMockData(!newValue);
          localStorage.setItem('showMockData', JSON.stringify(!newValue));
          
          toast({
            title: "Error Saving Preference",
            description: "There was an error saving your mock data preference. Please try again.",
            variant: "destructive"
          });
          return;
        }

        // Show success toast
        toast({
          title: "Preference Saved",
          description: newValue ? "Mock data is now enabled" : "Mock data is now disabled"
        });
      }

      // Reload the page to refresh data after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
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
