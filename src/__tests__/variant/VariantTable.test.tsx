import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import VariantTable from '@/components/admin/VariantTable';
import { getVariants, createVariant, updateVariant, deleteVariant } from '@/services/variant.service';
import { getAttributes } from '@/services/attribute.service';
import type { Variant } from '@/types';

jest.mock('@/services/variant.service', () => ({
  getVariants: jest.fn(),
  createVariant: jest.fn(),
  updateVariant: jest.fn(),
  deleteVariant: jest.fn(),
}));
jest.mock('@/services/attribute.service', () => ({
  getAttributes: jest.fn(),
}));

const mockedGetVariants = getVariants as jest.Mock;
const mockedCreateVariant = createVariant as jest.Mock;
const mockedUpdateVariant = updateVariant as jest.Mock;
const mockedDeleteVariant = deleteVariant as jest.Mock;
const mockedGetAttributes = getAttributes as jest.Mock;

function makeVariant(overrides: Partial<Variant> = {}): Variant {
  return {
    _id: 'v-1',
    sku: 'TSH-BLK-XL',
    attributes: { Color: 'Black', Size: 'XL' },
    price: 49.99,
    salePrice: 39.99,
    stock: 25,
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

function successResponse(data: Variant[], total = data.length) {
  return {
    success: true as const,
    message: 'Variants fetched',
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
    mockedGetVariants.mockResolvedValue(successResponse(sampleVariants));
    mockedGetAttributes.mockResolvedValue({
      success: true,
      message: 'Attributes fetched',
      data: [
        {
          _id: 'attr-color',
          name: 'Color',
          values: ['Black', 'Red'],
          isVariant: true,
          createdAt: new Date('2025-01-15'),
          updatedAt: new Date('2025-01-15'),
        },
        {
          _id: 'attr-size',
          name: 'Size',
          values: ['L', 'XL'],
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
      expect(screen.getByText('Product Variants')).toBeInTheDocument();
      expect(screen.getByText('Manage SKU-level variants such as sizes, colors, pricing and inventory.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add variant/i })).toBeInTheDocument();
    });

    it('renders a search input', () => {
      renderWithClient(<VariantTable />);
      expect(screen.getByPlaceholderText('Search variants...')).toBeInTheDocument();
    });
  });

  describe('data rendering', () => {
    it('shows an empty message when there are no variants', async () => {
      mockedGetVariants.mockResolvedValue(successResponse([]));
      renderWithClient(<VariantTable />);
      expect(await screen.findByText('No variants found. Add your first variant!')).toBeInTheDocument();
    });

    it('renders variant rows with sku, attributes, prices, stock and weight', async () => {
      renderWithClient(<VariantTable />);

      expect(await screen.findByText('TSH-BLK-XL')).toBeInTheDocument();
      expect(screen.getByText('TSH-RED-L')).toBeInTheDocument();

      expect(screen.getByText('Color: Black')).toBeInTheDocument();
      expect(screen.getByText('Size: XL')).toBeInTheDocument();
      expect(screen.getByText('Color: Red')).toBeInTheDocument();
      expect(screen.getByText('Size: L')).toBeInTheDocument();

      expect(screen.getByText('$49.99')).toBeInTheDocument();
      expect(screen.getByText('$59.99')).toBeInTheDocument();
      expect(screen.getByText('$39.99')).toBeInTheDocument();

      expect(screen.getByText('25 in stock')).toBeInTheDocument();
      expect(screen.getByText('Out of stock')).toBeInTheDocument();

      expect(screen.getByText('0.4 kg')).toBeInTheDocument();
      expect(screen.getByText('0.35 kg')).toBeInTheDocument();
    });

    it('shows a spinner while loading', () => {
      mockedGetVariants.mockReturnValue(new Promise(() => {}));
      const { container } = renderWithClient(<VariantTable />);
      expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('calls getVariants with search/page/limit params', async () => {
      renderWithClient(<VariantTable />);
      await screen.findByText('TSH-BLK-XL');

      fireEvent.change(screen.getByPlaceholderText('Search variants...'), {
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

      fireEvent.click(screen.getByRole('button', { name: /add variant/i }));
      expect(screen.getByText('Create New Variant')).toBeInTheDocument();

      fireEvent.change(screen.getByLabelText('SKU'), { target: { value: 'TSH-BLK-XL' } });
      expect(await screen.findByRole('combobox', { name: /select attribute 1/i })).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /add attribute/i }));

      fireEvent.change(screen.getByLabelText('Price ($)'), { target: { value: '49.99' } });
      fireEvent.change(screen.getByLabelText('Sale Price ($)'), { target: { value: '39.99' } });
      fireEvent.change(screen.getByLabelText('Stock'), { target: { value: '25' } });
      fireEvent.change(screen.getByLabelText('Weight (kg)'), { target: { value: '0.4' } });
      fireEvent.change(screen.getByLabelText('Image URL'), { target: { value: 'https://img.com/x.png' } });

      fireEvent.click(screen.getByRole('button', { name: /create variant/i }));

      await waitFor(() => {
        expect(mockedCreateVariant).toHaveBeenCalledWith(
          {
            sku: 'TSH-BLK-XL',
            attributes: {},
            price: 49.99,
            salePrice: 39.99,
            stock: 25,
            image: 'https://img.com/x.png',
            weight: 0.4,
          },
          expect.anything()
        );
      });
    });

    it('removes the last attribute row instead of deleting all rows', async () => {
      renderWithClient(<VariantTable />);
      fireEvent.click(screen.getByRole('button', { name: /add variant/i }));

      const removeButtons = screen.getAllByTitle('Remove attribute');
      expect(removeButtons).toHaveLength(1);
      fireEvent.click(removeButtons[0]);

      expect(screen.getAllByRole('combobox', { name: /select attribute/i })).toHaveLength(1);
    });
  });

  describe('edit flow', () => {
    it('opens the edit modal prefilled and updates the variant', async () => {
      mockedUpdateVariant.mockResolvedValue({ success: true, message: 'ok', data: makeVariant() });
      renderWithClient(<VariantTable />);

      await screen.findByText('TSH-BLK-XL');
      fireEvent.click(screen.getAllByTitle('Edit')[0]);

      expect(screen.getByText('Edit Variant')).toBeInTheDocument();
      expect((screen.getByLabelText('SKU') as HTMLInputElement).value).toBe('TSH-BLK-XL');
      expect((screen.getByLabelText('Stock') as HTMLInputElement).value).toBe('25');

      fireEvent.change(screen.getByLabelText('Price ($)'), { target: { value: '55' } });
      fireEvent.click(screen.getByRole('button', { name: /update variant/i }));

      await waitFor(() => {
        expect(mockedUpdateVariant).toHaveBeenCalledWith(
          expect.objectContaining({ _id: 'v-1', price: 55, sku: 'TSH-BLK-XL' }),
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
      fireEvent.click(screen.getAllByTitle('Delete')[0]);

      const confirmButtons = screen.getAllByRole('button', { name: 'Delete' });
      fireEvent.click(confirmButtons[confirmButtons.length - 1]);

      await waitFor(() => {
        expect(mockedDeleteVariant).toHaveBeenCalledWith('v-1', expect.anything());
      });
    });

    it('does not call deleteVariant when confirmation is cancelled', async () => {
      renderWithClient(<VariantTable />);

      await screen.findByText('TSH-BLK-XL');
      fireEvent.click(screen.getAllByTitle('Delete')[0]);

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

      await waitFor(() => {
        expect(mockedDeleteVariant).not.toHaveBeenCalled();
      });
    });
  });
});
