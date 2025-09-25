#!/bin/bash

echo "🚀 Starting Yellow.ai Docker Application..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp .env.docker .env
    echo "📝 Please edit .env file with your API keys before running again."
    echo "Required: GEMINI_API_KEY, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET"
    exit 1
fi

# Check required environment variables
source .env
if [ -z "$GEMINI_API_KEY" ] || [ "$GEMINI_API_KEY" = "your_gemini_api_key_here" ]; then
    echo "❌ GEMINI_API_KEY is not set in .env file"
    echo "Get your API key from: https://makersuite.google.com/app/apikey"
    exit 1
fi

if [ -z "$GOOGLE_CLIENT_ID" ] || [ "$GOOGLE_CLIENT_ID" = "your_google_client_id_here" ]; then
    echo "❌ GOOGLE_CLIENT_ID is not set in .env file"
    echo "Get your credentials from: https://console.cloud.google.com"
    exit 1
fi

if [ -z "$MONGODB_URI" ] || [[ "$MONGODB_URI" != *"mongodb"* ]]; then
    echo "❌ MONGODB_URI is not set or invalid in .env file"
    echo "Get your connection string from: MongoDB Atlas Dashboard → Connect → Drivers"
    echo "Format: mongodb+srv://username:password@cluster.mongodb.net/yellowai"
    exit 1
fi

echo "✅ Environment variables validated"

# Build and start services
echo "🔨 Building Docker images..."
docker-compose build

echo "🚀 Starting services..."
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to start..."
sleep 10

# Check service status
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "🎉 Yellow.ai is starting up!"
echo "📱 Frontend: http://localhost"
echo "🔧 Backend API: http://localhost:3000"
echo "🗄️  MongoDB: localhost:27017"
echo ""
echo "📋 Useful Commands:"
echo "  View logs: docker-compose logs -f"
echo "  Stop app: docker-compose down"
echo "  Restart: docker-compose restart"
echo "  Update: docker-compose pull && docker-compose up -d --build"