import React, { createContext, useCallback, useEffect, useState } from 'react';
import { storage } from '../services/storage';

const SETTINGS_STORAGE_KEY = 'systemSettings';

export interface SystemSettings {
  serverIp: string;
  serverPort: string;
  cellphoneNumber: string;
  attendanceMethod: 'local' | 'cloud';
  paymentMethod: 'local' | 'cloud';
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
  printAccounts: boolean;
  showSettingsTab: boolean;
}

const DEFAULT_SETTINGS: SystemSettings = {
  serverIp: '146.190.123.175',
  serverPort: '5001',
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
  printAccounts: true,
  showSettingsTab: true,
};

export type SystemSettingsContextValue = {
  settings: SystemSettings;
  loading: boolean;
  updateSettings: (partial: Partial<SystemSettings>) => Promise<boolean>;
  updateSetting: <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) => Promise<boolean>;
  resetSettings: () => Promise<boolean>;
};

const SystemSettingsContext = createContext<SystemSettingsContextValue | null>(null);

export function SystemSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const saved = await storage.getItem<SystemSettings>(SETTINGS_STORAGE_KEY);
        if (!cancelled && saved) {
          setSettings({ ...DEFAULT_SETTINGS, ...saved });
        }
      } catch (e) {
        if (!cancelled) console.error('[SystemSettings] load error:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateSettings = useCallback(async (partial: Partial<SystemSettings>) => {
    try {
      const updated = { ...settings, ...partial };
      await storage.setItem(SETTINGS_STORAGE_KEY, updated);
      setSettings(updated);
      return true;
    } catch (e) {
      console.error('[SystemSettings] save error:', e);
      return false;
    }
  }, [settings]);

  const updateSetting = useCallback(
    async <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) => {
      return updateSettings({ [key]: value });
    },
    [updateSettings]
  );

  const resetSettings = useCallback(async () => {
    try {
      await storage.removeItem(SETTINGS_STORAGE_KEY);
      setSettings(DEFAULT_SETTINGS);
      return true;
    } catch (e) {
      console.error('[SystemSettings] reset error:', e);
      return false;
    }
  }, []);

  const value: SystemSettingsContextValue = {
    settings,
    loading,
    updateSettings,
    updateSetting,
    resetSettings,
  };

  return (
    <SystemSettingsContext.Provider value={value}>
      {children}
    </SystemSettingsContext.Provider>
  );
}

export function useSystemSettingsContext(): SystemSettingsContextValue {
  const ctx = React.useContext(SystemSettingsContext);
  if (!ctx) {
    throw new Error('useSystemSettingsContext must be used within SystemSettingsProvider');
  }
  return ctx;
}
