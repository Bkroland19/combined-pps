#!/bin/bash

# Point Prevalence Survey System Deployment Script

set -e

echo "🚀 Deploying Point Prevalence Survey System..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
echo "🔍 Checking service status..."

# Check PostgreSQL
if docker-compose exec postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo "✅ PostgreSQL is running"
else
    echo "❌ PostgreSQL is not ready"
fi

# Check Backend
if curl -s http://localhost:8080/health > /dev/null; then
    echo "✅ Backend API is running"
else
    echo "❌ Backend API is not ready"
fi

# Check Frontend
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend is running"
else
    echo "❌ Frontend is not ready"
fi

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📊 Access your application:"
echo "  Frontend Dashboard: http://localhost:3000"
echo "  Backend API:        http://localhost:8080"
echo "  API Documentation:  http://localhost:8080/swagger/index.html"
echo "  Database:           localhost:5432"
echo ""
echo "📝 Useful commands:"
echo "  View logs:          docker-compose logs -f"
echo "  Stop services:      docker-compose down"
echo "  Restart services:   docker-compose restart"
echo ""
