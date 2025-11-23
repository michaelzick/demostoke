import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import {
  getLocalFavorites,
  addLocalFavorite,
  removeLocalFavorite,
  mergeFavoritesArrays
} from '@/services/localStorageFavoritesService';

interface FavoriteItem {
  equipment_id: string;
  favorited_at: string;
}

export const useFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load favorites on mount
  useEffect(() => {
    const loadFavorites = async () => {
      if (user) {
        // Logged in: merge localStorage + DB
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('favorite_equipment')
            .eq('id', user.id)
            .single();

          const dbFavorites = Array.isArray(profile?.favorite_equipment) 
            ? (profile.favorite_equipment as unknown as FavoriteItem[]) 
            : [];
          const localFavorites = getLocalFavorites();
          const merged = mergeFavoritesArrays(localFavorites, dbFavorites);
          
          // Sync merged back to DB
          await supabase
            .from('profiles')
            .update({ favorite_equipment: merged as any })
            .eq('id', user.id);

          setFavorites(merged.map(f => f.equipment_id));
        } catch (error) {
          console.error('Error loading favorites:', error);
          setFavorites(getLocalFavorites().map(f => f.equipment_id));
        }
      } else {
        // Logged out: use localStorage only
        setFavorites(getLocalFavorites().map(f => f.equipment_id));
      }
      setIsLoading(false);
    };

    loadFavorites();
  }, [user]);

  const toggleFavorite = useCallback(async (equipmentId: string) => {
    const isFavorited = favorites.includes(equipmentId);

    if (isFavorited) {
      // Remove favorite
      removeLocalFavorite(equipmentId);
      setFavorites(prev => prev.filter(id => id !== equipmentId));

      if (user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('favorite_equipment')
            .eq('id', user.id)
            .single();

          const currentFavorites = Array.isArray(profile?.favorite_equipment)
            ? (profile.favorite_equipment as unknown as FavoriteItem[])
            : [];
          const updated = currentFavorites.filter(f => f.equipment_id !== equipmentId);

          await supabase
            .from('profiles')
            .update({ favorite_equipment: updated as any })
            .eq('id', user.id);
        } catch (error) {
          console.error('Error removing favorite from DB:', error);
        }
      }
    } else {
      // Add favorite
      addLocalFavorite(equipmentId);
      setFavorites(prev => [equipmentId, ...prev]);

      if (user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('favorite_equipment')
            .eq('id', user.id)
            .single();

          const currentFavorites = Array.isArray(profile?.favorite_equipment)
            ? (profile.favorite_equipment as unknown as FavoriteItem[])
            : [];
          const updated = [
            { equipment_id: equipmentId, favorited_at: new Date().toISOString() },
            ...currentFavorites
          ];

          await supabase
            .from('profiles')
            .update({ favorite_equipment: updated as any })
            .eq('id', user.id);
        } catch (error) {
          console.error('Error adding favorite to DB:', error);
        }
      }
    }
  }, [favorites, user]);

  const isFavorite = useCallback((equipmentId: string) => {
    return favorites.includes(equipmentId);
  }, [favorites]);

  const hasFavorites = favorites.length > 0;

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    hasFavorites,
    isLoading
  };
};
