# Eldercare - Backend Service

A comprehensive monolith Node.js/Express backend service for healthcare management, featuring real-time chat, AI-powered nutrition analysis, medication tracking, and community features.

## 🚀 Quick Start

### Prerequisites
- Node.js 22+
- pnpm package manager
- Docker & Docker Compose (recommended)
- MSSQL Server instance

### Option 1: Docker Compose (Recommended)
```bash
# Clone and navigate to project root
git clone https://github.com/provsalt/BED2025Apr_P05_T1
cd BED2025Apr_P05_T1

# Copy and configure environment variables
cp .env.example .env

# Edit .env with your configuration (see Environment Setup below)

# Start all services (database, backend, frontend, MinIO)
docker compose up

# Migrate MSSQL if necessary.
docker compose exec backend node migrate.js

# Backend will be available at http://localhost:3001
```

### Option 2: Local Development
```bash
# Navigate to backend directory
cd backend

# Install dependencies
pnpm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your configuration (see Environment Setup below)

# Run database migrations
pnpm migrate

# Start development server
pnpm dev
```

## 🏗️ Architecture Overview

### Core Technologies
- **Runtime**: Node.js with ES modules
- **Framework**: Express.js 5.1.0
- **Database**: Microsoft SQL Server (MSSQL)
- **Authentication**: JWT with JOSE library
- **Real-time**: Socket.IO WebSockets
- **File Storage**: AWS S3 / MinIO
- **AI Integration**: OpenAI GPT4.1
- **Testing**: Vitest with coverage
- **Validation**: Zod schemas

### Observability Stack
- **Metrics**: Prometheus
- **Tracing**: OpenTelemetry + Tempo
- **Logging**: Pino + Loki
- **API Docs**: Swagger/OpenAPI 3.0

## 🔧 Environment Setup

### Required Environment Variables

Create a `.env` file in the backend directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=1433
DB_USER=sa
DB_PASSWORD=YourStrong@Passw0rd
DB_DATABASE=healthcare_db

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-here

# File Storage (S3/MinIO)
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET_NAME=healthcare-files
S3_REGION=us-east-1

# AI Services
OPENAI_API_KEY=sk-your-openai-api-key-here

# Email Service
RESEND_API_KEY=re_your-resend-api-key-here

# Application
PORT=3001
CLIENT_URL=http://localhost:5173

# Observability (Optional)
LOKI_URL=http://localhost:3100
TEMPO_URL=http://localhost:3200
PROMETHEUS_URL=http://localhost:9090
```

### Docker Services Configuration

When using Docker Compose, the following services are automatically configured:

| Service        | Port      | Description                |
|----------------|-----------|----------------------------|
| Backend API    | 3001      | Main Express server        |
| MSSQL Database | 1433      | SQL Server database        |
| MinIO          | 9000/9001 | S3-compatible file storage |
| Prometheus     | 9090      | Metrics collection         |
| Grafana        | 3000      | Metrics visualization      |
| Loki           | 3100      | Log aggregation            |
| Tempo          | 3200      | Distributed tracing        |

## 🏃‍♂️ Development Commands

```bash
# Development
pnpm dev              # Start with hot reload
pnpm start            # Production start

# Database
pnpm migrate          # Run database migrations

# Testing
pnpm test             # Run all tests
pnpm test -- <pattern> # Run specific tests
pnpm coverage         # Run tests with coverage

# Utilities
node generate-migration.js "migration_name"  # Create new migration
```

## 📊 Database Setup

### Running Migrations
```bash
# Run all pending migrations
cd backend && pnpm migrate

# Migrations are located in backend/migrations/
# Format: numbered SQL files (01_createTable.sql, 02_addColumn.sql, etc.)
```

### Creating New Migrations
```bash
# Generate a new migration file
node generate-migration.js "add_user_preferences_table"

# This creates: backend/migrations/YYYYMMDD_HHMMSS_add_user_preferences_table.sql
```

## 🎯 API Features & Endpoints

### Core Domains

#### 👤 User Management (`/api/user`)
- User registration and authentication
- Profile management with image upload
- Login history tracking
- Account deletion requests

#### 💬 Real-time Chat (`/api/chat`)
- WebSocket-based messaging
- Message editing and deletion
- Chat room management
- Real-time notifications

#### 🏥 Medical Tracking (`/api/medical`)
- Medication management
- Automated email reminders
- Health summaries with AI analysis
- Medical record tracking

#### 🍎 Nutrition Analysis (`/api/nutrition`)
- AI-powered food image analysis
- Meal logging and tracking
- Nutrition analytics and insights
- GPT-4 Vision integration

#### 🚌 Transport Planning (`/api/transport`)
- Public transport route management
- Route optimization
- Location-based services

#### 🎪 Community Events (`/api/community`)
- Event creation and management
- Admin approval workflow
- User event registrations

#### 🛡️ Admin Dashboard (`/api/admin`)
- User management
- System analytics
- Announcement management
- Content moderation

### API Documentation

Access the interactive Swagger documentation:
```
http://localhost:3001/api-docs
```

## 🔒 Authentication & Authorization

### JWT Authentication
All protected endpoints require a Bearer token:
```bash
Authorization: Bearer <jwt-token>
```

### Role-based Access Control
- **User**: Standard user permissions
- **Admin**: Full system access and management

### Socket.IO Authentication
WebSocket connections authenticate using JWT tokens passed during connection.

## 🧪 Testing

### Test Structure
```
backend/tests/
├── controllers/     # API endpoint tests
├── models/         # Database model tests  
├── middleware/     # Middleware tests
├── services/       # Service layer tests
└── utils/          # Utility function tests
```

### Running Tests
```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test -- userController.test.js

# Run tests with coverage
pnpm coverage

# Watch mode for development
pnpm test -- --watch
```

### Test Coverage
Current coverage includes:
- 26 comprehensive test files
- Controller, model, middleware, and service testing
- Integration tests with database operations

## 📈 Monitoring & Observability

### Metrics (Prometheus)
Custom metrics tracked:
- HTTP request duration and count
- Database query performance
- Real-time connection counts

### Logging (Pino + Loki)
Structured logging with:
- Request/response logging
- Error tracking with stack traces
- Performance metrics
- Security events

### Tracing (OpenTelemetry + Tempo)
Distributed tracing for:
- HTTP requests
- Database queries
- External API calls

### Accessing Monitoring

```bash
# Access monitoring interfaces
Grafana:    http://localhost:3000 (admin/admin)
Prometheus: http://localhost:9090
Loki:       http://localhost:3100
```

## 🚀 Production Deployment

### Docker Build
```bash
# Build production image
docker build -t healthcare-backend .

# Run container
docker run -p 3001:3001 --env-file .env healthcare-backend
```

### Environment Considerations
- Set `NODE_ENV=production`
- Use secure JWT secrets
- Configure proper CORS origins
- Set up SSL/TLS termination
- Configure rate limiting appropriately
- Set up log rotation
- Monitor resource usage

### Health Checks
The API provides health check endpoints:
```bash
GET /metrics     # Prometheus metrics endpoint
```

## 🛠️ Troubleshooting

### Common Issues

#### Database Connection
```bash
# Check database connectivity
docker compose logs db

# Verify migrations
pnpm migrate
```

#### File Upload Issues
```bash
# Check MinIO/S3 connectivity
docker compose logs minio

# Verify bucket exists and permissions are correct
```

#### Socket.IO Connection Problems
```bash
# Check WebSocket handshake
# Verify JWT token is valid
# Check CORS configuration
```

### Debug Mode
Enable detailed logging:
```env
NODE_ENV=development
```

## 📝 Contributing

### Code Style
- Follow Airbnb JavaScript Style Guide
- Use double quotes for strings
- 2-space indentation
- Semicolons required
- Arrow functions for components

### Adding New Features
1. Create feature branch
2. Add appropriate tests
3. Update API documentation
4. Run linting and tests
5. Submit pull request

### Database Changes
1. Create migration file: `node generate-migration.js "description"`
2. Write forward migration SQL
3. Test migration on development database
4. Include in pull request

## 📚 Additional Resources

- [Docker Compose Setup](../compose.yml)
- [Frontend Documentation](../frontend/README.md)
- [API Documentation](http://localhost:3001/api-docs)

---

Notice: This file was generated using generative AI. Things might be wrong.