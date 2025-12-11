import { useState, useEffect } from 'react';
import { storage } from '../services/storage';

export interface PaymentMethod {
  id: string;
  name: string;
  enabled: boolean;
}

const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'real', name: 'Real', enabled: false },
  { id: 'dolar', name: 'Dolar', enabled: false },
  { id: 'guarani', name: 'Guarani', enabled: false },
  { id: 'peso', name: 'Peso', enabled: false },
  { id: 'credito', name: 'Crédito', enabled: true },
  { id: 'debito', name: 'Débito', enabled: true },
  { id: 'vale_alimentacao', name: 'Vale Alimentação', enabled: false },
  { id: 'pix', name: 'Pix', enabled: true },
  { id: 'debito_terceiro', name: 'Débito Terceiro', enabled: false },
  { id: 'credito_terceiro', name: 'Crédito Terceiro', enabled: false },
  { id: 'pix_mp', name: 'Pix MP', enabled: false },
  { id: 'voucher', name: 'Voucher', enabled: false },
  { id: 'desconto', name: 'Desconto', enabled: false },
  { id: 'cortesia', name: 'Cortesia', enabled: false },
];

const PAYMENT_METHODS_STORAGE_KEY = 'paymentMethods';

export const usePaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(DEFAULT_PAYMENT_METHODS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const saved = await storage.getItem<PaymentMethod[]>(PAYMENT_METHODS_STORAGE_KEY);
      if (saved && Array.isArray(saved)) {
        setPaymentMethods(saved);
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentMethod = async (id: string, enabled: boolean) => {
    try {
      const updated = paymentMethods.map(method =>
        method.id === id ? { ...method, enabled } : method
      );
      await storage.setItem(PAYMENT_METHODS_STORAGE_KEY, updated);
      setPaymentMethods(updated);
      return true;
    } catch (error) {
      console.error('Error updating payment method:', error);
      return false;
    }
  };

  const updateAllPaymentMethods = async (methods: PaymentMethod[]) => {
    try {
      await storage.setItem(PAYMENT_METHODS_STORAGE_KEY, methods);
      setPaymentMethods(methods);
      return true;
    } catch (error) {
      console.error('Error saving payment methods:', error);
      return false;
    }
  };

  return {
    paymentMethods,
    loading,
    updatePaymentMethod,
    updateAllPaymentMethods,
  };
};


