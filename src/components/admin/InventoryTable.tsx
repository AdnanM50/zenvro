'use client';

import React, { useState } from 'react';
import { Boxes, Plus, Trash2, ArrowUpRight, ArrowDownRight, RefreshCw, RotateCcw, AlertTriangle } from 'lucide-react';
import type { InventoryItem, Product } from '@/types';
import { useApiGet, useApiPost, useApiDelete, createQueryKeys } from '@/hooks';
import { getInventoryLogs, createInventoryLog, deleteInventoryLog } from '@/services/inventory.service';
import { getProducts } from '@/services/product.service';
import DataTable, { ColumnDef } from '@/app/admin/_components/common/DataTable';
import Modal from '@/components/ui/Modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const inventoryQueryKeys = createQueryKeys('admin-inventory');
const productQueryKeys = createQueryKeys('admin-products-dropdown');

const MOVEMENT_BADGES: Record<string, { label: string; bg: string; icon: React.ComponentType<{ className?: string }> }> = {
  in: { label: 'Stock In', bg: 'bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800', icon: ArrowUpRight },
  out: { label: 'Stock Out', bg: 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800', icon: ArrowDownRight },
  adjustment: { label: 'Adjustment', bg: 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800', icon: RefreshCw },
  return: { label: 'Return', bg: 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800', icon: RotateCcw },
  damage: { label: 'Damage', bg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800', icon: AlertTriangle },
};

export default function InventoryTable() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [movementFilter, setMovementFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [productId, setProductId] = useState('');
  const [variantSku, setVariantSku] = useState('');
  const [quantity, setQuantity] = useState('');
  const [movementType, setMovementType] = useState<'in' | 'out' | 'adjustment' | 'return' | 'damage'>('in');
  const [note, setNote] = useState('');

  // Fetch Inventory Logs
  const { data: inventoryResponse, isLoading, refetch } = useApiGet<InventoryItem[]>({
    queryKey: inventoryQueryKeys.list({ movementType: movementFilter, page, limit }),
    queryFn: () => getInventoryLogs({ page, limit, movementType: movementFilter || undefined }),
  });

  const logs = inventoryResponse?.data || [];
  const meta = inventoryResponse?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 };

  // Fetch Products for Dropdown
  const { data: productResponse } = useApiGet<Product[]>({
    queryKey: productQueryKeys.list({ limit: 100 }),
    queryFn: () => getProducts({ limit: 100 }),
  });
  const products = productResponse?.data || [];
  const selectedProduct = products.find((p) => p._id === productId);

  // Create Inventory Log Mutation
  const createMutation = useApiPost({
    mutationFn: createInventoryLog,
    invalidateKeys: [inventoryQueryKeys.all, inventoryQueryKeys.lists()],
    successMessage: 'Inventory adjustment logged successfully',
    options: {
      onSuccess: () => {
        closeModal();
        refetch();
      },
    },
  });

  // Delete Inventory Log Mutation
  const deleteMutation = useApiDelete({
    mutationFn: deleteInventoryLog,
    invalidateKeys: [inventoryQueryKeys.all, inventoryQueryKeys.lists()],
    successMessage: 'Inventory log deleted successfully',
    options: {
      onSuccess: () => {
        refetch();
      },
    },
  });

  const resetForm = () => {
    setProductId('');
    setVariantSku('');
    setQuantity('');
    setMovementType('in');
    setNote('');
  };

  const openCreateModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    resetForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return;
    const qtyNum = Number(quantity);
    if (!qtyNum || isNaN(qtyNum)) return;

    createMutation.mutate({
      productId,
      variantSku: variantSku.trim() || undefined,
      quantity: qtyNum,
      movementType,
      note: note.trim() || undefined,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this inventory log record?')) {
      deleteMutation.mutate(id);
    }
  };

  const columns: ColumnDef<InventoryItem>[] = [
    {
      key: 'product',
      header: 'Product / SKU',
      render: (item) => {
        const prod = products.find((p) => p._id === item.productId);
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 shrink-0">
              <Boxes className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-gray-900 dark:text-white truncate">
                {prod ? prod.name : `Product #${item.productId.slice(-6)}`}
              </div>
              <div className="text-[11px] text-gray-400 font-mono">
                {item.variantSku ? `Variant: ${item.variantSku}` : prod?.sku ? `SKU: ${prod.sku}` : `ID: ${item.productId}`}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'movementType',
      header: 'Movement Type',
      render: (item) => {
        const badge = MOVEMENT_BADGES[item.movementType] || { label: item.movementType, bg: 'bg-gray-100 text-gray-700', icon: Boxes };
        const IconComponent = badge.icon;
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}>
            <IconComponent className="h-3 w-3" />
            {badge.label}
          </span>
        );
      },
    },
    {
      key: 'quantity',
      header: 'Quantity',
      render: (item) => {
        const isPositive = item.movementType === 'in' || item.movementType === 'return' || (item.movementType === 'adjustment' && item.quantity > 0);
        return (
          <span className={`font-mono font-bold text-sm ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {isPositive ? `+${item.quantity}` : `${item.quantity}`}
          </span>
        );
      },
    },
    {
      key: 'note',
      header: 'Note / Reason',
      render: (item) => (
        <span className="text-xs text-gray-600 dark:text-gray-400 max-w-[200px] truncate block">
          {typeof item.note === 'string' ? item.note || '—' : JSON.stringify(item.note)}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date & Time',
      render: (item) => (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {new Date(item.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (item) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => handleDelete(item._id)}
            disabled={deleteMutation.isPending}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            title="Delete Log"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Boxes className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            Inventory Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track product stock movements, adjustments, returns, and damaged inventory.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors text-sm shadow-md"
        >
          <Plus className="h-4 w-4" />
          Log Stock Movement
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-100 dark:border-gray-800">
        {[
          { key: '', label: 'All Movements' },
          { key: 'in', label: 'Stock In' },
          { key: 'out', label: 'Stock Out' },
          { key: 'adjustment', label: 'Adjustments' },
          { key: 'return', label: 'Returns' },
          { key: 'damage', label: 'Damage' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setMovementFilter(tab.key);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              movementFilter === tab.key
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={logs}
        isLoading={isLoading}
        emptyMessage="No inventory movement records found."
        pagination={{
          page: meta.page,
          limit: meta.limit,
          total: meta.total,
          totalPages: meta.totalPages,
          onPageChange: setPage,
          onLimitChange: (l) => {
            setLimit(l);
            setPage(1);
          },
        }}
      />

      {/* Log Stock Movement Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title="Record Stock Movement"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="product">Product *</Label>
            <select
              id="product"
              value={productId}
              onChange={(e) => {
                setProductId(e.target.value);
                setVariantSku('');
              }}
              required
              className="w-full mt-1.5 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            >
              <option value="">Select a product...</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} (Stock: {p.stock})
                </option>
              ))}
            </select>
          </div>

          {selectedProduct && selectedProduct.variants && selectedProduct.variants.length > 0 && (
            <div>
              <Label htmlFor="variantSku">Variant SKU (Optional)</Label>
              <select
                id="variantSku"
                value={variantSku}
                onChange={(e) => setVariantSku(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              >
                <option value="">All / Main Stock</option>
                {selectedProduct.variants.map((v) => (
                  <option key={v.sku} value={v.sku}>
                    {v.sku} (Stock: {v.stock})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="movementType">Movement Type *</Label>
              <select
                id="movementType"
                value={movementType}
                onChange={(e) => setMovementType(e.target.value as any)}
                required
                className="w-full mt-1.5 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              >
                <option value="in">Stock In (+)</option>
                <option value="out">Stock Out (-)</option>
                <option value="adjustment">Adjustment (+/-)</option>
                <option value="return">Customer Return (+)</option>
                <option value="damage">Damaged / Expired (-)</option>
              </select>
            </div>

            <div>
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 50 or -10"
                required
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="note">Note / Remarks</Label>
            <Input
              id="note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Restock from supplier invoice #4092"
              className="mt-1.5"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-2 text-xs font-semibold text-white bg-black dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              {createMutation.isPending ? 'Logging...' : 'Submit Movement'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
