import { useState, useEffect } from 'react';
import { storage, storageKeys } from '../services/storage';

export interface SystemSettings {
  // Servidor
  serverIp: string;
  serverPort: string;
  cellphoneNumber: string;
  
  // Métodos
  attendanceMethod: 'local' | 'cloud';
  paymentMethod: 'local' | 'cloud';
  
  // Configurações gerais
  landscapeScreen: boolean;
  directSale: boolean;
  directReceiptWithCard: boolean;
  showTourist: boolean;
  groupQuantityInOrder: boolean;
  scale: boolean;
  showBorder: boolean;
  cardOpening: boolean;
  bar2: boolean;
  secondCopyOrder: boolean;
  summarizedOrder: boolean;
  secondCopyDetailedBill: boolean;
  cashier: boolean;
  nfcCard: boolean;
  directEntry: boolean;
  emitWebenefixInvoice: boolean;
  mandatoryFieldsCardOpening: boolean;
  secondTableOrder: boolean;
  removeAccountOptions: boolean;
  removeCashierAccount: boolean;
  hideAnticipation: boolean;
}

const DEFAULT_SETTINGS: SystemSettings = {
  serverIp: '192.168.0.234',
  serverPort: '5000',
  cellphoneNumber: '',
  attendanceMethod: 'local',
  paymentMethod: 'local',
  landscapeScreen: false,
  directSale: false,
  directReceiptWithCard: false,
  showTourist: false,
  groupQuantityInOrder: false,
  scale: false,
  showBorder: false,
  cardOpening: false,
  bar2: false,
  secondCopyOrder: false,
  summarizedOrder: false,
  secondCopyDetailedBill: false,
  cashier: false,
  nfcCard: false,
  directEntry: false,
  emitWebenefixInvoice: false,
  mandatoryFieldsCardOpening: false,
  secondTableOrder: false,
  removeAccountOptions: false,
  removeCashierAccount: false,
  hideAnticipation: false,
};

const SETTINGS_STORAGE_KEY = 'systemSettings';

export const useSystemSettings = () => {
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await storage.getItem<SystemSettings>(SETTINGS_STORAGE_KEY);
      if (savedSettings) {
        setSettings({ ...DEFAULT_SETTINGS, ...savedSettings });
      }
    } catch (error) {
      console.error('Error loading system settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<SystemSettings>) => {
    try {
      const updated = { ...settings, ...newSettings };
      await storage.setItem(SETTINGS_STORAGE_KEY, updated);
      setSettings(updated);
      return true;
    } catch (error) {
      console.error('Error saving system settings:', error);
      return false;
    }
  };

  const updateSetting = async <K extends keyof SystemSettings>(
    key: K,
    value: SystemSettings[K]
  ) => {
    return updateSettings({ [key]: value });
  };

  const resetSettings = async () => {
    try {
      await storage.removeItem(SETTINGS_STORAGE_KEY);
      setSettings(DEFAULT_SETTINGS);
      return true;
    } catch (error) {
      console.error('Error resetting settings:', error);
      return false;
    }
  };

  return {
    settings,
    loading,
    updateSettings,
    updateSetting,
    resetSettings,
  };
};

