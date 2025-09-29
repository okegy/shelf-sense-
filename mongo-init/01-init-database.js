// MongoDB initialization script for inventory management system

// Switch to the inventory database
db = db.getSiblingDB('inventorydb');

// Create collections with indexes
db.createCollection('products');
db.createCollection('users');
db.createCollection('sales');
db.createCollection('iotsensors');
db.createCollection('alerts');
db.createCollection('categories');
db.createCollection('suppliers');
db.createCollection('wholesaleboxes');

// Create indexes for better performance
db.products.createIndex({ "barcode": 1 }, { unique: true });
db.products.createIndex({ "category": 1 });
db.products.createIndex({ "expiry": 1 });
db.products.createIndex({ "status": 1 });
db.products.createIndex({ "name": "text", "barcode": "text" });

db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });

db.sales.createIndex({ "productId": 1 });
db.sales.createIndex({ "timestamp": -1 });

db.iotsensors.createIndex({ "type": 1 });
db.iotsensors.createIndex({ "location": 1 });
db.iotsensors.createIndex({ "status": 1 });

db.alerts.createIndex({ "type": 1 });
db.alerts.createIndex({ "severity": 1 });
db.alerts.createIndex({ "timestamp": -1 });
db.alerts.createIndex({ "isRead": 1 });

// Insert sample users
db.users.insertMany([
  {
    username: 'admin',
    password: '$2a$10$8K1p/a3Z8l9v4c2X7Y8z9uF5G7H8I9J0K1L2M3N4O5P6Q7R8S9T0', // 'admin123'
    role: 'admin',
    isActive: true,
    createdAt: new Date(),
    lastLogin: null
  },
  {
    username: 'manager',
    password: '$2a$10$8K1p/a3Z8l9v4c2X7Y8z9uF5G7H8I9J0K1L2M3N4O5P6Q7R8S9T0', // 'manager123'
    role: 'manager',
    isActive: true,
    createdAt: new Date(),
    lastLogin: null
  },
  {
    username: 'staff',
    password: '$2a$10$8K1p/a3Z8l9v4c2X7Y8z9uF5G7H8I9J0K1L2M3N4O5P6Q7R8S9T0', // 'staff123'
    role: 'staff',
    isActive: true,
    createdAt: new Date(),
    lastLogin: null
  }
]);

// Insert sample categories
db.categories.insertMany([
  {
    name: 'Fresh Produce',
    icon: '🥬',
    totalItems: 0,
    expiringItems: 0,
    createdAt: new Date()
  },
  {
    name: 'Dairy',
    icon: '🥛',
    totalItems: 0,
    expiringItems: 0,
    createdAt: new Date()
  },
  {
    name: 'Packaged Foods',
    icon: '🍜',
    totalItems: 0,
    expiringItems: 0,
    createdAt: new Date()
  },
  {
    name: 'Beverages',
    icon: '🥤',
    totalItems: 0,
    expiringItems: 0,
    createdAt: new Date()
  },
  {
    name: 'Frozen',
    icon: '🧊',
    totalItems: 0,
    expiringItems: 0,
    createdAt: new Date()
  }
]);

// Insert sample IoT sensors
db.iotsensors.insertMany([
  {
    type: 'temperature',
    location: 'Storage Room A',
    value: 4.5,
    unit: '°C',
    status: 'online',
    lastUpdate: new Date(),
    threshold: { min: 2, max: 8 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    type: 'humidity',
    location: 'Storage Room A',
    value: 65,
    unit: '%',
    status: 'online',
    lastUpdate: new Date(),
    threshold: { min: 50, max: 75 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    type: 'ethylene',
    location: 'Fruit Section',
    value: 0.8,
    unit: 'ppm',
    status: 'online',
    lastUpdate: new Date(),
    threshold: { min: 0, max: 2 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    type: 'temperature',
    location: 'Freezer',
    value: -18,
    unit: '°C',
    status: 'online',
    lastUpdate: new Date(),
    threshold: { min: -25, max: -15 },
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

print('✅ Database initialized successfully with sample data');
