# AI-Powered eBay Store Manager - Integration Guide

## 🚀 Overview

This is a modern, AI-powered dashboard for managing your eBay store. It connects to your actual eBay store data through the eBay Developer APIs and provides real-time insights, analytics, and management tools.

## ✨ Features

- **Real-time Store Data**: Live connection to your eBay store
- **AI-Powered Insights**: Intelligent recommendations and analysis
- **Order Management**: Track and manage orders in real-time
- **Listing Optimization**: AI suggestions for improving listings
- **Analytics Dashboard**: Comprehensive store performance metrics
- **Customer Service**: Message management and response tools
- **Modern UI**: Beautiful, responsive design with dark/light themes

## 🛠️ Setup Instructions

### Prerequisites

1. **eBay Developer Account**: You need an active eBay Developer account
2. **API Credentials**: Your eBay API credentials (App ID, Dev ID, Cert ID, RU Name)
3. **OAuth Tokens**: Valid access and refresh tokens for your eBay account

### Quick Start

1. **Copy your environment file**:

   ```bash
   cp ../.env .
   ```

2. **Start the dashboard**:

   ```bash
   ./start-dashboard.sh
   ```

3. **Access the dashboard**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Manual Setup

If you prefer to start the servers manually:

1. **Start the backend API server**:

   ```bash
   cd backend
   npm install
   npm start
   ```

2. **Start the frontend development server** (in a new terminal):
   ```bash
   npm install
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables

Make sure your `.env` file contains:

```env
EBAY_APP_ID=your_app_id_here
EBAY_DEV_ID=your_dev_id_here
EBAY_CERT_ID=your_cert_id_here
EBAY_RUNAME=your_ru_name_here
EBAY_ENVIRONMENT=sandbox
EBAY_ACCESS_TOKEN=your_access_token_here
EBAY_REFRESH_TOKEN=your_refresh_token_here
EBAY_STORE_NAME=your_store_name
EBAY_USER_ID=your_ebay_user_id
```

### API Endpoints

The backend provides the following API endpoints:

- `GET /api/store/summary` - Store summary information
- `GET /api/store/orders?days=30` - Recent orders
- `GET /api/store/listings` - Active listings
- `GET /api/store/analytics?days=30` - Analytics data
- `GET /api/health` - Health check

## 📊 Dashboard Components

### 1. Dashboard Overview

- Real-time store metrics
- Revenue and order tracking
- AI-powered insights
- Performance charts

### 2. Order Management

- Recent orders display
- Order status tracking
- Customer information
- Order processing tools

### 3. Listings Optimization

- Active listings overview
- AI suggestions for improvement
- Performance metrics
- Optimization recommendations

### 4. Analytics Dashboard

- Revenue trends
- Sales performance
- Customer analytics
- Store health metrics

### 5. Customer Service

- Message management
- Response tracking
- AI-powered suggestions
- Customer insights

## 🤖 AI Features

The dashboard includes several AI-powered features:

- **Smart Insights**: AI analyzes your store data and provides actionable recommendations
- **Performance Predictions**: Forecast future performance based on current trends
- **Automated Alerts**: Get notified about important events and opportunities
- **Optimization Suggestions**: AI-powered recommendations for improving listings and sales

## 🔄 Data Flow

1. **Backend API** calls your eBay API client
2. **eBay API Client** fetches data from eBay Developer APIs
3. **Frontend** displays real-time data with AI enhancements
4. **AI Analysis** provides insights and recommendations

## 🐛 Troubleshooting

### Common Issues

1. **"Failed to fetch data" error**:

   - Check your `.env` file has correct credentials
   - Verify your eBay API tokens are valid
   - Ensure the backend server is running

2. **"API request failed" error**:

   - Check your internet connection
   - Verify eBay API credentials
   - Check eBay API rate limits

3. **Dashboard not loading**:
   - Ensure both frontend and backend servers are running
   - Check browser console for errors
   - Verify port 3000 and 5000 are available

### Debug Mode

To enable debug logging, set `DEBUG=true` in your `.env` file.

## 📈 Performance

- **Real-time Updates**: Data refreshes automatically
- **Caching**: Intelligent caching for better performance
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Fast Loading**: Optimized for quick load times

## 🔒 Security

- **API Keys**: Stored securely in environment variables
- **HTTPS**: Secure communication with eBay APIs
- **Token Management**: Automatic token refresh
- **Data Privacy**: No data stored permanently on the server

## 🚀 Deployment

### Production Build

1. **Build the frontend**:

   ```bash
   npm run build
   ```

2. **Start production server**:
   ```bash
   cd backend
   npm start
   ```

### Environment Variables for Production

Set these environment variables in your production environment:

```env
NODE_ENV=production
PORT=5000
EBAY_APP_ID=your_production_app_id
EBAY_DEV_ID=your_production_dev_id
EBAY_CERT_ID=your_production_cert_id
EBAY_RUNAME=your_production_ru_name
EBAY_ENVIRONMENT=production
EBAY_ACCESS_TOKEN=your_production_access_token
EBAY_REFRESH_TOKEN=your_production_refresh_token
EBAY_STORE_NAME=your_production_store_name
EBAY_USER_ID=your_production_user_id
```

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review the browser console for errors
3. Check the backend server logs
4. Verify your eBay API credentials

## 🔄 Updates

The dashboard automatically:

- Refreshes data every 30 seconds
- Updates AI insights in real-time
- Syncs with your eBay store changes
- Maintains optimal performance

---

**Happy selling! 🛍️✨**
