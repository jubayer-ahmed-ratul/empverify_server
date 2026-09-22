import { EmployeeStatus, VerificationResult } from '@prisma/client';
import { prisma } from '../config/database';
import { getCache, setCache } from '../config/redis';
import { uploadService } from './upload.service';

export class DashboardService {
  async getSummary() {
    // Try to get from cache
    const cacheKey = 'dashboard:summary';
    const cached = await getCache(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    // Calculate summary using efficient database aggregation
    const now = new Date();

    const [
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      suspendedEmployees,
      expiredEmployees,
    ] = await Promise.all([
      prisma.employee.count({
        where: { deletedAt: null },
      }),
      prisma.employee.count({
        where: {
          deletedAt: null,
          status: EmployeeStatus.ACTIVE,
          idExpiryDate: { gte: now },
        },
      }),
      prisma.employee.count({
        where: {
          deletedAt: null,
          status: EmployeeStatus.INACTIVE,
        },
      }),
      prisma.employee.count({
        where: {
          deletedAt: null,
          status: EmployeeStatus.SUSPENDED,
        },
      }),
      prisma.employee.count({
        where: {
          deletedAt: null,
          idExpiryDate: { lt: now },
        },
      }),
    ]);

    const summary = {
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      suspendedEmployees,
      expiredEmployees,
    };

    // Cache for 60 seconds
    await setCache(cacheKey, JSON.stringify(summary), 60);

    return summary;
  }

  async getRecentEmployees(limit: number = 10) {
    const employees = await prisma.employee.findMany({
      where: { deletedAt: null },
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        employeeId: true,
        fullName: true,
        photoUrl: true,
        position: true,
        department: true,
        status: true,
        createdAt: true,
      },
    });

    // Optimize photo URLs
    return employees.map((emp) => ({
      ...emp,
      photoUrl: emp.photoUrl
        ? uploadService.getOptimizedImageUrl(emp.photoUrl, 'thumbnail')
        : null,
    }));
  }

  async getRecentVerifications(limit: number = 10) {
    const verifications = await prisma.verificationLog.findMany({
      take: limit,
      orderBy: { verifiedAt: 'desc' },
      select: {
        id: true,
        result: true,
        verifiedAt: true,
        employee: {
          select: {
            employeeId: true,
            fullName: true,
            department: true,
          },
        },
      },
    });

    return verifications;
  }

  async getVerificationStats() {
    // Try to get from cache
    const cacheKey = 'dashboard:verification-stats';
    const cached = await getCache(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get verification counts using efficient aggregation
    const [todayStats, weekStats, monthStats] = await Promise.all([
      this.getVerificationStatsByPeriod(startOfToday),
      this.getVerificationStatsByPeriod(startOfWeek),
      this.getVerificationStatsByPeriod(startOfMonth),
    ]);

    const stats = {
      today: todayStats,
      thisWeek: weekStats,
      thisMonth: monthStats,
    };

    // Cache for 60 seconds
    await setCache(cacheKey, JSON.stringify(stats), 60);

    return stats;
  }

  private async getVerificationStatsByPeriod(startDate: Date) {
    const results = await prisma.verificationLog.groupBy({
      by: ['result'],
      where: {
        verifiedAt: { gte: startDate },
      },
      _count: {
        result: true,
      },
    });

    const stats = {
      total: 0,
      valid: 0,
      invalid: 0,
      inactive: 0,
      suspended: 0,
      expired: 0,
    };

    results.forEach((result) => {
      const count = result._count.result;
      stats.total += count;

      switch (result.result) {
        case VerificationResult.VALID:
          stats.valid += count;
          break;
        case VerificationResult.INVALID_TOKEN:
          stats.invalid += count;
          break;
        case VerificationResult.INACTIVE:
          stats.inactive += count;
          break;
        case VerificationResult.SUSPENDED:
          stats.suspended += count;
          break;
        case VerificationResult.EXPIRED:
          stats.expired += count;
          break;
      }
    });

    return stats;
  }

  async getDepartmentStats() {
    const cacheKey = 'dashboard:department-stats';
    const cached = await getCache(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const stats = await prisma.employee.groupBy({
      by: ['department'],
      where: { deletedAt: null },
      _count: {
        department: true,
      },
      orderBy: {
        _count: {
          department: 'desc',
        },
      },
      take: 10,
    });

    const departmentStats = stats.map((stat) => ({
      department: stat.department,
      count: stat._count.department,
    }));

    // Cache for 5 minutes
    await setCache(cacheKey, JSON.stringify(departmentStats), 300);

    return departmentStats;
  }
}

export const dashboardService = new DashboardService();
