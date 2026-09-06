import { ProductModel } from '@/models/product.model';
import { getDb } from '@/lib/db';

jest.mock('@/lib/db');

describe('ProductModel Unit Tests (Possible & Impossible Edge Cases)', () => {
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

  describe('create()', () => {
    it('creates a product with the full schema (media, pricing, inventory, attributes, SEO, variants)', async () => {
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true });

      const product = await ProductModel.create({
        name: 'Classic Cotton Tee',
        slug: 'classic-cotton-tee',
        sku: 'TSH-COT-001',
        barcode: '8801234567890',
        shortDescription: 'A soft everyday tee',
        description: 'Premium cotton t-shirt',
        category: 'cat-1',
        brand: 'brand-1',
        collection: 'col-1',
        tags: ['tag-1', 'tag-2'],
        featuredImage: 'https://img.com/tee.png',
        gallery: ['https://img.com/a.png', 'https://img.com/b.png'],
        video: 'https://img.com/tee.mp4',
        regularPrice: 59.99,
        salePrice: 49.99,
        costPrice: 20,
        stock: 100,
        lowStock: 10,
        sold: 42,
        status: 'active',
        isFeatured: true,
        isNewArrival: true,
        isTrending: false,
        gender: 'unisex',
        material: '100% Cotton',
        careInstruction: 'Machine wash cold',
        specifications: { Fit: 'Regular', Neckline: 'Crew' },
        variants: [
          {
            sku: 'TSH-COT-BLK-XL',
            attributes: { Color: 'Black', Size: 'XL' },
            price: 59.99,
            salePrice: 49.99,
            stock: 25,
            image: 'https://img.com/black-xl.png',
            weight: 0.4,
          },
        ],
        seo: {
          title: 'Classic Cotton Tee',
          description: 'SEO desc',
          keywords: ['tee', 'cotton'],
          canonical: 'https://store.com/tee',
          ogImage: 'https://img.com/og.png',
          ogTitle: 'OG Tee',
          ogDescription: 'OG desc',
          ogType: 'product',
          twitterCard: 'summary_large_image',
          structuredData: '{}',
          robots: 'index',
        },
      });

      expect(product._id).toBeDefined();
      expect(product.name).toBe('Classic Cotton Tee');
      expect(product.slug).toBe('classic-cotton-tee');
      expect(product.sku).toBe('TSH-COT-001');
      expect(product.barcode).toBe('8801234567890');
      expect(product.category).toBe('cat-1');
      expect(product.brand).toBe('brand-1');
      expect(product.collection).toBe('col-1');
      expect(product.tags).toEqual(['tag-1', 'tag-2']);
      expect(product.gallery).toEqual(['https://img.com/a.png', 'https://img.com/b.png']);
      expect(product.media).toEqual({
        featuredImage: 'https://img.com/tee.png',
        gallery: ['https://img.com/a.png', 'https://img.com/b.png'],
        videoUrl: 'https://img.com/tee.mp4',
      });
      expect(product.regularPrice).toBe(59.99);
      expect(product.salePrice).toBe(49.99);
      expect(product.costPrice).toBe(20);
      expect(product.stock).toBe(100);
      expect(product.lowStock).toBe(10);
      expect(product.sold).toBe(42);
      expect(product.status).toBe('active');
      expect(product.isFeatured).toBe(true);
      expect(product.isNewArrival).toBe(true);
      expect(product.isTrending).toBe(false);
      expect(product.gender).toBe('unisex');
      expect(product.material).toBe('100% Cotton');
      expect(product.specifications).toEqual({ Fit: 'Regular', Neckline: 'Crew' });
      expect(product.variants).toHaveLength(1);
      expect(product.variants[0].sku).toBe('TSH-COT-BLK-XL');
      expect(product.variants[0].price).toBe(59.99);
      expect(product.variants[0].createdAt).toBeInstanceOf(Date);
      expect(product.seo.ogTitle).toBe('OG Tee');
      expect(product.seo.robots).toBe('index');
    });

    it('creates a product with a minimal payload and sane defaults', async () => {
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true });

      const product = await ProductModel.create({
        name: 'Minimal Tee',
        sku: 'MIN-1',
        regularPrice: 10,
        stock: 5,
      });

      expect(product.slug).toBe('minimal-tee');
      expect(product.barcode).toBe('');
      expect(product.shortDescription).toBe('');
      expect(product.category).toBe('');
      expect(product.brand).toBe('');
      expect(product.collection).toBe('');
      expect(product.tags).toEqual([]);
      expect(product.featuredImage).toBe('');
      expect(product.gallery).toEqual([]);
      expect(product.salePrice).toBe(0);
      expect(product.costPrice).toBe(0);
      expect(product.lowStock).toBe(0);
      expect(product.sold).toBe(0);
      expect(product.status).toBe('active');
      expect(product.isFeatured).toBe(false);
      expect(product.isNewArrival).toBe(false);
      expect(product.isTrending).toBe(false);
      expect(product.gender).toBe('');
      expect(product.specifications).toEqual({});
      expect(product.variants).toEqual([]);
      expect(product.seo.title).toBe('');
      expect(product.seo.ogType).toBe('product');
      expect(product.createdAt).toBeInstanceOf(Date);
      expect(product.updatedAt).toBeInstanceOf(Date);
    });

    it('generates a slug from the name when none is provided', async () => {
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true });

      const product = await ProductModel.create({
        name: '  Premium Leather  Jacket  ',
        sku: 'JCK-1',
        regularPrice: 199,
        stock: 3,
      });

      expect(product.slug).toBe('premium-leather-jacket');
    });

    it('hydrates each embedded variant with an id and timestamps', async () => {
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true });

      const product = await ProductModel.create({
        name: 'Tee',
        sku: 'T-1',
        regularPrice: 10,
        stock: 1,
        variants: [
          { sku: 'T-BLK', price: 10, stock: 1 },
          { sku: 'T-RED', price: 12, stock: 2 },
        ],
      });

      expect(product.variants).toHaveLength(2);
      expect(product.variants[0]._id).toBeDefined();
      expect(product.variants[0].createdAt).toBeInstanceOf(Date);
      expect(product.variants[0].updatedAt).toBeInstanceOf(Date);
      expect(product.variants[0]._id).not.toBe(product.variants[1]._id);
    });

    it('coerces invalid numeric input instead of crashing (Impossible edge case)', async () => {
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true });

      const product = await ProductModel.create({
        name: 'Bad Numbers',
        sku: 'BAD-1',
        // @ts-expect-error testing defensive coercion against garbage input
        regularPrice: 'abc',
        // @ts-expect-error testing defensive coercion against garbage input
        stock: null,
      });

      expect(product.regularPrice).toBe(0);
      expect(product.stock).toBe(0);
    });
  });

  describe('findById()', () => {
    it('returns the matching product', async () => {
      const found = { _id: 'p1', name: 'Tee', sku: 'T-1' };
      mockCollection.findOne.mockResolvedValue(found);

      const product = await ProductModel.findById('p1');
      expect(product).toEqual(found);
      expect(mockCollection.findOne).toHaveBeenCalledWith({ _id: 'p1' });
    });

    it('returns null for a non-existent id (Edge case)', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      const product = await ProductModel.findById('missing');
      expect(product).toBeNull();
    });
  });

  describe('findBySlug()', () => {
    it('returns the matching product by slug', async () => {
      const found = { _id: 'p1', slug: 'classic-cotton-tee' };
      mockCollection.findOne.mockResolvedValue(found);

      const product = await ProductModel.findBySlug('classic-cotton-tee');
      expect(product).toEqual(found);
      expect(mockCollection.findOne).toHaveBeenCalledWith({ slug: 'classic-cotton-tee' });
    });

    it('returns null when the slug does not exist', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      const product = await ProductModel.findBySlug('nope');
      expect(product).toBeNull();
    });
  });

  describe('findBySku()', () => {
    it('returns the matching product by sku', async () => {
      const found = { _id: 'p1', sku: 'TSH-COT-001' };
      mockCollection.findOne.mockResolvedValue(found);

      const product = await ProductModel.findBySku('TSH-COT-001');
      expect(product).toEqual(found);
      expect(mockCollection.findOne).toHaveBeenCalledWith({ sku: 'TSH-COT-001' });
    });

    it('returns null when the sku does not exist', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      const product = await ProductModel.findBySku('DOES-NOT-EXIST');
      expect(product).toBeNull();
    });
  });

  describe('findPaginated()', () => {
    const chain = (toArrayValue: unknown[]) => {
      const toArrayMock = jest.fn().mockResolvedValue(toArrayValue);
      const limitMock = jest.fn().mockReturnValue({ toArray: toArrayMock });
      const skipMock = jest.fn().mockReturnValue({ limit: limitMock });
      const sortMock = jest.fn().mockReturnValue({ skip: skipMock });
      return { sortMock, toArrayMock };
    };

    it('returns products and total count', async () => {
      const products = [
        { _id: 'p1', name: 'Tee', sku: 'T-1', regularPrice: 10, stock: 5 },
        { _id: 'p2', name: 'Jacket', sku: 'J-1', regularPrice: 20, stock: 0 },
      ];
      const { sortMock } = chain(products);
      mockCollection.find.mockReturnValue({ sort: sortMock });
      mockCollection.countDocuments.mockResolvedValue(2);

      const result = await ProductModel.findPaginated(1, 10);
      expect(result.products).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('handles an empty product list gracefully (Edge case)', async () => {
      const { sortMock } = chain([]);
      mockCollection.find.mockReturnValue({ sort: sortMock });
      mockCollection.countDocuments.mockResolvedValue(0);

      const result = await ProductModel.findPaginated(5, 20);
      expect(result.products).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('applies a name/sku/barcode regex filter when a search term is provided', async () => {
      const { sortMock } = chain([]);
      mockCollection.find.mockReturnValue({ sort: sortMock });
      mockCollection.countDocuments.mockResolvedValue(0);

      await ProductModel.findPaginated(1, 10, { search: 'tee' });

      const filter = mockCollection.find.mock.calls[0][0];
      expect(filter.$or).toEqual([
        { name: { $regex: 'tee', $options: 'i' } },
        { sku: { $regex: 'tee', $options: 'i' } },
        { barcode: { $regex: 'tee', $options: 'i' } },
      ]);
    });

    it('applies reference, status, gender and flag filters', async () => {
      const { sortMock } = chain([]);
      mockCollection.find.mockReturnValue({ sort: sortMock });
      mockCollection.countDocuments.mockResolvedValue(0);

      await ProductModel.findPaginated(1, 10, {
        category: 'cat-1',
        brand: 'brand-1',
        status: 'draft',
        gender: 'women',
        isFeatured: true,
        isNewArrival: true,
        isTrending: false,
      });

      const filter = mockCollection.find.mock.calls[0][0];
      expect(filter).toEqual({
        category: 'cat-1',
        brand: 'brand-1',
        status: 'draft',
        gender: 'women',
        isFeatured: true,
        isNewArrival: true,
        isTrending: false,
      });
    });
  });

  describe('update()', () => {
    it('updates a product and returns true', async () => {
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const success = await ProductModel.update('p1', { regularPrice: 79.99, stock: 10 });
      expect(success).toBe(true);
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: 'p1' },
        expect.objectContaining({ $set: expect.objectContaining({ regularPrice: 79.99, stock: 10 }) })
      );
    });

    it('returns false when the product does not exist (Edge case)', async () => {
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 0 });

      const success = await ProductModel.update('missing', { regularPrice: 1 });
      expect(success).toBe(false);
    });

    it('re-slugifies the name when a slug is not provided', async () => {
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

      await ProductModel.update('p1', { name: '  New  Name  ' });

      const { $set } = mockCollection.updateOne.mock.calls[0][1];
      expect($set.slug).toBe('new-name');
      expect($set.updatedAt).toBeInstanceOf(Date);
    });

    it('hydrates variant payloads when replacing variants', async () => {
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

      await ProductModel.update('p1', {
        variants: [{ sku: 'T-NEW', price: 11, stock: 4 }],
      });

      const { $set } = mockCollection.updateOne.mock.calls[0][1];
      expect($set.variants).toHaveLength(1);
      expect($set.variants[0]._id).toBeDefined();
      expect($set.variants[0].sku).toBe('T-NEW');
      expect($set.variants[0].createdAt).toBeInstanceOf(Date);
    });
  });

  describe('delete()', () => {
    it('deletes a product and returns true', async () => {
      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const success = await ProductModel.delete('p1');
      expect(success).toBe(true);
      expect(mockCollection.deleteOne).toHaveBeenCalledWith({ _id: 'p1' });
    });

    it('returns false when nothing was deleted (Edge case)', async () => {
      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 0 });

      const success = await ProductModel.delete('missing');
      expect(success).toBe(false);
    });
  });

  describe('findAll()', () => {
    it('returns every product sorted by newest first', async () => {
      const products = [{ _id: 'p1' }, { _id: 'p2' }];
      const toArrayMock = jest.fn().mockResolvedValue(products);
      const sortMock = jest.fn().mockReturnValue({ toArray: toArrayMock });

      mockCollection.find.mockReturnValue({ sort: sortMock });

      const result = await ProductModel.findAll();
      expect(result).toEqual(products);
      expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
    });
  });
});
