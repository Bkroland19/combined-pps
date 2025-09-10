# Point Prevalence Survey System Makefile

.PHONY: help dev dev-backend dev-frontend build start clean setup docker-build docker-up docker-down docker-logs install

# Default target
help:
	@echo "Point Prevalence Survey System - Available Commands:"
	@echo ""
	@echo "Development:"
	@echo "  dev              - Start both backend and frontend in development mode"
	@echo "  dev-backend      - Start only the Go backend"
	@echo "  dev-frontend     - Start only the Next.js frontend"
	@echo ""
	@echo "Building:"
	@echo "  build            - Build both backend and frontend"
	@echo "  build-backend    - Build only the Go backend"
	@echo "  build-frontend   - Build only the Next.js frontend"
	@echo ""
	@echo "Production:"
	@echo "  start            - Start both services in production mode"
	@echo "  start-backend    - Start only backend in production"
	@echo "  start-frontend   - Start only frontend in production"
	@echo ""
	@echo "Docker:"
	@echo "  docker-build     - Build Docker images"
	@echo "  docker-up        - Start all services with Docker Compose"
	@echo "  docker-down      - Stop all Docker services"
	@echo "  docker-logs      - View Docker logs"
	@echo ""
	@echo "Utilities:"
	@echo "  setup            - Install all dependencies"
	@echo "  install          - Install root dependencies"
	@echo "  clean            - Clean build artifacts"
	@echo "  test             - Run tests"

# Development commands
dev:
	npm run dev

dev-backend:
	npm run dev:backend

dev-frontend:
	npm run dev:frontend

# Build commands
build:
	npm run build

build-backend:
	npm run build:backend

build-frontend:
	npm run build:frontend

# Production commands
start:
	npm run start

start-backend:
	npm run start:backend

start-frontend:
	npm run start:frontend

# Docker commands
docker-build:
	npm run docker:build

docker-up:
	npm run docker:up

docker-down:
	npm run docker:down

docker-logs:
	npm run docker:logs

# Setup commands
setup:
	npm run setup

install:
	npm install

# Utility commands
clean:
	npm run clean

test:
	@echo "Running backend tests..."
	cd backend && go test ./...
	@echo "Running frontend tests..."
	cd frontend && npm test

# Database commands
db-setup:
	@echo "Setting up PostgreSQL database..."
	docker run --name pps-postgres -e POSTGRES_DB=point_prevalence_survey -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:15-alpine
	@echo "Database setup complete. Connection details:"
	@echo "  Host: localhost"
	@echo "  Port: 5432"
	@echo "  Database: point_prevalence_survey"
	@echo "  Username: postgres"
	@echo "  Password: password"

db-stop:
	docker stop pps-postgres
	docker rm pps-postgres

# Full development setup
dev-setup: install setup db-setup
	@echo "Development setup complete!"
	@echo "Run 'make dev' to start both services"
	@echo "Or run 'make docker-up' to start with Docker"
