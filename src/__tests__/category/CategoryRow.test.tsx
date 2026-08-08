import { render, screen, fireEvent } from '@testing-library/react';
import CategoryRow from '@/app/admin/categories/_component/CategoryRow';
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

const defaultProps = {
  category: makeCategory(),
  children: [] as Category[],
  isExpanded: false,
  onToggleExpand: jest.fn(),
  onEdit: jest.fn(),
  onDelete: jest.fn(),
  onToggleActive: jest.fn(),
  onAddChild: jest.fn(),
};

function renderRow(overrides = {}) {
  return render(
    <table>
      <tbody>
        <CategoryRow {...defaultProps} {...overrides} />
      </tbody>
    </table>
  );
}

describe('CategoryRow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('parent row rendering', () => {
    it('renders category name and slug', () => {
      renderRow();
      expect(screen.getByText('T-Shirts')).toBeInTheDocument();
      expect(screen.getByText('t-shirts')).toBeInTheDocument();
    });

    it('renders image when provided', () => {
      renderRow({ category: makeCategory({ image: 'https://img.com/cat.jpg' }) });
      const img = screen.getByRole('img', { name: 'T-Shirts' });
      expect(img).toHaveAttribute('src', 'https://img.com/cat.jpg');
    });

    it('renders folder icon when no image', () => {
      renderRow();
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('shows subcategory count text', () => {
      renderRow({ children: [makeCategory({ _id: 'child-1', name: 'Graphic Tees' })] });
      expect(screen.getByText('1 subcategories')).toBeInTheDocument();
    });

    it('shows 0 subcategories when no children', () => {
      renderRow();
      expect(screen.getByText('0 subcategories')).toBeInTheDocument();
    });
  });

  describe('expand/collapse', () => {
    it('calls onToggleExpand when expand button clicked', () => {
      const onToggleExpand = jest.fn();
      const { container } = renderRow({
        children: [makeCategory({ _id: 'child-1' })],
        onToggleExpand,
      });
      const expandBtn = container.querySelector('button')!;
      fireEvent.click(expandBtn);
      expect(onToggleExpand).toHaveBeenCalledTimes(1);
    });

    it('does not render child rows when not expanded', () => {
      renderRow({
        children: [makeCategory({ _id: 'child-1', name: 'Child Cat' })],
        isExpanded: false,
      });
      expect(screen.queryByText('Child Cat')).not.toBeInTheDocument();
    });

    it('renders child rows when expanded', () => {
      renderRow({
        children: [makeCategory({ _id: 'child-1', name: 'Child Cat', slug: 'child-cat' })],
        isExpanded: true,
      });
      expect(screen.getByText('Child Cat')).toBeInTheDocument();
      expect(screen.getByText('child-cat')).toBeInTheDocument();
    });
  });

  describe('status', () => {
    it('shows Active for active category', () => {
      renderRow();
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('shows Inactive for inactive category', () => {
      renderRow({ category: makeCategory({ isActive: false }) });
      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });

    it('calls onToggleActive when status button clicked', () => {
      const onToggleActive = jest.fn();
      renderRow({ onToggleActive });
      fireEvent.click(screen.getByText('Active'));
      expect(onToggleActive).toHaveBeenCalledWith('cat-1');
    });
  });

  describe('actions', () => {
    it('calls onEdit when edit button clicked', () => {
      const onEdit = jest.fn();
      renderRow({ onEdit });
      fireEvent.click(screen.getByTitle('Edit'));
      expect(onEdit).toHaveBeenCalledWith(makeCategory());
    });

    it('calls onDelete when delete button clicked', () => {
      const onDelete = jest.fn();
      renderRow({ onDelete });
      fireEvent.click(screen.getByTitle('Delete'));
      expect(onDelete).toHaveBeenCalledWith('cat-1');
    });

    it('calls onAddChild when add subcategory button clicked', () => {
      const onAddChild = jest.fn();
      renderRow({ onAddChild });
      fireEvent.click(screen.getByTitle('Add subcategory'));
      expect(onAddChild).toHaveBeenCalledWith('cat-1');
    });
  });

  describe('columns prop', () => {
    it('hides children count column cell when excluded', () => {
      const { container } = renderRow({ columns: ['seo', 'status', 'created', 'actions'] });
      const tds = container.querySelectorAll('tr:first-child td');
      expect(tds).toHaveLength(6);
    });

    it('hides seo column when excluded', () => {
      const { container } = renderRow({ columns: ['children', 'status', 'created', 'actions'] });
      const tds = container.querySelectorAll('tr:first-child td');
      expect(tds).toHaveLength(6);
    });

    it('hides status column when excluded', () => {
      renderRow({ columns: ['children', 'seo', 'created', 'actions'] });
      expect(screen.queryByText('Active')).not.toBeInTheDocument();
    });

    it('hides actions column when excluded', () => {
      renderRow({ columns: ['children', 'seo', 'status', 'created'] });
      expect(screen.queryByTitle('Edit')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Delete')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Add subcategory')).not.toBeInTheDocument();
    });
  });

  describe('child rows', () => {
    it('shows "Configured" badge when child has seo title', () => {
      renderRow({
        children: [makeCategory({ _id: 'child-1', name: 'Sub', seo: { ...makeCategory().seo, title: 'SEO Title' } })],
        isExpanded: true,
      });
      expect(screen.getByText('Configured')).toBeInTheDocument();
    });

    it('shows Inactive text for inactive child', () => {
      renderRow({
        children: [makeCategory({ _id: 'child-1', name: 'Sub', isActive: false })],
        isExpanded: true,
      });
      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });

    it('renders child edit/delete buttons', () => {
      const onEdit = jest.fn();
      const onDelete = jest.fn();
      renderRow({
        children: [makeCategory({ _id: 'child-1', name: 'Sub' })],
        isExpanded: true,
        onEdit,
        onDelete,
      });
      const allEditButtons = screen.getAllByRole('button');
      const childEditBtn = allEditButtons[allEditButtons.length - 2];
      const childDeleteBtn = allEditButtons[allEditButtons.length - 1];
      fireEvent.click(childEditBtn);
      expect(onEdit).toHaveBeenCalled();
      fireEvent.click(childDeleteBtn);
      expect(onDelete).toHaveBeenCalled();
    });
  });
});
