#!/bin/bash

# 🌟 Revolutionary AI Platforms - One-Click Setup
# This script helps you get started with our platforms in minutes

echo "🚀 Welcome to Revolutionary AI Platforms!"
echo "========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first:"
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please upgrade to Node.js 18+"
    exit 1
fi

echo "✅ Node.js $NODE_VERSION is installed"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first"
    exit 1
fi

echo "✅ npm is installed"

# Ask user which platform they want to try
echo ""
echo "Which platform would you like to explore?"
echo "1) SpaceChild - AI-Powered Development"
echo "2) Pitchfork Protocol - Decentralized Activism"
echo "3) Unified Platform - Consciousness Bridge"
echo ""
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        PLATFORM="spacechild"
        PLATFORM_NAME="SpaceChild"
        ;;
    2)
        PLATFORM="pitchfork"
        PLATFORM_NAME="Pitchfork Protocol"
        ;;
    3)
        PLATFORM="unified"
        PLATFORM_NAME="Unified Platform"
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again and select 1, 2, or 3."
        exit 1
        ;;
esac

echo ""
echo "🎯 Setting up $PLATFORM_NAME..."
echo ""

# Clone the repository
if [ ! -d "revolutionary-ai-platforms" ]; then
    echo "📥 Cloning repository..."
    git clone https://github.com/yourusername/revolutionary-ai-platforms.git
    cd revolutionary-ai-platforms
else
    echo "📁 Repository already exists, updating..."
    cd revolutionary-ai-platforms
    git pull
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Set up environment file
if [ ! -f ".env" ]; then
    echo "⚙️  Setting up environment configuration..."
    cp .env.example .env
    echo "✅ Environment file created. You can customize it later if needed."
else
    echo "✅ Environment file already exists"
fi

# Build the application
echo "🔨 Building application..."
npm run build

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "🚀 To start $PLATFORM_NAME:"
echo "   cd revolutionary-ai-platforms"
echo "   npm run dev"
echo ""
echo "🌐 Then open your browser to: http://localhost:3000"
echo ""
echo "📚 Quick Start Guide:"
echo "   1. Visit /welcome to choose your platform"
echo "   2. Visit /guides for step-by-step tutorials"
echo "   3. Try the interactive onboarding flow"
echo ""
echo "💡 For developers:"
echo "   The advanced features are available at:"
echo "   - /consciousness (Consciousness Platform)"
echo "   - /unified (Unified Consciousness Platform)"
echo "   - /bridge (Development-Activism Bridge)"
echo ""
echo "🎯 Next Steps:"
echo "   1. Run 'npm run dev' to start the application"
echo "   2. Visit http://localhost:3000/welcome"
echo "   3. Follow the guided onboarding for your chosen platform"
echo ""
echo "Happy exploring! 🚀✨"
