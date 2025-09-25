# 🐳 Yellow.ai Docker Setup Guide

This guide will help you run the entire Yellow.ai chatbot platform using Docker containers.

## 📋 Prerequisites

1. **Docker Desktop** installed on your system
   - Windows: [Download Docker Desktop](https://docs.docker.com/desktop/windows/)
   - macOS: [Download Docker Desktop](https://docs.docker.com/desktop/mac/)
   - Linux: [Install Docker Engine](https://docs.docker.com/engine/install/)

2. **Required API Keys:**
   - Google Gemini API Key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Google OAuth credentials from [Google Cloud Console](https://console.cloud.google.com)

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

**Windows:**
```bash
# Double-click start.bat or run in Command Prompt
start.bat
```

**Linux/Mac:**
```bash
# Make script executable and run
chmod +x start.sh
./start.sh
```

### Option 2: Manual Setup

1. **Clone and Navigate:**
   ```bash
   git clone <your-repo-url>
   cd Yellow.ai
   ```

2. **Setup Environment Variables:**
   ```bash
   # Copy environment template
   cp .env.docker .env
   
   # Edit .env file with your credentials
   notepad .env  # Windows
   nano .env     # Linux/Mac
   ```

3. **Required Environment Variables:**
   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   ```

4. **Start Application:**
   ```bash
   # Build and start all services
   docker-compose up -d --build
   
   # Check status
   docker-compose ps
   ```

## 🏗️ Architecture

The Docker setup includes:

- **Frontend (React + Vite)**: Port 80
- **Backend (Node.js + Express)**: Port 3000  
- **MongoDB Database**: Port 27017
- **Redis Cache**: Port 6379

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │───▶│   Backend       │───▶│   MongoDB       │
│   (Nginx:80)    │    │   (Node:3000)   │    │   (Mongo:27017) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📱 Access Points

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost | Main application interface |
| **Backend API** | http://localhost:3000 | REST API endpoints |
| **API Health** | http://localhost:3000/health | Health check |
| **MongoDB** | localhost:27017 | Database connection |

## 🔧 Docker Commands

### Basic Operations
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart services
docker-compose restart

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f server
docker-compose logs -f client
```

### Development & Debugging
```bash
# Rebuild images
docker-compose build --no-cache

# Start with rebuild
docker-compose up -d --build

# Execute commands in containers
docker-compose exec server bash
docker-compose exec mongodb mongosh

# Check container status
docker-compose ps
docker stats
```

### Maintenance
```bash
# Remove all containers and volumes
docker-compose down -v

# Clean up unused images
docker image prune -f

# Full cleanup
docker system prune -a --volumes
```

## 🗄️ Database Management

### MongoDB Access
```bash
# Connect to MongoDB
docker-compose exec mongodb mongosh -u admin -p yellowai2024

# Database commands
use yellowai
db.users.find()
db.projects.find()
db.chats.find()
```

### Backup & Restore
```bash
# Backup database
docker-compose exec mongodb mongodump -u admin -p yellowai2024 --authenticationDatabase admin -d yellowai -o /backup

# Restore database
docker-compose exec mongodb mongorestore -u admin -p yellowai2024 --authenticationDatabase admin /backup/yellowai
```

## 🔐 Environment Configuration

### Production Settings
```bash
# .env file for production
NODE_ENV=production
JWT_SECRET=your-secure-jwt-secret
MONGODB_URI=mongodb://admin:yellowai2024@mongodb:27017/yellowai?authSource=admin
```

### Development Settings
```bash
# Add development overrides
CLIENT_URL=http://localhost:80
ALLOWED_ORIGINS=http://localhost:80,http://localhost:3000,http://localhost:5173
```

## 🐛 Troubleshooting

### Common Issues

**1. Port Already in Use:**
```bash
# Check what's using the port
netstat -tulpn | grep :3000
# or on Windows
netstat -ano | findstr :3000

# Stop the service
docker-compose down
```

**2. Environment Variables Not Working:**
```bash
# Check if .env file exists
ls -la .env

# Verify environment variables are loaded
docker-compose config
```

**3. Database Connection Issues:**
```bash
# Check MongoDB container
docker-compose logs mongodb

# Test database connection
docker-compose exec server node -e "console.log(process.env.MONGODB_URI)"
```

**4. Build Failures:**
```bash
# Clean build
docker-compose build --no-cache

# Check individual service
docker-compose up server
```

### Health Checks
```bash
# Check all service health
docker-compose ps

# Test API endpoints
curl http://localhost:3000/health
curl http://localhost:3000/api/test

# Test frontend
curl http://localhost/
```

## 📊 Monitoring

### View Real-time Logs
```bash
# All services
docker-compose logs -f

# Specific services
docker-compose logs -f server client mongodb
```

### Performance Monitoring
```bash
# Resource usage
docker stats

# Container details
docker inspect yellowai-server
```

## 🔄 Updates & Deployment

### Update Application
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

### Production Deployment
```bash
# Set production environment
export NODE_ENV=production

# Use production compose file
docker-compose -f docker-compose.prod.yml up -d
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [MongoDB Docker Image](https://hub.docker.com/_/mongo)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

## 🆘 Support

If you encounter issues:

1. Check the logs: `docker-compose logs -f`
2. Verify environment variables: `docker-compose config`
3. Test individual services: `docker-compose up <service-name>`
4. Clean restart: `docker-compose down -v && docker-compose up -d --build`

---

**Happy Containerizing! 🚀**