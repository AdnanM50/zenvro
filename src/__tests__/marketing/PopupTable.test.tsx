import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import PopupTable from '@/app/admin/marketing/popups/_components/PopupTable';
import {
  getPopupBanners,
  createPopupBanner,
  updatePopupBanner,
  deletePopupBanner,
} from '@/services/popup.service';
import type { PopupBanner } from '@/types';

jest.mock('@/services/popup.service', () => ({
  getPopupBanners: jest.fn(),
  createPopupBanner: jest.fn(),
  updatePopupBanner: jest.fn(),
  deletePopupBanner: jest.fn(),
}));

const mockedGetPopupBanners = getPopupBanners as jest.Mock;
const mockedCreatePopupBanner = createPopupBanner as jest.Mock;
const mockedUpdatePopupBanner = updatePopupBanner as jest.Mock;
const mockedDeletePopupBanner = deletePopupBanner as jest.Mock;

function makeBanner(overrides: Partial<PopupBanner> = {}): PopupBanner {
  return {
    _id: 'b-1',
    title: 'New Season',
    description: 'Great deals',
    imageUrl: '',
    buttonText: 'Shop Now',
    buttonLink: '/products',
    startDate: '2025-06-01',
    endDate: '2025-06-30',
    status: 'active',
    sortOrder: 0,
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
    ...overrides,
  };
}

const sampleBanners: PopupBanner[] = [
  makeBanner(),
  makeBanner({
    _id: 'b-2',
    title: 'Flash Announcement',
    description: '',
    startDate: undefined,
    endDate: undefined,
    status: 'inactive',
    sortOrder: 1,
  }),
];

function successResponse(data: PopupBanner[], total = data.length) {
  return {
    success: true as const,
    message: 'Popup banners fetched',
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

describe('PopupTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetPopupBanners.mockResolvedValue(successResponse(sampleBanners));
  });

  describe('header', () => {
    it('renders title, description and Add Popup Banner button', async () => {
      renderWithClient(<PopupTable />);
      expect(screen.getByText('Popup Banners')).toBeInTheDocument();
      expect(screen.getByText('Create announcement popups with scheduling and homepage visibility.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add popup banner/i })).toBeInTheDocument();
    });

    it('renders a search input', () => {
      renderWithClient(<PopupTable />);
      expect(screen.getByPlaceholderText('Search popup banners...')).toBeInTheDocument();
    });
  });

  describe('data rendering', () => {
    it('shows an empty message when there are no banners', async () => {
      mockedGetPopupBanners.mockResolvedValue(successResponse([]));
      renderWithClient(<PopupTable />);
      expect(await screen.findByText('No popup banners found. Add your first banner!')).toBeInTheDocument();
    });

    it('renders banner rows with title, schedule, status and sort order', async () => {
      renderWithClient(<PopupTable />);

      expect(await screen.findByText('New Season')).toBeInTheDocument();
      expect(screen.getByText('Flash Announcement')).toBeInTheDocument();
      expect(screen.getByText('Great deals')).toBeInTheDocument();

      expect(screen.getByText('Always on')).toBeInTheDocument();

      expect(screen.getByText('active')).toBeInTheDocument();
      expect(screen.getByText('inactive')).toBeInTheDocument();
      expect(screen.getAllByText('0').length).toBeGreaterThan(0);
      expect(screen.getAllByText('1').length).toBeGreaterThan(0);
    });

    it('shows a spinner while loading', () => {
      mockedGetPopupBanners.mockReturnValue(new Promise(() => {}));
      const { container } = renderWithClient(<PopupTable />);
      expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('calls getPopupBanners with search/page/limit params', async () => {
      renderWithClient(<PopupTable />);
      await screen.findByText('New Season');

      fireEvent.change(screen.getByPlaceholderText('Search popup banners...'), {
        target: { value: 'sale' },
      });

      await waitFor(() => {
        expect(mockedGetPopupBanners).toHaveBeenCalledWith(
          expect.objectContaining({ search: 'sale', page: 1, limit: 10 })
        );
      });
    });
  });

  describe('create flow', () => {
    it('opens the create modal and submits a new banner with full details', async () => {
      mockedCreatePopupBanner.mockResolvedValue({ success: true, message: 'ok', data: makeBanner() });
      renderWithClient(<PopupTable />);

      fireEvent.click(screen.getByRole('button', { name: /add popup banner/i }));
      expect(screen.getByText('Create New Popup Banner')).toBeInTheDocument();

      fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Winter Sale' } });
      fireEvent.change(screen.getByLabelText('Image URL'), { target: { value: 'https://img.com/w.png' } });
      fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Big discounts' } });
      fireEvent.change(screen.getByLabelText('Button Text'), { target: { value: 'Shop Sale' } });
      fireEvent.change(screen.getByLabelText('Button Link'), { target: { value: '/products/sale' } });
      fireEvent.change(screen.getByLabelText('Start Date'), { target: { value: '2025-07-01' } });
      fireEvent.change(screen.getByLabelText('End Date'), { target: { value: '2025-07-15' } });
      fireEvent.click(screen.getByRole('switch'));
      fireEvent.change(screen.getByLabelText('Sort Order'), { target: { value: '2' } });

      fireEvent.click(screen.getByRole('button', { name: /create banner/i }));

      await waitFor(() => {
        expect(mockedCreatePopupBanner).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Winter Sale',
            imageUrl: 'https://img.com/w.png',
            description: 'Big discounts',
            buttonText: 'Shop Sale',
            buttonLink: '/products/sale',
            startDate: '2025-07-01',
            endDate: '2025-07-15',
            status: 'active',
            sortOrder: 2,
          }),
          expect.anything()
        );
      });
    });

    it('submits only the required fields when optional fields are left blank', async () => {
      mockedCreatePopupBanner.mockResolvedValue({ success: true, message: 'ok', data: makeBanner() });
      renderWithClient(<PopupTable />);

      fireEvent.click(screen.getByRole('button', { name: /add popup banner/i }));
      fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Minimal Banner' } });

      fireEvent.click(screen.getByRole('button', { name: /create banner/i }));

      await waitFor(() => {
        expect(mockedCreatePopupBanner).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Minimal Banner',
            status: 'inactive',
            sortOrder: 0,
          }),
          expect.anything()
        );
      });
    });
  });

  describe('edit flow', () => {
    it('opens the edit modal prefilled and updates the banner', async () => {
      mockedUpdatePopupBanner.mockResolvedValue({ success: true, message: 'ok', data: makeBanner() });
      renderWithClient(<PopupTable />);

      await screen.findByText('New Season');
      fireEvent.click(screen.getAllByTitle('Edit')[0]);

      expect(screen.getByText('Edit Popup Banner')).toBeInTheDocument();
      expect((screen.getByLabelText('Title') as HTMLInputElement).value).toBe('New Season');
      expect((screen.getByLabelText('Description') as HTMLTextAreaElement).value).toBe('Great deals');
      expect(screen.getByRole('switch', { checked: true })).toBeInTheDocument();

      fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Updated Season' } });
      fireEvent.click(screen.getByRole('button', { name: /update banner/i }));

      await waitFor(() => {
        expect(mockedUpdatePopupBanner).toHaveBeenCalledWith(
          expect.objectContaining({ _id: 'b-1', title: 'Updated Season' }),
          expect.anything()
        );
      });
    });
  });

  describe('delete flow', () => {
    it('calls deletePopupBanner after confirmation', async () => {
      mockedDeletePopupBanner.mockResolvedValue({ success: true, message: 'ok', data: null });
      renderWithClient(<PopupTable />);

      await screen.findByText('New Season');
      fireEvent.click(screen.getAllByTitle('Delete')[0]);

      const confirmButtons = screen.getAllByRole('button', { name: 'Delete' });
      fireEvent.click(confirmButtons[confirmButtons.length - 1]);

      await waitFor(() => {
        expect(mockedDeletePopupBanner).toHaveBeenCalledWith('b-1', expect.anything());
      });
    });

    it('does not call deletePopupBanner when confirmation is cancelled', async () => {
      renderWithClient(<PopupTable />);

      await screen.findByText('New Season');
      fireEvent.click(screen.getAllByTitle('Delete')[0]);

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

      await waitFor(() => {
        expect(mockedDeletePopupBanner).not.toHaveBeenCalled();
      });
    });
  });
});
