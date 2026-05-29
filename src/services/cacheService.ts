// Serviço de Cache Offline
import { Species } from '@/types/species';
import { storageAdapter } from './storage';

const CACHE_KEYS = {
  SPECIES_LIST: '@species_cache',
  FEATURED_SPECIES: '@featured_cache',
  LAST_UPDATE: '@cache_last_update',
};

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas

/**
 * Salva lista de espécies no cache
 */
export const cacheSpeciesList = async (species: Species[]): Promise<void> => {
  try {
    await storageAdapter.setItem(CACHE_KEYS.SPECIES_LIST, JSON.stringify(species));
    await storageAdapter.setItem(CACHE_KEYS.LAST_UPDATE, Date.now().toString());
  } catch (error) {}
};

/**
 * Salva espécies em destaque no cache
 */
export const cacheFeaturedSpecies = async (species: Species[]): Promise<void> => {
  try {
    await storageAdapter.setItem(CACHE_KEYS.FEATURED_SPECIES, JSON.stringify(species));
  } catch (error) {}
};

/**
 * Recupera lista de espécies do cache (sempre retorna, mesmo expirado)
 */
export const getCachedSpeciesList = async (): Promise<Species[] | null> => {
  try {
    const cached = await storageAdapter.getItem(CACHE_KEYS.SPECIES_LIST);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    return null;
  }
};

/**
 * Recupera espécies em destaque do cache
 */
export const getCachedFeaturedSpecies = async (): Promise<Species[] | null> => {
  try {
    const cached = await storageAdapter.getItem(CACHE_KEYS.FEATURED_SPECIES);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    return null;
  }
};

/**
 * Limpa todo o cache
 */
export const clearAllCache = async (): Promise<void> => {
  try {
    await storageAdapter.multiRemove([
      CACHE_KEYS.SPECIES_LIST,
      CACHE_KEYS.FEATURED_SPECIES,
      CACHE_KEYS.LAST_UPDATE,
    ]);
  } catch (error) {}
};

/**
 * Verifica se tem cache válido
 */
export const hasFreshCache = async (): Promise<boolean> => {
  try {
    const lastUpdate = await storageAdapter.getItem(CACHE_KEYS.LAST_UPDATE);
    if (!lastUpdate) return false;

    const timeSinceUpdate = Date.now() - parseInt(lastUpdate, 10);
    return timeSinceUpdate < CACHE_DURATION;
  } catch {
    return false;
  }
};
