import { EmployeeStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { qrService } from './qr.service';
import { uploadService } from './upload.service';
import { auditService } from './audit.service';
import {
  CreateEmployeeInput,
  UpdateEmployeeInput,
  EmployeeListQuery,
} from '../validators/employee.validator';
import { getPagination, getPaginationMeta } from '../utils/pagination';
import { deleteCachePattern } from '../config/redis';

export class EmployeeService {
  async createEmployee(
    input: CreateEmployeeInput,
    photo: Express.Multer.File | undefined,
    adminId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    // Check if employeeId already exists
    const existing = await prisma.employee.findUnique({
      where: { employeeId: input.employeeId },
      select: { id: true },
    });

    if (existing) {
      throw new Error('Employee ID already exists');
    }

    // Generate QR code
    const qrData = await qrService.generateQRCode();

    // Upload photo if provided
    let photoUrl: string | undefined;
    let photoPublicId: string | undefined;

    if (photo) {
      const uploadResult = await uploadService.uploadEmployeePhoto(
        photo.buffer,
        input.employeeId
      );
      photoUrl = uploadResult.url;
      photoPublicId = uploadResult.publicId;
    }

    // Create employee
    const employee = await prisma.employee.create({
      data: {
        employeeId: input.employeeId,
        fullName: input.fullName,
        email: input.email || null,
        phone: input.phone,
        photoUrl,
        photoPublicId,
        position: input.position,
        department: input.department,
        companyName: input.companyName,
        joiningDate: new Date(input.joiningDate),
        idExpiryDate: new Date(input.idExpiryDate),
        verificationToken: qrData.verificationToken,
        status: EmployeeStatus.ACTIVE,
      },
      select: {
        id: true,
        employeeId: true,
        fullName: true,
        email: true,
        phone: true,
        photoUrl: true,
        position: true,
        department: true,
        companyName: true,
        joiningDate: true,
        idGenerationDate: true,
        idExpiryDate: true,
        status: true,
        createdAt: true,
      },
    });

    // Invalidate cache
    await deleteCachePattern('dashboard:*');

    // Create audit log
    await auditService.createLog({
      adminId,
      action: 'CREATE_EMPLOYEE',
      entityType: 'Employee',
      entityId: employee.id,
      metadata: {
        employeeId: employee.employeeId,
        fullName: employee.fullName,
      },
      ipAddress,
      userAgent,
    });

    return {
      employee,
      verificationUrl: qrData.verificationUrl,
      qrCode: qrData.qrCodeDataUrl,
    };
  }

  async getEmployees(query: EmployeeListQuery) {
    const page = parseInt(query.page);
    const limit = parseInt(query.limit);
    const { skip, take } = getPagination(page, limit, 100);

    // Build where clause
    const where: Prisma.EmployeeWhereInput = {
      deletedAt: null,
    };

    // Search functionality
    if (query.search) {
      where.OR = [
        { employeeId: { contains: query.search, mode: 'insensitive' } },
        { fullName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { department: { contains: query.search, mode: 'insensitive' } },
        { position: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.department) {
      where.department = { contains: query.department, mode: 'insensitive' };
    }

    if (query.position) {
      where.position = { contains: query.position, mode: 'insensitive' };
    }

    // Sorting
    const orderBy: Prisma.EmployeeOrderByWithRelationInput = {};
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';
    orderBy[sortBy as keyof Prisma.EmployeeOrderByWithRelationInput] = sortOrder;

    // Execute queries in parallel
    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        skip,
        take,
        orderBy,
        select: {
          id: true,
          employeeId: true,
          fullName: true,
          email: true,
          phone: true,
          photoUrl: true,
          position: true,
          department: true,
          companyName: true,
          status: true,
          idExpiryDate: true,
          createdAt: true,
        },
      }),
      prisma.employee.count({ where }),
    ]);

    // Optimize photo URLs for list view
    const optimizedEmployees = employees.map((emp) => ({
      ...emp,
      photoUrl: emp.photoUrl
        ? uploadService.getOptimizedImageUrl(emp.photoUrl, 'thumbnail')
        : null,
    }));

    return {
      employees: optimizedEmployees,
      pagination: getPaginationMeta(page, limit, total),
    };
  }

  async getEmployeeById(id: string) {
    const employee = await prisma.employee.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        employeeId: true,
        fullName: true,
        email: true,
        phone: true,
        photoUrl: true,
        position: true,
        department: true,
        companyName: true,
        joiningDate: true,
        idGenerationDate: true,
        idExpiryDate: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!employee) {
      throw new Error('Employee not found');
    }

    return employee;
  }

  async updateEmployee(
    id: string,
    input: UpdateEmployeeInput,
    photo: Express.Multer.File | undefined,
    adminId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const existing = await prisma.employee.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, photoPublicId: true, employeeId: true },
    });

    if (!existing) {
      throw new Error('Employee not found');
    }

    let photoUrl: string | undefined;
    let photoPublicId: string | undefined;

    // Handle photo upload
    if (photo) {
      // Delete old photo
      if (existing.photoPublicId) {
        await uploadService.deleteEmployeePhoto(existing.photoPublicId);
      }

      // Upload new photo
      const uploadResult = await uploadService.uploadEmployeePhoto(
        photo.buffer,
        existing.employeeId
      );
      photoUrl = uploadResult.url;
      photoPublicId = uploadResult.publicId;
    }

    // Prepare update data
    const updateData: Prisma.EmployeeUpdateInput = {
      ...input,
      ...(input.joiningDate && { joiningDate: new Date(input.joiningDate) }),
      ...(input.idExpiryDate && { idExpiryDate: new Date(input.idExpiryDate) }),
      ...(photoUrl && { photoUrl, photoPublicId }),
    };

    // Update employee
    const employee = await prisma.employee.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        employeeId: true,
        fullName: true,
        email: true,
        phone: true,
        photoUrl: true,
        position: true,
        department: true,
        companyName: true,
        joiningDate: true,
        idGenerationDate: true,
        idExpiryDate: true,
        status: true,
        updatedAt: true,
      },
    });

    // Invalidate cache
    await deleteCachePattern('dashboard:*');

    // Create audit log
    await auditService.createLog({
      adminId,
      action: 'UPDATE_EMPLOYEE',
      entityType: 'Employee',
      entityId: employee.id,
      metadata: {
        employeeId: employee.employeeId,
        updates: Object.keys(input),
      },
      ipAddress,
      userAgent,
    });

    return employee;
  }

  async deleteEmployee(
    id: string,
    adminId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const existing = await prisma.employee.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, employeeId: true, fullName: true },
    });

    if (!existing) {
      throw new Error('Employee not found');
    }

    // Soft delete
    await prisma.employee.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Invalidate cache
    await deleteCachePattern('dashboard:*');

    // Create audit log
    await auditService.createLog({
      adminId,
      action: 'DELETE_EMPLOYEE',
      entityType: 'Employee',
      entityId: existing.id,
      metadata: {
        employeeId: existing.employeeId,
        fullName: existing.fullName,
      },
      ipAddress,
      userAgent,
    });
  }

  async regenerateQR(
    id: string,
    adminId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const existing = await prisma.employee.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, employeeId: true },
    });

    if (!existing) {
      throw new Error('Employee not found');
    }

    // Generate new QR code
    const qrData = await qrService.generateQRCode();

    // Update employee with new verification token
    await prisma.employee.update({
      where: { id },
      data: {
        verificationToken: qrData.verificationToken,
      },
    });

    // Create audit log
    await auditService.createLog({
      adminId,
      action: 'REGENERATE_QR',
      entityType: 'Employee',
      entityId: existing.id,
      metadata: {
        employeeId: existing.employeeId,
      },
      ipAddress,
      userAgent,
    });

    return {
      verificationUrl: qrData.verificationUrl,
      qrCode: qrData.qrCodeDataUrl,
    };
  }

  async getIdCard(id: string) {
    const employee = await prisma.employee.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        employeeId: true,
        fullName: true,
        photoUrl: true,
        position: true,
        department: true,
        companyName: true,
        idGenerationDate: true,
        idExpiryDate: true,
        verificationToken: true,
      },
    });

    if (!employee) {
      throw new Error('Employee not found');
    }

    // Generate QR code for the card
    const qrCode = await qrService.generateQRCodeSVG(employee.verificationToken);
    const verificationUrl = `${process.env.APP_URL}/verify/${employee.verificationToken}`;

    return {
      ...employee,
      photoUrl: employee.photoUrl
        ? uploadService.getOptimizedImageUrl(employee.photoUrl, 'card')
        : null,
      verificationUrl,
      qrCode,
    };
  }
}

export const employeeService = new EmployeeService();
