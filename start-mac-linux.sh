#!/bin/bash

echo "===================================================================="
echo "       PrepPulse.AI - AI Placement Prep System Launcher (Unix)      "
echo "===================================================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null
then
    echo "[ERROR] Node.js is not installed or not in PATH."
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "[*] Node.js detected: $(node -v)"
echo ""

# Backend dependencies check
if [ ! -d "backend/node_modules" ]; then
    echo "[*] Installing Backend dependencies..."
    cd backend && npm install && cd ..
fi

# Frontend dependencies check
if [ ! -d "frontend/node_modules" ]; then
    echo "[*] Installing Frontend dependencies..."
    cd frontend && npm install && cd ..
fi

echo ""
echo "===================================================================="
echo " Launching Backend (Port 5000) and Frontend (Port 3000/3001)..."
echo "===================================================================="
echo ""

# Start backend in background
(cd backend && npm run dev) &
BACKEND_PID=$!

sleep 3

# Start frontend in background
(cd frontend && npm run dev) &
FRONTEND_PID=$!

echo ""
echo "[SUCCESS] Both servers launched!"
echo "Backend PID: $BACKEND_PID | Frontend PID: $FRONTEND_PID"
echo "Frontend URL: http://localhost:3000"
echo ""
echo "Press CTRL+C to stop all servers."

# Trap interrupt signal to cleanly shut down both processes
trap "kill $BACKEND_PID $FRONTEND_PID; exit 0" SIGINT SIGTERM

wait
