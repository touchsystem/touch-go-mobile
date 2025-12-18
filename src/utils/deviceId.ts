import * as Application from 'expo-application';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export interface DeviceInfo {
  deviceId: string | null;
  deviceName: string | null;
  modelName: string | null;
  osName: string | null;
  osVersion: string | null;
  brand: string | null;
  manufacturer: string | null;
  platform: string;
  appVersion: string | null;
}

/**
 * Obtém o ID único do dispositivo
 * - Android: Android ID (único por dispositivo, persiste após reinstalação)
 * - iOS: Identifier for Vendor (único por desenvolvedor, persiste após reinstalação)
 */
export const getDeviceId = async (): Promise<string | null> => {
  try {
    if (Platform.OS === 'android') {
      // Android ID - único por dispositivo e persiste após reinstalação do app
      const androidId = Application.getAndroidId();
      return androidId;
    } else if (Platform.OS === 'ios') {
      // iOS Identifier for Vendor - único por desenvolvedor
      // Persiste após reinstalação, mas muda se todos os apps do desenvolvedor forem removidos
      const iosId = await Application.getIosIdForVendorAsync();
      return iosId;
    }
    return null;
  } catch (error) {
    console.error('[DeviceId] Erro ao obter Device ID:', error);
    return null;
  }
};

/**
 * Obtém informações completas do dispositivo
 * Útil para exibir no painel administrativo e para debug
 */
export const getDeviceInfo = async (): Promise<DeviceInfo> => {
  try {
    const deviceId = await getDeviceId();
    const appVersion = Application.nativeApplicationVersion;

    const deviceInfo: DeviceInfo = {
      deviceId,
      deviceName: Device.deviceName,
      modelName: Device.modelName,
      osName: Device.osName,
      osVersion: Device.osVersion,
      brand: Device.brand,
      manufacturer: Device.manufacturer,
      platform: Platform.OS,
      appVersion,
    };

    console.log('[DeviceId] Informações do dispositivo:', {
      ...deviceInfo,
      deviceId: deviceId ? `${deviceId.substring(0, 8)}...` : null, // Log parcial por segurança
    });

    return deviceInfo;
  } catch (error) {
    console.error('[DeviceId] Erro ao obter informações do dispositivo:', error);
    return {
      deviceId: null,
      deviceName: null,
      modelName: null,
      osName: null,
      osVersion: null,
      brand: null,
      manufacturer: null,
      platform: Platform.OS,
      appVersion: null,
    };
  }
};

/**
 * Formata as informações do dispositivo para exibição
 */
export const formatDeviceInfo = (info: DeviceInfo): string => {
  const parts = [];
  
  if (info.manufacturer) parts.push(info.manufacturer);
  if (info.modelName) parts.push(info.modelName);
  if (info.osName && info.osVersion) parts.push(`${info.osName} ${info.osVersion}`);
  
  return parts.join(' - ') || 'Dispositivo desconhecido';
};

