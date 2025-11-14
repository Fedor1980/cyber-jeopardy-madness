import { hashPassword, comparePassword, generateAccessToken, verifyAccessToken } from '../src/utils/encryption';
import { UserRole } from '../src/types';

describe('Authentication Utilities', () => {
  describe('Password Hashing', () => {
    it('should hash a password', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should verify correct password', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);
      const isValid = await comparePassword(password, hash);

      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword';
      const hash = await hashPassword(password);
      const isValid = await comparePassword(wrongPassword, hash);

      expect(isValid).toBe(false);
    });
  });

  describe('JWT Tokens', () => {
    it('should generate a valid access token', () => {
      const token = generateAccessToken('user123', 'testuser', UserRole.PLAYER);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should verify and decode a valid token', () => {
      const userId = 'user123';
      const username = 'testuser';
      const role = UserRole.PLAYER;

      const token = generateAccessToken(userId, username, role);
      const decoded = verifyAccessToken(token);

      expect(decoded.userId).toBe(userId);
      expect(decoded.username).toBe(username);
      expect(decoded.role).toBe(role);
    });

    it('should reject invalid token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => verifyAccessToken(invalidToken)).toThrow();
    });
  });
});
