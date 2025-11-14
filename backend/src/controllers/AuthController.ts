import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { validate } from '../utils/validators';
import { registerUserSchema, loginSchema } from '../utils/validators';
import { SuccessResponse } from '../types';

export class AuthController {
  /**
   * Register a new user
   */
  static async register(req: Request, res: Response): Promise<void> {
    const data = validate(registerUserSchema)(req.body);

    const result = await AuthService.register(
      data.username,
      data.email,
      data.password,
      data.role
    );

    const response: SuccessResponse<typeof result> = {
      success: true,
      data: result,
      message: 'User registered successfully',
    };

    res.status(201).json(response);
  }

  /**
   * Login user
   */
  static async login(req: Request, res: Response): Promise<void> {
    const data = validate(loginSchema)(req.body);

    const result = await AuthService.login(data.username, data.password);

    const response: SuccessResponse<typeof result> = {
      success: true,
      data: result,
      message: 'Login successful',
    };

    res.status(200).json(response);
  }

  /**
   * Get current user
   */
  static async getCurrentUser(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const response: SuccessResponse<typeof req.user> = {
      success: true,
      data: req.user,
    };

    res.status(200).json(response);
  }

  /**
   * Refresh token
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const result = await AuthService.refreshToken(req.user.userId);

    const response: SuccessResponse<typeof result> = {
      success: true,
      data: result,
      message: 'Token refreshed successfully',
    };

    res.status(200).json(response);
  }
}
