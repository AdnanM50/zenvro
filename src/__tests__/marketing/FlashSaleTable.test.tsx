import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import FlashSaleTable from '@/app/admin/marketing/flash-sales/_components/FlashSaleTable';
import {
  getFlashSales,
  createFlashSale,
  updateFlashSale,
  deleteFlashSale,
} from '@/services/flash-sale.service';
import type { FlashSale } from '@/types';
import { getProducts } from '@/services/product.service';

jest.mock('@/services/flash-sale.service', () => ({
  getFlashSales: jest.fn(),
  createFlashSale: jest.fn(),
  updateFlashSale: jest.fn(),
  deleteFlashSale: jest.fn(),
}));

jest.mock('@/services/product.service', () => ({
  getProducts: jest.fn(),
}));

const mockedGetFlashSales = getFlashSales as jest.Mock;
const mockedCreateFlashSale = createFlashSale as jest.Mock;
const mockedUpdateFlashSale = updateFlashSale as jest.Mock;
const mockedDeleteFlashSale = deleteFlashSale as jest.Mock;
const mockedGetProducts = getProducts as jest.Mock;

const mockProducts = [
  { _id: 'p-1', name: 'Classic Tee', sku: 'SKU-1', status: 'active', regularPrice: 20, salePrice: 0, stock: 10, lowStock: 2, featuredImage: '' },
  { _id: 'p-2', name: 'Denim Jacket', sku: 'SKU-2', status: 'active', regularPrice: 60, salePrice: 0, stock: 0, lowStock: 5, featuredImage: '' },
];

function makeSale(overrides: Partial<FlashSale> = {}): FlashSale {
  return {
    _id: 'fs-1',
    title: '24 Hour Flash Sale',
    description: 'Huge discounts',
    discountType: 'percentage',
    discountValue: 25,
    startsAt: '2025-06-01T00:00',
    endsAt: '2025-06-02T00:00',
    productIds: ['p-1', 'p-2', 'p-3'],
    showOnHome: true,
    sortOrder: 0,
    status: 'active',
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
    ...overrides,
  };
}

const sampleSales: FlashSale[] = [
  makeSale(),
  makeSale({
    _id: 'fs-2',
    title: 'Weekend Deal',
    description: '',
    discountType: 'fixed',
    discountValue: 10,
    startsAt: '2025-07-01T00:00',
    endsAt: '2025-07-03T00:00',
    productIds: [],
    showOnHome: false,
    sortOrder: 1,
    status: 'scheduled',
  }),
];

function successResponse(data: FlashSale[], total = data.length) {
  return {
    success: true as const,
    message: 'Flash sales fetched',
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

describe('FlashSaleTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetFlashSales.mockResolvedValue(successResponse(sampleSales));
    mockedGetProducts.mockResolvedValue({
      success: true,
      message: 'Products fetched',
      data: mockProducts,
      meta: { page: 1, limit: 8, total: mockProducts.length, totalPages: 1 },
    });
  });

  describe('header', () => {
    it('renders title, description and Add Flash Sale button', async () => {
      renderWithClient(<FlashSaleTable />);
      expect(screen.getByText('Flash Sales')).toBeInTheDocument();
      expect(screen.getByText('Create timed discounts with products and home page placement.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add flash sale/i })).toBeInTheDocument();
    });

    it('renders a search input', () => {
      renderWithClient(<FlashSaleTable />);
      expect(screen.getByPlaceholderText('Search flash sales...')).toBeInTheDocument();
    });
  });

  describe('data rendering', () => {
    it('shows an empty message when there are no flash sales', async () => {
      mockedGetFlashSales.mockResolvedValue(successResponse([]));
      renderWithClient(<FlashSaleTable />);
      expect(await screen.findByText('No flash sales found. Add your first flash sale!')).toBeInTheDocument();
    });

    it('renders flash sale rows with title, discount, products, home and status', async () => {
      renderWithClient(<FlashSaleTable />);

      expect(await screen.findByText('24 Hour Flash Sale')).toBeInTheDocument();
      expect(screen.getByText('Weekend Deal')).toBeInTheDocument();
      expect(screen.getByText('Huge discounts')).toBeInTheDocument();

      expect(screen.getByText('25% off')).toBeInTheDocument();
      expect(screen.getByText('$10.00 off')).toBeInTheDocument();

      expect(screen.getByText('3')).toBeInTheDocument();

      expect(screen.getByText('Yes')).toBeInTheDocument();
      expect(screen.getByText('No')).toBeInTheDocument();

      expect(screen.getByText('active')).toBeInTheDocument();
      expect(screen.getByText('scheduled')).toBeInTheDocument();
    });

    it('shows a spinner while loading', () => {
      mockedGetFlashSales.mockReturnValue(new Promise(() => {}));
      const { container } = renderWithClient(<FlashSaleTable />);
      expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('calls getFlashSales with search/page/limit params', async () => {
      renderWithClient(<FlashSaleTable />);
      await screen.findByText('24 Hour Flash Sale');

      fireEvent.change(screen.getByPlaceholderText('Search flash sales...'), {
        target: { value: 'deal' },
      });

      await waitFor(() => {
        expect(mockedGetFlashSales).toHaveBeenCalledWith(
          expect.objectContaining({ search: 'deal', page: 1, limit: 10 })
        );
      });
    });
  });

  describe('create flow', () => {
    it('opens the create modal and submits a new flash sale with full details', async () => {
      mockedCreateFlashSale.mockResolvedValue({ success: true, message: 'ok', data: makeSale() });
      renderWithClient(<FlashSaleTable />);

      fireEvent.click(screen.getByRole('button', { name: /add flash sale/i }));
      expect(screen.getByText('Create New Flash Sale')).toBeInTheDocument();

      fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Mega Deal' } });
      fireEvent.change(screen.getByLabelText('Discount Type'), { target: { value: 'fixed' } });
      fireEvent.change(screen.getByLabelText('Discount Value ($)'), { target: { value: '15' } });
      fireEvent.change(screen.getByLabelText('Starts At'), { target: { value: '2025-08-01T00:00' } });
      fireEvent.change(screen.getByLabelText('Ends At'), { target: { value: '2025-08-02T00:00' } });
      fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'active' } });
      fireEvent.change(screen.getByPlaceholderText('Search products by name...'), { target: { value: 'tee' } });
      await screen.findByText('Classic Tee');
      fireEvent.click(screen.getByText('Classic Tee'));
      await screen.findByText('Denim Jacket');
      fireEvent.click(screen.getByText('Denim Jacket'));
      fireEvent.change(screen.getByLabelText('Sort Order'), { target: { value: '3' } });

      fireEvent.click(screen.getByRole('button', { name: /create flash sale/i }));

      await waitFor(() => {
        expect(mockedCreateFlashSale).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Mega Deal',
            description: undefined,
            discountType: 'fixed',
            discountValue: 15,
            startsAt: '2025-08-01T00:00',
            endsAt: '2025-08-02T00:00',
            status: 'active',
            productIds: ['p-1', 'p-2'],
            showOnHome: false,
            sortOrder: 3,
          }),
          expect.anything()
        );
      });
    });

    it('submits only the required fields with sane defaults when optional fields are left blank', async () => {
      mockedCreateFlashSale.mockResolvedValue({ success: true, message: 'ok', data: makeSale() });
      renderWithClient(<FlashSaleTable />);

      fireEvent.click(screen.getByRole('button', { name: /add flash sale/i }));
      fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Minimal Sale' } });
      fireEvent.change(screen.getByLabelText('Discount Value (%)'), { target: { value: '20' } });
      fireEvent.change(screen.getByLabelText('Starts At'), { target: { value: '2025-09-01T00:00' } });
      fireEvent.change(screen.getByLabelText('Ends At'), { target: { value: '2025-09-02T00:00' } });

      fireEvent.click(screen.getByRole('button', { name: /create flash sale/i }));

      await waitFor(() => {
        expect(mockedCreateFlashSale).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Minimal Sale',
            discountType: 'percentage',
            discountValue: 20,
            status: 'inactive',
            productIds: [],
            showOnHome: false,
            sortOrder: 0,
          }),
          expect.anything()
        );
      });
    });

    it('does not submit an invalid sale (end before start)', async () => {
      renderWithClient(<FlashSaleTable />);

      fireEvent.click(screen.getByRole('button', { name: /add flash sale/i }));
      fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Bad Sale' } });
      fireEvent.change(screen.getByLabelText('Discount Value (%)'), { target: { value: '10' } });
      fireEvent.change(screen.getByLabelText('Starts At'), { target: { value: '2025-09-02T00:00' } });
      fireEvent.change(screen.getByLabelText('Ends At'), { target: { value: '2025-09-01T00:00' } });

      fireEvent.click(screen.getByRole('button', { name: /create flash sale/i }));

      await waitFor(() => {
        expect(mockedCreateFlashSale).not.toHaveBeenCalled();
      });
    });
  });

  describe('edit flow', () => {
    it('opens the edit modal prefilled and updates the flash sale', async () => {
      mockedUpdateFlashSale.mockResolvedValue({ success: true, message: 'ok', data: makeSale() });
      renderWithClient(<FlashSaleTable />);

      await screen.findByText('24 Hour Flash Sale');
      fireEvent.click(screen.getAllByTitle('Edit')[0]);

      expect(screen.getByText('Edit Flash Sale')).toBeInTheDocument();
      expect((screen.getByLabelText('Title') as HTMLInputElement).value).toBe('24 Hour Flash Sale');
      expect((screen.getByLabelText('Discount Value (%)') as HTMLInputElement).value).toBe('25');
      expect((screen.getByLabelText('Status') as HTMLSelectElement).value).toBe('active');
      await screen.findByText('Classic Tee');

      fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Updated Sale' } });
      fireEvent.click(screen.getByRole('button', { name: /update flash sale/i }));

      await waitFor(() => {
        expect(mockedUpdateFlashSale).toHaveBeenCalledWith(
          expect.objectContaining({ _id: 'fs-1', title: 'Updated Sale' }),
          expect.anything()
        );
      });
    });
  });

  describe('delete flow', () => {
    it('calls deleteFlashSale after confirmation', async () => {
      mockedDeleteFlashSale.mockResolvedValue({ success: true, message: 'ok', data: null });
      renderWithClient(<FlashSaleTable />);

      await screen.findByText('24 Hour Flash Sale');
      fireEvent.click(screen.getAllByTitle('Delete')[0]);

      const confirmButtons = screen.getAllByRole('button', { name: 'Delete' });
      fireEvent.click(confirmButtons[confirmButtons.length - 1]);

      await waitFor(() => {
        expect(mockedDeleteFlashSale).toHaveBeenCalledWith('fs-1', expect.anything());
      });
    });

    it('does not call deleteFlashSale when confirmation is cancelled', async () => {
      renderWithClient(<FlashSaleTable />);

      await screen.findByText('24 Hour Flash Sale');
      fireEvent.click(screen.getAllByTitle('Delete')[0]);

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

      await waitFor(() => {
        expect(mockedDeleteFlashSale).not.toHaveBeenCalled();
      });
    });
  });
});
