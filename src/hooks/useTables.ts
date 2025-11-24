import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../services/api';

export interface Table {
  id: number;
  mesa_cartao: number;
  status: 'L' | 'O' | 'I' | 'R' | 'F';
  nome?: string;
  cliente?: string;
  obs?: string;
}

export const useTables = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  return { tables, loading, error, fetchTables };
};

