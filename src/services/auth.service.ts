import argon2 from 'argon2';
import { prisma } from '../config/database';
import { generateToken } from '../utils/jwt';
import { LoginInput } from '../validators/auth.validator';

export class AuthService {
  async login(input: LoginInput, ipAddress?: string, userAgent?: string) {
    const { email, password } = input;

    // Find admin by email
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await argon2.verify(admin.passwordHash, password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token
    const token = generateToken({
      id: admin.id,
      email: admin.email,
      role: admin.role,
    });

    // Create audit log (fire and forget)
    prisma.auditLog
      .create({
        data: {
          adminId: admin.id,
          action: 'LOGIN',
          entityType: 'Admin',
          entityId: admin.id,
          ipAddress,
          userAgent,
        },
      })
      .catch((error) => {
        console.error('Failed to create login audit log:', error);
      });

    return {
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    };
  }

  async getProfile(adminId: string) {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!admin) {
      throw new Error('Admin not found');
    }

    return admin;
  }

  async hashPassword(password: string): Promise<string> {
    return await argon2.hash(password);
  }
}

export const authService = new AuthService();
