import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Pokemon } from '@/lib/types';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { toast } from 'react-toastify';

const supabase = createClientComponentClient();

export function useFavorites(user: SupabaseUser | null, pokemons: Pokemon[]) {
  const [favorites, setFavorites] = useState<Pokemon[]>([]);

  useEffect(() => {
    if (user) {
      fetchFavorites(user.id);
    } else {
      setFavorites([]);
    }
  }, [user, pokemons]);

  useEffect(() => {
    if (!user) return;
    const favoritesSubscription = supabase
      .channel('favorites')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'favorites' }, payload => {
        fetchFavorites(user.id);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(favoritesSubscription);
    };
  }, [user]);

  const fetchFavorites = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('pokemon_number')
        .eq('user_id', userId);

      if (error) throw error;

      const favoriteNumbers = data.map(fav => fav.pokemon_number);
      const favoritePokemon = pokemons.filter(pokemon => favoriteNumbers.includes(pokemon.number));
      setFavorites(favoritePokemon);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast.error('Error fetching favorites');
    }
  };

  const addFavorite = async (pokemon: Pokemon) => {
    if (!user) {
      toast.error('User not logged in');
      return;
    }

    if (favorites.length >= 10) {
      toast.error('Maximum number of favorites reached');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('favorites')
        .insert({ user_id: user.id, pokemon_number: pokemon.number })
        .select();

      if (error) throw error;

      await fetchFavorites(user.id);
      toast.success('Favorite added successfully');
    } catch (error) {
      console.error('Error adding favorite:', error);
      toast.error('Error adding favorite');
    }
  };

  const removeFavorite = async (pokemon: Pokemon) => {
    if (!user) {
      toast.error('User not logged in');
      return;
    }

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('pokemon_number', pokemon.number);

      if (error) throw error;

      await fetchFavorites(user.id);
      toast.success('Favorite removed successfully');
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Error removing favorite');
    }
  };

  return { favorites, addFavorite, removeFavorite };
}
