# Eldercare

A comprehensive full-stack healthcare management application designed for modern healthcare needs, featuring AI-powered nutrition analysis, real-time communication, medication tracking, and community engagement tools.

## 🌟 Project Overview

This healthcare platform provides a complete solution for users to manage their health journey through multiple integrated modules:

- **🏥 Medical Management** - Medication tracking with automated reminders
- **🍎 AI-Powered Nutrition** - Food image analysis and nutritional insights
- **💬 Real-time Communication** - Chat system with WebSocket support
- **🚌 Transport Planning** - Public transport route optimization
- **🎪 Community Events** - Social engagement and event management
- **👨‍⚕️ AI Health Support** - Intelligent customer support system
- **📊 Advanced Analytics** - Comprehensive health and usage metrics
- **🛡️ Admin Dashboard** - Full system management and oversight

## 🏗️ Architecture

### Technology Stack

#### Frontend
- **React 19** with React Router 7
- **Tailwind CSS v4** for modern styling
- **Radix UI** components with shadcn/ui patterns
- **Socket.IO** client for real-time features
- **Vite** for fast development and building

#### Backend
- **Node.js 22** with Express.js 5.1.0
- **Microsoft SQL Server** database
- **Socket.IO** for WebSocket communications
- **OpenAI GPT-4** integration for AI features
- **AWS S3/MinIO** for file storage
- **JWT** authentication with role-based access

#### Observability & DevOps
- **Prometheus** - Metrics collection
- **Grafana** - Metrics visualization
- **Loki** - Log aggregation
- **Tempo** - Distributed tracing
- **Docker Compose** - Multi-service orchestration

### System Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   React App     │◄──►│   Express.js    │◄──►│   MSSQL Server  │
│   Port: 4173    │    │   Port: 3001    │    │   Port: 1433    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────▼───────────────────────┘
                    ┌─────────────────┐
                    │   File Storage  │
                    │   MinIO/S3      │
                    │   Port: 9000    │
                    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- **Node.js 22+**
- **pnpm** package manager
- **Docker** and **Docker Compose**
- **Git**

### One-Command Setup (Recommended)

```bash
# Clone the repository
git clone https://github.com/provsalt/BED2025Apr_P05_T1
cd BED2025Apr_P05_T1

# Copy environment configuration
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start all services with Docker Compose
docker compose up

# Run database migrations (in another terminal)
docker compose exec backend node migrate.js
```

**🎉 Your application is now running!**

- **Frontend**: http://localhost:4173
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api-docs
- **Grafana Dashboard**: http://localhost:3000 (admin/admin)
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin)

### Development Setup

For active development with hot reloading:

```bash
# Terminal 1: Start infrastructure services
docker compose up db minio prometheus grafana loki tempo

# Terminal 2: Start backend development server
cd backend
pnpm install
pnpm dev

# Terminal 3: Start frontend development server
cd frontend
pnpm install
pnpm dev
```

## 🔧 Environment Configuration

### Root `.env` File
Please refer to [.env.example](.env.example) for more details on the environmental variables

### Additional Configuration
- **Backend**: See [backend/.env.example](backend/.env.example) for complete backend configuration
- **OpenAI API**: Required for AI nutrition analysis and health summaries
- **Resend API**: Required for email notifications and medication reminders

## 📋 Available Services

| Service        | Port      | Description           | Health Check                  |
|----------------|-----------|-----------------------|-------------------------------|
| Frontend       | 4173      | React application     | http://localhost:4173         |
| Backend API    | 3001      | Express.js server     | http://localhost:3001/metrics |
| MSSQL Database | 1433      | SQL Server database   | Docker logs                   |
| MinIO Storage  | 9000/9001 | S3-compatible storage | http://localhost:9001         |
| Grafana        | 3000      | Metrics dashboard     | http://localhost:3000         |
| Prometheus     | 9090      | Metrics collection    | http://localhost:9090         |
| Loki           | 3100      | Log aggregation       | http://localhost:3100         |
| Tempo          | 3200      | Distributed tracing   | http://localhost:3200         |

## 🎯 Key Features

### Healthcare Management
- **Medication Tracking**: Set up medication schedules with automated email reminders
- **Health Summaries**: AI-generated health insights based on medication and nutrition data
- **Medical Records**: Comprehensive health record management

### AI-Powered Nutrition
- **Image Recognition**: Upload food photos for automatic nutritional analysis using GPT-4 Vision
- **Nutrition Analytics**: Track macronutrients, calories, and dietary patterns
- **Meal Recommendations**: AI-powered meal suggestions and health predictions

### Real-time Communication
- **Chat System**: WebSocket-based real-time messaging
- **Message Management**: Edit and delete messages with real-time updates
- **AI Support**: Intelligent customer support with contextual responses

### Community & Social
- **Event Management**: Create and join community health events
- **Admin Approval**: Moderated event system with approval workflow
- **Social Engagement**: Connect with other users for health goals

### Transport & Mobility
- **Route Planning**: Public transport route optimization
- **Location Services**: Integration with transit data for healthcare appointments

### Administration
- **User Management**: Comprehensive user administration tools
- **Analytics Dashboard**: System metrics and user behavior insights
- **Content Moderation**: Event and user content approval systems

## 🧪 Testing

### Backend Testing
```bash
cd backend

# Run all tests
pnpm test

# Run specific test suite
pnpm test -- userController.test.js

# Generate coverage report
pnpm coverage
```

### Frontend Testing
```bash
cd frontend

# Run frontend tests (when available)
pnpm test
```

### Test Coverage
- **Unit test files** covering controllers, models, middleware, and services
- **Integration tests** with database operations
- **Automated CI/CD** testing with GitHub Actions

## 📊 Monitoring & Observability

### Metrics Dashboard
Access Grafana at http://localhost:3000 (admin/admin) to view:
- API response times and error rates
- Database performance metrics
- Real-time user connections

### Log Analysis
View structured logs in Loki for:
- Request/response logging
- Error tracking with stack traces
- Security events and authentication
- Performance bottlenecks

### Distributed Tracing
Monitor request flows through Tempo for:
- End-to-end request tracing
- Database query performance
- External API call latency
- File upload processing times

## 🚀 Production Deployment

### Docker Production Setup
```bash
# Build production images
docker compose -f compose.yml build

# Deploy with production configuration
docker compose -f compose.yml up -d
```

### Production Considerations
- Configure a proxy in-front of the backend server. Eg: caddy/nginx
- Configure proper SSL/TLS certificates
- Set up database backups and replication
- Implement proper log rotation
- Configure monitoring alerts
- Set up CI/CD pipelines
- Review security configurations

## 🛠️ Development Workflow

### Project Scripts
```bash
# Root level commands
pnpm test              # Run all tests
pnpm test:backend      # Backend tests only
pnpm test:frontend     # Frontend tests only

# Backend specific
cd backend && pnpm dev      # Development server
cd backend && pnpm migrate  # Run database migrations

# Frontend specific
cd frontend && pnpm dev     # Development server
cd frontend && pnpm build   # Production build
```

### Adding New Features
1. **Database Changes**: Create migration using `node generate-migration.js "description"`
2. **Backend API**: Add controllers, models, and tests following domain structure
3. **Frontend Components**: Create components following established patterns
4. **Testing**: Add comprehensive tests for new functionality
5. **Documentation**: Update API documentation and README files

## 📚 Documentation

### Detailed Documentation
- **[Backend API Documentation](backend/README.md)** - Comprehensive backend setup and API reference
- **[Frontend Documentation](frontend/README.md)** - React application development guide
- **[API Interactive Docs](http://localhost:3001/api-docs)** - Swagger/OpenAPI documentation

### API Reference
The backend provides RESTful APIs organized by domain:
- `/api/user` - User management and authentication
- `/api/medical` - Medication tracking and health records
- `/api/nutrition` - AI-powered nutrition analysis
- `/api/chat` - Real-time messaging system
- `/api/community` - Community events and social features
- `/api/transport` - Route planning and transport services
- `/api/admin` - Administrative functions and analytics

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Follow the established code style and patterns
4. Add tests for new functionality
5. Submit a pull request

### Code Style
- **JavaScript**: Airbnb style guide with double quotes
- **React**: Functional components with hooks
- **Database**: Proper migration scripts for schema changes
- **Testing**: Comprehensive test coverage for new features

### Pull Request Process
1. Ensure all tests pass: `pnpm test`
2. Update documentation as needed
3. Add comprehensive commit messages
4. Request review from maintainers

## 🆘 Troubleshooting

### Common Issues

#### Service Won't Start
```bash
# Check service logs
docker compose logs [service-name]

# Restart specific service
docker compose restart [service-name]
```

#### Database Connection Issues
```bash
# Check database status
docker compose logs db

# Reset database
docker compose down -v
docker compose up db
```

#### Port Conflicts
```bash
# Check port usage
netstat -tulpn | grep :3001

# Use different ports in .env file
BACKEND_PORT=3002
FRONTEND_PORT=4174
```

### Getting Help
- Check service logs: `docker compose logs [service]`
- Review environment configuration
- Verify all required services are running
- Check firewall and network settings

Notice: This file was generated using generative AI. Things might be wrong.