import React from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import { TableProvider } from '../contexts/TableContext';
import { ThemeProvider } from '../contexts/ThemeContext';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <TableProvider>
            {children}
          </TableProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

