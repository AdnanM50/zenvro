import { ProductModel } from '@/models/product.model';
import { AttributeModel } from '@/models/attribute.model';
import { VariantModel } from '@/models/variant.model';
import connectToDatabase from '@/lib/mongoose';

jest.mock('@/lib/mongoose', () => {
  return jest.fn().mockResolvedValue({});
});

describe('Fashion eCommerce System (MongoDB & Mongoose Architecture)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Product Model & 3-Step Requirements', () => {
    it('requires category and brand ObjectIds when creating a product', async () => {
      const mockProductDoc = {
        _id: 'prod-123',
        name: 'Olive Leather Jacket',
        sku: 'JKT-OLV-001',
        slug: 'olive-leather-jacket',
        category: 'cat-123',
        brand: 'brand-456',
        regularPrice: 299.99,
        stock: 50,
        sold: 0, // Enforced read-only initially
        status: 'published',
        toObject: () => ({
          _id: 'prod-123',
          name: 'Olive Leather Jacket',
          sku: 'JKT-OLV-001',
          slug: 'olive-leather-jacket',
          category: 'cat-123',
          brand: 'brand-456',
          regularPrice: 299.99,
          stock: 50,
          sold: 0,
          status: 'published',
          seo: {
            title: 'Olive Leather Jacket',
            description: 'Premium jacket',
            robots: 'index, follow',
            sitemap: { include: true, priority: 0.8, changefreq: 'weekly' },
          },
        }),
      };

      const productModelCreateSpy = jest
        .spyOn(require('@/models/product.model').ProductMongooseModel, 'create')
        .mockResolvedValue(mockProductDoc as any);

      const product = await ProductModel.create({
        name: 'Olive Leather Jacket',
        sku: 'JKT-OLV-001',
        category: 'cat-123',
        brand: 'brand-456',
        regularPrice: 299.99,
        stock: 50,
      });

      expect(product).toBeDefined();
      expect(product.category).toBe('cat-123');
      expect(product.brand).toBe('brand-456');
      expect(product.sold).toBe(0);
      productModelCreateSpy.mockRestore();
    });

    it('rejects product creation when Category is missing', async () => {
      await expect(
        ProductModel.create({
          name: 'Jacket without category',
          sku: 'JKT-NO-CAT',
          category: '',
          brand: 'brand-123',
          regularPrice: 100,
          stock: 10,
        })
      ).rejects.toThrow('Category is required');
    });

    it('rejects product creation when Brand is missing', async () => {
      await expect(
        ProductModel.create({
          name: 'Jacket without brand',
          sku: 'JKT-NO-BRAND',
          category: 'cat-123',
          brand: '',
          regularPrice: 100,
          stock: 10,
        })
      ).rejects.toThrow('Brand is required');
    });
  });

  describe('Attributes Model & Variant-Enabled Filtering', () => {
    it('creates attributes with useForVariants flag', async () => {
      const mockAttrDoc = {
        _id: 'attr-color',
        name: 'Color',
        values: ['Olive', 'Black', 'White'],
        useForVariants: true,
        isVariant: true,
        toObject: () => ({
          _id: 'attr-color',
          name: 'Color',
          values: ['Olive', 'Black', 'White'],
          useForVariants: true,
          isVariant: true,
        }),
      };

      const attrCreateSpy = jest
        .spyOn(require('@/models/attribute.model').AttributeMongooseModel, 'create')
        .mockResolvedValue(mockAttrDoc as any);

      const attr = await AttributeModel.create({
        name: 'Color',
        values: ['Olive', 'Black', 'White'],
        useForVariants: true,
      });

      expect(attr.name).toBe('Color');
      expect(attr.useForVariants).toBe(true);
      attrCreateSpy.mockRestore();
    });
  });

  describe('Variants Separate Collection & Duplicate Combination Prevention', () => {
    it('creates a variant referencing productId in a separate collection', async () => {
      const mockVariantDoc = {
        _id: 'var-1',
        productId: 'prod-123',
        sku: 'JKT-OLV-M',
        attributes: { Color: 'Olive', Size: 'M' },
        price: 299.99,
        stock: 10,
        sold: 0,
        status: 'active',
        toObject: () => ({
          _id: 'var-1',
          productId: 'prod-123',
          sku: 'JKT-OLV-M',
          attributes: { Color: 'Olive', Size: 'M' },
          price: 299.99,
          stock: 10,
          sold: 0,
          status: 'active',
        }),
      };

      const findSpy = jest
        .spyOn(require('@/models/variant.model').VariantMongooseModel, 'find')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        } as any);

      const createSpy = jest
        .spyOn(require('@/models/variant.model').VariantMongooseModel, 'create')
        .mockResolvedValue(mockVariantDoc as any);

      const variant = await VariantModel.create({
        productId: 'prod-123',
        sku: 'JKT-OLV-M',
        attributes: { Color: 'Olive', Size: 'M' },
        price: 299.99,
        stock: 10,
      });

      expect(variant.productId).toBe('prod-123');
      expect(variant.sku).toBe('JKT-OLV-M');
      expect(variant.attributes).toEqual({ Color: 'Olive', Size: 'M' });

      findSpy.mockRestore();
      createSpy.mockRestore();
    });

    it('prevents duplicate variant attribute combinations for the same product', async () => {
      const existingVariant = {
        _id: 'var-1',
        productId: 'prod-123',
        attributes: { Color: 'Olive', Size: 'M' },
      };

      const findSpy = jest
        .spyOn(require('@/models/variant.model').VariantMongooseModel, 'find')
        .mockReturnValue({
          exec: jest.fn().mockResolvedValue([existingVariant]),
        } as any);

      await expect(
        VariantModel.create({
          productId: 'prod-123',
          sku: 'JKT-OLV-M-DUP',
          attributes: { Color: 'Olive', Size: 'M' },
          price: 299.99,
          stock: 5,
        })
      ).rejects.toThrow('A variant with this attribute combination already exists for this product.');

      findSpy.mockRestore();
    });
  });
});
