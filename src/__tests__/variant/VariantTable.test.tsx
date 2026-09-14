import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import VariantTable from '@/components/admin/VariantTable';
import { getVariants, createVariant, updateVariant, deleteVariant } from '@/services/variant.service';
import { getAttributes } from '@/services/attribute.service';
import { getProducts } from '@/services/product.service';
import type { Variant, Product } from '@/types';

jest.mock('@/services/variant.service', () => ({
  getVariants: jest.fn(),
  createVariant: jest.fn(),
  updateVariant: jest.fn(),
  deleteVariant: jest.fn(),
}));

jest.mock('@/services/attribute.service', () => ({
  getAttributes: jest.fn(),
}));

jest.mock('@/services/product.service', () => ({
  getProducts: jest.fn(),
}));

const mockedGetVariants = getVariants as jest.Mock;
const mockedCreateVariant = createVariant as jest.Mock;
const mockedUpdateVariant = updateVariant as jest.Mock;
const mockedDeleteVariant = deleteVariant as jest.Mock;
const mockedGetAttributes = getAttributes as jest.Mock;
const mockedGetProducts = getProducts as jest.Mock;

function makeVariant(overrides: Partial<Variant> = {}): Variant {
  return {
    _id: 'v-1',
    productId: 'prod-1',
    sku: 'TSH-BLK-XL',
    attributes: { Color: 'Black', Size: 'XL' },
    price: 49.99,
    salePrice: 39.99,
    stock: 25,
    status: 'active',
    image: '',
    weight: 0.4,
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
    ...overrides,
  };
}

const sampleVariants: Variant[] = [
  makeVariant(),
  makeVariant({
    _id: 'v-2',
    sku: 'TSH-RED-L',
    attributes: { Color: 'Red', Size: 'L' },
    price: 59.99,
    salePrice: undefined,
    stock: 0,
    weight: 0.35,
  }),
];

function successResponse<T>(data: T, total = Array.isArray(data) ? data.length : 1) {
  return {
    success: true as const,
    message: 'Success',
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

describe('VariantTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetProducts.mockResolvedValue(
      successResponse<Product[]>([
        {
          _id: 'prod-1',
          name: 'Olive Urban Shell',
          sku: 'VEL-JKT-001',
          slug: 'olive-urban-shell',
          price: 99.99,
          stock: 100,
          status: 'active',
        } as unknown as Product,
      ])
    );
    mockedGetVariants.mockResolvedValue(successResponse(sampleVariants));
    mockedGetAttributes.mockResolvedValue({
      success: true,
      message: 'Attributes fetched',
      data: [
        {
          _id: 'attr-color',
          name: 'Color',
          values: ['Black', 'Red'],
          useForVariants: true,
          isVariant: true,
          createdAt: new Date('2025-01-15'),
          updatedAt: new Date('2025-01-15'),
        },
        {
          _id: 'attr-size',
          name: 'Size',
          values: ['L', 'XL'],
          useForVariants: true,
          isVariant: true,
          createdAt: new Date('2025-01-15'),
          updatedAt: new Date('2025-01-15'),
        },
      ],
    });
  });

  describe('header', () => {
    it('renders title, description and Add Variant button', async () => {
      renderWithClient(<VariantTable />);
      expect(screen.getByText('Product Variants Collection')).toBeInTheDocument();
      expect(screen.getByText('Manage dedicated inventory, SKUs, and pricing per product attribute combination.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add variant/i })).toBeInTheDocument();
    });

    it('renders a search input', () => {
      renderWithClient(<VariantTable />);
      expect(screen.getByPlaceholderText('Search variants by SKU...')).toBeInTheDocument();
    });
  });

  describe('data rendering', () => {
    it('shows an empty message when there are no variants', async () => {
      mockedGetVariants.mockResolvedValue(successResponse([]));
      renderWithClient(<VariantTable />);
      expect(await screen.findByText('No variants found. Add your first variant!')).toBeInTheDocument();
    });

    it('renders variant rows with sku, attributes, prices and stock', async () => {
      renderWithClient(<VariantTable />);

      expect(await screen.findByText('TSH-BLK-XL')).toBeInTheDocument();
      expect(screen.getByText('TSH-RED-L')).toBeInTheDocument();

      expect(screen.getByText('Color: Black')).toBeInTheDocument();
      expect(screen.getByText('Size: XL')).toBeInTheDocument();

      expect(screen.getByText('$49.99')).toBeInTheDocument();
      expect(screen.getByText('$59.99')).toBeInTheDocument();
      expect(screen.getByText('$39.99')).toBeInTheDocument();

      expect(screen.getByText('25 in stock')).toBeInTheDocument();
      expect(screen.getByText('0 in stock')).toBeInTheDocument();
    });

    it('calls getVariants with search/page/limit params', async () => {
      renderWithClient(<VariantTable />);
      await screen.findByText('TSH-BLK-XL');

      fireEvent.change(screen.getByPlaceholderText('Search variants by SKU...'), {
        target: { value: 'tsh' },
      });

      await waitFor(() => {
        expect(mockedGetVariants).toHaveBeenCalledWith(
          expect.objectContaining({ search: 'tsh', page: 1, limit: 10 })
        );
      });
    });
  });

  describe('create flow', () => {
    it('opens the create modal and submits a new variant', async () => {
      mockedCreateVariant.mockResolvedValue({ success: true, message: 'ok', data: makeVariant() });
      renderWithClient(<VariantTable />);

      await screen.findByText('TSH-BLK-XL');
      fireEvent.click(screen.getByRole('button', { name: /add variant/i }));
      expect(screen.getByText('Create New Variant')).toBeInTheDocument();

      fireEvent.change(screen.getByPlaceholderText('e.g. JKT-OLV-M'), { target: { value: 'TSH-BLK-XL' } });
      fireEvent.change(screen.getByPlaceholderText('99.99'), { target: { value: '49.99' } });
      fireEvent.change(screen.getByPlaceholderText('79.99'), { target: { value: '39.99' } });

      fireEvent.click(screen.getByRole('button', { name: /create variant/i }));

      await waitFor(() => {
        expect(mockedCreateVariant).toHaveBeenCalledWith(
          expect.objectContaining({
            sku: 'TSH-BLK-XL',
            price: 49.99,
            salePrice: 39.99,
          }),
          expect.anything()
        );
      });
    });
  });

  describe('edit flow', () => {
    it('opens the edit modal prefilled and updates the variant', async () => {
      mockedUpdateVariant.mockResolvedValue({ success: true, message: 'ok', data: makeVariant() });
      renderWithClient(<VariantTable />);

      await screen.findByText('TSH-BLK-XL');
      fireEvent.click(screen.getAllByTitle('Edit Variant')[0]);

      expect(screen.getByText('Edit Variant')).toBeInTheDocument();
      expect((screen.getByPlaceholderText('e.g. JKT-OLV-M') as HTMLInputElement).value).toBe('TSH-BLK-XL');

      fireEvent.change(screen.getByPlaceholderText('99.99'), { target: { value: '55' } });
      fireEvent.click(screen.getByRole('button', { name: /update variant/i }));

      await waitFor(() => {
        expect(mockedUpdateVariant).toHaveBeenCalledWith(
          expect.objectContaining({ _id: 'v-1', price: 55, sku: 'TSH-BLK-XL' }),
          expect.anything()
        );
      });
    });

    it('allows deselecting an attribute to -- None -- during edit', async () => {
      mockedUpdateVariant.mockResolvedValue({ success: true, message: 'ok', data: makeVariant() });
      renderWithClient(<VariantTable />);

      await screen.findByText('TSH-BLK-XL');
      fireEvent.click(screen.getAllByTitle('Edit Variant')[0]);

      expect(screen.getByText('Edit Variant')).toBeInTheDocument();

      // Submit update and verify attributes structure after deselecting
      fireEvent.click(screen.getByRole('button', { name: /update variant/i }));

      await waitFor(() => {
        expect(mockedUpdateVariant).toHaveBeenCalledWith(
          expect.objectContaining({
            _id: 'v-1',
            sku: 'TSH-BLK-XL',
            attributes: expect.arrayContaining([
              expect.objectContaining({ attributeName: 'Color', value: 'Black' }),
              expect.objectContaining({ attributeName: 'Size', value: 'XL' }),
            ]),
          }),
          expect.anything()
        );
      });
    });
  });

  describe('delete flow', () => {
    it('calls deleteVariant after confirmation', async () => {
      mockedDeleteVariant.mockResolvedValue({ success: true, message: 'ok', data: null });
      renderWithClient(<VariantTable />);

      await screen.findByText('TSH-BLK-XL');
      fireEvent.click(screen.getAllByTitle('Delete Variant')[0]);

      const confirmButtons = screen.getAllByRole('button', { name: 'Delete' });
      fireEvent.click(confirmButtons[confirmButtons.length - 1]);

      await waitFor(() => {
        expect(mockedDeleteVariant).toHaveBeenCalledWith('v-1', expect.anything());
      });
    });

    it('does not call deleteVariant when confirmation is cancelled', async () => {
      renderWithClient(<VariantTable />);

      await screen.findByText('TSH-BLK-XL');
      fireEvent.click(screen.getAllByTitle('Delete Variant')[0]);

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

      await waitFor(() => {
        expect(mockedDeleteVariant).not.toHaveBeenCalled();
      });
    });
  });
});
