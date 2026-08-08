'use client';

import { useState } from 'react';
import type { Category } from '@/types';
import { useApiGet, createQueryKeys } from '@/hooks';
import { getCategories } from '@/services/category.service';
import CategoryTable from '@/app/admin/categories/_component/CategoryTable';

const PAGE_SIZE = 20;

const categoryKeys = createQueryKeys('categories');

export default function AdminCategoriesPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const listParams = {
    page,
    limit: PAGE_SIZE,
    ...(search ? { search } : {}),
  };

  const { data, isLoading } = useApiGet<Category[]>({
    queryKey: categoryKeys.list(listParams),
    queryFn: () => getCategories(listParams),
  });

  const categories = data?.data ?? [];
  const pagination = data?.meta;

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <CategoryTable
      categories={categories}
      loading={isLoading}
      search={search}
      onSearchChange={handleSearch}
      pagination={pagination}
      onPageChange={setPage}
    />
  );
}
