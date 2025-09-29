import { User } from '../types';

export class UserModel {
  private static users: User[] = [
    {
      id: 'user-001',
      username: 'admin',
      role: 'admin',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      lastLogin: new Date()
    },
    {
      id: 'user-002',
      username: 'manager',
      role: 'manager',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      lastLogin: new Date()
    },
    {
      id: 'user-003',
      username: 'staff',
      role: 'staff',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      lastLogin: new Date()
    }
  ];

  static async findByUsername(username: string): Promise<User | null> {
    return this.users.find(user => user.username === username && user.isActive) || null;
  }

  static async findById(id: string): Promise<User | null> {
    return this.users.find(user => user.id === id && user.isActive) || null;
  }

  static async updateLastLogin(id: string): Promise<void> {
    const user = this.users.find(u => u.id === id);
    if (user) {
      user.lastLogin = new Date();
    }
  }

  static async getAll(): Promise<User[]> {
    return this.users.filter(user => user.isActive);
  }

  static async create(username: string, role: string = 'staff'): Promise<User> {
    // Check if username already exists
    const existingUser = this.users.find(user => user.username === username);
    if (existingUser) {
      throw new Error('Username already exists');
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      username,
      role: role as 'admin' | 'manager' | 'staff',
      isActive: true,
      createdAt: new Date(),
      lastLogin: new Date()
    };

    this.users.push(newUser);
    return newUser;
  }
}
