import ProductForm from '@/components/admin/ProductForm';

export const metadata = {
  title: 'Create New Product',
};

export default function NewProductPage() {
  return (
    <div className="flex-1 p-4 sm:p-6">
      <ProductForm />
    </div>
  );
}
