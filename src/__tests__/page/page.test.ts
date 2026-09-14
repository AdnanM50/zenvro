import { PageModel, slugify } from '@/models/page.model';
import { getDb } from '@/lib/db';

jest.mock('@/lib/db');

describe('PageModel Unit Tests', () => {
  const mockCollection = {
    insertOne: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getDb as jest.Mock).mockResolvedValue({
      collection: () => mockCollection,
    });
  });

  describe('slugify()', () => {
    it('converts strings to URL safe slug format', () => {
      expect(slugify('About Us!')).toBe('about-us');
      expect(slugify('Terms & Conditions')).toBe('terms-conditions');
      expect(slugify('  Privacy -- Policy  ')).toBe('privacy-policy');
    });
  });

  describe('create()', () => {
    it('creates a CMS page with auto-slug, default SEO, and mapped sections', async () => {
      mockCollection.findOne.mockResolvedValue(null);
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true });

      const page = await PageModel.create({
        title: '  About Us  ',
        status: 'published',
        sections: [
          {
            id: 'sec-1',
            type: 'hero',
            title: 'Hero Heading',
            isActive: true,
            order: 1,
            data: { ctaLabel: 'Click' },
          },
        ],
        seo: {
          metaTitle: 'Custom Meta Title',
        },
      });

      expect(page._id).toBeDefined();
      expect(page.title).toBe('About Us');
      expect(page.slug).toBe('about-us');
      expect(page.status).toBe('published');
      expect(page.sections.length).toBe(1);
      expect(page.sections[0].title).toBe('Hero Heading');
      expect(page.seo.metaTitle).toBe('Custom Meta Title');
      expect(page.seo.metaDescription).toBeDefined();
    });

    it('handles slug collision by appending timestamp suffix', async () => {
      mockCollection.findOne.mockResolvedValue({ _id: 'existing-id', slug: 'about-us' });
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true });

      const page = await PageModel.create({ title: 'About Us' });
      expect(page.slug).not.toBe('about-us');
      expect(page.slug.startsWith('about-us-')).toBe(true);
    });
  });

  describe('findBySlug() & findById()', () => {
    it('returns page when found by slug', async () => {
      const mockPage = { _id: 'p1', title: 'Contact Us', slug: 'contact-us' };
      mockCollection.findOne.mockResolvedValue(mockPage);

      const res = await PageModel.findBySlug('contact-us');
      expect(res).toEqual(mockPage);
      expect(mockCollection.findOne).toHaveBeenCalledWith({ slug: 'contact-us' });
    });

    it('returns page when found by id', async () => {
      const mockPage = { _id: 'p1', title: 'Contact Us' };
      mockCollection.findOne.mockResolvedValue(mockPage);

      const res = await PageModel.findById('p1');
      expect(res).toEqual(mockPage);
      expect(mockCollection.findOne).toHaveBeenCalledWith({ _id: 'p1' });
    });
  });

  describe('findAll()', () => {
    it('queries all pages sorted by title', async () => {
      const mockPages = [{ _id: 'p1', title: 'About Us' }];
      const mockChain = {
        sort: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue(mockPages),
      };
      mockCollection.find.mockReturnValue(mockChain);

      const res = await PageModel.findAll({ search: 'About', status: 'published' });
      expect(res).toEqual(mockPages);
      expect(mockCollection.find).toHaveBeenCalledWith({
        $or: [
          { title: { $regex: 'About', $options: 'i' } },
          { slug: { $regex: 'About', $options: 'i' } },
        ],
        status: 'published',
      });
    });
  });

  describe('update()', () => {
    it('updates page details successfully', async () => {
      const mockExisting = { _id: 'p1', title: 'Old Title', slug: 'old-title', seo: {} };
      const mockUpdated = { _id: 'p1', title: 'New Title', slug: 'new-title', seo: {} };

      mockCollection.findOne.mockResolvedValueOnce(mockExisting);
      mockCollection.findOne.mockResolvedValueOnce(null); // slug check returns null
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });
      mockCollection.findOne.mockResolvedValueOnce(mockUpdated);

      const res = await PageModel.update('p1', {
        title: 'New Title',
        slug: 'new-title',
      });

      expect(res).toEqual(mockUpdated);
      expect(mockCollection.updateOne).toHaveBeenCalled();
    });

    it('throws error when updating slug to an existing slug used by another page', async () => {
      const mockExisting = { _id: 'p1', title: 'About Us', slug: 'about-us' };
      mockCollection.findOne.mockResolvedValueOnce(mockExisting);
      mockCollection.findOne.mockResolvedValueOnce({ _id: 'p2', slug: 'contact-us' }); // slug collision!

      await expect(
        PageModel.update('p1', { slug: 'contact-us' })
      ).rejects.toThrow("Slug 'contact-us' is already in use by another page.");
    });
  });

  describe('delete()', () => {
    it('deletes a page and returns true', async () => {
      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 1 });
      const res = await PageModel.delete('p1');
      expect(res).toBe(true);
    });
  });
});
