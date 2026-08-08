import { render, screen, fireEvent, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import CategoryTable from '@/app/admin/categories/_component/CategoryTable';
import type { Category } from '@/types';

function makeCategory(overrides: Partial<Category> = {}): Category {
  return {
    _id: 'cat-1',
    name: 'T-Shirts',
    slug: 't-shirts',
    image: '',
    description: '',
    seo: { title: '', description: '', keywords: [], canonical: '', ogImage: '', robots: 'index' },
    isActive: true,
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
    ...overrides,
  };
}

const sampleCategories: Category[] = [
  makeCategory(),
  makeCategory({ _id: 'cat-2', name: 'Hoodies', slug: 'hoodies', isActive: false }),
  makeCategory({ _id: 'cat-3', name: 'Jackets', slug: 'jackets', parentCategory: 'cat-1' }),
];

// CategoryTable uses the generic React Query hooks, so every render must be
// wrapped in a QueryClientProvider.
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

function getPaginationButtons() {
  const pageText = screen.getByText(/Showing/);
  const container = pageText.closest('div.flex-col, div.flex-row') || pageText.parentElement!;
  return within(container as HTMLElement).getAllByRole('button');
}

describe('CategoryTable', () => {
  describe('header', () => {
    it('renders title and description', () => {
      renderWithClient(<CategoryTable categories={[]} />);
      expect(screen.getByText('Categories')).toBeInTheDocument();
      expect(screen.getByText('Manage your product categories')).toBeInTheDocument();
    });

    it('renders custom title and description', () => {
      renderWithClient(
        <CategoryTable categories={[]} title="Product Categories" description="Custom description" />,
      );
      expect(screen.getByText('Product Categories')).toBeInTheDocument();
      expect(screen.getByText('Custom description')).toBeInTheDocument();
    });

    it('hides header when showHeader is false', () => {
      renderWithClient(<CategoryTable categories={[]} showHeader={false} />);
      expect(screen.queryByText('Categories')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /add category/i })).not.toBeInTheDocument();
    });

    it('shows Add Category button', () => {
      renderWithClient(<CategoryTable categories={[]} />);
      expect(screen.getByRole('button', { name: /add category/i })).toBeInTheDocument();
    });
  });

  describe('search', () => {
    it('renders search input', () => {
      renderWithClient(<CategoryTable categories={[]} />);
      expect(screen.getByPlaceholderText('Search categories...')).toBeInTheDocument();
    });

    it('filters categories by name', () => {
      renderWithClient(<CategoryTable categories={sampleCategories} />);
      expect(screen.getByText('T-Shirts')).toBeInTheDocument();
      expect(screen.getByText('Hoodies')).toBeInTheDocument();

      fireEvent.change(screen.getByPlaceholderText('Search categories...'), {
        target: { value: 'hood' },
      });

      expect(screen.queryByText('T-Shirts')).not.toBeInTheDocument();
      expect(screen.getByText('Hoodies')).toBeInTheDocument();
    });

    it('filters categories by slug', () => {
      renderWithClient(<CategoryTable categories={sampleCategories} />);
      fireEvent.change(screen.getByPlaceholderText('Search categories...'), {
        target: { value: 't-shirt' },
      });

      expect(screen.getByText('T-Shirts')).toBeInTheDocument();
      expect(screen.queryByText('Hoodies')).not.toBeInTheDocument();
    });

    it('calls onSearchChange when typing', () => {
      const onSearchChange = jest.fn();
      renderWithClient(<CategoryTable categories={[]} onSearchChange={onSearchChange} />);
      fireEvent.change(screen.getByPlaceholderText('Search categories...'), {
        target: { value: 'test' },
      });
      expect(onSearchChange).toHaveBeenCalledWith('test');
    });
  });

  describe('stats', () => {
    it('shows total count from categories', () => {
      renderWithClient(<CategoryTable categories={sampleCategories} />);
      expect(screen.getByText('Total:')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('shows total from pagination when provided', () => {
      renderWithClient(
        <CategoryTable categories={sampleCategories} pagination={{ page: 1, limit: 20, total: 100, totalPages: 5 }} />,
      );
      expect(screen.getAllByText('100').length).toBeGreaterThan(0);
    });

    it('shows active count', () => {
      renderWithClient(<CategoryTable categories={sampleCategories} />);
      expect(screen.getByText('Active:')).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('shows spinner when loading', () => {
      const { container } = renderWithClient(<CategoryTable categories={[]} loading={true} />);
      expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('hides table when loading', () => {
      renderWithClient(<CategoryTable categories={sampleCategories} loading={true} />);
      expect(screen.queryByText('T-Shirts')).not.toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('shows empty message when no categories', () => {
      renderWithClient(<CategoryTable categories={[]} />);
      expect(screen.getByText('No categories found')).toBeInTheDocument();
    });

    it('shows custom empty message', () => {
      renderWithClient(<CategoryTable categories={[]} emptyMessage="Nothing here" />);
      expect(screen.getByText('Nothing here')).toBeInTheDocument();
    });

    it('shows create link in empty state', () => {
      renderWithClient(<CategoryTable categories={[]} />);
      expect(screen.getByText('Create your first category')).toBeInTheDocument();
    });
  });

  describe('table rendering', () => {
    it('renders table headers', () => {
      renderWithClient(<CategoryTable categories={sampleCategories} />);
      expect(screen.getByText('Category')).toBeInTheDocument();
      expect(screen.getByText('Slug')).toBeInTheDocument();
      expect(screen.getByText('Children')).toBeInTheDocument();
      expect(screen.getByText('SEO')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Created')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('renders only root categories', () => {
      renderWithClient(<CategoryTable categories={sampleCategories} />);
      expect(screen.getByText('T-Shirts')).toBeInTheDocument();
      expect(screen.getByText('Hoodies')).toBeInTheDocument();
      expect(screen.queryByText('Jackets')).not.toBeInTheDocument();
    });

    it('shows children count for root with children', () => {
      renderWithClient(<CategoryTable categories={sampleCategories} />);
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  describe('pagination', () => {
    const pagination = { page: 2, limit: 20, total: 50, totalPages: 3 };

    it('shows pagination info when totalPages > 1', () => {
      renderWithClient(<CategoryTable categories={sampleCategories} pagination={pagination} />);
      expect(screen.getByText(/Showing/).parentElement).toHaveTextContent('Showing 21 to 40 of 50 categories');
    });

    it('hides pagination when totalPages is 1 and total is 0', () => {
      renderWithClient(
        <CategoryTable categories={sampleCategories} pagination={{ page: 1, limit: 20, total: 0, totalPages: 1 }} />,
      );
      expect(screen.queryByText(/Showing/)).not.toBeInTheDocument();
    });

    it('calls onPageChange with next page', () => {
      const onPageChange = jest.fn();
      renderWithClient(<CategoryTable categories={sampleCategories} pagination={pagination} onPageChange={onPageChange} />);
      const btns = getPaginationButtons();
      // Second to last button is next page
      const nextBtn = btns[btns.length - 2];
      fireEvent.click(nextBtn);
      expect(onPageChange).toHaveBeenCalledWith(3);
    });

    it('calls onPageChange with previous page', () => {
      const onPageChange = jest.fn();
      renderWithClient(<CategoryTable categories={sampleCategories} pagination={pagination} onPageChange={onPageChange} />);
      const btns = getPaginationButtons();
      // Second button is previous page
      fireEvent.click(btns[1]);
      expect(onPageChange).toHaveBeenCalledWith(1);
    });

    it('disables prev button on first page', () => {
      renderWithClient(
        <CategoryTable categories={sampleCategories} pagination={{ page: 1, limit: 20, total: 50, totalPages: 3 }} />,
      );
      const btns = getPaginationButtons();
      expect(btns[1]).toBeDisabled();
    });

    it('disables next button on last page', () => {
      renderWithClient(
        <CategoryTable categories={sampleCategories} pagination={{ page: 3, limit: 20, total: 50, totalPages: 3 }} />,
      );
      const btns = getPaginationButtons();
      expect(btns[btns.length - 2]).toBeDisabled();
    });

    it('highlights current page button', () => {
      renderWithClient(<CategoryTable categories={sampleCategories} pagination={pagination} />);
      const btns = getPaginationButtons();
      const page2Btn = btns.find((b) => b.textContent === '2');
      expect(page2Btn).toBeDefined();
      expect(page2Btn!.className).toContain('bg-black');
      expect(page2Btn!.className).toContain('text-white');
    });

    it('calls onPageChange when page number clicked', () => {
      const onPageChange = jest.fn();
      renderWithClient(<CategoryTable categories={sampleCategories} pagination={pagination} onPageChange={onPageChange} />);
      const btns = getPaginationButtons();
      const page1Btn = btns.find((b) => b.textContent === '1');
      fireEvent.click(page1Btn!);
      expect(onPageChange).toHaveBeenCalledWith(1);
    });
  });

  describe('columns prop', () => {
    it('hides specified columns from header', () => {
      renderWithClient(<CategoryTable categories={sampleCategories} columns={['status', 'actions']} />);
      expect(screen.getByText('Category')).toBeInTheDocument();
      expect(screen.getByText('Slug')).toBeInTheDocument();
      expect(screen.queryByText('Children')).not.toBeInTheDocument();
      expect(screen.queryByText('SEO')).not.toBeInTheDocument();
      expect(screen.queryByText('Created')).not.toBeInTheDocument();
    });
  });

  describe('callback props', () => {
    it('calls onDelete when category delete is triggered', () => {
      const onDelete = jest.fn();
      renderWithClient(<CategoryTable categories={sampleCategories} onDelete={onDelete} />);
      fireEvent.click(screen.getAllByTitle('Delete')[0]);
      expect(onDelete).toHaveBeenCalledWith('cat-1');
    });

    it('calls onToggleActive when status toggled', () => {
      const onToggleActive = jest.fn();
      renderWithClient(<CategoryTable categories={sampleCategories} onToggleActive={onToggleActive} />);
      fireEvent.click(screen.getByText('Active'));
      expect(onToggleActive).toHaveBeenCalledWith('cat-1');
    });
  });
});
