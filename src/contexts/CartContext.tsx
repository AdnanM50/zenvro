'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import type { Product } from '@/lib/products';

export type CartItem = {
  key: string;
  slug: string;
  name: string;
  category: string;
  year: string;
  price: number;
  image: string;
  size: string;
  quantity: number;
};

interface CartContextType {
  items: CartItem[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  addItem: (product: Product, size: string, quantity?: number) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'zenvro_cart';

function parsePrice(price: string): number {
  const parsed = parseInt(price.replace(/[^0-9]/g, ''), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatPrice(value: number): string {
  return `$${value.toLocaleString('en-US')}`;
}

function loadStoredItems(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as CartItem[];
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch {
    // Ignore corrupted storage
  }
  return [];
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadStoredItems);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage errors
    }
  }, [items]);

  const addItem = useCallback((product: Product, size: string, quantity = 1) => {
    const price = parsePrice(product.price);
    const key = `${product.slug}-${size}`;

    setItems((prev) => {
      const existing = prev.find((item) => item.key === key);
      if (existing) {
        return prev.map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [
        ...prev,
        {
          key,
          slug: product.slug,
          name: product.name,
          category: product.category,
          year: product.year,
          price,
          image: product.image,
          size,
          quantity,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((item) => item.key !== key));
  }, []);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.key !== key));
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, quantity } : item))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const count = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        subtotal,
        isOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export { formatPrice };
