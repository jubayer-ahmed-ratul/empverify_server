# EmpVerify API Documentation

Complete API reference for the EmpVerify Backend.

## Base URL

```
http://localhost:5000/api
```

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Get the token by calling `/api/auth/login`.

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "pagination": { ... }  // Only for paginated endpoints
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message",
  "errors": [ ... ]  // Optional validation errors
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (duplicate)
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error

---

## Authentication Endpoints

### POST /auth/login

Login with email and password.

**Rate Limit**: 5 requests per 15 minutes

**Request Body:**
```json
{
  "email": "admin@empverify.com",
  "password": "Admin@123456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Admin User",
      "email": "admin@empverify.com",
      "role": "ADMIN"
    }
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

### GET /auth/me

Get current admin profile.

**Authentication**: Required

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Admin User",
    "email": "admin@empverify.com",
    "role": "ADMIN",
    "createdAt": "2026-09-22T10:00:00.000Z"
  }
}
```

---

### POST /auth/logout

Logout current admin.

**Authentication**: Required

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout successful",
  "data": null
}
```

---

## Employee Endpoints

### POST /employees

Create a new employee.

**Authentication**: Required

**Content-Type**: `multipart/form-data`

**Form Fields:**
- `employeeId` (string, required) - Unique employee identifier
- `fullName` (string, required) - Full name
- `email` (string, optional) - Email address
- `phone` (string, optional) - Phone number
- `position` (string, required) - Job position
- `department` (string, required) - Department name
- `companyName` (string, required) - Company name
- `joiningDate` (string, required) - ISO date format
- `idExpiryDate` (string, required) - ISO date format
- `photo` (file, optional) - Image file (JPEG, PNG, WebP, max 5MB)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Employee created successfully",
  "data": {
    "employee": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "employeeId": "EMP-001",
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "photoUrl": "https://res.cloudinary.com/...",
      "position": "Software Engineer",
      "department": "IT",
      "companyName": "ABC Technologies",
      "joiningDate": "2024-01-15T00:00:00.000Z",
      "idGenerationDate": "2026-09-22T10:00:00.000Z",
      "idExpiryDate": "2025-01-15T00:00:00.000Z",
      "status": "ACTIVE",
      "createdAt": "2026-09-22T10:00:00.000Z"
    },
    "verificationUrl": "http://localhost:5000/verify/AbCd1234...",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANS..."
  }
}
```

**Error Response (409):**
```json
{
  "success": false,
  "message": "Employee ID already exists"
}
```

---

### GET /employees

Get paginated list of employees with search and filters.

**Authentication**: Required

**Query Parameters:**
- `page` (number, optional, default: 1)
- `limit` (number, optional, default: 20, max: 100)
- `search` (string, optional) - Search in employeeId, fullName, email, department, position
- `status` (enum, optional) - `ACTIVE`, `INACTIVE`, `SUSPENDED`
- `department` (string, optional)
- `position` (string, optional)
- `sortBy` (string, optional, default: createdAt)
- `sortOrder` (enum, optional, default: desc) - `asc`, `desc`

**Example Request:**
```
GET /api/employees?page=1&limit=20&search=john&status=ACTIVE&department=IT&sortBy=fullName&sortOrder=asc
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Employees retrieved successfully",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "employeeId": "EMP-001",
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "photoUrl": "https://res.cloudinary.com/.../w_150,h_150,c_fill,q_auto,f_auto/...",
      "position": "Software Engineer",
      "department": "IT",
      "companyName": "ABC Technologies",
      "status": "ACTIVE",
      "idExpiryDate": "2025-01-15T00:00:00.000Z",
      "createdAt": "2026-09-22T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### GET /employees/:id

Get employee by ID.

**Authentication**: Required

**Success Response (200):**
```json
{
  "success": true,
  "message": "Employee retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "employeeId": "EMP-001",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "photoUrl": "https://res.cloudinary.com/...",
    "position": "Software Engineer",
    "department": "IT",
    "companyName": "ABC Technologies",
    "joiningDate": "2024-01-15T00:00:00.000Z",
    "idGenerationDate": "2026-09-22T10:00:00.000Z",
    "idExpiryDate": "2025-01-15T00:00:00.000Z",
    "status": "ACTIVE",
    "createdAt": "2026-09-22T10:00:00.000Z",
    "updatedAt": "2026-09-22T10:00:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Employee not found"
}
```

---

### PATCH /employees/:id

Update employee information.

**Authentication**: Required

**Content-Type**: `multipart/form-data`

**Form Fields** (all optional):
- `fullName` (string)
- `email` (string)
- `phone` (string)
- `position` (string)
- `department` (string)
- `companyName` (string)
- `joiningDate` (string, ISO date)
- `idExpiryDate` (string, ISO date)
- `status` (enum) - `ACTIVE`, `INACTIVE`, `SUSPENDED`
- `photo` (file) - Replaces existing photo

**Success Response (200):**
```json
{
  "success": true,
  "message": "Employee updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "employeeId": "EMP-001",
    "fullName": "John Doe Updated",
    ...
  }
}
```

---

### DELETE /employees/:id

Soft delete an employee (sets deletedAt timestamp).

**Authentication**: Required

**Success Response (200):**
```json
{
  "success": true,
  "message": "Employee deleted successfully",
  "data": null
}
```

---

### POST /employees/:id/regenerate-qr

Regenerate QR code for an employee (invalidates old QR).

**Authentication**: Required

**Success Response (200):**
```json
{
  "success": true,
  "message": "QR code regenerated successfully",
  "data": {
    "verificationUrl": "http://localhost:5000/verify/NewToken1234...",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANS..."
  }
}
```

---

### GET /employees/:id/id-card

Get ID card data for printing.

**Authentication**: Required

**Success Response (200):**
```json
{
  "success": true,
  "message": "ID card data retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "employeeId": "EMP-001",
    "fullName": "John Doe",
    "photoUrl": "https://res.cloudinary.com/.../w_300,h_400,c_fill,q_auto,f_auto/...",
    "position": "Software Engineer",
    "department": "IT",
    "companyName": "ABC Technologies",
    "idGenerationDate": "2026-09-22T10:00:00.000Z",
    "idExpiryDate": "2025-01-15T00:00:00.000Z",
    "verificationUrl": "http://localhost:5000/verify/AbCd1234...",
    "qrCode": "<svg xmlns=\"http://www.w3.org/2000/svg\"..."
  }
}
```

---

## Verification Endpoint

### GET /verify/:verificationToken

Verify employee QR code (public endpoint).

**Authentication**: Not required

**Rate Limit**: 30 requests per minute

**Success Response - Valid (200):**
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
      "photoUrl": "https://res.cloudinary.com/.../w_400,h_400,c_limit,q_auto,f_auto/...",
      "position": "Software Engineer",
      "department": "IT",
      "companyName": "ABC Technologies",
      "idGenerationDate": "2026-09-22T10:00:00.000Z",
      "idExpiryDate": "2025-01-15T00:00:00.000Z"
    }
  }
}
```

**Success Response - Invalid (200):**
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

## Dashboard Endpoints

### GET /dashboard/summary

Get dashboard summary statistics.

**Authentication**: Required

**Cache**: 60 seconds (Redis)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Dashboard summary retrieved successfully",
  "data": {
    "totalEmployees": 1000,
    "activeEmployees": 850,
    "inactiveEmployees": 100,
    "suspendedEmployees": 20,
    "expiredEmployees": 30
  }
}
```

---

### GET /dashboard/recent-employees

Get recently added employees.

**Authentication**: Required

**Query Parameters:**
- `limit` (number, optional, default: 10)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Recent employees retrieved successfully",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "employeeId": "EMP-001",
      "fullName": "John Doe",
      "photoUrl": "https://res.cloudinary.com/.../w_150,h_150,c_fill,q_auto,f_auto/...",
      "position": "Software Engineer",
      "department": "IT",
      "status": "ACTIVE",
      "createdAt": "2026-09-22T10:00:00.000Z"
    }
  ]
}
```

---

### GET /dashboard/recent-verifications

Get recent verification attempts.

**Authentication**: Required

**Query Parameters:**
- `limit` (number, optional, default: 10)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Recent verifications retrieved successfully",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "result": "VALID",
      "verifiedAt": "2026-09-22T10:30:00.000Z",
      "employee": {
        "employeeId": "EMP-001",
        "fullName": "John Doe",
        "department": "IT"
      }
    }
  ]
}
```

---

### GET /dashboard/verification-stats

Get verification statistics for different time periods.

**Authentication**: Required

**Cache**: 60 seconds (Redis)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Verification statistics retrieved successfully",
  "data": {
    "today": {
      "total": 150,
      "valid": 140,
      "invalid": 2,
      "inactive": 3,
      "suspended": 1,
      "expired": 4
    },
    "thisWeek": {
      "total": 1050,
      "valid": 980,
      "invalid": 15,
      "inactive": 20,
      "suspended": 10,
      "expired": 25
    },
    "thisMonth": {
      "total": 4500,
      "valid": 4200,
      "invalid": 50,
      "inactive": 100,
      "suspended": 40,
      "expired": 110
    }
  }
}
```

---

### GET /dashboard/department-stats

Get employee count by department.

**Authentication**: Required

**Cache**: 5 minutes (Redis)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Department statistics retrieved successfully",
  "data": [
    {
      "department": "IT",
      "count": 250
    },
    {
      "department": "HR",
      "count": 50
    },
    {
      "department": "Sales",
      "count": 150
    }
  ]
}
```

---

## Verification Logs

### GET /verification-logs

Get paginated verification logs.

**Authentication**: Required

**Query Parameters:**
- `page` (number, optional, default: 1)
- `limit` (number, optional, default: 20)
- `employeeId` (string, optional) - Filter by employee ID
- `result` (enum, optional) - `VALID`, `INACTIVE`, `SUSPENDED`, `EXPIRED`, `INVALID_TOKEN`
- `from` (string, optional) - ISO date
- `to` (string, optional) - ISO date

**Success Response (200):**
```json
{
  "success": true,
  "message": "Verification logs retrieved successfully",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "result": "VALID",
      "verifiedAt": "2026-09-22T10:30:00.000Z",
      "ipAddress": "192.168.1.100",
      "employee": {
        "employeeId": "EMP-001",
        "fullName": "John Doe",
        "department": "IT"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

## Audit Logs

### GET /audit-logs

Get paginated audit logs.

**Authentication**: Required

**Query Parameters:**
- `page` (number, optional, default: 1)
- `limit` (number, optional, default: 20)
- `action` (string, optional) - Filter by action type
- `adminId` (string, optional) - Filter by admin ID
- `from` (string, optional) - ISO date
- `to` (string, optional) - ISO date

**Possible Actions:**
- `LOGIN`
- `LOGOUT`
- `CREATE_EMPLOYEE`
- `UPDATE_EMPLOYEE`
- `DELETE_EMPLOYEE`
- `ACTIVATE_EMPLOYEE`
- `DEACTIVATE_EMPLOYEE`
- `SUSPEND_EMPLOYEE`
- `REGENERATE_QR`
- `UPLOAD_PHOTO`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Audit logs retrieved successfully",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "action": "CREATE_EMPLOYEE",
      "entityType": "Employee",
      "entityId": "550e8400-e29b-41d4-a716-446655440001",
      "metadata": {
        "employeeId": "EMP-001",
        "fullName": "John Doe"
      },
      "ipAddress": "192.168.1.100",
      "createdAt": "2026-09-22T10:00:00.000Z",
      "admin": {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "name": "Admin User",
        "email": "admin@empverify.com"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 500,
    "totalPages": 25
  }
}
```

---

## Health Endpoints

### GET /health

Basic health check.

**Authentication**: Not required

**No Rate Limit**

**Success Response (200):**
```json
{
  "success": true,
  "message": "Service is healthy",
  "data": {
    "status": "healthy"
  }
}
```

---

### GET /health/db

Health check with database connectivity test.

**Authentication**: Not required

**Success Response (200):**
```json
{
  "success": true,
  "message": "Service and database are healthy",
  "data": {
    "status": "healthy",
    "database": "connected"
  }
}
```

**Error Response (503):**
```json
{
  "success": false,
  "message": "Database connection failed"
}
```

---

## Rate Limits

- **Login**: 5 requests per 15 minutes
- **Verification**: 30 requests per minute
- **Other API endpoints**: 100 requests per 15 minutes

Rate limit headers are included in responses:
```
RateLimit-Limit: 100
RateLimit-Remaining: 99
RateLimit-Reset: 1234567890
```

---

## Error Codes

### Validation Errors (422)

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "body.email",
      "message": "Invalid email address"
    },
    {
      "field": "body.password",
      "message": "Password must be at least 6 characters"
    }
  ]
}
```

### Prisma Errors

**Unique Constraint (409):**
```json
{
  "success": false,
  "message": "employeeId already exists"
}
```

**Not Found (404):**
```json
{
  "success": false,
  "message": "Record not found"
}
```

---

## Pagination

All paginated endpoints follow the same format:

**Query Parameters:**
- `page` - Page number (1-indexed)
- `limit` - Items per page (max: 100)

**Response:**
```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

## Best Practices

1. **Always validate responses** - Check `success` field
2. **Handle rate limits** - Implement exponential backoff
3. **Store JWT securely** - Use httpOnly cookies or secure storage
4. **Refresh tokens** - Implement token refresh logic
5. **Use pagination** - Don't fetch all records at once
6. **Optimize images** - Use Cloudinary transformations
7. **Cache when possible** - Reduce API calls
8. **Handle errors gracefully** - Show user-friendly messages

---

## Support

For issues and questions:
- 📖 Read the [README.md](./README.md)
- 🐛 Report bugs via GitHub Issues
- 💬 Join discussions

---

**Last Updated**: September 2026
