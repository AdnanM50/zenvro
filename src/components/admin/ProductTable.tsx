'use client';

import React, { useState } from 'react';
import { Package, Plus, Edit3, Trash2, Star } from 'lucide-react';
import Link from 'next/link';
import type { Product, ProductStatus } from '@/types';
import { useApiGet, useApiDelete, createQueryKeys } from '@/hooks';
import { getProducts, deleteProduct } from '@/services/product.service';
import DataTable, { ColumnDef } from '@/app/admin/_components/common/DataTable';

const productQueryKeys = createQueryKeys('admin-products');

const formatPrice = (value: number | undefined) =>
  value === undefined || value === null ? '—' : `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function ProductTable() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  const { data: productResponse, isLoading, refetch } = useApiGet<Product[]>({
    queryKey: productQueryKeys.list({ search, page, limit }),
    queryFn: () => getProducts({ page, limit, search }),
  });

  const products = productResponse?.data || [];
  const meta = productResponse?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 };

  const deleteMutation = useApiDelete({
    mutationFn: deleteProduct,
    invalidateKeys: [productQueryKeys.all, productQueryKeys.lists()],
    successMessage: 'Product deleted successfully',
    options: {
      onSuccess: () => {
        refetch();
      },
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate(id);
    }
  };

  const columns: ColumnDef<Product>[] = [
    {
      key: 'name',
      header: 'Product',
      render: (product) => (
        <div className="flex items-center gap-3">
          {product.featuredImage ? (
            <img
              src={product.featuredImage}
              alt={product.name}
              className="w-10 h-10 rounded-lg object-cover bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
              <Package className="h-5 w-5" />
            </div>
          )}
          <div className="min-w-0">
            <Link
              href={`/admin/products/edit/${product._id}`}
              className="font-semibold text-gray-900 dark:text-white truncate hover:text-purple-700 dark:hover:text-purple-400 transition-colors"
            >
              {product.name}
            </Link>
            <code className="font-mono text-[11px] text-gray-400">{product.sku}</code>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (product) =>
        product.category ? (
          <span className="text-gray-700 dark:text-gray-300">{product.category}</span>
        ) : (
          <span className="text-gray-400 text-xs">—</span>
        ),
    },
    {
      key: 'price',
      header: 'Price',
      render: (product) => (
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-gray-900 dark:text-white">{formatPrice(product.regularPrice)}</span>
          {product.salePrice !== undefined && product.salePrice !== null && product.salePrice > 0 && (
            <span className="text-[11px] text-gray-400 line-through">{formatPrice(product.salePrice)}</span>
          )}
        </div>
      ),
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (product) => {
        const label =
          product.stock <= 0
            ? 'Out of stock'
            : product.lowStock > 0 && product.stock <= product.lowStock
              ? `Low stock (${product.stock})`
              : `${product.stock} in stock`;
        const tone =
          product.stock <= 0
            ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
            : product.lowStock > 0 && product.stock <= product.lowStock
              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
              : 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800';
        return (
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${tone}`}>
            {label}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (product) => {
        const tones: Record<ProductStatus, string> = {
          active: 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
          draft: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700',
          archived: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
        };
        return (
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${tones[product.status || 'draft']}`}>
            {product.status || 'draft'}
          </span>
        );
      },
    },
    {
      key: 'featured',
      header: 'Featured',
      align: 'center',
      render: (product) =>
        product.isFeatured ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
            <Star className="h-3.5 w-3.5 fill-current" /> Featured
          </span>
        ) : (
          <span className="text-gray-400 text-xs">—</span>
        ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (product) => new Date(product.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (product) => (
        <div className="flex items-center justify-end gap-1">
          <Link
            href={`/admin/products/edit/${product._id}`}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            title="Edit"
          >
            <Edit3 className="h-4 w-4" />
          </Link>
          <button
            onClick={() => handleDelete(product._id)}
            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      title="Products"
      description="Manage your product catalog, pricing, inventory and SEO."
      columns={columns}
      data={products}
      keyExtractor={(product) => product._id}
      loading={isLoading}
      emptyMessage="No products found. Add your first product!"
      emptyIcon={<Package className="h-10 w-10 mb-2 text-gray-400 opacity-50" />}
      search={{
        value: search,
        onChange: setSearch,
        placeholder: 'Search products...',
      }}
      headerActions={
        <Link
          href="/admin/products/create-product"
          className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-xs"
        >
          <Plus className="h-4 w-4" /> Add Product
        </Link>
      }
      pagination={{
        page: meta.page,
        limit: meta.limit,
        total: meta.total,
        totalPages: meta.totalPages,
        onPageChange: setPage,
        onLimitChange: (newLimit) => {
          setLimit(newLimit);
          setPage(1);
        },
        itemUnitName: 'products',
      }}
    />
  );
}
