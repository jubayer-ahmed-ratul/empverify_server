# EmpVerify - Employee Digital ID & QR Verification System Backend

A high-performance, production-ready backend system for managing employee digital IDs with secure QR code verification. Built with Node.js, Express.js, TypeScript, PostgreSQL, and Prisma ORM.

## 🚀 Features

### Core Functionality
- **Employee Management**: Complete CRUD operations for employee records
- **Secure QR Code System**: Cryptographically secure verification tokens
- **Photo Management**: Cloudinary integration with automatic image optimization
- **Real-time Verification**: Fast public QR code verification endpoint
- **Status Management**: Active, Inactive, Suspended employee states
- **ID Expiration**: Automatic expiry checking
- **QR Regeneration**: Instantly invalidate old QR codes

### Admin Features
- **Authentication**: JWT-based secure authentication
- **Dashboard**: Performance-optimized statistics and insights
- **Search & Filter**: Advanced employee search with pagination
- **Audit Logging**: Complete audit trail of all admin actions
- **Verification Logs**: Track all QR verification attempts

### Performance & Security
- **Database Optimization**: Indexed queries, efficient aggregations
- **Redis Caching**: Optional caching for dashboard statistics
- **Rate Limiting**: Protection against abuse
- **Input Validation**: Zod schema validation
- **Image Optimization**: CDN delivery with on-demand transformations
- **Pagination**: All large datasets properly paginated

## 📋 Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT with Argon2 password hashing
- **Validation**: Zod
- **File Upload**: Multer
- **Image Storage**: Cloudinary
- **QR Generation**: qrcode
- **Caching**: Redis (optional)
- **Security**: Helmet, CORS, Rate Limiting
- **Testing**: Vitest + Supertest

## 🏗️ Architecture

The application follows a clean, layered architecture:

```
Route → Controller → Service → Repository (Prisma) → PostgreSQL
```

### Project Structure

```
src/
├── config/           # Configuration (database, env, cloudinary, redis)
├── controllers/      # Request handlers
├── services/         # Business logic
├── routes/           # API routes
├── middleware/       # Express middleware
├── validators/       # Zod schemas
├── utils/            # Helper functions
├── app.ts            # Express app setup
└── server.ts         # Server entry point

prisma/
├── schema.prisma     # Database schema
└── seed.ts           # Database seeding

tests/                # Test files
```

## 🔧 Installation

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- Redis (optional, for caching)
- Cloudinary account

### Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd EmpVerify
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/empverify?schema=public

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Application
APP_URL=http://localhost:5000
CORS_ORIGIN=http://localhost:3000

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Redis (Optional)
REDIS_URL=redis://localhost:6379

# Admin Seed
SEED_ADMIN_NAME=Admin User
SEED_ADMIN_EMAIL=admin@empverify.com
SEED_ADMIN_PASSWORD=Admin@123456
```

4. **Generate Prisma Client**
```bash
npm run prisma:generate
```

5. **Run database migrations**
```bash
npm run prisma:migrate
```

6. **Seed the database**
```bash
npm run prisma:seed
```

This creates an initial admin user with the credentials from your `.env` file.

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

The server will start on `http://localhost:5000` with hot-reload enabled.

### Production Build
```bash
npm run build
npm start
```

### Database Commands
```bash
# Generate Prisma Client
npm run prisma:generate

# Create new migration
npm run prisma:migrate

# Seed database
npm run prisma:seed

# Open Prisma Studio
npm run prisma:studio
```

### Testing
```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

All admin endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

### Auth Endpoints

#### POST `/auth/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "admin@empverify.com",
  "password": "Admin@123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "admin": {
      "id": "uuid",
      "name": "Admin User",
      "email": "admin@empverify.com",
      "role": "ADMIN"
    }
  }
}
```

#### GET `/auth/me`
Get current admin profile. **Requires authentication.**

#### POST `/auth/logout`
Logout current admin. **Requires authentication.**

---

### Employee Endpoints

#### POST `/employees`
Create a new employee. **Requires authentication.**

**Request:** `multipart/form-data`

**Fields:**
- `employeeId` (string, required)
- `fullName` (string, required)
- `email` (string, optional)
- `phone` (string, optional)
- `position` (string, required)
- `department` (string, required)
- `companyName` (string, required)
- `joiningDate` (string, ISO date, required)
- `idExpiryDate` (string, ISO date, required)
- `photo` (file, optional, max 5MB)

**Response:**
```json
{
  "success": true,
  "message": "Employee created successfully",
  "data": {
    "employee": {
      "id": "uuid",
      "employeeId": "EMP-001",
      "fullName": "John Doe",
      ...
    },
    "verificationUrl": "http://localhost:5000/verify/secure-token",
    "qrCode": "data:image/png;base64,..."
  }
}
```

#### GET `/employees`
Get paginated list of employees with search and filters. **Requires authentication.**

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)
- `search` (string, optional)
- `status` (ACTIVE|INACTIVE|SUSPENDED, optional)
- `department` (string, optional)
- `position` (string, optional)
- `sortBy` (string, default: createdAt)
- `sortOrder` (asc|desc, default: desc)

**Example:**
```
GET /api/employees?page=1&limit=20&search=john&status=ACTIVE&department=IT
```

#### GET `/employees/:id`
Get employee by ID. **Requires authentication.**

#### PATCH `/employees/:id`
Update employee. **Requires authentication.**

**Request:** `multipart/form-data` (same fields as create, all optional)

#### DELETE `/employees/:id`
Soft delete employee. **Requires authentication.**

#### POST `/employees/:id/regenerate-qr`
Regenerate QR code (invalidates old QR). **Requires authentication.**

**Response:**
```json
{
  "success": true,
  "message": "QR code regenerated successfully",
  "data": {
    "verificationUrl": "http://localhost:5000/verify/new-secure-token",
    "qrCode": "data:image/png;base64,..."
  }
}
```

#### GET `/employees/:id/id-card`
Get ID card data for printing. **Requires authentication.**

---

### Verification Endpoint

#### GET `/verify/:verificationToken`
Verify employee QR code. **Public endpoint - no authentication required.**

**Response (Valid):**
```json
{
  "success": true,
  "message": "Verification completed",
  "data": {
    "valid": true,
    "status": "VALID",
    "employee": {
      "employeeId": "EMP-001",
      "fullName": "John Doe",
      "photoUrl": "https://...",
      "position": "Software Engineer",
      "department": "IT",
      "companyName": "ABC Technologies",
      "idGenerationDate": "2026-09-22T00:00:00.000Z",
      "idExpiryDate": "2027-09-22T00:00:00.000Z"
    }
  }
}
```

**Response (Invalid):**
```json
{
  "success": true,
  "message": "Verification completed",
  "data": {
    "valid": false,
    "status": "INVALID_ID"
  }
}
```

**Possible Status Values:**
- `VALID` - Employee is active and ID is not expired
- `INACTIVE` - Employee status is inactive
- `SUSPENDED` - Employee is suspended
- `EXPIRED` - ID has passed expiry date
- `INVALID_ID` - Token does not exist or employee is deleted

---

### Dashboard Endpoints

#### GET `/dashboard/summary`
Get dashboard summary statistics. **Requires authentication.**

**Response:**
```json
{
  "success": true,
  "data": {
    "totalEmployees": 1000,
    "activeEmployees": 850,
    "inactiveEmployees": 100,
    "suspendedEmployees": 20,
    "expiredEmployees": 30
  }
}
```

#### GET `/dashboard/recent-employees`
Get recent employees (default: 10). **Requires authentication.**

**Query:** `?limit=10`

#### GET `/dashboard/recent-verifications`
Get recent verifications (default: 10). **Requires authentication.**

**Query:** `?limit=10`

#### GET `/dashboard/verification-stats`
Get verification statistics for today, this week, and this month. **Requires authentication.**

#### GET `/dashboard/department-stats`
Get employee count by department. **Requires authentication.**

---

### Verification Logs

#### GET `/verification-logs`
Get paginated verification logs. **Requires authentication.**

**Query Parameters:**
- `page` (number)
- `limit` (number)
- `employeeId` (string, optional)
- `result` (VerificationResult, optional)
- `from` (ISO date, optional)
- `to` (ISO date, optional)

---

### Audit Logs

#### GET `/audit-logs`
Get paginated audit logs. **Requires authentication.**

**Query Parameters:**
- `page` (number)
- `limit` (number)
- `action` (string, optional)
- `adminId` (string, optional)
- `from` (ISO date, optional)
- `to` (ISO date, optional)

---

### Health Check

#### GET `/health`
Basic health check.

#### GET `/health/db`
Health check with database connectivity.

---

## 🔒 Security Features

### Authentication & Authorization
- JWT-based authentication
- Argon2 password hashing
- Role-based access control (ADMIN, SUPER_ADMIN)

### Rate Limiting
- Login: 5 attempts per 15 minutes
- Verification: 30 requests per minute
- API: 100 requests per 15 minutes

### Input Validation
- Zod schema validation for all inputs
- File type and size validation
- SQL injection prevention via Prisma

### Security Headers
- Helmet.js for secure HTTP headers
- CORS configuration
- Request compression

### Data Protection
- Soft delete (preserves data)
- Audit logging (tracks all actions)
- No sensitive data in QR codes

## ⚡ Performance Optimizations

### Database
- **Indexed columns**: All frequently queried fields
- **Efficient queries**: Using Prisma select to fetch only needed fields
- **Aggregation**: Database-level calculations instead of JavaScript
- **No N+1 queries**: Proper query planning

### Caching
- Redis caching for dashboard statistics (60-second TTL)
- Cache invalidation on data changes
- Graceful degradation if Redis is unavailable

### Image Optimization
- Cloudinary CDN delivery
- On-demand image transformations
- Multiple size variants (thumbnail, medium, large, card)
- WebP/AVIF format support

### API Design
- Pagination for all large datasets (max 100 per page)
- Separate lightweight dashboard endpoints
- Async/non-blocking verification logging
- Small response payloads

### Code Quality
- TypeScript strict mode
- Clean architecture (layered)
- Error handling
- Graceful shutdown

## 📊 QR Code System

### How It Works

1. **QR Generation**
   - Admin creates an employee
   - System generates a cryptographically secure token (48 bytes, URL-safe)
   - QR contains only the verification URL: `https://domain.com/verify/{token}`
   - QR is stored as data URL or SVG

2. **QR Verification**
   - User scans QR code
   - QR redirects to verification URL
   - Backend looks up employee by token (indexed)
   - System calculates effective status (active + not expired)
   - Returns validation result
   - Logs verification attempt

3. **Dynamic Status**
   - QR never stores employee data directly
   - Status changes immediately affect verification
   - ID expiration is checked in real-time
   - QR regeneration invalidates old tokens

### Security
- Tokens are cryptographically random
- Unpredictable and unguessable
- Unique per employee
- Can be regenerated anytime

## 🗄️ Database Schema

### Models

#### Admin
- Stores admin user accounts
- Argon2 hashed passwords
- Role-based permissions

#### Employee
- Complete employee information
- Unique employeeId and verificationToken
- Soft delete support (deletedAt)
- Multiple indexes for performance

#### VerificationLog
- Tracks all verification attempts
- IP address and user agent
- Result status (VALID, INVALID, etc.)

#### AuditLog
- Complete audit trail
- All admin actions logged
- Metadata for context

## 🔧 Configuration

### Environment Variables

See `.env.example` for all available variables.

**Critical Settings:**
- `JWT_SECRET`: Must be at least 32 characters
- `DATABASE_URL`: PostgreSQL connection string
- `CLOUDINARY_*`: Required for image uploads
- `REDIS_URL`: Optional, for caching

### Redis (Optional)

Redis is optional but recommended for production. If Redis is unavailable, the application continues to work without caching.

**Benefits:**
- Faster dashboard loading
- Reduced database load
- Improved scalability

## 🚢 Deployment

### Production Checklist

1. **Environment Variables**
   - Set `NODE_ENV=production`
   - Use strong `JWT_SECRET`
   - Configure proper `CORS_ORIGIN`
   - Set secure database credentials

2. **Database**
   - Run migrations
   - Setup database backups
   - Configure connection pooling

3. **Redis**
   - Setup Redis instance
   - Configure Redis URL

4. **Cloudinary**
   - Verify API limits
   - Setup usage alerts

5. **Security**
   - Enable HTTPS
   - Setup reverse proxy (nginx)
   - Configure firewall
   - Setup logging and monitoring

6. **Performance**
   - Enable compression
   - Setup CDN for static assets
   - Monitor response times

### Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY prisma ./prisma
RUN npx prisma generate

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: empverify
      POSTGRES_USER: empuser
      POSTGRES_PASSWORD: emppass
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: postgresql://empuser:emppass@postgres:5432/empverify
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis

volumes:
  postgres_data:
  redis_data:
```

## 🧪 Testing

The project includes test cases for:
- Authentication (login, logout, profile)
- Employee CRUD operations
- QR verification
- Status changes
- Validation
- Rate limiting

Run tests with:
```bash
npm test
```

## 📝 License

ISC

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:
1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit a pull request

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ for secure employee verification**
