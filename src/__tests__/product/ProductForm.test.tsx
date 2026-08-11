import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import ProductForm from '@/components/admin/ProductForm';
import {
  getProduct,
  createProduct,
  updateProduct,
} from '@/services/product.service';
import { getCategories } from '@/services/category.service';
import { getBrands } from '@/services/brand.service';
import { getCollections } from '@/services/collection.service';
import { getTags } from '@/services/tag.service';
import { defaultProductSEO } from '@/types';
import type { Product } from '@/types';

jest.mock('@/services/product.service', () => ({
  getProduct: jest.fn(),
  createProduct: jest.fn(),
  updateProduct: jest.fn(),
}));
jest.mock('@/services/category.service', () => ({
  getCategories: jest.fn(),
}));
jest.mock('@/services/brand.service', () => ({
  getBrands: jest.fn(),
}));
jest.mock('@/services/collection.service', () => ({
  getCollections: jest.fn(),
}));
jest.mock('@/services/tag.service', () => ({
  getTags: jest.fn(),
}));

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: jest.fn() }),
}));

const mockedGetProduct = getProduct as jest.Mock;
const mockedCreateProduct = createProduct as jest.Mock;
const mockedUpdateProduct = updateProduct as jest.Mock;
const mockedGetCategories = getCategories as jest.Mock;
const mockedGetBrands = getBrands as jest.Mock;
const mockedGetCollections = getCollections as jest.Mock;
const mockedGetTags = getTags as jest.Mock;

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    _id: 'p-1',
    name: 'Classic Tee',
    slug: 'classic-tee',
    sku: 'TSH-COT-001',
    barcode: '8801234567890',
    shortDescription: '',
    description: '',
    category: 'cat-1',
    brand: '',
    collection: '',
    tags: ['tag-1'],
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
    specifications: { Fit: 'Regular' },
    variants: [],
    seo: { ...defaultProductSEO },
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
    ...overrides,
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

function navigateToFinalStep() {
  fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'New Denim Jacket' } });
  fireEvent.change(screen.getByLabelText('SKU'), { target: { value: 'JCK-NEW-001' } });
  fireEvent.click(screen.getByRole('button', { name: /continue/i }));

  fireEvent.change(screen.getByLabelText('Regular Price ($)'), { target: { value: '149.99' } });
  fireEvent.change(screen.getByLabelText('Stock'), { target: { value: '50' } });
  fireEvent.click(screen.getByRole('button', { name: /continue/i }));
}

describe('ProductForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetCategories.mockResolvedValue({
      success: true,
      message: 'Categories fetched',
      data: [{ _id: 'cat-2', name: 'cat-2' }],
    });
    mockedGetBrands.mockResolvedValue({ success: true, message: 'Brands fetched', data: [] });
    mockedGetCollections.mockResolvedValue({ success: true, message: 'Collections fetched', data: [] });
    mockedGetTags.mockResolvedValue({
      success: true,
      message: 'Tags fetched',
      data: [
        { _id: 'tag-1', name: 'tag-1' },
        { _id: 'tag-2', name: 'tag-2' },
      ],
    });
  });

  describe('create flow', () => {
    it('renders the heading, stepper and a disabled Continue button initially', () => {
      renderWithClient(<ProductForm />);

      expect(screen.getByText('Create New Product')).toBeInTheDocument();
      expect(screen.getByText('Basics & Organization')).toBeInTheDocument();
      expect(screen.getByText('Media & Pricing')).toBeInTheDocument();
      expect(screen.getByText('Attributes & SEO')).toBeInTheDocument();

      const continueButton = screen.getByRole('button', { name: /continue/i });
      expect(continueButton).toBeDisabled();
    });

    it('enables Continue after name and SKU, then navigates to Media & Pricing', () => {
      renderWithClient(<ProductForm />);

      fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Tee' } });
      expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled();

      fireEvent.change(screen.getByLabelText('SKU'), { target: { value: 'TSH-1' } });
      const continueButton = screen.getByRole('button', { name: /continue/i });
      expect(continueButton).toBeEnabled();

      fireEvent.click(continueButton);
      expect(screen.getByLabelText('Regular Price ($)')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled();
    });

    it('disables Continue on the pricing step until price and stock are filled', () => {
      renderWithClient(<ProductForm />);

      fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Tee' } });
      fireEvent.change(screen.getByLabelText('SKU'), { target: { value: 'TSH-1' } });
      fireEvent.click(screen.getByRole('button', { name: /continue/i }));

      fireEvent.change(screen.getByLabelText('Regular Price ($)'), { target: { value: '9.99' } });
      expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled();

      fireEvent.change(screen.getByLabelText('Stock'), { target: { value: '2' } });
      expect(screen.getByRole('button', { name: /continue/i })).toBeEnabled();
    });

    it('submits a new product with full details', async () => {
      mockedCreateProduct.mockResolvedValue({ success: true, message: 'ok', data: makeProduct() });
      renderWithClient(<ProductForm />);

      fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'New Denim Jacket' } });
      fireEvent.change(screen.getByLabelText('SKU'), { target: { value: 'JCK-NEW-001' } });
      fireEvent.change(screen.getByLabelText('Barcode'), { target: { value: '8801234567890' } });
      expect(await screen.findByRole('combobox', { name: 'Category' })).toBeInTheDocument();
      expect(screen.queryByPlaceholderText('Comma separated tags')).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /continue/i }));

      fireEvent.change(screen.getByLabelText('Regular Price ($)'), { target: { value: '149.99' } });
      fireEvent.change(screen.getByLabelText('Sale Price ($)'), { target: { value: '129.99' } });
      fireEvent.change(screen.getByLabelText('Cost Price ($)'), { target: { value: '70' } });
      fireEvent.change(screen.getByLabelText('Stock'), { target: { value: '50' } });
      fireEvent.change(screen.getByLabelText('Low Stock Threshold'), { target: { value: '5' } });
      fireEvent.change(screen.getByLabelText('Sold'), { target: { value: '12' } });
      fireEvent.click(screen.getByRole('button', { name: /continue/i }));

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

      expect(mockPush).toHaveBeenCalledWith('/admin/products');
    });

    it('submits only the required fields when optional fields are left blank', async () => {
      mockedCreateProduct.mockResolvedValue({ success: true, message: 'ok', data: makeProduct() });
      renderWithClient(<ProductForm />);

      navigateToFinalStep();
      fireEvent.click(screen.getByRole('button', { name: /create product/i }));

      await waitFor(() => {
        expect(mockedCreateProduct).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'New Denim Jacket',
            sku: 'JCK-NEW-001',
            regularPrice: 149.99,
            stock: 50,
            status: 'active',
            isFeatured: false,
            gallery: [],
            specifications: {},
          }),
          expect.anything()
        );
      });
    });
  });

  describe('edit flow', () => {
    it('shows a loading state while fetching the product', () => {
      mockedGetProduct.mockReturnValue(new Promise(() => {}));
      renderWithClient(<ProductForm productId="p-1" />);
      expect(screen.getByText('Loading product...')).toBeInTheDocument();
    });

    it('prefills the form with the loaded product', async () => {
      mockedGetProduct.mockResolvedValue({ success: true, message: 'Product fetched', data: makeProduct() });
      renderWithClient(<ProductForm productId="p-1" />);

      expect(await screen.findByDisplayValue('Classic Tee')).toBeInTheDocument();
      expect(screen.getByDisplayValue('TSH-COT-001')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /continue/i }));
      expect(screen.getByDisplayValue('59.99')).toBeInTheDocument();
      expect(screen.getByDisplayValue('25')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /continue/i }));
      expect((screen.getByLabelText('Status') as HTMLSelectElement).value).toBe('active');
    });

    it('updates the product on submit', async () => {
      mockedGetProduct.mockResolvedValue({ success: true, message: 'Product fetched', data: makeProduct() });
      mockedUpdateProduct.mockResolvedValue({ success: true, message: 'ok', data: makeProduct() });
      renderWithClient(<ProductForm productId="p-1" />);

      await screen.findByDisplayValue('Classic Tee');

      fireEvent.click(screen.getByRole('button', { name: /continue/i }));

      fireEvent.change(screen.getByLabelText('Regular Price ($)'), { target: { value: '64.99' } });
      fireEvent.click(screen.getByRole('button', { name: /continue/i }));

      fireEvent.click(screen.getByRole('button', { name: /update product/i }));

      await waitFor(() => {
        expect(mockedUpdateProduct).toHaveBeenCalledWith(
          expect.objectContaining({ _id: 'p-1', name: 'Classic Tee', regularPrice: 64.99, stock: 25 }),
          expect.anything()
        );
      });

      expect(mockPush).toHaveBeenCalledWith('/admin/products');
    });

    it('shows an error state when the product cannot be loaded', async () => {
      mockedGetProduct.mockRejectedValue(new Error('fail'));
      renderWithClient(<ProductForm productId="p-1" />);

      expect(await screen.findByText('Failed to load this product.')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /back to products/i })).toHaveAttribute(
        'href',
        '/admin/products'
      );
    });
  });
});
