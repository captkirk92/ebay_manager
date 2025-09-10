#!/bin/bash

echo "🚀 Starting Enhanced eBay Dashboard"
echo "=================================="

# Run enhanced data collection
echo "📊 Collecting enhanced eBay data..."
cd "/workspaces/ebay_manager/AI-Powered eBay Store Manager"
PYTHONPATH=. python3 enhanced_data_pipeline.py

echo ""
echo "🌟 Enhanced data collection completed!"
echo ""
echo "📱 Available Dashboard Views:"
echo "   • Basic Dashboard:    http://localhost:3000/"
echo "   • Material Dashboard: http://localhost:3000/?view=material-dashboard"
echo "   • Enhanced Dashboard: http://localhost:3000/?view=enhanced-dashboard"
echo ""
echo "🚀 Starting development server..."

# Start the development server
npm run dev
