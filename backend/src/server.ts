import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import routes from './routes/index';
import { AlertModel } from './models/Alert';
import { IoTSensorModel } from './models/IoTSensor';
import { ProductModel } from './models/Product';
import { connectDB } from './database';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Smart Inventory Management System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      sales: '/api/sales',
      sensors: '/api/sensors',
      alerts: '/api/alerts',
      discounts: '/api/products/apply-discounts (POST - admin/manager only)'
    },
    features: {
      smartDiscounts: 'Automatic discounts based on expiry dates and stock levels',
      iotSensors: 'Real-time environmental monitoring',
      voiceCommands: 'Voice search and command processing',
      alerts: 'Automated notifications for expiry, stock, and sensor issues'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// Background tasks for alerts, sensor updates, and smart discounts
const startBackgroundTasks = () => {
  // Generate alerts every 5 minutes
  setInterval(async () => {
    try {
      await AlertModel.generateExpiryAlerts();
      await AlertModel.generateStockAlerts();
      await AlertModel.generateSensorAlerts();
      console.log('Alert generation completed at', new Date().toISOString());
    } catch (error) {
      console.error('Error generating alerts:', error);
    }
  }, 5 * 60 * 1000); // 5 minutes

  // Simulate sensor updates every 2 minutes
  setInterval(async () => {
    try {
      await IoTSensorModel.simulateSensorUpdates();
      console.log('Sensor data simulation completed at', new Date().toISOString());
    } catch (error) {
      console.error('Error simulating sensor updates:', error);
    }
  }, 2 * 60 * 1000); // 2 minutes

  // Apply smart discounts every 10 minutes
  setInterval(async () => {
    try {
      await ProductModel.applySmartDiscounts();
      console.log('Smart discount application completed at', new Date().toISOString());
    } catch (error) {
      console.error('Error applying smart discounts:', error);
    }
  }, 10 * 60 * 1000); // 10 minutes
};

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Seed database with initial data
    const { seedDatabase } = await import('./data/seedData');
    await seedDatabase();

    // Initialize background tasks
    startBackgroundTasks();

    app.listen(PORT, () => {
      console.log(`🚀 Smart Inventory Management System API running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/`);
      console.log(`🔐 Authentication: POST http://localhost:${PORT}/api/auth/login`);
      console.log(`🗄️  MongoDB connected to inventorydb`);
      console.log(`🌱 Database seeded with sample data`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
startServer();

export default app;
