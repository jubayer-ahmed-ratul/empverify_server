import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Get seed credentials from environment or use defaults
  const adminName = process.env.SEED_ADMIN_NAME || 'Admin User';
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@empverify.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@123456';

  // Check if admin already exists
  const existingAdmin = await prisma.admin.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log(`✅ Admin user already exists: ${adminEmail}`);
  } else {
    // Hash password
    const passwordHash = await argon2.hash(adminPassword);

    // Create admin user
    const admin = await prisma.admin.create({
      data: {
        name: adminName,
        email: adminEmail,
        passwordHash,
        role: 'SUPER_ADMIN',
      },
    });

    console.log(`✅ Admin user created successfully!`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: ${adminPassword}`);
    console.log(`   ⚠️  Please change the password after first login`);
  }

  console.log('🌱 Database seed completed!');
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
