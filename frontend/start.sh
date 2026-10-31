#!/bin/bash
# HireHub Frontend Setup Script
set -e

echo "📦 Installing Node dependencies..."
cd "$(dirname "$0")"
npm install

echo ""
echo "✅ Dependencies installed!"
echo ""
echo "🚀 Starting React dev server on http://localhost:5173"
npm run dev
