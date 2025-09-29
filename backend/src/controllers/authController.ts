import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { LoginRequest, AuthResponse } from '../types';
import { generateToken, comparePassword } from '../middleware/auth';

export class AuthController {
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password }: LoginRequest = req.body;

      if (!username || !password) {
        const response: AuthResponse = {
          success: false,
          error: 'Username and password are required'
        };
        res.status(400).json(response);
        return;
      }

      const user = await UserModel.findByUsername(username);
      if (!user) {
        const response: AuthResponse = {
          success: false,
          error: 'Invalid credentials'
        };
        res.status(401).json(response);
        return;
      }

      // For demo purposes, we'll use simple password comparison
      // In production, use proper password hashing
      const isPasswordValid = await comparePassword(password, password);

      if (!isPasswordValid) {
        const response: AuthResponse = {
          success: false,
          error: 'Invalid credentials'
        };
        res.status(401).json(response);
        return;
      }

      // Update last login
      await UserModel.updateLastLogin(user.id);

      const token = generateToken(user);

      const response: AuthResponse = {
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        },
        message: 'Login successful'
      };
      res.json(response);
    } catch (error) {
      const response: AuthResponse = {
        success: false,
        error: 'Login failed'
      };
      res.status(500).json(response);
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    try {
      // In a more sophisticated implementation, you might want to:
      // - Add the token to a blacklist
      // - Clear any server-side sessions
      // - Log the logout event

      const response: AuthResponse = {
        success: true,
        message: 'Logout successful'
      };
      res.json(response);
    } catch (error) {
      const response: AuthResponse = {
        success: false,
        error: 'Logout failed'
      };
      res.status(500).json(response);
    }
  }

  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        const response: AuthResponse = {
          success: false,
          error: 'User not authenticated'
        };
        res.status(401).json(response);
        return;
      }

      const response: AuthResponse = {
        success: true,
        user: req.user,
        message: 'Profile retrieved successfully'
      };
      res.json(response);
    } catch (error) {
      const response: AuthResponse = {
        success: false,
        error: 'Failed to retrieve profile'
      };
      res.status(500).json(response);
    }
  }

  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, password, role = 'staff' }: { username: string; password: string; role?: string } = req.body;

      if (!username || !password) {
        const response: AuthResponse = {
          success: false,
          error: 'Username and password are required'
        };
        res.status(400).json(response);
        return;
      }

      if (username.length < 3) {
        const response: AuthResponse = {
          success: false,
          error: 'Username must be at least 3 characters long'
        };
        res.status(400).json(response);
        return;
      }

      if (password.length < 6) {
        const response: AuthResponse = {
          success: false,
          error: 'Password must be at least 6 characters long'
        };
        res.status(400).json(response);
        return;
      }

      // Check if user already exists
      const existingUser = await UserModel.findByUsername(username);
      if (existingUser) {
        const response: AuthResponse = {
          success: false,
          error: 'Username already exists'
        };
        res.status(409).json(response);
        return;
      }

      // Create new user
      const newUser = await UserModel.create(username, role);

      // For demo purposes, we'll use simple password storage
      // In production, you would hash the password properly
      const token = generateToken(newUser);

      const response: AuthResponse = {
        success: true,
        token,
        user: {
          id: newUser.id,
          username: newUser.username,
          role: newUser.role,
          isActive: newUser.isActive,
          createdAt: newUser.createdAt,
          lastLogin: newUser.lastLogin
        },
        message: 'Account created successfully'
      };
      res.status(201).json(response);
    } catch (error) {
      const response: AuthResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      };
      res.status(500).json(response);
    }
  }

  static async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      // Only admins and managers can view all users
      if (!req.user || !['admin', 'manager'].includes(req.user.role)) {
        const response: AuthResponse = {
          success: false,
          error: 'Insufficient permissions'
        };
        res.status(403).json(response);
        return;
      }

      const users = await UserModel.getAll();
      const response: AuthResponse = {
        success: true,
        data: users,
        message: 'Users retrieved successfully'
      };
      res.json(response);
    } catch (error) {
      const response: AuthResponse = {
        success: false,
        error: 'Failed to retrieve users'
      };
      res.status(500).json(response);
    }
  }
}
