'use client';

import React from 'react';
import { Search, Loader2, Inbox } from 'lucide-react';
import Pagination, { PaginationProps } from '../../../../components/ui/pagination';

export interface ColumnDef<T> {
  key: string;
  header: React.ReactNode;
  render?: (item: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  title?: string;
  description?: string;
  headerActions?: React.ReactNode;
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onLimitChange?: (limit: number) => void;
    pageSizeOptions?: number[];
    itemUnitName?: string;
  };
  className?: string;
}

export default function DataTable<T>({
  columns,
  data,
  keyExtractor,
  loading = false,
  emptyMessage = 'No data available',
  emptyIcon,
  title,
  description,
  headerActions,
  search,
  pagination,
  className = '',
}: DataTableProps<T>) {
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Header Section */}
      {(title || headerActions || search) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            {title && <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>}
            {description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {search && (
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={search.placeholder || 'Search...'}
                  value={search.value}
                  onChange={(e) => search.onChange(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 text-gray-900 dark:text-gray-100"
                />
              </div>
            )}
            {headerActions}
          </div>
        </div>
      )}

      {/* Main Table Container */}
      <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {columns.map((col) => {
                  const alignClass =
                    col.align === 'center'
                      ? 'text-center'
                      : col.align === 'right'
                      ? 'text-right'
                      : 'text-left';
                  return (
                    <th
                      key={col.key}
                      className={`px-4 py-3.5 font-semibold ${alignClass} ${col.className || ''}`}
                    >
                      {col.header}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs text-gray-700 dark:text-gray-300">
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                      <span className="text-xs text-gray-400 font-medium">Loading data...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      {emptyIcon || <Inbox className="h-10 w-10 mb-2 opacity-50" />}
                      <p className="text-sm font-medium">{emptyMessage}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr
                    key={keyExtractor(item, index)}
                    className="hover:bg-gray-50/80 dark:hover:bg-gray-900/40 transition-colors"
                  >
                    {columns.map((col) => {
                      const alignClass =
                        col.align === 'center'
                          ? 'text-center'
                          : col.align === 'right'
                          ? 'text-right'
                          : 'text-left';
                      return (
                        <td
                          key={col.key}
                          className={`px-4 py-3.5 ${alignClass} ${col.className || ''}`}
                        >
                          {col.render
                            ? col.render(item, index)
                            : (item as Record<string, unknown>)[col.key] as React.ReactNode}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Professional Pagination Footer */}
        {pagination && (
          <Pagination
            page={pagination.page}
            limit={pagination.limit}
            total={pagination.total}
            totalPages={pagination.totalPages}
            onPageChange={pagination.onPageChange}
            onLimitChange={pagination.onLimitChange}
            pageSizeOptions={pagination.pageSizeOptions}
            itemUnitName={pagination.itemUnitName}
          />
        )}
      </div>
    </div>
  );
}
