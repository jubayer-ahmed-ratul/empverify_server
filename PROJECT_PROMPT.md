# Employee Digital ID & QR Verification System - Complete Project Prompt

## Project Overview
Build a complete, production-ready, high-performance **Employee Digital ID & QR Verification System Backend** using Node.js, Express.js, TypeScript, PostgreSQL, and Prisma ORM.

---

## Technology Stack (MUST USE)

### Required:
- **Backend**: Node.js + Express.js
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT with Argon2 password hashing
- **Validation**: Zod
- **File Upload**: Multer
- **Image Storage**: Cloudinary
- **QR Generation**: qrcode npm package
- **Caching**: Redis (optional)
- **Security**: Helmet, CORS, express-rate-limit
- **Testing**: Vitest or Jest + Supertest

### Do NOT Use:
- NestJS, Fastify, Django, Laravel
- Firebase/Supabase as primary database
- MongoDB

---

## Core Requirements

### 1. System Features

**Admin Side:**
- Login/Logout with JWT
- Dashboard with statistics
- Employee CRUD (Create, Read, Update, Delete)
- Employee search, filter, pagination
- Photo upload to Cloudinary
- QR code generation
- QR code regeneration (invalidates old QR)
- Status management (Active, Inactive, Suspended)
- Audit logs (all admin actions)
- Verification logs (all QR scans)

**Public Side:**
- QR code verification endpoint (no auth required)
- Real-time status checking
- ID expiry validation

---

### 2. QR Code System (CRITICAL REQUIREMENT)

**NEVER store employee data in QR code!**

QR must contain ONLY a verification URL:
```
https://domain.com/verify/{secure-token}
```

**Token Requirements:**
- Cryptographically secure (use crypto.randomBytes)
- 48 bytes, URL-safe
- Unpredictable and unique
- Stored in database with employee record

**How It Works:**
1. Generate secure random token
2. Store token in database with employee
3. QR contains: `APP_URL/verify/{token}`
4. When scanned → API looks up token → returns current status
5. Status changes immediately affect verification
6. QR regeneration invalidates old token

**Status Logic:**
- If employee ACTIVE + not expired → VALID
- If employee INACTIVE → INACTIVE
- If employee SUSPENDED → SUSPENDED
- If ID expired → EXPIRED
- If token not found → INVALID_ID

---

### 3. Performance Requirements (CRITICAL)

**Must handle:**
- 100,000+ employees
- Fast response times (<100ms for most endpoints)
- Efficient database queries
- Proper pagination everywhere

**Performance Rules:**
- ❌ NO SELECT * queries
- ❌ NO loading all employees at once
- ❌ NO N+1 queries
- ❌ NO fetching unnecessary data
- ✅ Database indexes on frequently queried columns
- ✅ Prisma select (only needed fields)
- ✅ Database aggregations (not JS calculations)
- ✅ Pagination (max 100 items per page)
- ✅ Redis caching for dashboard stats

**Dashboard Design:**
- Separate lightweight APIs (not one huge call)
- `/api/dashboard/summary` - counts only
- `/api/dashboard/recent-employees` - 10 items
- `/api/dashboard/recent-verifications` - 10 items
- `/api/dashboard/verification-stats` - aggregated data

**Image Optimization:**
- Cloudinary CDN URLs
- Multiple size variants (thumbnail, medium, large, card)
- On-demand transformations
- WebP/AVIF support

---

### 4. Database Schema

**Models:**

```prisma
model Admin {
  id           String   @id @default(uuid())
  name         String
  email        String   @unique
  passwordHash String
  role         AdminRole @default(ADMIN)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  auditLogs    AuditLog[]
}

model Employee {
  id                String           @id @default(uuid())
  employeeId        String           @unique
  fullName          String
  email             String?
  phone             String?
  photoUrl          String?
  photoPublicId     String?
  position          String
  department        String
  companyName       String
  joiningDate       DateTime
  idGenerationDate  DateTime         @default(now())
  idExpiryDate      DateTime
  status            EmployeeStatus   @default(ACTIVE)
  verificationToken String           @unique
  createdAt         DateTime         @default(now())
  updatedAt         DateTime         @updatedAt
  deletedAt         DateTime?
  verificationLogs  VerificationLog[]
}

model VerificationLog {
  id         String             @id @default(uuid())
  employeeId String
  employee   Employee           @relation(...)
  verifiedAt DateTime           @default(now())
  result     VerificationResult
  ipAddress  String?
  userAgent  String?
}

model AuditLog {
  id         String      @id @default(uuid())
  adminId    String
  admin      Admin       @relation(...)
  action     AuditAction
  entityType String
  entityId   String?
  metadata   Json?
  ipAddress  String?
  userAgent  String?
  createdAt  DateTime    @default(now())
}
```

**Enums:**
```prisma
enum AdminRole { ADMIN, SUPER_ADMIN }
enum EmployeeStatus { ACTIVE, INACTIVE, SUSPENDED }
enum VerificationResult { VALID, INACTIVE, SUSPENDED, EXPIRED, INVALID_TOKEN }
enum AuditAction { LOGIN, CREATE_EMPLOYEE, UPDATE_EMPLOYEE, DELETE_EMPLOYEE, ACTIVATE_EMPLOYEE, DEACTIVATE_EMPLOYEE, SUSPEND_EMPLOYEE, REGENERATE_QR }
```

**Indexes (MUST HAVE):**
```prisma
@@index([employeeId])
@@index([verificationToken])
@@index([status])
@@index([department])
@@index([position])
@@index([createdAt])
@@index([idExpiryDate])
@@index([deletedAt])
```

---

### 5. API Endpoints

**Authentication:**
- POST `/api/auth/login` - Rate limit: 5/15min
- POST `/api/auth/logout`
- GET `/api/auth/me`

**Employees (All require auth):**
- POST `/api/employees` - Create with photo
- GET `/api/employees` - List with pagination, search, filter
- GET `/api/employees/:id` - Get single
- PATCH `/api/employees/:id` - Update
- DELETE `/api/employees/:id` - Soft delete
- POST `/api/employees/:id/regenerate-qr` - New QR
- GET `/api/employees/:id/id-card` - ID card data

**Verification (Public):**
- GET `/api/verify/:token` - Rate limit: 30/min

**Dashboard (Require auth):**
- GET `/api/dashboard/summary`
- GET `/api/dashboard/recent-employees`
- GET `/api/dashboard/recent-verifications`
- GET `/api/dashboard/verification-stats`

**Logs (Require auth):**
- GET `/api/verification-logs` - Paginated
- GET `/api/audit-logs` - Paginated

**Health:**
- GET `/api/health`
- GET `/api/health/db`

---

### 6. Project Structure

```
src/
├── config/
│   ├── env.ts           # Environment validation
│   ├── database.ts      # Prisma client
│   ├── cloudinary.ts    # Cloudinary config
│   └── redis.ts         # Redis config
├── controllers/         # Request handlers
├── services/            # Business logic
├── routes/              # API routes
├── middleware/
│   ├── auth.middleware.ts
│   ├── validate.middleware.ts
│   ├── upload.middleware.ts
│   ├── error.middleware.ts
│   └── rateLimit.middleware.ts
├── validators/          # Zod schemas
├── utils/
│   ├── jwt.ts
│   ├── response.ts
│   ├── pagination.ts
│   └── generateToken.ts
├── app.ts               # Express setup
└── server.ts            # Server entry

prisma/
├── schema.prisma
└── seed.ts              # Create initial admin

tests/                   # Vitest tests
```

---

### 7. Security Requirements

**Authentication:**
- JWT with secure secret (min 32 chars)
- Argon2 password hashing
- Token expiration (7 days default)
- Protected routes with middleware

**Rate Limiting:**
- Login: 5 attempts per 15 minutes
- Verification: 30 requests per minute
- General API: 100 requests per 15 minutes

**Input Validation:**
- Zod schemas for all inputs
- File type validation (JPEG, PNG, WebP)
- File size limit (5MB)
- SQL injection prevention (Prisma)

**Security Headers:**
- Helmet.js
- CORS configuration
- Body size limits

**Data Protection:**
- Soft delete (preserve data)
- No sensitive data in responses
- Audit logging
- No passwords in logs

---

### 8. Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=your-secret-min-32-chars
JWT_EXPIRES_IN=7d

# Application
APP_URL=http://localhost:5000
CORS_ORIGIN=http://localhost:3000

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Redis (Optional)
REDIS_URL=redis://localhost:6379

# Seed
SEED_ADMIN_NAME=Admin User
SEED_ADMIN_EMAIL=admin@empverify.com
SEED_ADMIN_PASSWORD=Admin@123456
```

---

### 9. Response Format

**Success:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "pagination": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error message",
  "errors": [ ... ]
}
```

**HTTP Status Codes:**
- 200 - Success
- 201 - Created
- 400 - Bad Request
- 401 - Unauthorized
- 403 - Forbidden
- 404 - Not Found
- 409 - Conflict
- 422 - Validation Error
- 429 - Too Many Requests
- 500 - Internal Server Error

---

### 10. Testing Requirements

**Test Coverage:**
- Authentication (login, logout, protected routes)
- Employee CRUD operations
- QR verification (all status scenarios)
- Status changes
- QR regeneration
- Search and pagination
- Rate limiting
- Validation

**Use:**
- Vitest or Jest
- Supertest for API testing

---

### 11. Documentation Requirements

Create complete documentation:

1. **README.md** - Main documentation
   - Project overview
   - Features
   - Tech stack
   - Installation guide
   - API documentation
   - Deployment guide

2. **API.md** - Complete API reference
   - All endpoints with examples
   - Request/response formats
   - Authentication
   - Error codes

3. **DEPLOYMENT.md** - Deployment guide
   - VPS deployment
   - Docker deployment
   - Platform deployment (Railway, Render, etc.)

4. **QUICKSTART.md** - 5-minute setup guide

---

### 12. Code Quality Requirements

**TypeScript:**
- Strict mode enabled
- No `any` types (use proper types)
- Interfaces for data structures

**Code Style:**
- Clean architecture (Route → Controller → Service → Repository)
- Error handling everywhere
- Async/await (no callbacks)
- Comments for complex logic

**Best Practices:**
- DRY (Don't Repeat Yourself)
- Single Responsibility Principle
- Proper error messages
- Graceful shutdown handling

---

### 13. Deployment Readiness

**Must include:**
- `.env.example` with all variables
- `package.json` with all scripts
- Prisma migrations
- Seed script for initial admin
- Health check endpoints
- Graceful shutdown
- Error logging
- Process management (PM2 compatible)

**Scripts:**
```json
{
  "dev": "tsx watch src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js",
  "prisma:generate": "prisma generate",
  "prisma:migrate": "prisma migrate dev",
  "prisma:seed": "tsx prisma/seed.ts",
  "test": "vitest run"
}
```

---

### 14. Performance Benchmarks

**Target Response Times:**
- Health check: <10ms
- Login: <100ms
- Verification: <50ms (with cache)
- Employee list: <100ms (20 items)
- Dashboard summary: <50ms (cached)

**Scalability:**
- Support 100,000+ employees
- Handle 1,000+ verifications per minute
- Efficient with multiple concurrent admins

---

### 15. Critical Rules (DO NOT FORGET)

1. ❌ **NEVER** put employee data in QR code
2. ❌ **NEVER** use SELECT * in queries
3. ❌ **NEVER** load all employees at once
4. ✅ **ALWAYS** use pagination
5. ✅ **ALWAYS** use database indexes
6. ✅ **ALWAYS** validate inputs
7. ✅ **ALWAYS** log admin actions
8. ✅ **ALWAYS** use CDN for images
9. ✅ **ALWAYS** handle errors properly
10. ✅ **ALWAYS** make verification fast (<50ms)

---

## Deliverables

1. ✅ Complete working backend with all features
2. ✅ Prisma schema with migrations
3. ✅ Seed script for initial admin
4. ✅ Complete documentation (README, API, DEPLOYMENT)
5. ✅ Environment configuration (.env.example)
6. ✅ Test suite with good coverage
7. ✅ Production-ready code
8. ✅ No TODOs or placeholders
9. ✅ Clean, maintainable code
10. ✅ Ready to deploy

---

## Success Criteria

The project is complete when:

✅ All features implemented and working
✅ TypeScript compiles without errors
✅ All tests passing
✅ Documentation complete
✅ Can run with: `npm install && npm run dev`
✅ Can build with: `npm run build`
✅ Can deploy to production
✅ Fast response times achieved
✅ Secure authentication working
✅ QR verification working correctly
✅ Dashboard loads quickly
✅ Pagination working everywhere
✅ Image upload to Cloudinary working
✅ Redis caching working (optional)
✅ Database migrations working
✅ Seed script working

---

## Notes

- Focus on PERFORMANCE from day one
- Make it PRODUCTION-READY, not a prototype
- Write CLEAN, MAINTAINABLE code
- Provide COMPLETE documentation
- No half-baked features
- Everything must WORK end-to-end

---

## Example Use Case

1. Admin logs in
2. Admin adds employee with photo
3. System generates secure QR code
4. QR printed on ID card
5. Someone scans QR code
6. System verifies in real-time
7. Shows employee info if valid
8. Logs verification attempt
9. Admin can see all logs
10. Admin can regenerate QR if needed

---

**This is a COMPLETE, PRODUCTION-READY system, not a demo!**

---

## Current Status

Repository: https://github.com/jubayer-ahmed-ratul/empverify_server

**Completed:**
- ✅ All backend code
- ✅ TypeScript setup
- ✅ Prisma schema
- ✅ All API endpoints
- ✅ Authentication
- ✅ QR system
- ✅ Documentation
- ✅ Tests

**Current Issue:**
- Deployment configuration (TypeScript build issues on Render/Railway)

**Environment Variables Setup:**
```
DATABASE_URL=postgres://310d116b765a5b996e1f926801559edb4babe1f76acc2670f124860f6283e38a:sk_VbPQJXYej1d_faHqCHvUn@pooled.db.prisma.io:5432/postgres?sslmode=require
JWT_SECRET=V3riStaff_9xK7mP2qL8vN4sR6tY1wZ5aB0cD7eF3hJ8kM2
CLOUDINARY_CLOUD_NAME=djt7gf8y
CLOUDINARY_API_KEY=459657783282957
CLOUDINARY_API_SECRET=Ly23KYmFJD18USeMYAsclwBd6fs
```

---

**Use this prompt to rebuild or deploy the project!**
