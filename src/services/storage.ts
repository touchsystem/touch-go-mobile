import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  SERVER_CONFIG: 'serverConfig',
  EMPRESA: 'empresa',
  TABLE: 'table',
  CART: 'cart',
};

// Verifica se o AsyncStorage está disponível
const isAsyncStorageAvailable = () => {
  try {
    return AsyncStorage !== null && AsyncStorage !== undefined;
  } catch {
    return false;
  }
};

export const storage = {
  async setItem(key: string, value: any): Promise<void> {
    try {
      if (!isAsyncStorageAvailable()) {
        throw new Error('AsyncStorage is not available');
      }
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      console.log(`[Storage] Saved ${key}:`, value);
    } catch (error) {
      console.error(`[Storage] Error saving ${key}:`, error);
      throw error; // Re-throw para que o erro seja tratado pelo chamador
    }
  },

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      const parsed = jsonValue != null ? JSON.parse(jsonValue) : null;
      console.log(`[Storage] Retrieved ${key}:`, parsed);
      return parsed;
    } catch (error) {
      console.error(`[Storage] Error reading ${key}:`, error);
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from storage:', error);
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
};

export const storageKeys = STORAGE_KEYS;

