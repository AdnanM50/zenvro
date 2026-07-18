import { hashPassword, verifyPassword, generateAccessToken, verifyAccessToken, generateRefreshToken, verifyRefreshToken } from '@/lib/auth';

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

  describe('generateAccessToken', () => {
    it('should generate a JWT access token', () => {
      const userId = '123';
      const email = 'test@example.com';
      const token = generateAccessToken(userId, email);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify a valid access token', () => {
      const userId = '123';
      const email = 'test@example.com';
      const token = generateAccessToken(userId, email);
      
      const decoded = verifyAccessToken(token);
      expect(decoded).toBeDefined();
      expect(decoded?.userId).toBe(userId);
      expect(decoded?.email).toBe(email);
    });

    it('should return null for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      const decoded = verifyAccessToken(invalidToken);
      expect(decoded).toBeNull();
    });

    it('should return null for malformed token', () => {
      const decoded = verifyAccessToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.expired');
      expect(decoded).toBeNull();
    });

    it('should return null when verifying a refresh token as access token', () => {
      const token = generateRefreshToken('123', 'test@example.com');
      const decoded = verifyAccessToken(token);
      expect(decoded).toBeNull();
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a JWT refresh token', () => {
      const userId = '123';
      const email = 'test@example.com';
      const token = generateRefreshToken(userId, email);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token', () => {
      const userId = '123';
      const email = 'test@example.com';
      const token = generateRefreshToken(userId, email);
      
      const decoded = verifyRefreshToken(token);
      expect(decoded).toBeDefined();
      expect(decoded?.userId).toBe(userId);
      expect(decoded?.email).toBe(email);
    });

    it('should return null for invalid token', () => {
      const decoded = verifyRefreshToken('invalid.token.here');
      expect(decoded).toBeNull();
    });

    it('should return null when verifying an access token as refresh token', () => {
      const token = generateAccessToken('123', 'test@example.com');
      const decoded = verifyRefreshToken(token);
      expect(decoded).toBeNull();
    });
  });
});
