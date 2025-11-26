import { useState, useCallback } from 'react';
import api from '../services/api';

export interface RelationalGroup {
  grupo: {
    id: number;
    nome: string;
    tipo: string; // "1" = múltipla escolha, "2" = escolha única (radio)
    min?: number;
    max?: number;
    obrigatorio?: boolean;
  };
  itens: Array<{
    id: number;
    codm: string;
    nomeProduto: string;
    descricao?: string;
    precoVenda: number;
    status?: string;
    codm_status?: string;
  }>;
}

export interface RelationalGroupsResponse {
  grupos: RelationalGroup[];
  produto?: any;
}

export const useRelationalGroups = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRelationalGroups = useCallback(async (codm: string): Promise<RelationalGroup[]> => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<RelationalGroupsResponse>(
        `/produtos/${codm}/grupos-itens?status=A`
      );
      const gruposArr = Array.isArray(response.data?.grupos) ? response.data.grupos : [];
      return gruposArr;
    } catch (err: any) {
      const errorMessage = err.response?.data?.erro || err.message || 'Erro ao carregar grupos relacionais';
      setError(errorMessage);
      console.error('Error fetching relational groups:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    fetchRelationalGroups,
    loading,
    error,
  };
};

