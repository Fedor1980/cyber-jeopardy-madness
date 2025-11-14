import { UserModel } from '../models/User';
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
} from '../utils/encryption';
import { AuthenticationError, ConflictError } from '../utils/errors';
import { UserRole } from '../types';

export class AuthService {
  /**
   * Register a new user
   */
  static async register(
    username: string,
    email: string,
    password: string,
    role: UserRole = UserRole.PLAYER
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    user: { id: string; username: string; email: string; role: UserRole };
  }> {
    // Check if user already exists
    const existingUser = await UserModel.findByUsername(username);
    if (existingUser) {
      throw new ConflictError('Username already exists');
    }

    const existingEmail = await UserModel.findByEmail(email);
    if (existingEmail) {
      throw new ConflictError('Email already exists');
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const user = await UserModel.create(username, email, passwordHash, role);

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.username, user.role);
    const refreshToken = generateRefreshToken(user.id, user.username, user.role);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * Login user
   */
  static async login(
    username: string,
    password: string
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    user: { id: string; username: string; email: string; role: UserRole };
  }> {
    // Find user
    const user = await UserModel.findByUsername(username);
    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.username, user.role);
    const refreshToken = generateRefreshToken(user.id, user.username, user.role);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * Refresh access token
   */
  static async refreshToken(userId: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    const accessToken = generateAccessToken(user.id, user.username, user.role);
    const refreshToken = generateRefreshToken(user.id, user.username, user.role);

    return { accessToken, refreshToken };
  }
}
