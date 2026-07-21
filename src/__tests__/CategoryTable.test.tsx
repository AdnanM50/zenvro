import { render, screen, fireEvent, within } from '@testing-library/react';
import CategoryTable from '@/components/admin/CategoryTable';
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

function getPaginationButtons() {
  const pageText = screen.getByText(/Page \d+ of \d+/);
  const paginationNav = pageText.parentElement!;
  const btnContainer = paginationNav.querySelector('.flex.items-center.gap-1')!;
  return within(btnContainer as HTMLElement).getAllByRole('button');
}

describe('CategoryTable', () => {
  describe('header', () => {
    it('renders title and description', () => {
      render(<CategoryTable categories={[]} />);
      expect(screen.getByText('Categories')).toBeInTheDocument();
      expect(screen.getByText('Manage your product categories')).toBeInTheDocument();
    });

    it('renders custom title and description', () => {
      render(
        <CategoryTable categories={[]} title="Product Categories" description="Custom description" />,
      );
      expect(screen.getByText('Product Categories')).toBeInTheDocument();
      expect(screen.getByText('Custom description')).toBeInTheDocument();
    });

    it('hides header when showHeader is false', () => {
      render(<CategoryTable categories={[]} showHeader={false} />);
      expect(screen.queryByText('Categories')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /add category/i })).not.toBeInTheDocument();
    });

    it('shows Add Category button', () => {
      render(<CategoryTable categories={[]} />);
      expect(screen.getByRole('button', { name: /add category/i })).toBeInTheDocument();
    });
  });

  describe('search', () => {
    it('renders search input', () => {
      render(<CategoryTable categories={[]} />);
      expect(screen.getByPlaceholderText('Search categories...')).toBeInTheDocument();
    });

    it('filters categories by name', () => {
      render(<CategoryTable categories={sampleCategories} />);
      expect(screen.getByText('T-Shirts')).toBeInTheDocument();
      expect(screen.getByText('Hoodies')).toBeInTheDocument();

      fireEvent.change(screen.getByPlaceholderText('Search categories...'), {
        target: { value: 'hood' },
      });

      expect(screen.queryByText('T-Shirts')).not.toBeInTheDocument();
      expect(screen.getByText('Hoodies')).toBeInTheDocument();
    });

    it('filters categories by slug', () => {
      render(<CategoryTable categories={sampleCategories} />);
      fireEvent.change(screen.getByPlaceholderText('Search categories...'), {
        target: { value: 't-shirt' },
      });

      expect(screen.getByText('T-Shirts')).toBeInTheDocument();
      expect(screen.queryByText('Hoodies')).not.toBeInTheDocument();
    });

    it('calls onSearchChange when typing', () => {
      const onSearchChange = jest.fn();
      render(<CategoryTable categories={[]} onSearchChange={onSearchChange} />);
      fireEvent.change(screen.getByPlaceholderText('Search categories...'), {
        target: { value: 'test' },
      });
      expect(onSearchChange).toHaveBeenCalledWith('test');
    });
  });

  describe('stats', () => {
    it('shows total count from categories', () => {
      render(<CategoryTable categories={sampleCategories} />);
      expect(screen.getByText('Total:')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('shows total from pagination when provided', () => {
      render(
        <CategoryTable categories={sampleCategories} pagination={{ page: 1, limit: 20, total: 100, totalPages: 5 }} />,
      );
      expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('shows active count', () => {
      render(<CategoryTable categories={sampleCategories} />);
      expect(screen.getByText('Active:')).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('shows spinner when loading', () => {
      const { container } = render(<CategoryTable categories={[]} loading={true} />);
      expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('hides table when loading', () => {
      render(<CategoryTable categories={sampleCategories} loading={true} />);
      expect(screen.queryByText('T-Shirts')).not.toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('shows empty message when no categories', () => {
      render(<CategoryTable categories={[]} />);
      expect(screen.getByText('No categories found')).toBeInTheDocument();
    });

    it('shows custom empty message', () => {
      render(<CategoryTable categories={[]} emptyMessage="Nothing here" />);
      expect(screen.getByText('Nothing here')).toBeInTheDocument();
    });

    it('shows create link in empty state', () => {
      render(<CategoryTable categories={[]} />);
      expect(screen.getByText('Create your first category')).toBeInTheDocument();
    });
  });

  describe('table rendering', () => {
    it('renders table headers', () => {
      render(<CategoryTable categories={sampleCategories} />);
      expect(screen.getByText('Category')).toBeInTheDocument();
      expect(screen.getByText('Slug')).toBeInTheDocument();
      expect(screen.getByText('Children')).toBeInTheDocument();
      expect(screen.getByText('SEO')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Created')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('renders only root categories', () => {
      render(<CategoryTable categories={sampleCategories} />);
      expect(screen.getByText('T-Shirts')).toBeInTheDocument();
      expect(screen.getByText('Hoodies')).toBeInTheDocument();
      expect(screen.queryByText('Jackets')).not.toBeInTheDocument();
    });

    it('shows children count for root with children', () => {
      render(<CategoryTable categories={sampleCategories} />);
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  describe('pagination', () => {
    const pagination = { page: 2, limit: 20, total: 50, totalPages: 3 };

    it('shows pagination info when totalPages > 1', () => {
      render(<CategoryTable categories={sampleCategories} pagination={pagination} />);
      expect(screen.getByText('Page 2 of 3 (50 total)')).toBeInTheDocument();
    });

    it('hides pagination when totalPages is 1', () => {
      render(
        <CategoryTable categories={sampleCategories} pagination={{ page: 1, limit: 20, total: 5, totalPages: 1 }} />,
      );
      expect(screen.queryByText(/Page/)).not.toBeInTheDocument();
    });

    it('calls onPageChange with next page', () => {
      const onPageChange = jest.fn();
      render(<CategoryTable categories={sampleCategories} pagination={pagination} onPageChange={onPageChange} />);
      const btns = getPaginationButtons();
      const nextBtn = btns[btns.length - 1];
      fireEvent.click(nextBtn);
      expect(onPageChange).toHaveBeenCalledWith(3);
    });

    it('calls onPageChange with previous page', () => {
      const onPageChange = jest.fn();
      render(<CategoryTable categories={sampleCategories} pagination={pagination} onPageChange={onPageChange} />);
      const btns = getPaginationButtons();
      fireEvent.click(btns[0]);
      expect(onPageChange).toHaveBeenCalledWith(1);
    });

    it('disables prev button on first page', () => {
      render(
        <CategoryTable categories={sampleCategories} pagination={{ page: 1, limit: 20, total: 50, totalPages: 3 }} />,
      );
      const btns = getPaginationButtons();
      expect(btns[0]).toBeDisabled();
    });

    it('disables next button on last page', () => {
      render(
        <CategoryTable categories={sampleCategories} pagination={{ page: 3, limit: 20, total: 50, totalPages: 3 }} />,
      );
      const btns = getPaginationButtons();
      expect(btns[btns.length - 1]).toBeDisabled();
    });

    it('highlights current page button', () => {
      render(<CategoryTable categories={sampleCategories} pagination={pagination} />);
      const btns = getPaginationButtons();
      const page2Btn = btns.find((b) => b.textContent === '2');
      expect(page2Btn).toBeDefined();
      expect(page2Btn!.className).toContain('bg-black');
      expect(page2Btn!.className).toContain('text-white');
    });

    it('calls onPageChange when page number clicked', () => {
      const onPageChange = jest.fn();
      render(<CategoryTable categories={sampleCategories} pagination={pagination} onPageChange={onPageChange} />);
      const btns = getPaginationButtons();
      const page1Btn = btns.find((b) => b.textContent === '1');
      fireEvent.click(page1Btn!);
      expect(onPageChange).toHaveBeenCalledWith(1);
    });
  });

  describe('columns prop', () => {
    it('hides specified columns from header', () => {
      render(<CategoryTable categories={sampleCategories} columns={['status', 'actions']} />);
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
      render(<CategoryTable categories={sampleCategories} onDelete={onDelete} />);
      fireEvent.click(screen.getAllByTitle('Delete')[0]);
      expect(onDelete).toHaveBeenCalledWith('cat-1');
    });

    it('calls onToggleActive when status toggled', () => {
      const onToggleActive = jest.fn();
      render(<CategoryTable categories={sampleCategories} onToggleActive={onToggleActive} />);
      fireEvent.click(screen.getByText('Active'));
      expect(onToggleActive).toHaveBeenCalledWith('cat-1');
    });
  });
});
