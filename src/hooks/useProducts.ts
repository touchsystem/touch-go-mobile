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
      setGroups(response.data || []);
    } catch (err: any) {
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

