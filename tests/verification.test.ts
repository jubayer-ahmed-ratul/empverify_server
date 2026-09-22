import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/database';
import { authService } from '../src/services/auth.service';
import { qrService } from '../src/services/qr.service';

describe('Verification API', () => {
  let authToken: string;
  let adminId: string;
  let employeeId: string;
  let verificationToken: string;

  beforeAll(async () => {
    // Create test admin
    const passwordHash = await authService.hashPassword('Test@123456');
    const admin = await prisma.admin.create({
      data: {
        name: 'Test Admin',
        email: 'verify-test@empverify.com',
        passwordHash,
        role: 'ADMIN',
      },
    });
    adminId = admin.id;

    // Login to get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'verify-test@empverify.com',
        password: 'Test@123456',
      });

    authToken = loginResponse.body.data.token;

    // Create test employee with QR
    const qrData = await qrService.generateQRCode();
    const employee = await prisma.employee.create({
      data: {
        employeeId: 'VERIFY-TEST-001',
        fullName: 'Verification Test User',
        position: 'Tester',
        department: 'QA',
        companyName: 'Test Company',
        joiningDate: new Date('2024-01-01'),
        idExpiryDate: new Date('2025-12-31'),
        status: 'ACTIVE',
        verificationToken: qrData.verificationToken,
      },
    });

    employeeId = employee.id;
    verificationToken = employee.verificationToken;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.employee.delete({ where: { id: employeeId } });
    await prisma.admin.delete({ where: { id: adminId } });
    await prisma.$disconnect();
  });

  describe('GET /verify/:verificationToken', () => {
    it('should verify active employee successfully', async () => {
      const response = await request(app)
        .get(`/api/verify/${verificationToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.valid).toBe(true);
      expect(response.body.data.status).toBe('VALID');
      expect(response.body.data.employee).toHaveProperty('employeeId');
      expect(response.body.data.employee).toHaveProperty('fullName');
      expect(response.body.data.employee.employeeId).toBe('VERIFY-TEST-001');
    });

    it('should return invalid for non-existent token', async () => {
      const response = await request(app)
        .get('/api/verify/invalid-token-12345');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.valid).toBe(false);
      expect(response.body.data.status).toBe('INVALID_ID');
      expect(response.body.data).not.toHaveProperty('employee');
    });

    it('should return inactive for inactive employee', async () => {
      // Update employee to inactive
      await prisma.employee.update({
        where: { id: employeeId },
        data: { status: 'INACTIVE' },
      });

      const response = await request(app)
        .get(`/api/verify/${verificationToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.valid).toBe(false);
      expect(response.body.data.status).toBe('INACTIVE');

      // Restore to active
      await prisma.employee.update({
        where: { id: employeeId },
        data: { status: 'ACTIVE' },
      });
    });

    it('should return suspended for suspended employee', async () => {
      // Update employee to suspended
      await prisma.employee.update({
        where: { id: employeeId },
        data: { status: 'SUSPENDED' },
      });

      const response = await request(app)
        .get(`/api/verify/${verificationToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.valid).toBe(false);
      expect(response.body.data.status).toBe('SUSPENDED');

      // Restore to active
      await prisma.employee.update({
        where: { id: employeeId },
        data: { status: 'ACTIVE' },
      });
    });

    it('should return expired for expired ID', async () => {
      // Set expiry date to past
      await prisma.employee.update({
        where: { id: employeeId },
        data: { idExpiryDate: new Date('2020-01-01') },
      });

      const response = await request(app)
        .get(`/api/verify/${verificationToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.valid).toBe(false);
      expect(response.body.data.status).toBe('EXPIRED');

      // Restore expiry date
      await prisma.employee.update({
        where: { id: employeeId },
        data: { idExpiryDate: new Date('2025-12-31') },
      });
    });

    it('should create verification log', async () => {
      await request(app).get(`/api/verify/${verificationToken}`);

      const logs = await prisma.verificationLog.findMany({
        where: { employeeId },
      });

      expect(logs.length).toBeGreaterThan(0);
    });
  });

  describe('POST /employees/:id/regenerate-qr', () => {
    it('should regenerate QR and invalidate old one', async () => {
      const oldToken = verificationToken;

      // Regenerate QR
      const regenerateResponse = await request(app)
        .post(`/api/employees/${employeeId}/regenerate-qr`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(regenerateResponse.status).toBe(200);
      expect(regenerateResponse.body.data).toHaveProperty('verificationUrl');
      expect(regenerateResponse.body.data).toHaveProperty('qrCode');

      // Get new token from database
      const employee = await prisma.employee.findUnique({
        where: { id: employeeId },
        select: { verificationToken: true },
      });

      const newToken = employee!.verificationToken;
      expect(newToken).not.toBe(oldToken);

      // Old token should be invalid
      const oldVerifyResponse = await request(app)
        .get(`/api/verify/${oldToken}`);

      expect(oldVerifyResponse.body.data.valid).toBe(false);
      expect(oldVerifyResponse.body.data.status).toBe('INVALID_ID');

      // New token should be valid
      const newVerifyResponse = await request(app)
        .get(`/api/verify/${newToken}`);

      expect(newVerifyResponse.body.data.valid).toBe(true);
      expect(newVerifyResponse.body.data.status).toBe('VALID');

      // Update verificationToken for cleanup
      verificationToken = newToken;
    });
  });
});
