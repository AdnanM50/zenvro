'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ProductForm from '@/components/admin/ProductForm';

export default function EditProductPage() {
  const params = useParams();
  const id = params?.id as string;

  return (
    <div className="flex-1 p-4 sm:p-6">
      <ProductForm productId={id} />
    </div>
  );
}

