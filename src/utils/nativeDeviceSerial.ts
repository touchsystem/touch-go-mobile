import { NativeModules, Platform } from 'react-native';

const { DeviceSerial } = NativeModules;

export interface NativeDeviceSerial {
  getSerialNumber(): Promise<string>;
  getDeviceModel(): Promise<string>;
  getDeviceManufacturer(): Promise<string>;
  getDeviceBrand(): Promise<string>;
  getAndroidId(): Promise<string>;
}

/**
 * Módulo Nativo Customizado para obter Serial Number do Android
 * 
 * Funciona apenas no build nativo (Android Studio / APK)
 * No Expo Go, retorna null
 */
const nativeDeviceSerial: NativeDeviceSerial | null = 
  Platform.OS === 'android' && DeviceSerial ? DeviceSerial : null;

/**
 * Obtém o Serial Number REAL do dispositivo Android
 * 
 * Implementação nativa que:
 * - Android 8+: usa Build.getSerial()
 * - Android <8: usa Build.SERIAL
 * - Fallback: usa Android ID se serial não disponível
 * 
 * @returns Serial Number do dispositivo (ex: RX8N70KYP2P)
 */
export async function getNativeSerialNumber(): Promise<string | null> {
  if (!nativeDeviceSerial) {
    console.log('[NativeDeviceSerial] Módulo não disponível (normal no Expo Go)');
    return null;
  }

  try {
    const serial = await nativeDeviceSerial.getSerialNumber();
    console.log('[NativeDeviceSerial] Serial Number obtido:', serial);
    return serial;
  } catch (error) {
    console.error('[NativeDeviceSerial] Erro ao obter serial:', error);
    return null;
  }
}

/**
 * Obtém o Android ID (fallback caso serial não esteja disponível)
 */
export async function getNativeAndroidId(): Promise<string | null> {
  if (!nativeDeviceSerial) {
    return null;
  }

  try {
    const androidId = await nativeDeviceSerial.getAndroidId();
    return androidId;
  } catch (error) {
    console.error('[NativeDeviceSerial] Erro ao obter Android ID:', error);
    return null;
  }
}

/**
 * Obtém informações completas do dispositivo do módulo nativo
 */
export async function getNativeDeviceInfo() {
  if (!nativeDeviceSerial) {
    return {
      serialNumber: null,
      model: null,
      manufacturer: null,
      brand: null,
      androidId: null,
    };
  }

  try {
    const [serialNumber, model, manufacturer, brand, androidId] = await Promise.all([
      nativeDeviceSerial.getSerialNumber().catch(() => null),
      nativeDeviceSerial.getDeviceModel().catch(() => null),
      nativeDeviceSerial.getDeviceManufacturer().catch(() => null),
      nativeDeviceSerial.getDeviceBrand().catch(() => null),
      nativeDeviceSerial.getAndroidId().catch(() => null),
    ]);

    return {
      serialNumber,
      model,
      manufacturer,
      brand,
      androidId,
    };
  } catch (error) {
    console.error('[NativeDeviceSerial] Erro ao obter informações:', error);
    return {
      serialNumber: null,
      model: null,
      manufacturer: null,
      brand: null,
      androidId: null,
    };
  }
}

export default nativeDeviceSerial;

