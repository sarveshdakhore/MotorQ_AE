# MotorQ - Smart Parking Management System

A comprehensive parking management system built with modern web technologies, featuring real-time parking slot management, vehicle tracking, billing, analytics, and notifications.

![MotorQ Dashboard](https://img.shields.io/badge/Status-Active-green)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-ISC-yellow)

## 🚀 Features

### Core Functionality
- **Real-time Parking Management**: Track vehicle entries, exits, and slot availability
- **Smart Slot Assignment**: Automatic slot assignment based on vehicle type and availability
- **Multi-vehicle Support**: Cars, Bikes, EVs, and Handicap-accessible vehicles
- **Flexible Billing**: Hourly rates and day pass options
- **Session Management**: Complete parking session lifecycle management

### Advanced Features
- **Analytics Dashboard**: Comprehensive insights into parking usage, revenue, and trends
- **Notification System**: Real-time notifications for important events
- **Vehicle Search**: Quick lookup of currently parked vehicles
- **Slot Override**: Administrative controls for manual slot changes
- **Historical Data**: Complete parking history with filtering and pagination
- **Maintenance Mode**: Slot maintenance status management

### Technical Features
- **RESTful API**: Well-documented API with OpenAPI/Swagger specs
- **Real-time Updates**: Live dashboard updates without page refresh
- **Type Safety**: Full TypeScript implementation
- **Database Migrations**: Prisma ORM with automatic schema management
- **Caching**: Redis integration for improved performance
- **Security**: JWT authentication and rate limiting
- **Concurrency Control**: Prisma transactions with row locking for thread-safe operations
- **ACID Compliance**: Full database transaction support with rollback capabilities

## 🏗️ Architecture

### Backend Stack
- **Node.js** with **TypeScript**
- **Express.js** web framework
- **Prisma ORM** with **PostgreSQL**
- **Redis** for caching
- **TSOA** for API generation and documentation
- **JWT** for authentication
- **Docker** for containerization

### Frontend Stack
- **Next.js 15** with **React 19**
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Radix UI** components
- **Lucide React** icons
- **Sonner** for notifications

### Database Schema
- **Vehicles**: Vehicle registration and type management
- **Slots**: Parking slot configuration and status
- **Sessions**: Active and completed parking sessions
- **Billing**: Flexible billing configuration
- **Analytics**: Usage and revenue tracking

## 🏗️ Project Structure

```
MotorQ/
├── frontend/                    # Next.js application
│   ├── src/
│   │   ├── app/                # App Router pages
│   │   │   ├── dashboard/      # Main dashboard
│   │   │   ├── parking/        # Vehicle entry/exit
│   │   │   ├── analytics/      # Analytics & reports
│   │   │   └── auth/          # Authentication
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ui/            # shadcn/ui components
│   │   │   └── parking/       # Parking-specific components
│   │   ├── lib/               # API clients & utilities
│   │   ├── contexts/          # React contexts
│   │   └── hooks/             # Custom React hooks
│   ├── package.json
│   └── .env.local             # Frontend environment variables
├── backend/                     # Express TypeScript API
│   ├── src/
│   │   ├── controllers/        # API controllers (TSOA)
│   │   ├── services/          # Business logic
│   │   ├── middleware/        # Express middleware
│   │   ├── types/            # TypeScript definitions
│   │   └── routes/           # Auto-generated routes
│   ├── prisma/                # Database schema & migrations
│   │   ├── schema.prisma      # Database schema
│   │   └── migrations/        # Database migrations
│   ├── scripts/               # Utility scripts
│   ├── Dockerfile             # Backend container
│   └── .env                   # Backend environment variables
├── docker-compose.yml           # Docker orchestration
└── README.md                   # This documentation
```


## 📋 Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Docker** and **Docker Compose**
- **Git**

## 🚀 Quick Start (Docker - Recommended)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd MotorQ
```

### 2. Start with Docker Compose
```bash
# Start all services (PostgreSQL, Redis, Backend, Prisma Studio)
docker-compose up -d

# View logs
docker-compose logs -f
```

### 3. Access the Application
- **API Documentation**: http://localhost:8001/docs
- **Prisma Studio**: http://localhost:5555 (Database admin)
- **API Health Check**: http://localhost:8001/health

### 4. Setup Frontend (Separate Terminal)
```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local

# Start development server
npm run dev
```

### 5. Access Frontend
- **Frontend Application**: http://localhost:3000

## 🛠️ Manual Setup (Without Docker)

### Backend Setup

1. **Navigate to Backend Directory**
   ```bash
   cd backend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Setup Environment Variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/motorq_db?schema=public"
   REDIS_URL="redis://localhost:6379"
   PORT=8001
   NODE_ENV=development
   API_BASE_PATH=""
   ENABLE_DOCS="true"
   ```

4. **Setup Database**
   ```bash
   # Start PostgreSQL and Redis (using Docker)
   docker run -d --name motorq_postgres -p 5432:5432 -e POSTGRES_PASSWORD=password -e POSTGRES_DB=motorq_db postgres:16-alpine
   docker run -d --name motorq_redis -p 6379:6379 redis:7-alpine
   
   # Run database migrations
   npx prisma migrate deploy
   
   # Generate Prisma client
   npx prisma generate
   
   # (Optional) Seed initial data
   node scripts/seed-slots-simple.js
   ```

5. **Start Backend Server**
   ```bash
   # Development mode
   npm run dev
   
   # Development with Prisma Studio
   npm run dev:studio
   
   # Production build
   npm run build
   npm start
   ```

### Frontend Setup

1. **Navigate to Frontend Directory**
   ```bash
   cd frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Setup Environment Variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8001/api
   ```

4. **Start Frontend Server**
   ```bash
   # Development mode
   npm run dev
   
   # Production build
   npm run build
   npm start
   ```

## 🐳 Docker Commands

### Basic Operations
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Restart specific service
docker-compose restart backend

# Rebuild and start
docker-compose up --build -d
```

### Database Operations
```bash
# Access PostgreSQL container
docker exec -it motorq_postgres psql -U postgres -d motorq_db

# View database with Prisma Studio
# Already running at http://localhost:5555

# Run migrations in container
docker exec -it motorq_backend npx prisma migrate deploy

# Seed data
docker exec -it motorq_backend node scripts/seed-slots-simple.js
```

### Development
```bash
# Watch backend logs
docker-compose logs -f backend

# Watch all service logs
docker-compose logs -f

# Remove all containers and volumes (CAUTION: Data loss)
docker-compose down -v
```

## 📋 Database Seeding

The project includes scripts to seed initial parking slot data:

```bash
# Simple seeding (recommended for development)
cd backend
node scripts/seed-slots-simple.js

# Or using Docker
docker exec -it motorq_backend node scripts/seed-slots-simple.js
```

This creates:
- 10 Regular car slots
- 5 Compact car slots  
- 3 EV charging slots
- 2 Handicap accessible slots

## 🔧 Configuration

### Backend Configuration

The backend uses environment variables for configuration:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/motorq_db?schema=public"

# Redis Configuration  
REDIS_URL="redis://localhost:6379"

# Server Configuration
PORT=8001
NODE_ENV=development

# API Configuration
API_BASE_PATH=""
ENABLE_DOCS="true"

# Authentication (if implemented)
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="24h"
```

### Frontend Configuration

```env
# API Endpoint
NEXT_PUBLIC_API_URL=http://localhost:8001/api

# Environment
NODE_ENV=development
```

### Docker Configuration

The `docker-compose.yml` file configures:
- **PostgreSQL**: Database server on port 5432
- **Redis**: Cache server on port 6379  
- **Backend**: API server on port 8001
- **Prisma Studio**: Database admin on port 5555




## 📚 API Documentation

### Interactive Documentation
Access the interactive API documentation at:
- **Development**: http://localhost:8001/docs
- **Swagger UI**: Auto-generated from TSOA annotations

### Key API Endpoints

#### Vehicle Management
```
POST   /api/vehicles/entry     # Register vehicle entry
POST   /api/vehicles/exit      # Process vehicle exit
GET    /api/vehicles/search    # Search parked vehicles
```

#### Slot Management
```
GET    /api/slots              # List all slots
GET    /api/slots/available    # Get available slots
PUT    /api/slots/:id/status   # Update slot status
```

#### Session Management
```
GET    /api/sessions/current   # Current parking sessions
GET    /api/sessions/history   # Parking history
POST   /api/sessions/override  # Override slot assignment
```

#### Analytics
```
GET    /api/analytics/dashboard    # Dashboard statistics
GET    /api/analytics/revenue      # Revenue analytics
GET    /api/analytics/occupancy    # Occupancy trends
```

#### System
```
GET    /api/health             # Health check
GET    /api/billing/rates      # Current billing rates
```

## 🔒 Data Consistency & Concurrency Control

MotorQ implements robust concurrency control mechanisms to ensure data consistency in high-traffic scenarios:

### Prisma Transactions

The system uses Prisma's `$transaction` API with **ReadCommitted** isolation level for all critical operations:

```typescript
// Example: Vehicle entry with slot assignment
const session = await prisma.$transaction(async (tx) => {
  // All operations are atomic within this transaction
  const slot = await tx.parkingSlot.findFirst({
    where: { id: slotId, status: 'AVAILABLE' }
  });
  
  if (!slot) {
    throw new Error('Slot no longer available');
  }
  
  // Update slot status
  await tx.parkingSlot.update({
    where: { id: slotId },
    data: { status: 'OCCUPIED' }
  });
  
  // Create parking session
  return await tx.parkingSession.create({
    data: { vehicleId, slotId, billingType }
  });
}, {
  timeout: 10000,  // 10 second timeout
  isolationLevel: 'ReadCommitted'
});
```

### Row Locking Strategy

**Slot Assignment with Row Locking:**
- Uses `SELECT FOR UPDATE` semantics via Prisma transactions
- Prevents race conditions during slot assignment
- Implements timeout mechanisms to prevent deadlocks

```typescript
// Auto-assignment with row locking
const result = await prisma.$transaction(async (tx) => {
  // Find and lock available slot
  const availableSlot = await tx.parkingSlot.findFirst({
    where: {
      status: 'AVAILABLE',
      slotType: { in: preferredTypes }
    },
    orderBy: { slotNumber: 'asc' }
  });
  
  // Double-check availability with row lock
  if (availableSlot) {
    const lockedSlot = await tx.parkingSlot.findFirst({
      where: {
        id: availableSlot.id,
        status: 'AVAILABLE'
      }
    });
    
    return lockedSlot ? { success: true, slot: lockedSlot } : null;
  }
}, {
  timeout: 5000,
  isolationLevel: 'ReadCommitted'
});
```

### Critical Operations Protected

1. **Vehicle Entry**: 
   - Slot availability check and assignment
   - Vehicle registration and session creation
   - Status updates (all atomic)

2. **Vehicle Exit**:
   - Session completion and billing calculation
   - Slot status reset to available
   - Revenue record creation

3. **Slot Override**:
   - Moving vehicles between slots
   - Maintaining session continuity
   - Status consistency across multiple slots

4. **Manual Slot Assignment**:
   - Administrative slot reservations
   - Conflict prevention with concurrent requests

### Transaction Configuration

- **Isolation Level**: `ReadCommitted` for optimal balance of consistency and performance
- **Timeout**: 5-10 seconds to prevent system lockup
- **Retry Logic**: Automatic retry for timeout and deadlock scenarios
- **Error Handling**: Graceful degradation with user-friendly messages

### Performance Optimizations

- **Connection Pooling**: Prisma's built-in connection pool management
- **Query Optimization**: Strategic indexing on frequently queried fields
- **Transaction Scope**: Minimal transaction duration to reduce lock contention
- **Fallback Mechanisms**: Multi-tier slot preference system reduces transaction conflicts

This ensures the system can handle concurrent users safely while maintaining data integrity and providing optimal performance.

## 🧪 Testing

### Backend Testing
```bash
cd backend

# Run tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test
npm test -- --grep "parking"
```

### Frontend Testing
```bash
cd frontend

# Run tests
npm test

# Run in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e
```

## 🚀 Deployment

### Production Build

#### Backend
```bash
cd backend

# Build for production
npm run build:prod

# Start production server
NODE_ENV=production npm start
```

#### Frontend
```bash
cd frontend

# Build for production
npm run build

# Start production server
npm start
```

### Docker Production
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production services
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables for Production
Ensure these are set in production:
```env
NODE_ENV=production
DATABASE_URL="postgresql://..."
REDIS_URL="redis://..."
JWT_SECRET="strong-secret-key"
ENABLE_DOCS="false"  # Disable in production
```


## 🔍 Monitoring & Logging

### Health Checks
```bash
# Backend health
curl http://localhost:8001/health

# Database connectivity
curl http://localhost:8001/api/system/db-status
```

### Logs
```bash
# Docker logs
docker-compose logs -f backend
docker-compose logs -f postgres

# Application logs are written to console
# In production, configure log aggregation (ELK, Splunk, etc.)
```

## 🛡️ Security Considerations

### Development
- Default passwords are used for convenience
- CORS is enabled for localhost
- Detailed error messages are shown

### Production Checklist
- [ ] Change default database passwords
- [ ] Set strong JWT secrets
- [ ] Configure CORS properly
- [ ] Enable HTTPS
- [ ] Disable API documentation (`ENABLE_DOCS=false`)
- [ ] Set up proper logging
- [ ] Configure rate limiting
- [ ] Regular security updates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow existing code style
- Use meaningful commit messages

## 📝 Troubleshooting

### Common Issues

#### Backend won't start
```bash
# Check if ports are available
lsof -i :8001
lsof -i :5432
lsof -i :6379

# Check Docker containers
docker ps
docker-compose logs backend
```

#### Database connection issues
```bash
# Verify database is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Test connection
docker exec -it motorq_postgres pg_isready -U postgres
```

#### Frontend API connection issues
```bash
# Verify backend is accessible
curl http://localhost:8001/health

# Check environment variables
cat frontend/.env.local
```

#### Docker issues
```bash
# Clean up Docker resources
docker system prune -f

# Rebuild containers
docker-compose build --no-cache

# Reset everything (CAUTION: Data loss)
docker-compose down -v
docker system prune -f
```

### Getting Help
- Check the logs: `docker-compose logs -f`
- Verify environment variables are set correctly
- Ensure all required ports are available
- Check database connectivity
- Review API documentation at `/docs`


## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

- Development Team - Initial work

## 🙏 Acknowledgments

- Prisma for excellent ORM tools
- Next.js team for the amazing framework
- Radix UI for accessible components
- All open source contributors

---

**Happy Parking! 🚗🏢**