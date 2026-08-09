import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import ProductTable from '@/components/admin/ProductTable';
import { getProducts, deleteProduct } from '@/services/product.service';
import { defaultProductSEO } from '@/types';
import type { Product } from '@/types';

jest.mock('@/services/product.service', () => ({
  getProducts: jest.fn(),
  deleteProduct: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
}));

const mockedGetProducts = getProducts as jest.Mock;
const mockedDeleteProduct = deleteProduct as jest.Mock;

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    _id: 'p-1',
    name: 'Classic Tee',
    slug: 'classic-tee',
    sku: 'TSH-COT-001',
    barcode: '',
    shortDescription: '',
    description: '',
    category: 'cat-1',
    brand: '',
    collection: '',
    tags: [],
    featuredImage: '',
    gallery: [],
    video: '',
    regularPrice: 59.99,
    salePrice: 49.99,
    costPrice: 20,
    stock: 25,
    lowStock: 5,
    sold: 10,
    status: 'active',
    isFeatured: true,
    isNewArrival: false,
    isTrending: false,
    gender: 'unisex',
    material: '',
    careInstruction: '',
    specifications: {},
    variants: [],
    seo: { ...defaultProductSEO },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
    ...overrides,
  };
}

const sampleProducts: Product[] = [
  makeProduct(),
  makeProduct({
    _id: 'p-2',
    name: 'Leather Jacket',
    slug: 'leather-jacket',
    sku: 'JCK-LEA-001',
    category: '',
    regularPrice: 199.99,
    salePrice: undefined,
    costPrice: 80,
    stock: 0,
    lowStock: 3,
    status: 'draft',
    isFeatured: false,
    gender: 'men',
  }),
];

function successResponse(data: Product[], total = data.length) {
  return {
    success: true as const,
    message: 'Products fetched',
    data,
    meta: { page: 1, limit: 10, total, totalPages: Math.ceil(total / 10) || 1 },
  };
}

function renderWithClient(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(ui, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
}

describe('ProductTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetProducts.mockResolvedValue(successResponse(sampleProducts));
  });

  describe('header', () => {
    it('renders title, description and an Add Product link', async () => {
      renderWithClient(<ProductTable />);
      expect(screen.getByText('Products')).toBeInTheDocument();
      expect(screen.getByText('Manage your product catalog, pricing, inventory and SEO.')).toBeInTheDocument();
      const addLink = screen.getByRole('link', { name: /add product/i });
      expect(addLink).toHaveAttribute('href', '/admin/products/create-product');
    });

    it('renders a search input', () => {
      renderWithClient(<ProductTable />);
      expect(screen.getByPlaceholderText('Search products...')).toBeInTheDocument();
    });
  });

  describe('data rendering', () => {
    it('shows an empty message when there are no products', async () => {
      mockedGetProducts.mockResolvedValue(successResponse([]));
      renderWithClient(<ProductTable />);
      expect(await screen.findByText('No products found. Add your first product!')).toBeInTheDocument();
    });

    it('renders product rows with name, sku, category, prices and stock', async () => {
      renderWithClient(<ProductTable />);

      expect(await screen.findByText('Classic Tee')).toBeInTheDocument();
      expect(screen.getByText('Leather Jacket')).toBeInTheDocument();
      expect(screen.getByText('TSH-COT-001')).toBeInTheDocument();
      expect(screen.getByText('JCK-LEA-001')).toBeInTheDocument();

      expect(screen.getByText('cat-1')).toBeInTheDocument();

      expect(screen.getByText('$59.99')).toBeInTheDocument();
      expect(screen.getByText('$199.99')).toBeInTheDocument();
      expect(screen.getByText('$49.99')).toBeInTheDocument();

      expect(screen.getByText('25 in stock')).toBeInTheDocument();
      expect(screen.getByText('Out of stock')).toBeInTheDocument();

      expect(screen.getByText('active')).toBeInTheDocument();
      expect(screen.getByText('draft')).toBeInTheDocument();
    });

    it('shows a featured badge only for featured products', async () => {
      renderWithClient(<ProductTable />);
      await screen.findByText('Classic Tee');
      // 1 badge + 1 column header
      expect(screen.getAllByText('Featured')).toHaveLength(2);
    });

    it('shows a spinner while loading', () => {
      mockedGetProducts.mockReturnValue(new Promise(() => {}));
      const { container } = renderWithClient(<ProductTable />);
      expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('calls getProducts with search/page/limit params', async () => {
      renderWithClient(<ProductTable />);
      await screen.findByText('Classic Tee');

      fireEvent.change(screen.getByPlaceholderText('Search products...'), {
        target: { value: 'tee' },
      });

      await waitFor(() => {
        expect(mockedGetProducts).toHaveBeenCalledWith(
          expect.objectContaining({ search: 'tee', page: 1, limit: 10 })
        );
      });
    });
  });

  describe('navigation links', () => {
    it('links the product name to the edit page', async () => {
      renderWithClient(<ProductTable />);
      await screen.findByText('Classic Tee');
      expect(screen.getByRole('link', { name: 'Classic Tee' })).toHaveAttribute(
        'href',
        '/admin/products/edit/p-1'
      );
    });

    it('links the edit action to the edit page', async () => {
      renderWithClient(<ProductTable />);
      await screen.findByText('Classic Tee');
      const editLinks = screen.getAllByTitle('Edit');
      expect(editLinks).toHaveLength(2);
      expect(editLinks[0]).toHaveAttribute('href', '/admin/products/edit/p-1');
      expect(editLinks[1]).toHaveAttribute('href', '/admin/products/edit/p-2');
    });
  });

  describe('delete flow', () => {
    it('calls deleteProduct after confirmation', async () => {
      mockedDeleteProduct.mockResolvedValue({ success: true, message: 'ok', data: null });
      renderWithClient(<ProductTable />);

      await screen.findByText('Classic Tee');
      fireEvent.click(screen.getAllByTitle('Delete')[0]);

      const confirmButtons = screen.getAllByRole('button', { name: 'Delete' });
      fireEvent.click(confirmButtons[confirmButtons.length - 1]);

      await waitFor(() => {
        expect(mockedDeleteProduct).toHaveBeenCalledWith('p-1', expect.anything());
      });
    });

    it('does not call deleteProduct when confirmation is cancelled', async () => {
      renderWithClient(<ProductTable />);

      await screen.findByText('Classic Tee');
      fireEvent.click(screen.getAllByTitle('Delete')[0]);

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

      await waitFor(() => {
        expect(mockedDeleteProduct).not.toHaveBeenCalled();
      });
    });
  });
});
