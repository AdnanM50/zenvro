import { AttributeModel } from '@/models/attribute.model';
import { getDb } from '@/lib/db';

jest.mock('@/lib/db');

describe('AttributeModel Unit Tests (Possible & Impossible Edge Cases)', () => {
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
    it('creates an attribute with values list and variant support', async () => {
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true });

      const attr = await AttributeModel.create({
        name: 'Size',
        values: ['S', 'M', 'L', 'XL'],
        isVariant: true,
      });

      expect(attr.name).toBe('Size');
      expect(attr.values).toEqual(['S', 'M', 'L', 'XL']);
      expect(attr.isVariant).toBe(true);
    });
  });

  describe('findPaginated()', () => {
    it('handles empty attribute list gracefully (Edge case)', async () => {
      const toArrayMock = jest.fn().mockResolvedValue([]);
      const limitMock = jest.fn().mockReturnValue({ toArray: toArrayMock });
      const skipMock = jest.fn().mockReturnValue({ limit: limitMock });
      const sortMock = jest.fn().mockReturnValue({ skip: skipMock });

      mockCollection.find.mockReturnValue({ sort: sortMock });
      mockCollection.countDocuments.mockResolvedValue(0);

      const result = await AttributeModel.findPaginated(1, 10);
      expect(result.attributes).toEqual([]);
      expect(result.total).toBe(0);
    });
  });
});
