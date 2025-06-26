
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useMapboxToken = () => {
  const [token, setToken] = useState<string | null>(null);
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [isLoadingToken, setIsLoadingToken] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadToken = async () => {
      console.log('🔄 Starting token loading process...');
      setIsLoadingToken(true);

      // First, check localStorage for a valid token
      const localToken = localStorage.getItem('mapbox_token');
      if (localToken && localToken.startsWith('pk.')) {
        console.log('✅ Valid token found in localStorage');
        setToken(localToken);
        setIsLoadingToken(false);
        return;
      }

      // If no valid local token, try to fetch from Supabase
      console.log('🌐 Fetching token from Supabase Edge Function...');
      try {
        console.log('📡 Calling get-mapbox-token function...');
        
        const { data, error } = await supabase.functions.invoke('get-mapbox-token', {
          method: 'GET'
        });
        
        console.log('📡 Function response received');
        console.log('📊 Response data:', data);
        console.log('❌ Response error:', error);
        
        if (error) {
          console.error('❌ Error from Edge Function:', error);
          throw error;
        }

        if (data && data.token && data.token.startsWith('pk.')) {
          console.log('✅ Valid token received from Supabase');
          setToken(data.token);
          localStorage.setItem('mapbox_token', data.token);
          setIsLoadingToken(false);
          return;
        } else {
          console.error('❌ Invalid or missing token in response');
          throw new Error('Invalid token received');
        }
      } catch (err) {
        console.error('❌ Exception while fetching token from Supabase:', err);
        
        // Fallback to environment variable
        console.log('🔄 Trying fallback to environment variable...');
        const envToken = import.meta.env.VITE_MAPBOX_TOKEN;
        
        if (envToken && envToken.startsWith('pk.')) {
          console.log('✅ Valid token found in environment variable');
          setToken(envToken);
          localStorage.setItem('mapbox_token', envToken);
          setIsLoadingToken(false);
          return;
        } else {
          console.error('❌ No valid token found in environment variable either');
          console.log('📝 Showing token input form');
          setShowTokenInput(true);
          setIsLoadingToken(false);
        }
      }
    };

    loadToken();
  }, []);

  const handleTokenSubmit = (tokenInput: string) => {
    console.log('📝 Token submitted by user');
    if (!tokenInput || !tokenInput.startsWith('pk.')) {
      toast({
        title: "Invalid Token",
        description: "Please enter a valid Mapbox token starting with 'pk.'",
        variant: "destructive"
      });
      return;
    }
    
    localStorage.setItem('mapbox_token', tokenInput);
    setToken(tokenInput);
    setShowTokenInput(false);
    toast({
      title: "Token Applied",
      description: "Your Mapbox token has been saved. The map will now load.",
    });
  };

  const handleTokenError = () => {
    toast({
      title: "Invalid Mapbox Token",
      description: "The provided Mapbox token is invalid or expired. Please enter a new token.",
      variant: "destructive"
    });
    setShowTokenInput(true);
    localStorage.removeItem('mapbox_token');
    setToken(null);
  };

  return {
    token,
    showTokenInput,
    isLoadingToken,
    handleTokenSubmit,
    handleTokenError
  };
};
