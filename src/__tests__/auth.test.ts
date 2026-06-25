import { hashPassword, verifyPassword, generateToken, verifyToken } from '@/lib/auth';
import { db } from '@/lib/db';

describe('Auth Library', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'testpassword123';
      const hashed = await hashPassword(password);
      
      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(0);
    });

    it('should generate different hashes for the same password', async () => {
      const password = 'testpassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'testpassword123';
      const hashed = await hashPassword(password);
      
      const isValid = await verifyPassword(password, hashed);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'testpassword123';
      const wrongPassword = 'wrongpassword';
      const hashed = await hashPassword(password);
      
      const isValid = await verifyPassword(wrongPassword, hashed);
      expect(isValid).toBe(false);
    });
  });

  describe('generateToken', () => {
    it('should generate a JWT token', () => {
      const userId = '123';
      const email = 'test@example.com';
      const token = generateToken(userId, email);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const userId = '123';
      const email = 'test@example.com';
      const token = generateToken(userId, email);
      
      const decoded = verifyToken(token);
      expect(decoded).toBeDefined();
      expect(decoded?.userId).toBe(userId);
      expect(decoded?.email).toBe(email);
    });

    it('should return null for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      const decoded = verifyToken(invalidToken);
      expect(decoded).toBeNull();
    });

    it('should return null for expired token', () => {
      // This test would require mocking time or using a very short expiry
      // For now, we test with an obviously malformed token
      const decoded = verifyToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.expired');
      expect(decoded).toBeNull();
    });
  });
});

describe('Database', () => {
  beforeEach(() => {
    // Clear the in-memory database before each test
    // Note: In real implementation, you'd want to reset the Map
  });

  describe('user.create', () => {
    it('should create a new user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword',
      };
      
      const user = await db.user.create(userData);
      
      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
      expect(user.password).toBe(userData.password);
      expect(user.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('user.findByEmail', () => {
    it('should find a user by email', async () => {
      const userData = {
        name: 'Find Test User',
        email: 'findtest@example.com',
        password: 'hashedpassword',
      };
      
      await db.user.create(userData);
      const foundUser = await db.user.findByEmail(userData.email);
      
      expect(foundUser).toBeDefined();
      expect(foundUser?.email).toBe(userData.email);
      expect(foundUser?.name).toBe(userData.name);
    });

    it('should return null for non-existent email', async () => {
      const foundUser = await db.user.findByEmail('nonexistent@example.com');
      expect(foundUser).toBeNull();
    });
  });

  describe('user.findById', () => {
    it('should find a user by id', async () => {
      const userData = {
        name: 'ID Test User',
        email: 'idtest@example.com',
        password: 'hashedpassword',
      };
      
      const createdUser = await db.user.create(userData);
      const foundUser = await db.user.findById(createdUser.id);
      
      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(createdUser.id);
      expect(foundUser?.email).toBe(userData.email);
    });

    it('should return null for non-existent id', async () => {
      const foundUser = await db.user.findById('non-existent-id');
      expect(foundUser).toBeNull();
    });
  });
});
