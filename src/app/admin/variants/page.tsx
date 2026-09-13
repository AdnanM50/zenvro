import { Suspense } from 'react';
import VariantTable from '@/components/admin/VariantTable';

export default function AdminVariantsPage() {
  return (
    <div className="flex-1 p-4 sm:p-6">
      <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Loading variants...</div>}>
        <VariantTable />
      </Suspense>
    </div>
  );
}
