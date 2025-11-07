#!/bin/bash

# NITS Core - Single-Click Docker Deployment
# NO CHROMIUM - NO HEADLESS MODE - Pure Python/Node.js stack

set -e

echo "🚀 NITS Core - Single-Click Deployment"
echo "========================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first:"
    echo "   https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first:"
    echo "   https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Check if .env exists, if not copy from example
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created. You may want to edit it with your API keys."
    echo ""
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p uploads output logs
echo "✅ Directories created"
echo ""

# Build and start containers
echo "🐳 Building Docker image (this may take a few minutes)..."
docker-compose build

echo ""
echo "🚀 Starting NITS Core services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to start..."
sleep 5

# Check health
echo "🔍 Checking service health..."
for i in {1..10}; do
    if curl -f http://localhost:4000/health > /dev/null 2>&1; then
        echo "✅ NITS Core is up and running!"
        break
    fi
    if [ $i -eq 10 ]; then
        echo "⚠️  Service might be still starting. Check logs with: docker-compose logs -f"
    fi
    sleep 3
done

echo ""
echo "════════════════════════════════════════"
echo "🎉 Deployment Complete!"
echo "════════════════════════════════════════"
echo ""
echo "📍 Access Points:"
echo "   - GUI:        http://localhost:4000"
echo "   - ML Service: http://localhost:5000"
echo "   - Core API:   http://localhost:3000"
echo ""
echo "📋 Useful Commands:"
echo "   - View logs:   docker-compose logs -f"
echo "   - Stop:        docker-compose down"
echo "   - Restart:     docker-compose restart"
echo "   - Rebuild:     docker-compose up -d --build"
echo ""
echo "📚 Documentation:"
echo "   - Proxy Guide: cat PROXY_INTEGRATION_GUIDE.md"
echo "   - README:      cat README.md"
echo ""
