import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import CategoryFormModal from '@/app/admin/categories/_component/CategoryFormModal';
import type { Category } from '@/types';

const sampleCategories: Category[] = [
  {
    _id: '6a7ac75552ca97fa994d2f72',
    name: 'Electronics',
    slug: 'electronics',
    image: '',
    description: 'Electronic products',
    seo: { title: '', description: '', keywords: [], canonical: '', ogImage: '', robots: 'index' },
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    _id: 'cat-2',
    name: 'Clothing',
    slug: 'clothing',
    image: '',
    description: 'Apparel & Fashion',
    seo: { title: '', description: '', keywords: [], canonical: '', ogImage: '', robots: 'index' },
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
];

function renderWithClient(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe('CategoryFormModal', () => {
  it('displays "None (Root Category)" by default when no parent category is selected', () => {
    renderWithClient(
      <CategoryFormModal
        open={true}
        onClose={jest.fn()}
        onSave={jest.fn()}
        editing={false}
        saving={false}
        error=""
        categories={sampleCategories}
      />
    );

    expect(screen.getAllByText('None (Root Category)').length).toBeGreaterThan(0);
  });

  it('displays the Category NAME instead of the raw ID when a parent category is selected', () => {
    renderWithClient(
      <CategoryFormModal
        open={true}
        onClose={jest.fn()}
        onSave={jest.fn()}
        initialData={{
          name: 'Smartphones',
          parentCategory: '6a7ac75552ca97fa994d2f72',
        }}
        editing={true}
        saving={false}
        error=""
        categories={sampleCategories}
      />
    );

    // Should display the Category Name "Electronics", NOT the raw ID "6a7ac75552ca97fa994d2f72"
    expect(screen.getAllByText('Electronics').length).toBeGreaterThan(0);
    expect(screen.queryByText('6a7ac75552ca97fa994d2f72')).not.toBeInTheDocument();
  });

  it('calls onSave with correct parent category ID when submitted', async () => {
    const handleSave = jest.fn();
    renderWithClient(
      <CategoryFormModal
        open={true}
        onClose={jest.fn()}
        onSave={handleSave}
        initialData={{
          name: 'Smartphones',
          parentCategory: '6a7ac75552ca97fa994d2f72',
        }}
        editing={true}
        saving={false}
        error=""
        categories={sampleCategories}
      />
    );

    const nameInput = screen.getByPlaceholderText('Category name');
    fireEvent.change(nameInput, { target: { value: 'Smartphones' } });

    const submitBtn = screen.getByRole('button', { name: 'Update' });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Smartphones',
          parentCategory: '6a7ac75552ca97fa994d2f72',
        })
      );
    });
  });
});
