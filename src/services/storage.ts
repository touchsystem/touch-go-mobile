import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  SERVER_CONFIG: 'serverConfig',
  EMPRESA: 'empresa',
  TABLE: 'table',
  CART: 'cart',
  LAST_USED_NICK: 'lastUsedNick',
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
      // Se for string (como token), salva diretamente sem JSON.stringify
      if (typeof value === 'string') {
        await AsyncStorage.setItem(key, value);
      } else {
        const jsonValue = JSON.stringify(value);
        await AsyncStorage.setItem(key, jsonValue);
      }
      console.log(`[Storage] Saved ${key}:`, typeof value === 'string' ? '***' : value);
    } catch (error) {
      console.error(`[Storage] Error saving ${key}:`, error);
      throw error; // Re-throw para que o erro seja tratado pelo chamador
    }
  },

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value === null) {
        return null;
      }
      
      // Para tokens, sempre retorna como string pura (sem parse JSON)
      if (key === STORAGE_KEYS.TOKEN) {
        // Remove aspas extras se houver (caso tenha sido salvo como JSON string)
        const cleanToken = value.replace(/^["']|["']$/g, '');
        console.log(`[Storage] Retrieved ${key}: ***`);
        return cleanToken as T;
      }
      
      // Para outros valores, tenta fazer parse JSON
      try {
        const parsed = JSON.parse(value);
        console.log(`[Storage] Retrieved ${key}:`, parsed);
        return parsed;
      } catch {
        // Se não for JSON válido, retorna como string
        console.log(`[Storage] Retrieved ${key} (as string):`, value);
        return value as T;
      }
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

