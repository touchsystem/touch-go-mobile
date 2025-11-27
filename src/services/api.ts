import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { storage, storageKeys } from './storage';
import { handleTokenExpiration } from './auth-manager';

const getBaseURL = async (): Promise<string> => {
  const config = await storage.getItem<{ apiUrl: string; apiUrlLocal?: string }>(storageKeys.SERVER_CONFIG);
  // No mobile, sempre usa a URL local (ou apiUrl que será a URL local)
  if (config?.apiUrl) {
    return config.apiUrl;
  }
  // Fallback padrão
  return 'http://192.168.0.234:5000';
};

const axiosInstance = axios.create({
  baseURL: 'http://192.168.0.234:5000', // Será atualizado dinamicamente
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para atualizar baseURL dinamicamente
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const baseURL = await getBaseURL();
    config.baseURL = baseURL;

    const token = await storage.getItem<string>(storageKeys.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const user = await storage.getItem<{ id: number }>(storageKeys.USER);
    if (user?.id) {
      config.headers['X-User-ID'] = user.id.toString();
      if (config.method === 'post' || config.method === 'put') {
        config.data = {
          ...config.data,
          id_usu: user.id,
        };
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de resposta
axiosInstance.interceptors.response.use(
  (response) => {
    if (response.data?.erro) {
      return Promise.reject({
        response: {
          data: response.data,
        },
      });
    }
    return response;
  },
  async (error: AxiosError<{ erro?: string }>) => {
    if (error.response?.status === 401) {
      const msg = error.response.data?.erro?.toLowerCase() || '';
      if (msg.includes('token is expired') || msg.includes('token inválido') || msg.includes('token expirado')) {
        // Chama a função de logout que atualiza o estado e redireciona
        await handleTokenExpiration();
      }
      return Promise.reject(new Error(msg || 'Não autorizado'));
    }

    if (error.response?.data) {
      return Promise.reject(error);
    }

    if (error.response?.status === 404) {
      return Promise.reject(new Error('Recurso não encontrado.'));
    }

    if (error.request) {
      return Promise.reject(new Error('Erro de conexão. Verifique sua internet.'));
    }

    return Promise.reject(new Error('Erro ao configurar a requisição.'));
  }
);

export default axiosInstance;

