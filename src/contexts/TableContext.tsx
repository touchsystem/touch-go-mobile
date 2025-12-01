import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import axiosInstance from '../services/api';

export interface Table {
  id: number;
  mesa_cartao: number;
  status: 'L' | 'O' | 'I' | 'R' | 'F';
  nome?: string;
  cliente?: string;
  obs?: string;
}

// Interface para mesa selecionada (usada em OrdersScreen)
export interface SelectedTable {
  numero: string;
  id?: number;
  mesa_cartao?: number;
}

interface TableContextType {
  tables: Table[];
  loading: boolean;
  error: string | null;
  fetchTables: () => Promise<void>;
  updateTableStatus: (mesaCartao: number, status: Table['status']) => void;
  refreshTable: (mesaCartao: number) => Promise<void>;
  selectedTable: SelectedTable | null;
  setSelectedTable: (table: SelectedTable | null) => void;
}

const TableContext = createContext<TableContextType | undefined>(undefined);

export function TableProvider({ children }: { children: ReactNode }) {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<SelectedTable | null>(null);

  const fetchTables = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/mesas');
      setTables(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar mesas');
      setTables([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTableStatus = useCallback((mesaCartao: number, status: Table['status']) => {
    setTables((prevTables) =>
      prevTables.map((table) =>
        table.mesa_cartao === mesaCartao ? { ...table, status } : table
      )
    );
  }, []);

  const refreshTable = useCallback(async (mesaCartao: number) => {
    try {
      const response = await axiosInstance.get(`/mesas?mesa_cartao=${mesaCartao}`);
      const allTables = response.data || [];
      
      // Procura a mesa correta no array retornado
      const updatedTable = allTables.find((t: Table) => t.mesa_cartao === mesaCartao);
      
      // Verifica se encontrou a mesa correta
      if (updatedTable && updatedTable.mesa_cartao === mesaCartao) {
        setTables((prevTables) => {
          // Garante que a mesa atualizada está na lista
          const existingIndex = prevTables.findIndex((t) => t.mesa_cartao === mesaCartao);
          
          if (existingIndex >= 0) {
            // Atualiza a mesa na posição original
            const newTables = [...prevTables];
            newTables[existingIndex] = updatedTable;
            return newTables;
          } else {
            // Se não encontrou, adiciona no final
            console.warn(`Mesa ${mesaCartao} não encontrada na lista, adicionando...`);
            return [...prevTables, updatedTable];
          }
        });
      } else {
        console.warn(`Mesa ${mesaCartao} não encontrada na resposta da API. Retornado:`, allTables);
        // Se a API não retornou a mesa correta, apenas atualiza o status localmente
        updateTableStatus(mesaCartao, 'F');
      }
    } catch (error) {
      console.error('Erro ao atualizar mesa:', error);
      // Em caso de erro, apenas atualiza o status para 'F' (Fechada) mantendo a mesa
      updateTableStatus(mesaCartao, 'F');
    }
  }, [updateTableStatus]);

  return (
    <TableContext.Provider
      value={{
        tables,
        loading,
        error,
        fetchTables,
        updateTableStatus,
        refreshTable,
        selectedTable,
        setSelectedTable,
      }}
    >
      {children}
    </TableContext.Provider>
  );
}

export function useTableContext() {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error('useTableContext must be used within a TableProvider');
  }
  return context;
}

// Alias para compatibilidade com código existente
export const useTable = useTableContext;
