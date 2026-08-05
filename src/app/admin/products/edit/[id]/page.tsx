import ProductForm from '@/components/admin/ProductForm';

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  return (
    <div className="flex-1 p-4 sm:p-6">
      <ProductForm productId={id} />
    </div>
  );
}
