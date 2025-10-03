@echo off
REM 🌟 Revolutionary AI Platforms - One-Click Setup (Windows)
REM This script helps you get started with our platforms in minutes

echo 🚀 Welcome to Revolutionary AI Platforms!
echo =========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first:
    echo    Visit: https://nodejs.org/
    pause
    exit /b 1
)

REM Check Node.js version
for /f "tokens=2 delims=v." %%i in ('node --version') do set NODE_VERSION=%%i
if %NODE_VERSION% LSS 18 (
    echo ❌ Node.js version %NODE_VERSION% is too old. Please upgrade to Node.js 18+
    pause
    exit /b 1
)

echo ✅ Node.js %NODE_VERSION% is installed

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed. Please install npm first
    pause
    exit /b 1
)

echo ✅ npm is installed
echo.

REM Ask user which platform they want to try
echo Which platform would you like to explore?
echo 1^) SpaceChild - AI-Powered Development
echo 2^) Pitchfork Protocol - Decentralized Activism
echo 3^) Unified Platform - Consciousness Bridge
echo.
set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" (
    set PLATFORM=spacechild
    set PLATFORM_NAME=SpaceChild
) else if "%choice%"=="2" (
    set PLATFORM=pitchfork
    set PLATFORM_NAME=Pitchfork Protocol
) else if "%choice%"=="3" (
    set PLATFORM=unified
    set PLATFORM_NAME=Unified Platform
) else (
    echo ❌ Invalid choice. Please run the script again and select 1, 2, or 3.
    pause
    exit /b 1
)

echo.
echo 🎯 Setting up %PLATFORM_NAME%...
echo.

REM Clone the repository
if not exist "revolutionary-ai-platforms" (
    echo 📥 Cloning repository...
    git clone https://github.com/yourusername/revolutionary-ai-platforms.git
    cd revolutionary-ai-platforms
) else (
    echo 📁 Repository already exists, updating...
    cd revolutionary-ai-platforms
    git pull
)

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Set up environment file
if not exist ".env" (
    echo ⚙️  Setting up environment configuration...
    copy .env.example .env
    echo ✅ Environment file created. You can customize it later if needed.
) else (
    echo ✅ Environment file already exists
)

REM Build the application
echo 🔨 Building application...
call npm run build

echo.
echo 🎉 Setup Complete!
echo ==================
echo.
echo 🚀 To start %PLATFORM_NAME%:
echo    cd revolutionary-ai-platforms
echo    npm run dev
echo.
echo 🌐 Then open your browser to: http://localhost:3000
echo.
echo 📚 Quick Start Guide:
echo    1. Visit /welcome to choose your platform
echo    2. Visit /guides for step-by-step tutorials
echo    3. Try the interactive onboarding flow
echo.
echo 💡 For developers:
echo    The advanced features are available at:
echo    - /consciousness (Consciousness Platform^)
echo    - /unified (Unified Consciousness Platform^)
echo    - /bridge (Development-Activism Bridge^)
echo.
echo 🎯 Next Steps:
echo    1. Run 'npm run dev' to start the application
echo    2. Visit http://localhost:3000/welcome
echo    3. Follow the guided onboarding for your chosen platform
echo.
echo Happy exploring! 🚀✨
echo.
pause
