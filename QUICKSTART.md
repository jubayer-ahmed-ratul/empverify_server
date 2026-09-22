# Quick Start Guide

Get EmpVerify Backend running in 5 minutes!

## Prerequisites

Before you begin, ensure you have:
- ✅ Node.js 18+ installed
- ✅ PostgreSQL 14+ installed and running
- ✅ Cloudinary account (free tier works)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Configure Environment

1. Open `.env` file in the root directory
2. Update the following required fields:

```env
# Update with your PostgreSQL credentials
DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/empverify?schema=public

# Update with your Cloudinary credentials (get from cloudinary.com)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Generate a secure JWT secret (at least 32 characters)
JWT_SECRET=change-this-to-a-long-random-string-at-least-32-characters

# Optional: Redis for caching (comment out if not using)
# REDIS_URL=redis://localhost:6379
```

### Get Cloudinary Credentials

1. Sign up at https://cloudinary.com (free)
2. Go to Dashboard
3. Copy: Cloud Name, API Key, API Secret

## Step 3: Setup Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed initial admin user
npm run prisma:seed
```

The seed command will create an admin user:
- **Email**: admin@empverify.com
- **Password**: Admin@123456

⚠️ **Change this password in production!**

## Step 4: Start the Server

```bash
npm run dev
```

You should see:

```
✅ Database connected successfully

╔════════════════════════════════════════════════════════════╗
║                                                            ║
║     🚀 EmpVerify Backend Server                           ║
║                                                            ║
║     Environment: development                              ║
║     Port:        5000                                      ║
║     URL:         http://localhost:5000                     ║
║                                                            ║
║     Ready to accept requests! 🎉                          ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

## Step 5: Test the API

### Test Health Endpoint

```bash
curl http://localhost:5000/api/health
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@empverify.com",
    "password": "Admin@123456"
  }'
```

You'll receive a JWT token in the response. Copy it for the next steps.

### Create an Employee

```bash
curl -X POST http://localhost:5000/api/employees \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -F "employeeId=EMP-001" \
  -F "fullName=John Doe" \
  -F "email=john@example.com" \
  -F "phone=+1234567890" \
  -F "position=Software Engineer" \
  -F "department=IT" \
  -F "companyName=ABC Technologies" \
  -F "joiningDate=2024-01-15" \
  -F "idExpiryDate=2025-01-15"
```

The response will include:
- Employee data
- Verification URL
- QR code (base64)

### Verify QR Code

Copy the verification token from the response and test:

```bash
curl http://localhost:5000/api/verify/YOUR_VERIFICATION_TOKEN
```

## Common Issues

### Database Connection Failed

**Problem**: Can't connect to PostgreSQL

**Solutions**:
1. Verify PostgreSQL is running: `psql --version`
2. Check DATABASE_URL in `.env`
3. Create database manually: `createdb empverify`

### Cloudinary Upload Failed

**Problem**: Image uploads fail

**Solutions**:
1. Verify Cloudinary credentials
2. Check internet connection
3. Test credentials in Cloudinary dashboard

### Port Already in Use

**Problem**: Port 5000 is already taken

**Solution**: Change PORT in `.env` file to another port (e.g., 3000, 8000)

## Next Steps

- 📖 Read the full [README.md](./README.md) for complete documentation
- 🧪 Run tests: `npm test`
- 🎨 Connect a frontend application
- 🚀 Deploy to production

## Development Tools

### Prisma Studio

View and edit your database visually:

```bash
npm run prisma:studio
```

Opens at http://localhost:5555

### View Logs

The server logs all important events:
- Database connections
- API requests (in development)
- Errors and warnings
- Authentication attempts

### Hot Reload

The dev server automatically restarts when you change files.

## Production Deployment

When ready for production:

1. Update `.env` with production values
2. Set `NODE_ENV=production`
3. Use a strong JWT_SECRET
4. Enable Redis for caching
5. Setup HTTPS
6. Configure proper CORS_ORIGIN

See [README.md](./README.md) for detailed deployment instructions.

## Need Help?

- 📚 Check the [README.md](./README.md)
- 🐛 Found a bug? Open an issue
- 💬 Questions? Start a discussion

---

**Happy Coding! 🚀**
