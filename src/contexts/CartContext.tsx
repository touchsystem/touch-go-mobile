import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storage, storageKeys } from '../services/storage';
import { CartItem } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'uuid' | 'quantidade'>) => void;
  updateQuantity: (uuid: string, quantity: number) => void;
  updateCartItem: (uuid: string, quantity: number, observation?: string) => void;
  removeFromCart: (uuid: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    loadCart();
  }, []);

  useEffect(() => {
    saveCart();
  }, [cart]);

  const loadCart = async () => {
    try {
      const savedCart = await storage.getItem<CartItem[]>(storageKeys.CART);
      if (savedCart) {
        setCart(savedCart);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const saveCart = async () => {
    try {
      await storage.setItem(storageKeys.CART, cart);
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  const addToCart = (item: Omit<CartItem, 'uuid' | 'quantidade'>) => {
    setCart((prevCart) => {
      // Se o item tem relacionais, adiciona o principal e os relacionais
      if ((item as any).relacionais && Array.isArray((item as any).relacionais)) {
        const uuidPrincipal = (item as any).uuid || `${item.id}-${Date.now()}`;
        const principal: CartItem = {
          ...item,
          uuid: uuidPrincipal,
          quantidade: 1,
          codm_status: (item as any).codm_status || 'R',
        };
        
        const relacionais: CartItem[] = ((item as any).relacionais || []).map((rel: any) => ({
          uuid: rel.uuid || `${rel.id || rel.codm}-${Date.now()}`,
          id: rel.id || parseInt(rel.codm || '0') || 0,
          nome: rel.nomeProduto || rel.nome || rel.des2 || 'Produto Relacional',
          descricao: rel.descricao || '',
          preco: rel.pv || rel.precoVenda || 0,
          quantidade: rel.quantity || rel.fractionQty || 1,
          codm: rel.codm || '',
          pv: rel.pv || rel.precoVenda || 0,
          codm_status: rel.codm_status || 'M',
          codm_relacional: rel.codm_relacional || principal.codm,
          uuid_principal: uuidPrincipal,
          fractionQty: rel.fractionQty,
          fractionLabel: rel.fractionLabel,
          fractionValue: rel.fractionValue, // Incluir fractionValue
          quantity: rel.quantity,
          precoVenda: rel.precoVenda, // Manter precoVenda original
        }));

        return [...prevCart, principal, ...relacionais];
      }

      // Item normal sem relacionais
      const existingItem = prevCart.find((cartItem) => 
        cartItem.id === item.id && 
        !cartItem.uuid_principal && 
        !cartItem.codm_relacional
      );
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.uuid === existingItem.uuid
            ? { ...cartItem, quantidade: cartItem.quantidade + 1 }
            : cartItem
        );
      }
      return [
        ...prevCart,
        {
          ...item,
          uuid: `${item.id}-${Date.now()}`,
          quantidade: 1,
        },
      ];
    });
  };

  const updateQuantity = (uuid: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(uuid);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => (item.uuid === uuid ? { ...item, quantidade: quantity } : item))
    );
  };

  const updateCartItem = (uuid: string, quantity: number, observation?: string) => {
    if (quantity <= 0) {
      removeFromCart(uuid);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.uuid === uuid
          ? { ...item, quantidade: quantity, observacao: observation || item.observacao }
          : item
      )
    );
  };

  const removeFromCart = (uuid: string) => {
    setCart((prevCart) => {
      // Remove o item principal e todos os seus relacionais
      return prevCart.filter(
        (item) => item.uuid !== uuid && item.uuid_principal !== uuid
      );
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotal = (): number => {
    // Agrupa principais e relacionais
    const principais = cart.filter(
      (item) => item.codm_status === 'R' || !item.codm_status || !item.codm_relacional
    );

    return principais.reduce((total, principal) => {
      const relacionais = cart.filter(
        (item) => item.uuid_principal === principal.uuid && item.codm_status === 'M'
      );

      let valorPrincipal = (principal.pv || principal.preco || 0) * principal.quantidade;

      // Calcula valor dos relacionais
      if (relacionais.length > 0) {
        const hasFractionals = relacionais.some(
          (rel) => typeof rel.fractionQty === 'number' || rel.fractionLabel
        );

        if (hasFractionals) {
          // Verifica se está no modo SOMA ou MAIOR PREÇO
          const positives = relacionais.filter((rel) => {
            const price = (rel as any).fractionValue ?? rel.pv ?? rel.preco ?? 0;
            return (typeof rel.fractionQty === 'number' || rel.fractionLabel) && price > 0;
          }).length;

          if (positives > 1) {
            // Modo SOMA: soma todas as frações
            const fractionalTotal = relacionais.reduce((sum: number, rel: any) => {
              if (typeof rel.fractionQty === 'number' || rel.fractionLabel) {
                // Prioriza fractionValue se disponível (já calculado corretamente)
                if (rel.fractionValue !== undefined && rel.fractionValue !== null && rel.fractionValue > 0) {
                  return sum + rel.fractionValue;
                }
                // Se o item já tem pv calculado corretamente e é maior que zero, usa ele
                if (rel.pv && rel.pv > 0) {
                  return sum + rel.pv;
                }
                // Senão, calcula baseado na fração apenas se houver preço
                const priceUnit = rel.pv ?? rel.preco ?? rel.precoVenda ?? 0;
                if (priceUnit > 0) {
                  const fraction = rel.fractionQty ?? 1;
                  return sum + (priceUnit * fraction);
                }
              }
              return sum;
            }, 0);
            // Só adiciona se houver valor nos fracionados
            if (fractionalTotal > 0) {
              valorPrincipal += fractionalTotal * principal.quantidade;
            }
          } else {
            // Modo MAIOR PREÇO: usa apenas o maior preço entre os sabores
            const unitMaxPrice = relacionais.reduce((m: number, rel: any) => {
              // Usa fractionValue se disponível, senão usa pv, senão usa preco
              const price = rel.fractionValue ?? rel.pv ?? rel.preco ?? 0;
              return price > m ? price : m;
            }, 0);
            // Só adiciona se houver preço maior que zero
            if (unitMaxPrice > 0) {
              valorPrincipal += unitMaxPrice * principal.quantidade;
            }
          }
        } else {
          // Relacionais normais (não fracionados)
          const relacionaisTotal = relacionais.reduce((sum, rel) => {
            const price = rel.pv || rel.preco || 0;
            const qty = rel.quantity || rel.quantidade || 1;
            return sum + price * qty;
          }, 0);
          valorPrincipal += relacionaisTotal * principal.quantidade;
        }
      }

      return total + valorPrincipal;
    }, 0);
  };

  const getTotalItems = (): number => {
    // Conta apenas os itens principais (não relacionais)
    // Itens relacionais são parte do item principal e não devem ser contados separadamente
    return cart.reduce((total, item) => {
      // Se o item é relacional (tem uuid_principal ou codm_relacional), não conta
      if (item.uuid_principal || item.codm_relacional) {
        return total;
      }
      // Conta apenas itens principais
      return total + item.quantidade;
    }, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        updateCartItem,
        removeFromCart,
        clearCart,
        getTotal,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

