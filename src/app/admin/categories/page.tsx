'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Category } from '@/types';
import CategoryTable from '@/components/admin/CategoryTable';

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const PAGE_SIZE = 20;

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 });

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
      if (search) params.set('search', search);
      const res = await fetch(`/api/admin/categories?${params}`);
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
        setPagination(data.meta);
      }
    } catch {
      console.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <CategoryTable
      categories={categories}
      loading={loading}
      search={search}
      onSearchChange={handleSearch}
      pagination={pagination}
      onPageChange={setPage}
      onRefresh={fetchCategories}
    />
  );
}
