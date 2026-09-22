import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/database';
import { authService } from '../src/services/auth.service';

describe('Auth API', () => {
  let authToken: string;
  let adminId: string;

  beforeAll(async () => {
    // Create test admin
    const passwordHash = await authService.hashPassword('Test@123456');
    const admin = await prisma.admin.create({
      data: {
        name: 'Test Admin',
        email: 'test@empverify.com',
        passwordHash,
        role: 'ADMIN',
      },
    });
    adminId = admin.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.admin.delete({ where: { id: adminId } });
    await prisma.$disconnect();
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@empverify.com',
          password: 'Test@123456',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('admin');

      authToken = response.body.data.token;
    });

    it('should fail with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@empverify.com',
          password: 'WrongPassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should fail with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@empverify.com',
        });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user profile', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('test@empverify.com');
    });

    it('should fail without token', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
