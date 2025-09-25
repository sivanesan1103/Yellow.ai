@echo off
echo 🚀 Starting Yellow.ai Docker Application...

:: Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    echo Visit: https://docs.docker.com/desktop/windows/
    pause
    exit /b 1
)

:: Check if Docker Compose is available
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose is not available. Please update Docker Desktop.
    pause
    exit /b 1
)

:: Check if .env file exists
if not exist ".env" (
    echo ⚠️  .env file not found. Creating from template...
    copy .env.docker .env
    echo 📝 Please edit .env file with your API keys before running again.
    echo Required: GEMINI_API_KEY, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, MONGODB_URI
    echo MongoDB Atlas: Get connection string from Atlas Dashboard
    pause
    exit /b 1
)

echo ✅ Docker is ready

:: Build and start services
echo 🔨 Building Docker images...
docker-compose build

echo 🚀 Starting services...
docker-compose up -d

:: Wait for services to start
echo ⏳ Waiting for services to start...
timeout /t 10 /nobreak >nul

:: Check service status
echo 📊 Service Status:
docker-compose ps

echo.
echo 🎉 Yellow.ai is starting up!
echo 📱 Frontend: http://localhost
echo 🔧 Backend API: http://localhost:3000
echo 🗄️  MongoDB: localhost:27017
echo.
echo 📋 Useful Commands:
echo   View logs: docker-compose logs -f
echo   Stop app: docker-compose down
echo   Restart: docker-compose restart
echo   Update: docker-compose pull ^&^& docker-compose up -d --build

pause