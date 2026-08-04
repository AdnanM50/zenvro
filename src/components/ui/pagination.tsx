'use client';

import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  SlidersHorizontal,
} from 'lucide-react';

export interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
  showRangeInfo?: boolean;
  showPageJump?: boolean;
  className?: string;
  itemUnitName?: string;
}

export function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | '...')[] = [1];

  if (current > 3) {
    pages.push('...');
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push('...');
  }

  pages.push(total);
  return pages;
}

export default function Pagination({
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  onLimitChange,
  pageSizeOptions = [10, 25, 50, 100],
  showPageSizeSelector = true,
  showRangeInfo = true,
  showPageJump = true,
  className = '',
  itemUnitName = 'entries',
}: PaginationProps) {
  const [jumpPage, setJumpPage] = useState<string>(String(page));

  useEffect(() => {
    setJumpPage(String(page));
  }, [page]);

  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);
  const pageNumbers = getPageNumbers(page, totalPages);

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetPage = parseInt(jumpPage, 10);
    if (!isNaN(targetPage) && targetPage >= 1 && targetPage <= totalPages) {
      onPageChange(targetPage);
    } else {
      setJumpPage(String(page));
    }
  };

  if (total === 0 && totalPages <= 1) {
    return null;
  }

  return (
    <div
      className={`flex flex-col md:flex-row items-center justify-between gap-4 py-4 px-2 sm:px-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-400 select-none ${className}`}
    >
      {/* Left side: Page Size Selector & Range Summary */}
      <div className="flex flex-wrap items-center gap-4">
        {showPageSizeSelector && onLimitChange && (
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-2.5 py-1.5 transition-all focus-within:ring-2 focus-within:ring-black/10 dark:focus-within:ring-white/10">
            <SlidersHorizontal className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-gray-500 font-medium">Rows per page:</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="bg-transparent font-semibold text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer text-xs"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}

        {showRangeInfo && (
          <div className="text-gray-500 font-medium">
            Showing <span className="font-bold text-gray-900 dark:text-gray-100">{startItem}</span> to{' '}
            <span className="font-bold text-gray-900 dark:text-gray-100">{endItem}</span> of{' '}
            <span className="font-bold text-gray-900 dark:text-gray-100">{total}</span> {itemUnitName}
          </div>
        )}
      </div>

      {/* Right side: Page Navigation & Quick Jump */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Navigation Buttons */}
        <div className="flex items-center gap-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-1 rounded-xl shadow-xs">
          {/* First Page */}
          <button
            type="button"
            onClick={() => onPageChange(1)}
            disabled={page <= 1}
            title="First Page"
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 dark:text-gray-300 transition-colors"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>

          {/* Previous Page */}
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            title="Previous Page"
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 dark:text-gray-300 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1 px-1">
            {pageNumbers.map((p, idx) =>
              p === '...' ? (
                <span key={`dots-${idx}`} className="px-1 text-gray-400 font-bold">
                  ...
                </span>
              ) : (
                <button
                  key={`page-${p}`}
                  type="button"
                  onClick={() => onPageChange(Number(p))}
                  className={`min-w-[28px] h-7 px-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    p === page
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm scale-105'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {p}
                </button>
              )
            )}
          </div>

          {/* Next Page */}
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            title="Next Page"
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 dark:text-gray-300 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Last Page */}
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            disabled={page >= totalPages}
            title="Last Page"
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 dark:text-gray-300 transition-colors"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Page Jump Input */}
        {showPageJump && totalPages > 1 && (
          <form onSubmit={handleJumpSubmit} className="flex items-center gap-1.5">
            <span className="text-gray-500 font-medium hidden sm:inline">Go to:</span>
            <input
              type="text"
              inputMode="numeric"
              value={jumpPage}
              onChange={(e) => setJumpPage(e.target.value)}
              className="w-11 h-8 text-center bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
            />
            <span className="text-gray-400 text-[10px]">/ {totalPages}</span>
          </form>
        )}
      </div>
    </div>
  );
}
