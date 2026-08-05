import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import ProductTable from '@/components/admin/ProductTable';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '@/services/product.service';
import { defaultProductSEO } from '@/types';
import type { Product } from '@/types';

jest.mock('@/services/product.service', () => ({
  getProducts: jest.fn(),
  createProduct: jest.fn(),
  updateProduct: jest.fn(),
  deleteProduct: jest.fn(),
}));

const mockedGetProducts = getProducts as jest.Mock;
const mockedCreateProduct = createProduct as jest.Mock;
const mockedUpdateProduct = updateProduct as jest.Mock;
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
    it('renders title, description and Add Product button', async () => {
      renderWithClient(<ProductTable />);
      expect(screen.getByText('Products')).toBeInTheDocument();
      expect(screen.getByText('Manage your product catalog, pricing, inventory and SEO.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add product/i })).toBeInTheDocument();
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

  describe('create flow', () => {
    it('opens the create modal and submits a new product with full details', async () => {
      mockedCreateProduct.mockResolvedValue({ success: true, message: 'ok', data: makeProduct() });
      renderWithClient(<ProductTable />);

      fireEvent.click(screen.getByRole('button', { name: /add product/i }));
      expect(screen.getByText('Create New Product')).toBeInTheDocument();

      fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'New Denim Jacket' } });
      fireEvent.change(screen.getByLabelText('SKU'), { target: { value: 'JCK-NEW-001' } });
      fireEvent.change(screen.getByLabelText('Barcode'), { target: { value: '8801234567890' } });
      fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'cat-2' } });
      fireEvent.change(screen.getByLabelText('Tags'), { target: { value: 'tag-1, tag-2' } });
      fireEvent.change(screen.getByLabelText('Regular Price ($)'), { target: { value: '149.99' } });
      fireEvent.change(screen.getByLabelText('Sale Price ($)'), { target: { value: '129.99' } });
      fireEvent.change(screen.getByLabelText('Cost Price ($)'), { target: { value: '70' } });
      fireEvent.change(screen.getByLabelText('Stock'), { target: { value: '50' } });
      fireEvent.change(screen.getByLabelText('Low Stock Threshold'), { target: { value: '5' } });
      fireEvent.change(screen.getByLabelText('Sold'), { target: { value: '12' } });

      fireEvent.click(screen.getByLabelText('Featured'));
      fireEvent.click(screen.getByLabelText('Trending'));

      fireEvent.change(screen.getByPlaceholderText('e.g. Material'), { target: { value: 'Material' } });
      fireEvent.change(screen.getByPlaceholderText('e.g. Cotton'), { target: { value: 'Denim' } });

      fireEvent.change(screen.getByLabelText('Variants (JSON array)'), {
        target: { value: '[{"sku":"JCK-NEW-BLK","price":149.99,"stock":5}]' },
      });

      fireEvent.change(screen.getByLabelText('SEO Title'), { target: { value: 'New Denim Jacket' } });

      fireEvent.click(screen.getByRole('button', { name: /create product/i }));

      await waitFor(() => {
        expect(mockedCreateProduct).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'New Denim Jacket',
            sku: 'JCK-NEW-001',
            barcode: '8801234567890',
            category: 'cat-2',
            tags: ['tag-1', 'tag-2'],
            regularPrice: 149.99,
            salePrice: 129.99,
            costPrice: 70,
            stock: 50,
            lowStock: 5,
            sold: 12,
            status: 'active',
            isFeatured: true,
            isTrending: true,
            specifications: { Material: 'Denim' },
            variants: [{ sku: 'JCK-NEW-BLK', price: 149.99, stock: 5 }],
            seo: expect.objectContaining({ title: 'New Denim Jacket' }),
          }),
          expect.anything()
        );
      });
    });

    it('submits only the required fields when optional fields are left blank', async () => {
      mockedCreateProduct.mockResolvedValue({ success: true, message: 'ok', data: makeProduct() });
      renderWithClient(<ProductTable />);

      fireEvent.click(screen.getByRole('button', { name: /add product/i }));
      fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Minimal Product' } });
      fireEvent.change(screen.getByLabelText('SKU'), { target: { value: 'MIN-001' } });
      fireEvent.change(screen.getByLabelText('Regular Price ($)'), { target: { value: '9.99' } });
      fireEvent.change(screen.getByLabelText('Stock'), { target: { value: '2' } });

      fireEvent.click(screen.getByRole('button', { name: /create product/i }));

      await waitFor(() => {
        expect(mockedCreateProduct).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Minimal Product',
            sku: 'MIN-001',
            regularPrice: 9.99,
            stock: 2,
            status: 'active',
            isFeatured: false,
            gallery: [],
            specifications: {},
          }),
          expect.anything()
        );
      });
    });

    it('removes the last specification row instead of deleting all rows', async () => {
      renderWithClient(<ProductTable />);
      fireEvent.click(screen.getByRole('button', { name: /add product/i }));

      const removeButtons = screen.getAllByTitle('Remove specification');
      expect(removeButtons).toHaveLength(1);
      fireEvent.click(removeButtons[0]);

      expect(screen.getAllByPlaceholderText('e.g. Material')).toHaveLength(1);
    });
  });

  describe('edit flow', () => {
    it('opens the edit modal prefilled and updates the product', async () => {
      mockedUpdateProduct.mockResolvedValue({ success: true, message: 'ok', data: makeProduct() });
      renderWithClient(<ProductTable />);

      await screen.findByText('Classic Tee');
      fireEvent.click(screen.getAllByTitle('Edit')[0]);

      expect(screen.getByText('Edit Product')).toBeInTheDocument();
      expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe('Classic Tee');
      expect((screen.getByLabelText('SKU') as HTMLInputElement).value).toBe('TSH-COT-001');
      expect((screen.getByLabelText('Regular Price ($)') as HTMLInputElement).value).toBe('59.99');
      expect((screen.getByLabelText('Stock') as HTMLInputElement).value).toBe('25');
      expect((screen.getByLabelText('Status') as HTMLSelectElement).value).toBe('active');

      fireEvent.change(screen.getByLabelText('Regular Price ($)'), { target: { value: '64.99' } });
      fireEvent.click(screen.getByRole('button', { name: /update product/i }));

      await waitFor(() => {
        expect(mockedUpdateProduct).toHaveBeenCalledWith(
          expect.objectContaining({ _id: 'p-1', regularPrice: 64.99, name: 'Classic Tee' }),
          expect.anything()
        );
      });
    });
  });

  describe('delete flow', () => {
    it('calls deleteProduct after confirmation', async () => {
      mockedDeleteProduct.mockResolvedValue({ success: true, message: 'ok', data: null });
      window.confirm = jest.fn(() => true);
      renderWithClient(<ProductTable />);

      await screen.findByText('Classic Tee');
      fireEvent.click(screen.getAllByTitle('Delete')[0]);

      await waitFor(() => {
        expect(mockedDeleteProduct).toHaveBeenCalledWith('p-1', expect.anything());
      });
    });

    it('does not call deleteProduct when confirmation is cancelled', async () => {
      window.confirm = jest.fn(() => false);
      renderWithClient(<ProductTable />);

      await screen.findByText('Classic Tee');
      fireEvent.click(screen.getAllByTitle('Delete')[0]);

      await waitFor(() => {
        expect(mockedDeleteProduct).not.toHaveBeenCalled();
      });
    });
  });
});
