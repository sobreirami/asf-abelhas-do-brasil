// Serviço de Storage - AsyncStorage (compatível com Expo Go)
import AsyncStorage from '@react-native-async-storage/async-storage';

export const storageAdapter = {
  /**
   * Salva um item no storage
   */
  setItem: async (key: string, value: string): Promise<void> => {
    await AsyncStorage.setItem(key, value);
  },

  /**
   * Recupera um item do storage
   */
  getItem: async (key: string): Promise<string | null> => {
    return await AsyncStorage.getItem(key);
  },

  /**
   * Remove um item do storage
   */
  removeItem: async (key: string): Promise<void> => {
    await AsyncStorage.removeItem(key);
  },

  /**
   * Remove múltiplos itens do storage
   */
  multiRemove: async (keys: string[]): Promise<void> => {
    await AsyncStorage.multiRemove(keys);
  },

  /**
   * Limpa todo o storage
   */
  clear: async (): Promise<void> => {
    await AsyncStorage.clear();
  },
};
