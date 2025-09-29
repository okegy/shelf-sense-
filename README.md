# Smart Inventory Management System

A comprehensive inventory management solution with real-time monitoring, automated alerts, and intelligent analytics to minimize waste and maximize profits.

## 🚀 Features

### Core Features
- **Real-time Inventory Tracking**: Monitor stock levels, expiry dates, and freshness
- **Automated Alerts**: Smart notifications for expiring items, low stock, and sensor alerts
- **IoT Integration**: Temperature, humidity, and ethylene monitoring
- **Sales Analytics**: Real-time profit tracking and wastage prevention
- **Barcode Scanning**: Quick product identification and management
- **Wholesale Management**: Bulk item tracking with individual unit management
- **Supplier Management**: Track supplier reliability and ratings
- **Purchase Orders**: Streamlined ordering system

### Smart Features
- **Dynamic Pricing**: Automatic discounts for expiring items
- **Wastage Prevention**: AI-powered recommendations to reduce waste
- **Real-time Dashboard**: Live updates of financial metrics
- **Multi-role Access**: Admin, Manager, and Staff roles
- **Mobile Responsive**: Works on all devices

### 🔬 Hardware Integration (NEW!)
- **Corrosion Rate Detection**: Hardware-based freshness analysis for fruits and vegetables
- **CLI Tool Integration**: Seamless integration with existing command-line hardware tools
- **Real-time Scanning**: Individual and batch product scanning capabilities
- **Voice-Controlled Hardware**: Hands-free operation with voice commands
- **Container Support**: Runs in Podman/Docker with hardware device access
- **Environmental Monitoring**: Temperature, humidity, and ethylene level tracking
- **Freshness Classification**: 4-tier status system (Fresh → Moderate → High Risk → Spoiled)

## 🛠️ Technology Stack

### Backend
- **Node.js** with **TypeScript**
- **Express.js** for API server
- **JWT Authentication** with role-based access
- **In-memory data storage** (easily replaceable with MongoDB/PostgreSQL)
- **WebSocket support** for real-time updates
- **Background task scheduling** for alerts and sensor simulation

### Frontend
- **React 18** with **TypeScript**
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Axios** for API communication
- **Responsive design** with modern UI

## 📋 Prerequisites

- Node.js 16+ and npm
- Git

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd project
```

### 2. Install Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
npm install
```

### 3. Start the Backend
```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:5000` with:
- API endpoints: `http://localhost:5000/api`
- Health check: `http://localhost:5000/health`
- API documentation: `http://localhost:5000/`

### 4. Start the Frontend
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

### 5. Login
- **Username**: Any username (e.g., `admin`, `manager`, `staff`)
- **Password**: Any password
- **URL**: `http://localhost:5173`

## 📚 API Documentation

### Authentication
```bash
# Login
POST /api/auth/login
{
  "username": "admin",
  "password": "password"
}

# Get Profile
GET /api/auth/profile
Authorization: Bearer <token>
```

### Products
```bash
# Get all products
GET /api/products

# Get product by barcode
GET /api/products/barcode/:barcode

# Search products
GET /api/products/search?q=search_term

# Get expiring products
GET /api/products/expiring
```

### Categories
```bash
# Get all categories
GET /api/categories

# Get category statistics
GET /api/categories/stats
```

### Sales
```bash
# Get today's sales
GET /api/sales/today

# Create a sale
POST /api/sales
{
  "productId": "1",
  "quantity": 2,
  "unitPrice": 32,
  "discount": 8
}
```

### IoT Sensors
```bash
# Get all sensors
GET /api/sensors

# Get sensor statistics
GET /api/sensors/stats
```

### Alerts
```bash
# Get all alerts
GET /api/alerts

# Get unread alerts
GET /api/alerts/unread

# Mark alert as read
PUT /api/alerts/:id/read
```

## 🎯 Key Features Explained

### 1. Smart Inventory Management
- **Real-time Stock Tracking**: Monitor inventory levels across all categories
- **Expiry Management**: Automatic alerts for products nearing expiry
- **Freshness Monitoring**: Track product quality with IoT sensors

### 2. Automated Alert System
- **Expiry Alerts**: Notifications for products expiring within 24-48 hours
- **Stock Alerts**: Low inventory warnings
- **Sensor Alerts**: Environmental condition monitoring
- **Smart Recommendations**: Automatic discount suggestions

### 3. Financial Analytics
- **Real-time Profit Tracking**: Live profit calculations
- **Wastage Prevention**: Track savings from early discounts
- **Sales Analytics**: Comprehensive sales reporting

### 4. IoT Integration
- **Temperature Monitoring**: Track storage conditions
- **Humidity Control**: Monitor environmental factors
- **Ethylene Detection**: Fruit ripening monitoring
- **Automated Responses**: Smart system adjustments

### 5. Wholesale Management
- **Bulk Tracking**: Manage wholesale boxes and individual units
- **Unit-level Monitoring**: Track individual items within boxes
- **Sales Integration**: Seamless wholesale-to-retail conversion

## 🔧 Configuration

### Environment Variables (Backend)
Create a `.env` file in the backend directory:
```env
PORT=5000
JWT_SECRET=your-secret-key
NODE_ENV=development
```

### API Base URL (Frontend)
Update `src/services/api.ts` if you change the backend port:
```typescript
const API_BASE_URL = 'http://localhost:5000/api';
```

## 📱 Usage Guide

### Dashboard Overview
1. **Login** with any credentials
2. **View Financial Metrics**: Today's profit, wastage prevented, items at risk
3. **Monitor Categories**: Click categories to filter products
4. **Scan Barcodes**: Use the barcode scanner for quick product lookup

### Managing Inventory
1. **Search Products**: Use the search bar or barcode scanner
2. **View Product Details**: Click on products to see detailed information
3. **Monitor Expiry**: Check the expiry status and freshness indicators
4. **Apply Discounts**: System automatically suggests discounts for expiring items

### Wholesale Operations
1. **View Wholesale Boxes**: See all bulk inventory
2. **Track Individual Units**: Monitor individual items within boxes
3. **Process Sales**: Sell items from wholesale boxes
4. **Restock**: Add new wholesale boxes as needed

### IoT Monitoring
1. **View Sensor Data**: Real-time temperature, humidity, and ethylene levels
2. **Monitor Alerts**: Get notified of environmental issues
3. **Track Trends**: View historical sensor data

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Different permissions for admin, manager, and staff
- **API Security**: Protected endpoints with authentication middleware
- **Input Validation**: Comprehensive data validation

## 📊 Data Models

### Product
- ID, name, barcode, count, expiry date
- Price, discounted price, status (safe/warning/danger)
- Freshness level, category, environmental conditions

### Sale
- Product ID, quantity, unit price, total price
- Discount applied, timestamp, payment method

### IoT Sensor
- Type (temperature/humidity/ethylene), location, value
- Status (online/offline), thresholds, last update

### Corrosion Reading (NEW!)
- Product ID, corrosion rate (0-5 scale), confidence score
- Status (fresh/moderate/high_risk/spoiled), environmental data
- Timestamp, sensor location, hardware diagnostics

### Alert
- Type (expiry/stock/sensor/system), severity level
- Title, message, timestamp, read status

## 🚀 Deployment

### Quick Start (Development)
```bash
# Start both frontend and backend
npm run start

# Or start individually:
npm run backend  # Backend on port 5000
npm run dev      # Frontend on port 5173
```

### Hardware Integration Deployment
```powershell
# Windows - Automated deployment with hardware support
.\deploy-hardware-integration.ps1 -Deploy -HardwareDevice "COM3"

# Test hardware integration
.\deploy-hardware-integration.ps1 -Test

# Manual container deployment
podman-compose up --build
```

### Production Deployment
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
npm run build
# Deploy the dist folder to your hosting service
```

### Container Deployment
```bash
# With hardware device access
podman-compose up --build -d

# Check status
podman-compose ps
podman-compose logs
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please contact the development team or create an issue in the repository.

## 🔄 Updates

The system includes:
- **Automatic Alert Generation**: Every 5 minutes
- **Sensor Data Simulation**: Every 2 minutes
- **Real-time Financial Updates**: Every 30 seconds
- **Live Dashboard Updates**: Instant data synchronization

---

**Smart Inventory Management System** - Reducing waste, maximizing profits, and providing intelligent inventory solutions for modern businesses.
