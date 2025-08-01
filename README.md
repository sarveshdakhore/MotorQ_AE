# Full-Stack Web Application

A modern full-stack web application built with Next.js, Express, PostgreSQL, and Redis, containerized with Docker.

## 🏗️ Project Structure

```
project-root/
├── frontend/          # Next.js application
│   ├── src/
│   │   ├── app/       # App Router pages
│   │   ├── components/ # UI components (shadcn/ui)
│   │   └── lib/       # Utilities
│   ├── package.json
│   ├── vercel.json    # Vercel deployment config
│   └── .env.local     # Frontend environment variables
├── backend/           # Express TypeScript API
│   ├── src/
│   │   ├── controllers/ # API controllers with tsoa decorators
│   │   ├── services/   # Business logic
│   │   ├── middleware/ # Express middleware
│   │   ├── types/     # TypeScript type definitions
│   │   └── routes/    # Auto-generated routes (tsoa)
│   ├── prisma/        # Database schema and migrations
│   ├── Dockerfile     # Backend container configuration
│   └── .env           # Backend environment variables
├── docker-compose.yml # Docker orchestration
└── README.md         # This file
```

## 🚀 Tech Stack

### Frontend
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Vercel** deployment ready

### Backend
- **Express.js** with TypeScript
- **tsoa** for OpenAPI/Swagger documentation
- **Prisma ORM** for database access
- **PostgreSQL 16** database
- **Redis** for caching
- **Docker** containerization

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Docker** and Docker Compose
- **Git**

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd MotorQ
```

### 2. Environment Configuration

#### Backend Environment Variables

Copy the example environment file and configure:

```bash
cp backend/.env.example backend/.env
```

Update `backend/.env` with your settings:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/motorq_db?schema=public"
REDIS_URL="redis://localhost:6379"
PORT=3001
NODE_ENV=development
API_BASE_PATH="/api"
```

#### Frontend Environment Variables

Copy the example environment file:

```bash
cp frontend/.env.local.example frontend/.env.local
```

Update `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 3. Docker Setup (Recommended)

#### Start all services with Docker Compose:

```bash
# Start all services (PostgreSQL, Redis, Backend API)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ This will delete your data)
docker-compose down -v
```

#### Individual service commands:

```bash
# Start only database and Redis
docker-compose up -d postgres redis

# Start backend
docker-compose up -d backend

# Rebuild backend after code changes
docker-compose up -d --build backend
```

### 4. Local Development Setup

#### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations (requires running PostgreSQL)
npx prisma migrate dev

# Start development server
npm run dev

# Or just run the server
npm run serve
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🐳 Docker Commands

### Production Build

```bash
# Build and start all services
docker-compose up -d --build

# Scale backend service
docker-compose up -d --scale backend=3
```

### Development with Docker

```bash
# Start with file watching (if configured)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

## 🗄️ Database Management

### Prisma Commands

```bash
cd backend

# Generate Prisma client
npm run prisma:generate

# Create and apply migration
npm run prisma:migrate

# Reset database (⚠️ Deletes all data)
npx prisma migrate reset

# Open Prisma Studio (Database GUI)
npm run prisma:studio

# Seed database (if seed script exists)
npx prisma db seed
```

### Direct Database Access

```bash
# Connect to PostgreSQL container
docker-compose exec postgres psql -U postgres -d motorq_db

# Backup database
docker-compose exec postgres pg_dump -U postgres motorq_db > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres motorq_db < backup.sql
```

## 🔧 Development Commands

### Backend

```bash
cd backend

# Development with hot reload
npm run dev

# Build TypeScript
npm run build

# Start production server
npm start

# Generate API routes and documentation
npx tsoa spec-and-routes

# Run tests (if configured)
npm test
```

### Frontend

```bash
cd frontend

# Development server
npm run dev

# Production build
npm run build

# Start production server  
npm start

# Add shadcn/ui components
npx shadcn@latest add [component-name]

# Lint and format
npm run lint
```

## 📚 API Documentation

Once the backend is running, visit:

- **Swagger UI**: http://localhost:3001/docs
- **OpenAPI Spec**: http://localhost:3001/docs/swagger.json
- **Health Check**: http://localhost:3001/health

### API Endpoints

#### Users API

- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

Example request:

```bash
# Create a user
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'

# Get all users
curl http://localhost:3001/api/users
```

## 🚀 Deployment

### Frontend (Vercel)

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard:
   ```
   NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
   ```
3. Deploy automatically on push to main branch

### Backend (Docker)

The backend is containerized and can be deployed to any Docker-compatible platform:

- **Docker Swarm**
- **Kubernetes**
- **AWS ECS**
- **Google Cloud Run**
- **DigitalOcean Apps**

## 🧪 Testing

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests  
cd frontend
npm test

# End-to-end tests (if configured)
npm run test:e2e
```

## 🔍 Monitoring and Debugging

### Application Logs

```bash
# View all service logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Health Checks

- **Backend API**: http://localhost:3001/health
- **Frontend**: http://localhost:3000
- **Database**: Check with `docker-compose ps`
- **Redis**: Check with `docker-compose exec redis redis-cli ping`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 Environment Variables Reference

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` or `production` |
| `API_BASE_PATH` | API base path | `/api` |

### Frontend (.env.local)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3001/api` |

## 🔧 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Check what's using the port
   lsof -i :3001
   # Kill the process
   kill -9 <PID>
   ```

2. **Database connection issues**
   ```bash
   # Check if PostgreSQL is running
   docker-compose ps postgres
   # Restart PostgreSQL
   docker-compose restart postgres
   ```

3. **Prisma client issues**
   ```bash
   # Regenerate Prisma client
   cd backend
   npx prisma generate
   ```

4. **Build failures**
   ```bash
   # Clean install
   rm -rf node_modules package-lock.json
   npm install
   ```

## 📄 License

This project is licensed under the MIT License. See LICENSE file for details.

## 🙋‍♂️ Support

For support and questions:

- Create an issue in the repository
- Check existing documentation
- Review the troubleshooting section above