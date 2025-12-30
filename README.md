# Classroom Manager System

A backend microservices-based management system to help user manage their learning center, sport club,... built with Node.js, featuring authentication, student management, class management, teacher management, and tuition tracking.

## Architecture

This system consists of 5 microservices:

- **Auth Service** (Port 3001) - User authentication and authorization
- **Student Service** (Port 3002) - Student data management
- **Class Service** (Port 3003) - Class and enrollment management
- **Teacher Service** (Port 3005) - Teacher profile management
- **Tuition Service** (Port 3004) - Payment and invoice management

## Tech Stack

- **Backend**: Node.js, Express.js
- **Databases**: MongoDB (Auth), PostgreSQL (Students, Classes, Teachers, Tuition)
- **Caching**: Redis (Database caching)
- **ORM**: Prisma (PostgreSQL services), Mongoose (MongoDB)
- **Authentication**: JWT with RSA keys
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Deployment**: AWS and Terraform (IaC)

## Development Set Up

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)

### Running with Docker

```bash
# Start all services
docker-compose up -d
```

### Services will be available at:

- Auth Service: http://localhost:3001
- Student Service: http://localhost:3002
- Class Service: http://localhost:3003
- Tuition Service: http://localhost:3004
- Teacher Service: http://localhost:3005

## Database

The system uses multiple databases:

- **MongoDB** (Port 27017) - User authentication data
- **Redis** (Port 6379) - Database caching
- **PostgreSQL** instances for each service:
  - Student DB (studentdb)
  - Class DB (classdb)
  - Teacher DB (teacherdb)
  - Tuition DB (tuitiondb)

### Environment Variables

Each service requires its own `.env` file. Check individual service directories for required environment variables.

**Auth Service**:
```
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PREFIX=userSv:
ACCESS_TOKEN_EXPIRY='1h'
REFRESH_TOKEN_EXPIRY='7d'
```

**Student Service**:
```
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PREFIX=studentSv:
```

**Class Service**:
```
STUDENT_SERVICE_API="http://student:3002/students"
TEACHER_SERVICE_API="http://teacher:3005/teachers"
USER_SERVICE_API="http://auth:3001/users"
AWS_REGION="your-aws-region"
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PREFIX=classSv:
```

**Teacher Service**:
```
AWS_BUCKET_NAME=your-bucket-name
AWS_REGION="your-aws-region"
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PREFIX=teacherSv:
```

**Tuition Service**:
```
CLASS_SERVICE_API="http://class:3003/classes"
STUDENT_SERVICE_API="http://student:3002/students"
AWS_REGION="your-aws-region"
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PREFIX=tuitionSv:
```

## API Documentation

### Authentication Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh token
- `DELETE /auth/logout` - User logout
- `PATCH /auth/password` - Change password
- `GET /auth/by-ids` - Get usernames by IDs

### Student Endpoints
- `GET /students` - List students
- `POST /students` - Create student
- `GET /students/:id` - Get student by ID
- `PATCH /students/:id` - Update student
- `DELETE /students/:id` - Delete student
- `GET /students/by-ids` - Get students by IDs

### Class Endpoints
- `GET /classes` - List classes
- `POST /classes` - Create class
- `GET /classes/:id` - Get class by ID
- `PATCH /classes/:id` - Update class
- `DELETE /classes/:id` - Delete class
- `GET /classes/:id/students` - Get students in class
- `POST /classes/:id/students` - Add student to class
- `PATCH /classes/:id/students/:studentId` - Change student class
- `DELETE /classes/:id/students/:studentId` - Remove student from class
- `GET /classes/:id/users` - Get users in class
- `POST /classes/:id/users` - Add user to class
- `PATCH /classes/:id/users/:userId` - Change user class role
- `DELETE /classes/:id/users/:userId` - Remove user from class
- `DELETE /classes/:id/users/me` - Leave class
- `POST /classes/join` - Join class
- `GET /classes/:classId/permissions` - Check user permissions

### Teacher Endpoints
- `GET /teachers` - List teachers
- `POST /teachers` - Create teacher (with avatar upload)
- `GET /teachers/:id` - Get teacher by ID
- `PATCH /teachers/:id` - Update teacher (with avatar upload)
- `DELETE /teachers/:id` - Delete teacher

### Tuition Endpoints
#### Invoices
- `GET /invoices` - List invoices
- `POST /invoices` - Create invoice
- `GET /invoices/:id` - Get invoice by ID
- `PATCH /invoices/:id` - Update invoice
- `DELETE /invoices/:id` - Delete invoice
- `PATCH /invoices/:id/cancel` - Cancel invoice
- `GET /invoices/:id/payments` - Get payments for invoice
- `POST /invoices/:id/payments` - Create payment for invoice

#### Payments
- `DELETE /payments/:paymentId` - Delete payment

#### Reports
- `GET /reports/class/:classId` - Get class monthly tuition report
- `GET /reports/student/:studentId` - Get student tuition report

## Security Features

- JWT-based authentication with RSA key pairs
- Password hashing with bcrypt
- Role-based access control
- Request validation middleware