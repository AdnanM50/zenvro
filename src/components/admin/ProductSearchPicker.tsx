'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Search, X, Package, Plus } from 'lucide-react';
import type { Product } from '@/types';
import { getProducts } from '@/services/product.service';

const SEARCH_DEBOUNCE_MS = 300;
const SEARCH_RESULTS = 8;

const formatPrice = (value: number | undefined) =>
  value === undefined || value === null || value === 0
    ? '—'
    : `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function stockLabel(product: Product): { label: string; tone: string } {
  if (product.stock <= 0) {
    return {
      label: 'Out of stock',
      tone: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800',
    };
  }
  if (product.lowStock > 0 && product.stock <= product.lowStock) {
    return {
      label: `Low (${product.stock})`,
      tone: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
    };
  }
  return {
    label: `In stock (${product.stock})`,
    tone: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800',
  };
}

interface ProductSearchPickerProps {
  value: string[];
  onChange: (ids: string[]) => void;
  label?: string;
  placeholder?: string;
  helperText?: string;
  max?: number;
  id?: string;
}

export default function ProductSearchPicker({
  value,
  onChange,
  label = 'Products',
  placeholder = 'Search products by name...',
  helperText,
  max,
  id = 'product-search-picker',
}: ProductSearchPickerProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedMapRef = useRef<Map<string, Product>>(new Map());

  const idsKey = useMemo(() => value.join(','), [value]);

  // Restore products for the current selection (only fetches ids we don't know yet)
  useEffect(() => {
    const missing = value.filter((id) => !selectedMapRef.current.has(id));
    if (missing.length === 0) return;
    let active = true;
    setRestoring(true);
    getProducts({ ids: missing, limit: 100 })
      .then((res) => {
        if (!active) return;
        (res.data || []).forEach((p) => selectedMapRef.current.set(p._id, p));
      })
      .catch(() => {
        // Silent: selection ids remain, picker still usable
      })
      .finally(() => {
        if (active) setRestoring(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  const runSearch = useCallback((q: string) => {
    const trimmed = q.trim();
    if (!trimmed) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    getProducts({ search: trimmed, limit: SEARCH_RESULTS })
      .then((res) => {
        setResults(res.data || []);
      })
      .catch(() => {
        setResults([]);
      })
      .finally(() => {
        setSearching(false);
      });
  }, []);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setQuery(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(next), SEARCH_DEBOUNCE_MS);
  };

  const addProduct = (product: Product) => {
    if (value.includes(product._id)) return;
    if (max !== undefined && value.length >= max) return;
    selectedMapRef.current.set(product._id, product);
    onChange([...value, product._id]);
  };

  const removeProduct = (productId: string) => {
    onChange(value.filter((id) => id !== productId));
  };

  const selectedProducts = value
    .map((id) => selectedMapRef.current.get(id))
    .filter((p): p is Product => Boolean(p));

  const atMax = max !== undefined && value.length >= max;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        {label && <label className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</label>}
        {max !== undefined && (
          <span className="text-[11px] text-gray-400 dark:text-gray-500">
            {value.length}/{max} selected
          </span>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <input
          id={id}
          type="text"
          value={query}
          onChange={handleQueryChange}
          placeholder={placeholder}
          className="w-full pl-9 pr-3.5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 text-gray-900 dark:text-gray-100"
        />
      </div>

      {/* Search results */}
      {query.trim() && (
        <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-gray-900">
          {searching ? (
            <div className="px-4 py-3 text-xs text-gray-400 dark:text-gray-500">Searching...</div>
          ) : results.length === 0 ? (
            <div className="px-4 py-3 text-xs text-gray-400 dark:text-gray-500">No products match &quot;{query.trim()}&quot;</div>
          ) : (
            <ul className="max-h-64 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
              {results.map((product) => {
                const selected = value.includes(product._id);
                const stock = stockLabel(product);
                return (
                  <li key={product._id}>
                    <button
                      type="button"
                      onClick={() => addProduct(product)}
                      disabled={selected || (atMax && !selected)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {product.featuredImage ? (
                        <img
                          src={product.featuredImage}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 shrink-0">
                          <Package className="h-5 w-5" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white text-xs truncate">{product.name}</span>
                          <span className="text-[10px] uppercase text-gray-400 font-medium shrink-0">{product.status}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <code className="font-mono text-[10px] text-gray-400 truncate">{product.sku}</code>
                          <span className="text-xs font-semibold text-gray-900 dark:text-white shrink-0">{formatPrice(product.regularPrice)}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium shrink-0 ${stock.tone}`}>{stock.label}</span>
                        </div>
                      </div>
                      {selected ? (
                        <span className="text-[10px] font-medium text-gray-400 shrink-0">Added</span>
                      ) : (
                        <Plus className="h-4 w-4 text-gray-400 shrink-0" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* Selected products */}
      {selectedProducts.length > 0 && (
        <div className="space-y-2">
          <div className="text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Selected ({selectedProducts.length})
          </div>
          <ul className="flex flex-wrap gap-2">
            {selectedProducts.map((product) => (
              <li
                key={product._id}
                className="flex items-center gap-2 pl-1.5 pr-2 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl"
              >
                {product.featuredImage ? (
                  <img
                    src={product.featuredImage}
                    alt={product.name}
                    className="w-7 h-7 rounded-lg object-cover bg-gray-100 dark:bg-gray-800 shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 shrink-0">
                    <Package className="h-4 w-4" />
                  </div>
                )}
                <div className="min-w-0 max-w-48">
                  <div className="text-xs font-medium text-gray-900 dark:text-white truncate">{product.name}</div>
                  <div className="text-[10px] text-gray-400 truncate">
                    {formatPrice(product.regularPrice)} · {product.sku}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeProduct(product._id)}
                  className="p-1 rounded-md text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shrink-0"
                  title="Remove"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {restoring && selectedProducts.length === 0 && (
        <p className="text-[11px] text-gray-400 dark:text-gray-500">Loading selected products...</p>
      )}

      {helperText && <p className="text-[11px] text-gray-400 dark:text-gray-500">{helperText}</p>}
    </div>
  );
}
