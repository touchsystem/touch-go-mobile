import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Product, ProductGroup } from '../types';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [groups, setGroups] = useState<ProductGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<ProductGroup[]>('/grupos?status=C');
      const groupsData = response.data || [];
      
      // Se não tiver quantidadeItens, busca a contagem de produtos para cada grupo
      const groupsWithCount = await Promise.all(
        groupsData.map(async (group) => {
          if (group.quantidadeItens !== undefined && group.quantidadeItens !== null) {
            return group;
          }
          
          try {
            // Busca produtos do grupo para contar
            const productsResponse = await api.get<Product[]>(`/produtos/grupopd/${group.cod_gp}`);
            return {
              ...group,
              quantidadeItens: productsResponse.data?.length || 0,
            };
          } catch {
            return {
              ...group,
              quantidadeItens: 0,
            };
          }
        })
      );
      
      setGroups(groupsWithCount);
    } catch (err: any) {
      // Ignora erros de token inválido (será redirecionado automaticamente)
      if (err.message === 'TOKEN_EXPIRED_SILENT' || (err as any).isTokenError) {
        return;
      }
      setError(err.message || 'Erro ao carregar grupos');
      console.error('Error fetching groups:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async (codGp?: string) => {
    try {
      setLoading(true);
      setError(null);
      const url = codGp
        ? `/produtos/grupopd/${codGp}`
        : '/produtos?status=C';
      console.log('Fetching products from:', url);
      const response = await api.get<Product[]>(url);
      console.log('Products received:', response.data?.length || 0);
      setProducts(response.data || []);
    } catch (err: any) {
      // Ignora erros de token inválido (será redirecionado automaticamente)
      if (err.message === 'TOKEN_EXPIRED_SILENT' || (err as any).isTokenError) {
        return;
      }
      const errorMessage = err.response?.data?.erro || err.message || 'Erro ao carregar produtos';
      setError(errorMessage);
      console.error('Error fetching products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return {
    products,
    groups,
    loading,
    error,
    fetchProducts,
    fetchGroups,
    refetch: useCallback(() => {
      fetchGroups();
      fetchProducts();
    }, [fetchGroups, fetchProducts]),
  };
};

