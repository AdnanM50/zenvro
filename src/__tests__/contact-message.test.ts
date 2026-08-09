import { ContactMessageModel } from '@/models/contact-message.model';
import { getDb } from '@/lib/db';

jest.mock('@/lib/db');

describe('ContactMessageModel Unit Tests (Possible & Impossible Edge Cases)', () => {
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
    it('creates a message with full schema and defaults', async () => {
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true });

      const item = await ContactMessageModel.create({
        name: '  Jane Doe  ',
        email: '  JANE@EXAMPLE.COM  ',
        subject: '  Sizing question  ',
        message: '  Do you have the SS/26 jacket in XL?  ',
        userId: 'u1',
        isRegistered: true,
      });

      expect(item._id).toBeDefined();
      expect(item.name).toBe('Jane Doe');
      expect(item.email).toBe('jane@example.com');
      expect(item.subject).toBe('Sizing question');
      expect(item.message).toBe('Do you have the SS/26 jacket in XL?');
      expect(item.userId).toBe('u1');
      expect(item.isRegistered).toBe(true);
      expect(item.status).toBe('new');
      expect(item.createdAt).toBeInstanceOf(Date);
      expect(item.updatedAt).toBeInstanceOf(Date);
    });

    it('defaults subject, userId and isRegistered when omitted', async () => {
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true });

      const item = await ContactMessageModel.create({
        name: 'Guest User',
        email: 'guest@example.com',
        message: 'Hello',
      });

      expect(item.subject).toBe('');
      expect(item.userId).toBeUndefined();
      expect(item.isRegistered).toBe(false);
      expect(item.status).toBe('new');
    });

    it('strips whitespace-only userId', async () => {
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true });

      const item = await ContactMessageModel.create({
        name: 'A',
        email: 'a@example.com',
        message: 'Hi',
        userId: '   ',
        isRegistered: true,
      });

      expect(item.userId).toBeUndefined();
    });
  });

  describe('findById()', () => {
    it('returns message when found', async () => {
      const mockDoc = { _id: 'c1', name: 'Jane' };
      mockCollection.findOne.mockResolvedValue(mockDoc);

      const res = await ContactMessageModel.findById('c1');
      expect(res).toEqual(mockDoc);
      expect(mockCollection.findOne).toHaveBeenCalledWith({ _id: 'c1' });
    });

    it('returns null when not found', async () => {
      mockCollection.findOne.mockResolvedValue(null);
      const res = await ContactMessageModel.findById('missing');
      expect(res).toBeNull();
    });
  });

  describe('findByEmail()', () => {
    it('queries lowercased trimmed email and sorts newest first', async () => {
      const mockArray = [{ _id: 'c1' }];
      const mockChain = {
        sort: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue(mockArray),
      };
      mockCollection.find.mockReturnValue(mockChain);

      const res = await ContactMessageModel.findByEmail('  Jane@Example.COM  ');
      expect(res).toEqual(mockArray);
      expect(mockCollection.find).toHaveBeenCalledWith({ email: 'jane@example.com' });
      expect(mockChain.sort).toHaveBeenCalledWith({ createdAt: -1 });
    });
  });

  describe('findPaginated()', () => {
    it('applies search and status filters with pagination', async () => {
      const mockArray = [{ _id: 'c1' }];
      const mockChain = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue(mockArray),
      };
      mockCollection.find.mockReturnValue(mockChain);
      mockCollection.countDocuments.mockResolvedValue(1);

      const res = await ContactMessageModel.findPaginated(1, 10, {
        search: 'Jane',
        status: 'new',
      });

      expect(res).toEqual({ messages: mockArray, total: 1 });
      expect(mockCollection.find).toHaveBeenCalledWith({
        $or: [
          { name: { $regex: 'Jane', $options: 'i' } },
          { email: { $regex: 'Jane', $options: 'i' } },
          { subject: { $regex: 'Jane', $options: 'i' } },
          { message: { $regex: 'Jane', $options: 'i' } },
        ],
        status: 'new',
      });
      expect(mockChain.skip).toHaveBeenCalledWith(0);
      expect(mockChain.limit).toHaveBeenCalledWith(10);
    });

    it('returns an empty result set when nothing matches', async () => {
      const mockChain = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue([]),
      };
      mockCollection.find.mockReturnValue(mockChain);
      mockCollection.countDocuments.mockResolvedValue(0);

      const res = await ContactMessageModel.findPaginated(1, 10, {});
      expect(res).toEqual({ messages: [], total: 0 });
    });
  });

  describe('update()', () => {
    it('updates status only', async () => {
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const res = await ContactMessageModel.update('c1', { status: 'answered' });
      expect(res).toBe(true);
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: 'c1' },
        {
          $set: expect.objectContaining({
            status: 'answered',
            updatedAt: expect.any(Date),
          }),
        }
      );
    });

    it('stores reply, repliedBy, and flips status to answered', async () => {
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const res = await ContactMessageModel.update(
        'c1',
        { reply: '  Thanks for reaching out!  ' },
        'admin-1'
      );

      expect(res).toBe(true);
      const setCall = mockCollection.updateOne.mock.calls[0][1].$set;
      expect(setCall.reply).toBe('Thanks for reaching out!');
      expect(setCall.status).toBe('answered');
      expect(setCall.repliedBy).toBe('admin-1');
      expect(setCall.repliedAt).toBeInstanceOf(Date);
    });

    it('throws when reply is empty', async () => {
      await expect(
        ContactMessageModel.update('c1', { reply: '   ' })
      ).rejects.toThrow('Reply cannot be empty');
      expect(mockCollection.updateOne).not.toHaveBeenCalled();
    });

    it('throws when status is invalid', async () => {
      await expect(
        ContactMessageModel.update('c1', { status: 'spam' as never })
      ).rejects.toThrow('Status must be new or answered');
      expect(mockCollection.updateOne).not.toHaveBeenCalled();
    });

    it('returns false when document to update is not found', async () => {
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 0 });
      const res = await ContactMessageModel.update('c999', { status: 'answered' });
      expect(res).toBe(false);
    });
  });

  describe('delete()', () => {
    it('returns true on successful deletion', async () => {
      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 1 });
      const res = await ContactMessageModel.delete('c1');
      expect(res).toBe(true);
    });

    it('returns false when document to delete is not found', async () => {
      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 0 });
      const res = await ContactMessageModel.delete('c999');
      expect(res).toBe(false);
    });
  });

  describe('countByStatus()', () => {
    it('counts each bucket in parallel', async () => {
      mockCollection.countDocuments.mockResolvedValueOnce(10); // total
      mockCollection.countDocuments.mockResolvedValueOnce(6); // new
      mockCollection.countDocuments.mockResolvedValueOnce(4); // answered
      mockCollection.countDocuments.mockResolvedValueOnce(3); // registered
      mockCollection.countDocuments.mockResolvedValueOnce(7); // guest

      const stats = await ContactMessageModel.countByStatus();
      expect(stats).toEqual({
        total: 10,
        new: 6,
        answered: 4,
        registered: 3,
        guest: 7,
      });

      expect(mockCollection.countDocuments).toHaveBeenCalledWith({ status: 'new' });
      expect(mockCollection.countDocuments).toHaveBeenCalledWith({ status: 'answered' });
      expect(mockCollection.countDocuments).toHaveBeenCalledWith({ isRegistered: true });
      expect(mockCollection.countDocuments).toHaveBeenCalledWith({ isRegistered: false });
    });
  });
});
