import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import {
  getLocalFavorites,
  addLocalFavorite,
  removeLocalFavorite,
  isLocalFavorite,
  mergeFavoritesArrays,
} from '@/services/localStorageFavoritesService';
import type { FavoriteItem } from '@/services/localStorageFavoritesService';

interface FavoritesContextType {
  favorites: string[];
  isLoading: boolean;
  isFavorite: (equipmentId: string) => boolean;
  toggleFavorite: (equipmentId: string) => Promise<void>;
  hasFavorites: () => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load favorites on mount and when user changes
  useEffect(() => {
    loadFavorites();
  }, [user?.id, isAuthenticated]);

  const loadFavorites = async () => {
    setIsLoading(true);
    try {
      const localFavs = getLocalFavorites();

      if (isAuthenticated && user?.id) {
        // Fetch from database
        const { data: profile } = await supabase
          .from('profiles')
          .select('favorite_equipment')
          .eq('id', user.id)
          .single();

        const dbFavorites = Array.isArray(profile?.favorite_equipment) 
          ? (profile.favorite_equipment as unknown as FavoriteItem[])
          : [];
        
        // Merge local and DB favorites
        const merged = mergeFavoritesArrays(localFavs, dbFavorites);
        const favoriteIds = merged.map(item => item.equipment_id);
        setFavorites(favoriteIds);
      } else {
        // Use local storage only
        const favoriteIds = localFavs.map(item => item.equipment_id);
        setFavorites(favoriteIds);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      // Fallback to local storage
      const localFavs = getLocalFavorites();
      setFavorites(localFavs.map(item => item.equipment_id));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async (equipmentId: string) => {
    const isFav = favorites.includes(equipmentId);

    // Optimistic update
    if (isFav) {
      setFavorites(prev => prev.filter(id => id !== equipmentId));
      removeLocalFavorite(equipmentId);
    } else {
      setFavorites(prev => [...prev, equipmentId]);
      addLocalFavorite(equipmentId);
    }

    // Sync with database if authenticated
    if (isAuthenticated && user?.id) {
      try {
        const localFavs = getLocalFavorites();
        await supabase
          .from('profiles')
          .update({ favorite_equipment: localFavs as any })
          .eq('id', user.id);
      } catch (error) {
        console.error('Error syncing favorites to database:', error);
        // Revert optimistic update on error
        if (isFav) {
          setFavorites(prev => [...prev, equipmentId]);
          addLocalFavorite(equipmentId);
        } else {
          setFavorites(prev => prev.filter(id => id !== equipmentId));
          removeLocalFavorite(equipmentId);
        }
      }
    }
  };

  const isFavorite = (equipmentId: string): boolean => {
    return favorites.includes(equipmentId);
  };

  const hasFavorites = (): boolean => {
    return favorites.length > 0;
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isLoading,
        isFavorite,
        toggleFavorite,
        hasFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
