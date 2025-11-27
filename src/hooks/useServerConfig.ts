import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ServerConfig {
  apiUrl: string;
  apiUrlLocal?: string;
  appName?: string;
}

export const useServerConfig = () => {
  const { getServerConfig, setServerConfig: saveServerConfig } = useAuth();
  const [config, setConfig] = useState<ServerConfig>({
    apiUrl: 'http://192.168.0.234:5000',
    apiUrlLocal: '',
    appName: 'EatzGo',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const savedConfig = await getServerConfig();
      if (savedConfig) {
        setConfig(savedConfig);
      }
    } catch (error) {
      console.error('Error loading server config:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (newConfig: ServerConfig) => {
    try {
      await saveServerConfig(newConfig);
      setConfig(newConfig);
      return true;
    } catch (error) {
      console.error('Error saving server config:', error);
      return false;
    }
  };

  return {
    config,
    loading,
    updateConfig,
  };
};




