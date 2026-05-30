import { Species } from '../types/species';
import { storageAdapter } from './storage';

const FAVORITES_KEY = '@asf_favorites';

export const getFavorites = async (): Promise<Species[]> => {
  try {
    const favoritesJson = await storageAdapter.getItem(FAVORITES_KEY);
    return favoritesJson ? JSON.parse(favoritesJson) : [];
  } catch {
    return [];
  }
};

export const addFavorite = async (species: Species): Promise<void> => {
  const favorites = await getFavorites();
  const exists = favorites.some((fav) => fav.id === species.id);
  if (!exists) {
    favorites.push(species);
    await storageAdapter.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }
};

export const removeFavorite = async (speciesId: string): Promise<void> => {
  const favorites = await getFavorites();
  const filtered = favorites.filter((fav) => fav.id !== speciesId);
  await storageAdapter.setItem(FAVORITES_KEY, JSON.stringify(filtered));
};

export const isFavorite = async (speciesId: string): Promise<boolean> => {
  try {
    const favorites = await getFavorites();
    return favorites.some((fav) => fav.id === speciesId);
  } catch {
    return false;
  }
};

export const clearFavorites = async (): Promise<void> => {
  await storageAdapter.removeItem(FAVORITES_KEY);
};
