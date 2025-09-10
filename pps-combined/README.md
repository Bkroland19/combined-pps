# Point Prevalence Survey System

A comprehensive data management and analytics platform for Point Prevalence Survey (PPS) data collection and analysis. This system consists of a Go-based REST API backend and a Next.js frontend dashboard.

## 🏗️ Architecture

```
pps-combined/
├── backend/          # Go REST API server
├── frontend/         # Next.js dashboard
├── docker-compose.yml # Unified deployment
└── package.json      # Monorepo management
```

## 🚀 Quick Start

### Prerequisites

-    **Node.js** 18+
-    **Go** 1.21+
-    **PostgreSQL** 12+
-    **Docker** & **Docker Compose** (optional)

### Option 1: Docker Deployment (Recommended)

1. **Clone and setup:**

     ```bash
     git clone <your-repo-url>
     cd pps-combined
     ```

2. **Start all services:**

     ```bash
     docker-compose up -d
     ```

3. **Access the application:**
     - Frontend Dashboard: http://localhost:3000
     - Backend API: http://localhost:8080
     - API Documentation: http://localhost:8080/swagger/index.html
     - Database: localhost:5432

### Option 2: Local Development

1. **Install dependencies:**

     ```bash
     npm run setup
     ```

2. **Start PostgreSQL:**

     ```bash
     # Using Docker
     docker run --name pps-postgres -e POSTGRES_DB=point_prevalence_survey -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:15-alpine

     # Or install PostgreSQL locally
     ```

3. **Start development servers:**

     ```bash
     # Start both backend and frontend
     npm run dev

     # Or start individually
     npm run dev:backend  # Backend on :8080
     npm run dev:frontend # Frontend on :3000
     ```

## 📊 Features

### Backend API (Go)

-    **RESTful API** with comprehensive endpoints
-    **PostgreSQL** integration with GORM
-    **CSV Upload** support for all data types
-    **Swagger Documentation** auto-generated
-    **Statistics & Analytics** endpoints
-    **Filtering & Pagination** for all resources

### Frontend Dashboard (Next.js)

-    **Real-time Dashboard** with live data
-    **Interactive Charts** using Recharts
-    **Multi-section Navigation:**
     -    Overview: Key metrics and trends
     -    Analytics: Statistical analysis
     -    Patients: Distribution by region/facility/ward
     -    Antibiotics: Classes, classifications, routes
     -    Specimens: Types, results, microorganisms
     -    Data Upload: CSV import interface
     -    Database: Patient data table
-    **Responsive Design** with dark mode support
-    **Modern UI** with Tailwind CSS

## 🔧 Development

### Backend Development

```bash
cd backend
go mod download
go run main.go
```

**Available endpoints:**

-    `GET /api/v1/patients` - List patients
-    `GET /api/v1/patients/stats` - Patient statistics
-    `GET /api/v1/antibiotics` - List antibiotics
-    `GET /api/v1/antibiotics/stats` - Antibiotic statistics
-    `GET /api/v1/specimens` - List specimens
-    `GET /api/v1/specimens/stats` - Specimen statistics
-    `POST /api/v1/upload/*` - CSV upload endpoints
-    `GET /health` - Health check

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

**Environment Variables:**

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## 🐳 Docker Commands

```bash
# Build all services
npm run docker:build

# Start all services
npm run docker:up

# Stop all services
npm run docker:down

# View logs
npm run docker:logs

# Rebuild and restart
docker-compose up --build -d
```

## 🛠️ Available Scripts

```bash
# Development
npm run dev              # Start both backend and frontend
npm run dev:backend      # Start only backend
npm run dev:frontend     # Start only frontend

# Building
npm run build            # Build both applications
npm run build:backend    # Build only backend
npm run build:frontend   # Build only frontend

# Production
npm run start            # Start both in production
npm run start:backend    # Start only backend
npm run start:frontend   # Start only frontend

# Docker
npm run docker:build     # Build Docker images
npm run docker:up        # Start with Docker Compose
npm run docker:down      # Stop Docker Compose
npm run docker:logs      # View logs

# Utilities
npm run setup            # Install all dependencies
npm run clean            # Clean build artifacts
```

## 🚀 Deployment

### Production Deployment

1. **Build the application:**

     ```bash
     npm run build
     ```

2. **Start production services:**
     ```bash
     npm run start
     ```

### Docker Production

1. **Build and deploy:**

     ```bash
     docker-compose -f docker-compose.yml up -d
     ```

2. **Scale services:**
     ```bash
     docker-compose up -d --scale frontend=2
     ```

## 📄 License

This project is licensed under the MIT License.
