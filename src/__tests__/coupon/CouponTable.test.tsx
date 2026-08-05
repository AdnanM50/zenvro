import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import CouponTable from '@/components/admin/CouponTable';
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from '@/services/coupon.service';
import type { Coupon } from '@/types';

jest.mock('@/services/coupon.service', () => ({
  getCoupons: jest.fn(),
  createCoupon: jest.fn(),
  updateCoupon: jest.fn(),
  deleteCoupon: jest.fn(),
}));

const mockedGetCoupons = getCoupons as jest.Mock;
const mockedCreateCoupon = createCoupon as jest.Mock;
const mockedUpdateCoupon = updateCoupon as jest.Mock;
const mockedDeleteCoupon = deleteCoupon as jest.Mock;

function makeCoupon(overrides: Partial<Coupon> = {}): Coupon {
  return {
    _id: 'c-1',
    name: 'Summer Sale',
    code: 'SUMMER10',
    type: 'percentage',
    value: 10,
    minOrderAmount: 50,
    maxDiscountAmount: 25,
    startDate: '2025-06-01',
    endDate: '2025-06-30',
    usageLimit: 100,
    perUserLimit: 1,
    usedCount: 5,
    appliesTo: 'all',
    products: [],
    categories: [],
    status: 'active',
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
    ...overrides,
  };
}

const sampleCoupons: Coupon[] = [
  makeCoupon(),
  makeCoupon({
    _id: 'c-2',
    name: 'Flash Deal',
    code: 'FLASH5',
    type: 'fixed',
    value: 5,
    minOrderAmount: undefined,
    usageLimit: undefined,
    usedCount: 0,
    status: 'inactive',
  }),
];

function successResponse(data: Coupon[], total = data.length) {
  return {
    success: true as const,
    message: 'Coupons fetched',
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

describe('CouponTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetCoupons.mockResolvedValue(successResponse(sampleCoupons));
  });

  describe('header', () => {
    it('renders title, description and Add Coupon button', async () => {
      renderWithClient(<CouponTable />);
      expect(screen.getByText('Coupons')).toBeInTheDocument();
      expect(screen.getByText('Create discount codes, set usage limits and manage promotions.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add coupon/i })).toBeInTheDocument();
    });

    it('renders a search input', () => {
      renderWithClient(<CouponTable />);
      expect(screen.getByPlaceholderText('Search coupons...')).toBeInTheDocument();
    });
  });

  describe('data rendering', () => {
    it('shows an empty message when there are no coupons', async () => {
      mockedGetCoupons.mockResolvedValue(successResponse([]));
      renderWithClient(<CouponTable />);
      expect(await screen.findByText('No coupons found. Add your first coupon!')).toBeInTheDocument();
    });

    it('renders coupon rows with name, code, discount, usage and status', async () => {
      renderWithClient(<CouponTable />);

      expect(await screen.findByText('Summer Sale')).toBeInTheDocument();
      expect(screen.getByText('Flash Deal')).toBeInTheDocument();
      expect(screen.getByText('SUMMER10')).toBeInTheDocument();
      expect(screen.getByText('FLASH5')).toBeInTheDocument();

      expect(screen.getByText('10% off')).toBeInTheDocument();
      expect(screen.getByText('$5.00 off')).toBeInTheDocument();

      expect(screen.getByText('5 / 100')).toBeInTheDocument();
      expect(screen.getByText('0 / ∞')).toBeInTheDocument();

      expect(screen.getByText('$50.00')).toBeInTheDocument();

      expect(screen.getByText('active')).toBeInTheDocument();
      expect(screen.getByText('inactive')).toBeInTheDocument();
    });

    it('shows a spinner while loading', () => {
      mockedGetCoupons.mockReturnValue(new Promise(() => {}));
      const { container } = renderWithClient(<CouponTable />);
      expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('calls getCoupons with search/page/limit params', async () => {
      renderWithClient(<CouponTable />);
      await screen.findByText('Summer Sale');

      fireEvent.change(screen.getByPlaceholderText('Search coupons...'), {
        target: { value: 'summer' },
      });

      await waitFor(() => {
        expect(mockedGetCoupons).toHaveBeenCalledWith(
          expect.objectContaining({ search: 'summer', page: 1, limit: 10 })
        );
      });
    });
  });

  describe('create flow', () => {
    it('opens the create modal and submits a new coupon with full details', async () => {
      mockedCreateCoupon.mockResolvedValue({ success: true, message: 'ok', data: makeCoupon() });
      renderWithClient(<CouponTable />);

      fireEvent.click(screen.getByRole('button', { name: /add coupon/i }));
      expect(screen.getByText('Create New Coupon')).toBeInTheDocument();

      fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Winter Sale' } });
      fireEvent.change(screen.getByLabelText('Code'), { target: { value: 'WINTER20' } });
      fireEvent.change(screen.getByLabelText('Type'), { target: { value: 'fixed' } });
      fireEvent.change(screen.getByLabelText('Value ($)'), { target: { value: '20' } });
      fireEvent.change(screen.getByLabelText('Minimum Order ($)'), { target: { value: '75' } });
      fireEvent.change(screen.getByLabelText('Maximum Discount ($)'), { target: { value: '30' } });
      fireEvent.change(screen.getByLabelText('Usage Limit'), { target: { value: '50' } });
      fireEvent.change(screen.getByLabelText('Per-User Limit'), { target: { value: '1' } });
      fireEvent.change(screen.getByLabelText('Applies To'), { target: { value: 'products' } });
      fireEvent.change(screen.getByLabelText('Products'), { target: { value: 'p-1, p-2' } });

      fireEvent.click(screen.getByRole('button', { name: /create coupon/i }));

      await waitFor(() => {
        expect(mockedCreateCoupon).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Winter Sale',
            code: 'WINTER20',
            type: 'fixed',
            value: 20,
            minOrderAmount: 75,
            maxDiscountAmount: 30,
            usageLimit: 50,
            perUserLimit: 1,
            status: 'active',
            appliesTo: 'products',
            products: ['p-1', 'p-2'],
            categories: [],
          }),
          expect.anything()
        );
      });
    });

    it('submits only the required fields when optional fields are left blank', async () => {
      mockedCreateCoupon.mockResolvedValue({ success: true, message: 'ok', data: makeCoupon() });
      renderWithClient(<CouponTable />);

      fireEvent.click(screen.getByRole('button', { name: /add coupon/i }));
      fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Minimal Coupon' } });
      fireEvent.change(screen.getByLabelText('Code'), { target: { value: 'MIN1' } });
      fireEvent.change(screen.getByLabelText('Value (%)'), { target: { value: '15' } });

      fireEvent.click(screen.getByRole('button', { name: /create coupon/i }));

      await waitFor(() => {
        expect(mockedCreateCoupon).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Minimal Coupon',
            code: 'MIN1',
            type: 'percentage',
            value: 15,
            status: 'active',
            appliesTo: 'all',
            products: [],
            categories: [],
          }),
          expect.anything()
        );
      });
    });
  });

  describe('edit flow', () => {
    it('opens the edit modal prefilled and updates the coupon', async () => {
      mockedUpdateCoupon.mockResolvedValue({ success: true, message: 'ok', data: makeCoupon() });
      renderWithClient(<CouponTable />);

      await screen.findByText('Summer Sale');
      fireEvent.click(screen.getAllByTitle('Edit')[0]);

      expect(screen.getByText('Edit Coupon')).toBeInTheDocument();
      expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe('Summer Sale');
      expect((screen.getByLabelText('Code') as HTMLInputElement).value).toBe('SUMMER10');
      expect((screen.getByLabelText('Value (%)') as HTMLInputElement).value).toBe('10');
      expect((screen.getByLabelText('Status') as HTMLSelectElement).value).toBe('active');

      fireEvent.change(screen.getByLabelText('Value (%)'), { target: { value: '15' } });
      fireEvent.click(screen.getByRole('button', { name: /update coupon/i }));

      await waitFor(() => {
        expect(mockedUpdateCoupon).toHaveBeenCalledWith(
          expect.objectContaining({ _id: 'c-1', value: 15, name: 'Summer Sale' }),
          expect.anything()
        );
      });
    });
  });

  describe('delete flow', () => {
    it('calls deleteCoupon after confirmation', async () => {
      mockedDeleteCoupon.mockResolvedValue({ success: true, message: 'ok', data: null });
      window.confirm = jest.fn(() => true);
      renderWithClient(<CouponTable />);

      await screen.findByText('Summer Sale');
      fireEvent.click(screen.getAllByTitle('Delete')[0]);

      await waitFor(() => {
        expect(mockedDeleteCoupon).toHaveBeenCalledWith('c-1', expect.anything());
      });
    });

    it('does not call deleteCoupon when confirmation is cancelled', async () => {
      window.confirm = jest.fn(() => false);
      renderWithClient(<CouponTable />);

      await screen.findByText('Summer Sale');
      fireEvent.click(screen.getAllByTitle('Delete')[0]);

      await waitFor(() => {
        expect(mockedDeleteCoupon).not.toHaveBeenCalled();
      });
    });
  });
});
