import React, { createContext, useContext, useState, ReactNode } from 'react';
import { storage, storageKeys } from '../services/storage';
import { Table } from '../types';

interface TableContextType {
  selectedTable: Table | null;
  setSelectedTable: (table: Table | null) => Promise<void>;
}

const TableContext = createContext<TableContextType | undefined>(undefined);

export const TableProvider = ({ children }: { children: ReactNode }) => {
  const [selectedTable, setSelectedTableState] = useState<Table | null>(null);

  const setSelectedTable = async (table: Table | null) => {
    setSelectedTableState(table);
    if (table) {
      await storage.setItem(storageKeys.TABLE, table);
    } else {
      await storage.removeItem(storageKeys.TABLE);
    }
  };

  React.useEffect(() => {
    loadTable();
  }, []);

  const loadTable = async () => {
    try {
      const savedTable = await storage.getItem<Table>(storageKeys.TABLE);
      if (savedTable) {
        setSelectedTableState(savedTable);
      }
    } catch (error) {
      console.error('Error loading table:', error);
    }
  };

  return (
    <TableContext.Provider
      value={{
        selectedTable,
        setSelectedTable,
      }}
    >
      {children}
    </TableContext.Provider>
  );
};

export const useTable = () => {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error('useTable must be used within a TableProvider');
  }
  return context;
};



