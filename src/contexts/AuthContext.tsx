import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storage, storageKeys } from '../services/storage';
import api from '../services/api';
import { User, LoginParams, LoginResponse, Empresa } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (params: LoginParams) => Promise<LoginResponse>;
  loginWithCode: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  setServerConfig: (config: { apiUrl: string; apiUrlLocal?: string; appName?: string }) => Promise<void>;
  getServerConfig: () => Promise<{ apiUrl: string; apiUrlLocal?: string; appName?: string } | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await storage.getItem<string>(storageKeys.TOKEN);
      const storedUser = await storage.getItem<User>(storageKeys.USER);

      if (token && storedUser) {
        // Verificar se token ainda é válido
        try {
          const decoded = decodeToken(token);
          if (decoded && decoded.exp && decoded.exp * 1000 > Date.now()) {
            setUser(storedUser);
            // Atualizar baseURL do axios
            const config = await storage.getItem<{ apiUrl: string }>(storageKeys.SERVER_CONFIG);
            if (config?.apiUrl) {
              api.defaults.baseURL = config.apiUrl;
            }
          } else {
            await logout();
          }
        } catch (error) {
          await logout();
        }
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const decodeToken = (token: string): any => {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (error) {
      return null;
    }
  };

  const login = async (params: LoginParams): Promise<LoginResponse> => {
    try {
      const response = await api.post('/login', {
        email: params.email,
        senha: params.password,
      });

      const token = response.data.token;
      const empresas: Empresa[] = response.data.empresas || [];

      await storage.setItem(storageKeys.TOKEN, token);
      
      const decoded = decodeToken(token);
      const userData: User = {
        id: decoded.id || decoded.usuarioId || decoded.userId,
        nome: decoded.name || decoded.nome || '',
        nick: decoded.nick || '',
        email: decoded.email || params.email,
        nivel: decoded.nivel || 0,
        CDEMP: decoded.CDEMP || decoded.cdEmp || '',
      };

      await storage.setItem(storageKeys.USER, userData);
      setUser(userData);

      // Buscar dados completos do usuário
      if (userData.id) {
        try {
          const userResponse = await api.get(`/usuarios/${userData.id}`);
          const fullUserData = { ...userData, ...userResponse.data };
          await storage.setItem(storageKeys.USER, fullUserData);
          setUser(fullUserData);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }

      // Definir empresa principal
      const empresaPrincipal = empresas.find((e) => e.cdemp === userData.CDEMP) || empresas[0];
      if (empresaPrincipal) {
        await storage.setItem(storageKeys.EMPRESA, empresaPrincipal);
        if (empresaPrincipal.token) {
          await storage.setItem(storageKeys.TOKEN, empresaPrincipal.token);
        }
      }

      return {
        token,
        empresas,
        decodedToken: userData,
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.erro || error.message || 'Erro ao fazer login';
      throw new Error(errorMessage);
    }
  };

  const loginWithCode = async (code: string): Promise<void> => {
    try {
      const storedUser = await storage.getItem<User>(storageKeys.USER);
      if (!storedUser?.nick) {
        throw new Error('Faça login com email e senha primeiro');
      }

      const response = await api.post('/login', {
        nick: storedUser.nick,
        codigo: code,
      });

      const token = response.data.token;
      await storage.setItem(storageKeys.TOKEN, token);
      
      const decoded = decodeToken(token);
      const userData: User = {
        ...storedUser,
        id: decoded.id || decoded.usuarioId || storedUser.id,
      };

      await storage.setItem(storageKeys.USER, userData);
      setUser(userData);
    } catch (error: any) {
      const errorMessage = error.response?.data?.erro || error.message || 'Código inválido';
      throw new Error(errorMessage);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await api.post('/logout').catch(() => {}); // Ignora erro se não conseguir fazer logout no servidor
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      await storage.clear();
      setUser(null);
    }
  };

  const setServerConfig = async (config: { apiUrl: string; apiUrlLocal?: string; appName?: string }): Promise<void> => {
    await storage.setItem(storageKeys.SERVER_CONFIG, config);
    api.defaults.baseURL = config.apiUrl;
  };

  const getServerConfig = async (): Promise<{ apiUrl: string; apiUrlLocal?: string; appName?: string } | null> => {
    return await storage.getItem(storageKeys.SERVER_CONFIG);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithCode,
        logout,
        setServerConfig,
        getServerConfig,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

