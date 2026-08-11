import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import HomeSectionTable from '@/app/admin/marketing/home-sections/_components/HomeSectionTable';
import {
  getHomeSections,
  createHomeSection,
  updateHomeSection,
  deleteHomeSection,
} from '@/services/home-section.service';
import type { HomeSection } from '@/types';
import { getProducts } from '@/services/product.service';

jest.mock('@/services/home-section.service', () => ({
  getHomeSections: jest.fn(),
  createHomeSection: jest.fn(),
  updateHomeSection: jest.fn(),
  deleteHomeSection: jest.fn(),
}));

jest.mock('@/services/product.service', () => ({
  getProducts: jest.fn(),
}));

const mockedGetHomeSections = getHomeSections as jest.Mock;
const mockedCreateHomeSection = createHomeSection as jest.Mock;
const mockedUpdateHomeSection = updateHomeSection as jest.Mock;
const mockedDeleteHomeSection = deleteHomeSection as jest.Mock;
const mockedGetProducts = getProducts as jest.Mock;

const mockProducts = [
  { _id: 'p-1', name: 'Alpha Tee', sku: 'SKU-1', status: 'active', regularPrice: 20, salePrice: 0, stock: 10, lowStock: 2, featuredImage: '' },
  { _id: 'p-2', name: 'Beta Jeans', sku: 'SKU-2', status: 'active', regularPrice: 60, salePrice: 0, stock: 8, lowStock: 2, featuredImage: '' },
  { _id: 'p-3', name: 'Gamma Cap', sku: 'SKU-3', status: 'active', regularPrice: 15, salePrice: 0, stock: 5, lowStock: 2, featuredImage: '' },
  { _id: 'p-9', name: 'Classic Tee', sku: 'SKU-9', status: 'active', regularPrice: 25, salePrice: 0, stock: 12, lowStock: 2, featuredImage: '' },
  { _id: 'p-10', name: 'Denim Jacket', sku: 'SKU-10', status: 'active', regularPrice: 70, salePrice: 0, stock: 0, lowStock: 5, featuredImage: '' },
];

function makeSection(overrides: Partial<HomeSection> = {}): HomeSection {
  return {
    _id: 'hs-1',
    title: "Editor's Picks",
    subtitle: 'Handpicked daily',
    sectionType: 'featured-products',
    enabled: true,
    sortOrder: 0,
    productIds: ['p-1', 'p-2', 'p-3'],
    imageUrl: undefined,
    link: undefined,
    linkText: undefined,
    content: undefined,
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
    ...overrides,
  };
}

const sampleSections: HomeSection[] = [
  makeSection(),
  makeSection({
    _id: 'hs-2',
    title: 'Spring Banner',
    subtitle: undefined,
    sectionType: 'promo-banner',
    enabled: false,
    sortOrder: 1,
    productIds: [],
  }),
];

function successResponse(data: HomeSection[], total = data.length) {
  return {
    success: true as const,
    message: 'Home sections fetched',
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

describe('HomeSectionTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetHomeSections.mockResolvedValue(successResponse(sampleSections));
    mockedGetProducts.mockResolvedValue({
      success: true,
      message: 'Products fetched',
      data: mockProducts,
      meta: { page: 1, limit: 8, total: mockProducts.length, totalPages: 1 },
    });
  });

  describe('header', () => {
    it('renders title, description and Add Section button', async () => {
      renderWithClient(<HomeSectionTable />);
      expect(screen.getByText('Home Sections')).toBeInTheDocument();
      expect(screen.getByText('Pick the 1-2 sections you want shown on the home page and control their order.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add section/i })).toBeInTheDocument();
    });

    it('renders a search input', () => {
      renderWithClient(<HomeSectionTable />);
      expect(screen.getByPlaceholderText('Search home sections...')).toBeInTheDocument();
    });
  });

  describe('data rendering', () => {
    it('shows an empty message when there are no sections', async () => {
      mockedGetHomeSections.mockResolvedValue(successResponse([]));
      renderWithClient(<HomeSectionTable />);
      expect(await screen.findByText('No home sections found. Add your first section!')).toBeInTheDocument();
    });

    it('renders section rows with title, type, products, sort and visibility', async () => {
      renderWithClient(<HomeSectionTable />);

      expect(await screen.findByText("Editor's Picks")).toBeInTheDocument();
      expect(screen.getByText('Handpicked daily')).toBeInTheDocument();
      expect(screen.getByText('Spring Banner')).toBeInTheDocument();

      expect(screen.getByText('Featured Products')).toBeInTheDocument();
      expect(screen.getByText('Promo Banner')).toBeInTheDocument();

      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('—')).toBeInTheDocument();

      expect(screen.getByText('Visible')).toBeInTheDocument();
      expect(screen.getByText('Hidden')).toBeInTheDocument();
    });

    it('shows a spinner while loading', () => {
      mockedGetHomeSections.mockReturnValue(new Promise(() => {}));
      const { container } = renderWithClient(<HomeSectionTable />);
      expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('calls getHomeSections with search/page/limit params', async () => {
      renderWithClient(<HomeSectionTable />);
      await screen.findByText("Editor's Picks");

      fireEvent.change(screen.getByPlaceholderText('Search home sections...'), {
        target: { value: 'banner' },
      });

      await waitFor(() => {
        expect(mockedGetHomeSections).toHaveBeenCalledWith(
          expect.objectContaining({ search: 'banner', page: 1, limit: 10 })
        );
      });
    });
  });

  describe('create flow', () => {
    it('creates a promo-banner section with its banner fields', async () => {
      mockedCreateHomeSection.mockResolvedValue({ success: true, message: 'ok', data: makeSection() });
      renderWithClient(<HomeSectionTable />);

      fireEvent.click(screen.getByRole('button', { name: /add section/i }));
      expect(screen.getByText('Create New Home Section')).toBeInTheDocument();

      fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Launch Banner' } });
      fireEvent.change(screen.getByLabelText('Section Type'), { target: { value: 'promo-banner' } });
      fireEvent.change(screen.getByLabelText('Image URL'), { target: { value: 'https://img.com/b.png' } });
      fireEvent.change(screen.getByLabelText('Button Text'), { target: { value: 'Shop Now' } });
      fireEvent.change(screen.getByLabelText('Button Link'), { target: { value: '/collections/new' } });

      fireEvent.click(screen.getByRole('button', { name: /create section/i }));

      await waitFor(() => {
        expect(mockedCreateHomeSection).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Launch Banner',
            sectionType: 'promo-banner',
            enabled: true,
            sortOrder: 0,
            productIds: [],
            imageUrl: 'https://img.com/b.png',
            link: '/collections/new',
            linkText: 'Shop Now',
          }),
          expect.anything()
        );
      });
    });

    it('creates a featured-products section and adds products by name', async () => {
      mockedCreateHomeSection.mockResolvedValue({ success: true, message: 'ok', data: makeSection() });
      renderWithClient(<HomeSectionTable />);

      fireEvent.click(screen.getByRole('button', { name: /add section/i }));
      fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Featured Section' } });
      fireEvent.change(screen.getByPlaceholderText('Search products by name...'), { target: { value: 'tee' } });
      await screen.findByText('Classic Tee');
      fireEvent.click(screen.getByText('Classic Tee'));
      await screen.findByText('Denim Jacket');
      fireEvent.click(screen.getByText('Denim Jacket'));

      fireEvent.click(screen.getByRole('button', { name: /create section/i }));

      await waitFor(() => {
        expect(mockedCreateHomeSection).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Featured Section',
            sectionType: 'featured-products',
            productIds: ['p-9', 'p-10'],
          }),
          expect.anything()
        );
      });
    });
  });

  describe('edit flow', () => {
    it('opens the edit modal prefilled and updates the section', async () => {
      mockedUpdateHomeSection.mockResolvedValue({ success: true, message: 'ok', data: makeSection() });
      renderWithClient(<HomeSectionTable />);

      await screen.findByText("Editor's Picks");
      fireEvent.click(screen.getAllByTitle('Edit')[0]);

      expect(screen.getByText('Edit Home Section')).toBeInTheDocument();
      expect((screen.getByLabelText('Title') as HTMLInputElement).value).toBe("Editor's Picks");
      expect((screen.getByLabelText('Section Type') as HTMLSelectElement).value).toBe('featured-products');
      expect(screen.getByRole('switch', { checked: true })).toBeInTheDocument();
      await screen.findByText('Alpha Tee');

      fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Updated Section' } });
      fireEvent.click(screen.getByRole('button', { name: /update section/i }));

      await waitFor(() => {
        expect(mockedUpdateHomeSection).toHaveBeenCalledWith(
          expect.objectContaining({ _id: 'hs-1', title: 'Updated Section' }),
          expect.anything()
        );
      });
    });
  });

  describe('delete flow', () => {
    it('calls deleteHomeSection after confirmation', async () => {
      mockedDeleteHomeSection.mockResolvedValue({ success: true, message: 'ok', data: null });
      renderWithClient(<HomeSectionTable />);

      await screen.findByText("Editor's Picks");
      fireEvent.click(screen.getAllByTitle('Delete')[0]);

      const confirmButtons = screen.getAllByRole('button', { name: 'Delete' });
      fireEvent.click(confirmButtons[confirmButtons.length - 1]);

      await waitFor(() => {
        expect(mockedDeleteHomeSection).toHaveBeenCalledWith('hs-1', expect.anything());
      });
    });

    it('does not call deleteHomeSection when confirmation is cancelled', async () => {
      renderWithClient(<HomeSectionTable />);

      await screen.findByText("Editor's Picks");
      fireEvent.click(screen.getAllByTitle('Delete')[0]);

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

      await waitFor(() => {
        expect(mockedDeleteHomeSection).not.toHaveBeenCalled();
      });
    });
  });
});
