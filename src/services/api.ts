import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { handleTokenExpiration } from './auth-manager';
import { storage, storageKeys } from './storage';

const getBaseURL = async (): Promise<string> => {
  const config = await storage.getItem<{ apiUrl: string; apiUrlLocal?: string }>(storageKeys.SERVER_CONFIG);
  // No mobile, sempre usa a URL local (ou apiUrl que será a URL local)
  if (config?.apiUrl) {
    return config.apiUrl;
  }
  // Fallback padrão
  return 'http://146.190.123.175:5001';
};

const axiosInstance = axios.create({
  baseURL: 'http://146.190.123.175:5001', // Será atualizado dinamicamente
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
      // Remove espaços e quebras de linha do token
      const cleanToken = token.trim();

      // Valida se o token tem formato válido (JWT tem 3 partes separadas por ponto)
      const tokenParts = cleanToken.split('.');
      if (tokenParts.length === 3 && cleanToken.length > 0) {
        config.headers.Authorization = `Bearer ${cleanToken}`;
      } else {
        // Token inválido, remove e redireciona
        console.log('[API] Token inválido detectado, removendo...');
        await handleTokenExpiration();
        // Retorna um erro especial que pode ser ignorado pelos componentes
        const silentError = new Error('TOKEN_EXPIRED_SILENT');
        (silentError as any).isTokenError = true;
        return Promise.reject(silentError);
      }
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

    // Adiciona Device ID no header de todas as requisições (exceto login)
    const deviceId = await storage.getItem<string>(storageKeys.DEVICE_ID);
    if (deviceId && !config.url?.includes('/login')) {
      config.headers['X-Device-ID'] = deviceId;
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
      const errorMessage = error.message?.toLowerCase() || '';

      // Verifica se é erro relacionado a token inválido/expirado
      const isTokenError =
        msg.includes('token is expired') ||
        msg.includes('token inválido') ||
        msg.includes('token expirado') ||
        msg.includes('invalid token') ||
        errorMessage.includes('token') && (errorMessage.includes('invalid') || errorMessage.includes('expired') || errorMessage.includes('segments'));

      if (isTokenError) {
        // Chama a função de logout que atualiza o estado e redireciona
        await handleTokenExpiration();
        // Retorna um erro especial que pode ser ignorado pelos componentes
        const silentError = new Error('TOKEN_EXPIRED_SILENT');
        (silentError as any).isTokenError = true;
        return Promise.reject(silentError);
      }
      return Promise.reject(new Error(msg || 'Não autorizado'));
    }

    // Verifica se o erro é relacionado a token inválido mesmo sem ser 401
    const errorMessage = error.message?.toLowerCase() || '';
    if (errorMessage.includes('token') && (errorMessage.includes('invalid') || errorMessage.includes('segments'))) {
      await handleTokenExpiration();
      // Retorna um erro especial que pode ser ignorado pelos componentes
      const silentError = new Error('TOKEN_EXPIRED_SILENT');
      (silentError as any).isTokenError = true;
      return Promise.reject(silentError);
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

