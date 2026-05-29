// Serviço para gerenciar favoritos localmente com MMKV
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Species } from '../types/species';
import { storageAdapter } from './storage';

const FAVORITES_KEY = '@asf_favorites';

/**
 * Busca todos os favoritos salvos
 */
export const getFavorites = async (): Promise<Species[]> => {
  try {
    const favoritesJson = await storageAdapter.getItem(FAVORITES_KEY);
    return favoritesJson ? JSON.parse(favoritesJson) : [];
  } catch (error) {
    return [];
  }
};

/**
 * Adiciona uma espécie aos favoritos
 */
export const addFavorite = async (species: Species): Promise<void> => {
  try {
    const favorites = await getFavorites();
    const exists = favorites.some((fav) => fav.id === species.id);

    if (!exists) {
      favorites.push(species);
      await storageAdapter.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Remove uma espécie dos favoritos
 */
export const removeFavorite = async (speciesId: string): Promise<void> => {
  try {
    const favorites = await getFavorites();
    const filtered = favorites.filter((fav) => fav.id !== speciesId);
    await storageAdapter.setItem(FAVORITES_KEY, JSON.stringify(filtered));
  } catch (error) {
    throw error;
  }
};

/**
 * Verifica se uma espécie está nos favoritos
 */
export const isFavorite = async (speciesId: string): Promise<boolean> => {
  try {
    const favorites = await getFavorites();
    return favorites.some((fav) => fav.id === speciesId);
  } catch (error) {
    return false;
  }
};

/**
 * Limpa todos os favoritos
 */
export const clearFavorites = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(FAVORITES_KEY);
  } catch (error) {
    throw error;
  }
};
