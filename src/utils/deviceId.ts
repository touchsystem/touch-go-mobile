import * as Application from 'expo-application';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Importação condicional - só funciona no build nativo, não no Expo Go
let DeviceInfo: any = null;
try {
  DeviceInfo = require('react-native-device-info').default;
} catch (e) {
  console.log('[DeviceId] react-native-device-info não disponível (normal no Expo Go)');
}

export interface DeviceInfo {
  deviceId: string | null;
  serialNumber: string | null;
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
    
    // Obtém o Serial Number (Android) - Só funciona no build nativo
    let serialNumber: string | null = null;
    if (DeviceInfo && Platform.OS === 'android') {
      try {
        serialNumber = await DeviceInfo.getSerialNumber();
        console.log('[DeviceId] Serial Number obtido:', serialNumber);
        
        // Se retornar "unknown", tenta usar o androidId como alternativa
        if (serialNumber === 'unknown') {
          serialNumber = Application.getAndroidId();
          console.log('[DeviceId] Serial retornou "unknown", usando androidId:', serialNumber);
        }
      } catch (err) {
        console.log('[DeviceId] Erro ao obter serial number (normal no Expo Go):', err);
        // Se falhar, usa o androidId como alternativa
        serialNumber = Application.getAndroidId();
      }
    } else if (Platform.OS === 'android') {
      // Fallback para Expo Go - usa androidId
      serialNumber = Application.getAndroidId();
      console.log('[DeviceId] Usando androidId como serial (Expo Go):', serialNumber);
    }

    const deviceInfo: DeviceInfo = {
      deviceId,
      serialNumber,
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
      serialNumber: null,
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

/**
 * Cria um identificador visual único baseado no Device ID
 * Como não podemos acessar o serial number real, usamos o Device ID
 * formatado de forma mais legível
 * 
 * Exemplo: 0d8a21609c9b7f5b -> 0D8A-2160-9C9B-7F5B
 */
export const getVisualDeviceIdentifier = (deviceId: string | null): string => {
  if (!deviceId) return 'N/A';
  
  // Formata o Device ID em grupos de 4 caracteres maiúsculos
  const formatted = deviceId.toUpperCase().match(/.{1,4}/g)?.join('-') || deviceId;
  return formatted;
};

