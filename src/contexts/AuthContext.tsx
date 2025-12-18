import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import api from '../services/api';
import { setLogoutHandler } from '../services/auth-manager';
import { storage, storageKeys } from '../services/storage';
import { Empresa, LoginParams, LoginResponse, User } from '../types';
import { getDeviceId, getDeviceInfo } from '../utils/deviceId';

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
        // Verificar se token tem formato válido (JWT tem 3 partes)
        const tokenParts = token.trim().split('.');
        if (tokenParts.length !== 3) {
          // Token inválido, limpa tudo
          console.log('[AuthContext] Token inválido (formato incorreto), fazendo logout');
          await logout();
          return;
        }

        // Verificar se token ainda é válido
        try {
          const decoded = decodeToken(token);
          if (decoded && decoded.exp && decoded.exp * 1000 > Date.now()) {
            setUser(storedUser);

            // Garantir que o nick está salvo no LAST_USED_NICK para exibir no perfil
            if (storedUser.nick) {
              const lastUsedNick = await storage.getItem<string>(storageKeys.LAST_USED_NICK);
              if (!lastUsedNick) {
                await storage.setItem(storageKeys.LAST_USED_NICK, storedUser.nick);
              }
            }

            // Atualizar baseURL do axios
            const config = await storage.getItem<{ apiUrl: string }>(storageKeys.SERVER_CONFIG);
            if (config?.apiUrl) {
              api.defaults.baseURL = config.apiUrl;
            }
          } else {
            console.log('[AuthContext] Token expirado, fazendo logout');
            await logout();
          }
        } catch (error) {
          console.log('[AuthContext] Erro ao decodificar token, fazendo logout');
          await logout();
        }
      } else {
        // Sem token ou usuário, garante que está limpo
        if (token && !storedUser) {
          // Token existe mas não tem usuário, limpa token
          await storage.removeItem(storageKeys.TOKEN);
        }
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setUser(null);
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
      // Obtém informações do dispositivo
      const deviceInfo = await getDeviceInfo();
      const deviceId = deviceInfo.deviceId;

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📱 INFORMAÇÕES DO DISPOSITIVO:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`🔑 Device ID: ${deviceId}`);
      console.log(`📱 Nome: ${deviceInfo.deviceName || 'N/A'}`);
      console.log(`🏷️  Modelo: ${deviceInfo.modelName || 'N/A'}`);
      console.log(`🏭 Fabricante: ${deviceInfo.manufacturer || 'N/A'}`);
      console.log(`📲 Marca: ${deviceInfo.brand || 'N/A'}`);
      console.log(`💻 Sistema: ${deviceInfo.osName} ${deviceInfo.osVersion || ''}`);
      console.log(`📦 App Versão: ${deviceInfo.appVersion || 'N/A'}`);
      console.log(`🤖 Plataforma: ${deviceInfo.platform}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      // Envia deviceId junto com o login
      const response = await api.post('/login', {
        email: params.email,
        senha: params.password,
        deviceId: deviceId,
        deviceInfo: {
          deviceName: deviceInfo.deviceName,
          modelName: deviceInfo.modelName,
          osName: deviceInfo.osName,
          osVersion: deviceInfo.osVersion,
          platform: deviceInfo.platform,
          appVersion: deviceInfo.appVersion,
        },
      });

      const token = response.data.token;
      const empresas: Empresa[] = response.data.empresas || [];

      console.log('[AuthContext] Saving token and user data');
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

      console.log('[AuthContext] User data:', userData);
      await storage.setItem(storageKeys.USER, userData);

      // Salvar o nick do usuário logado para exibir no perfil
      if (userData.nick) {
        await storage.setItem(storageKeys.LAST_USED_NICK, userData.nick);
      }

      // Salvar o Device ID no storage
      if (deviceId) {
        await storage.setItem(storageKeys.DEVICE_ID, deviceId);
        console.log('[AuthContext] Device ID salvo no storage');
      }

      setUser(userData);

      // Buscar dados completos do usuário
      if (userData.id) {
        try {
          const userResponse = await api.get(`/usuarios/${userData.id}`);
          const fullUserData = { ...userData, ...userResponse.data };
          await storage.setItem(storageKeys.USER, fullUserData);

          // Atualizar o nick se vier nos dados completos
          if (fullUserData.nick) {
            await storage.setItem(storageKeys.LAST_USED_NICK, fullUserData.nick);
          }

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

      // Salvar o nick do usuário logado para exibir no perfil
      if (userData.nick) {
        await storage.setItem(storageKeys.LAST_USED_NICK, userData.nick);
      }

      setUser(userData);
    } catch (error: any) {
      const errorMessage = error.response?.data?.erro || error.message || 'Código inválido';
      throw new Error(errorMessage);
    }
  };

  const logout = useCallback(async (): Promise<void> => {
    try {
      await api.post('/logout').catch(() => { }); // Ignora erro se não conseguir fazer logout no servidor
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      // Salva a configuração do servidor antes de limpar
      const serverConfig = await storage.getItem(storageKeys.SERVER_CONFIG);

      // Remove apenas dados de autenticação, mantendo a configuração do servidor
      await storage.removeItem(storageKeys.TOKEN);
      await storage.removeItem(storageKeys.USER);
      await storage.removeItem(storageKeys.EMPRESA);
      await storage.removeItem(storageKeys.TABLE);
      await storage.removeItem(storageKeys.CART);
      await storage.removeItem(storageKeys.LAST_USED_NICK);

      // Restaura a configuração do servidor se existir
      if (serverConfig) {
        await storage.setItem(storageKeys.SERVER_CONFIG, serverConfig);
      }

      setUser(null);
      console.log('[AuthContext] Logout completed, server config preserved');
    }
  }, []);

  // Atualiza a referência global do logout
  useEffect(() => {
    setLogoutHandler(logout);
    return () => {
      setLogoutHandler(null);
    };
  }, [logout]);

  const setServerConfig = async (config: { apiUrl: string; apiUrlLocal?: string; appName?: string }): Promise<void> => {
    try {
      console.log('[AuthContext] Saving server config:', config);
      await storage.setItem(storageKeys.SERVER_CONFIG, config);
      api.defaults.baseURL = config.apiUrl;
      console.log('[AuthContext] Server config saved successfully');
    } catch (error) {
      console.error('[AuthContext] Error saving server config:', error);
      throw error;
    }
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

