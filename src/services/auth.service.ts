import { UserModel, RefreshToken } from '@/models/user.model';
import { hashPassword, verifyPassword, generateTokenPair } from '@/lib/auth';
import type { UserRole } from '@/types';

export const AuthService = {
  /**
   * Hashes a plain password using salt.
   */
  async hashPassword(password: string): Promise<string> {
    return hashPassword(password);
  },

  /**
   * Verifies password against hashed password.
   */
  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return verifyPassword(password, hashedPassword);
  },

  /**
   * Generates JWT access and refresh token pair.
   */
  createTokenPair(userId: string, email: string, role: UserRole) {
    return generateTokenPair(userId, email, role);
  },

  /**
   * Stores a new refresh token record.
   */
  async createRefreshToken(userId: string, token: string, expiresAt: Date): Promise<RefreshToken> {
    return UserModel.refreshToken.create(userId, token, expiresAt);
  },

  /**
   * Finds an active refresh token.
   */
  async findRefreshToken(token: string): Promise<RefreshToken | null> {
    return UserModel.refreshToken.findByToken(token);
  },

  /**
   * Revokes a refresh token by token string.
   */
  async revokeRefreshToken(token: string): Promise<boolean> {
    return UserModel.refreshToken.revokeByToken(token);
  },

  /**
   * Revokes all active refresh tokens for a user.
   */
  async revokeUserRefreshTokens(userId: string): Promise<void> {
    return UserModel.refreshToken.revokeByUserId(userId);
  },

  /**
   * Cleans up expired refresh tokens.
   */
  async purgeExpiredTokens(): Promise<void> {
    return UserModel.refreshToken.deleteExpired();
  },
};
