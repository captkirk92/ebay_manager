#!/bin/bash

# AI-Powered eBay Store Manager Dashboard Startup Script

echo "🚀 Starting AI-Powered eBay Store Manager Dashboard..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Please copy your .env file from the main project directory."
    echo "   Run: cp ../.env ."
    exit 1
fi

# Check if Python dependencies are installed
echo "📦 Checking Python dependencies..."
python3 -c "import requests, json" 2>/dev/null || {
    echo "❌ Python dependencies not found. Installing..."
    pip3 install requests python-dotenv
}

# Start backend server
echo "🔧 Starting backend API server..."
cd backend
npm start &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 3

# Check if backend is running
if curl -s http://localhost:5000/api/health > /dev/null; then
    echo "✅ Backend server started successfully on port 5000"
else
    echo "❌ Backend server failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Start frontend development server
echo "🎨 Starting frontend development server..."
cd ..
npm run dev &
FRONTEND_PID=$!

echo ""
echo "🎉 Dashboard is starting up!"
echo "📊 Backend API: http://localhost:5000"
echo "🎨 Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for processes
wait
