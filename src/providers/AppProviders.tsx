import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { TableProvider } from '../contexts/TableContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { initTransactionSync } from '../services/transaction-sync';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    initTransactionSync(true).catch((e) => console.warn('[App] initTransactionSync:', e));
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <TableProvider>
                {children}
              </TableProvider>
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

