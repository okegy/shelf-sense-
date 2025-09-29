import express from 'express';
import cors from 'cors';
const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data
const mockProducts = [
  {
    id: '1',
    name: 'Fresh Apples',
    barcode: '1234567890',
    count: 50,
    expiry: '2024-01-15',
    price: 120,
    discountedPrice: 100,
    status: 'safe',
    freshness: 'Fresh',
    category: 'fruits',
    humidity: '65%',
    ethylene: 'Low',
    temperature: '4°C'
  },
  {
    id: '2',
    name: 'Organic Bananas',
    barcode: '1234567891',
    count: 30,
    expiry: '2024-01-10',
    price: 80,
    discountedPrice: 60,
    status: 'warning',
    freshness: 'Good',
    category: 'fruits',
    humidity: '70%',
    ethylene: 'Medium',
    temperature: '12°C'
  },
  {
    id: '3',
    name: 'Fresh Milk',
    barcode: '1234567892',
    count: 25,
    expiry: '2024-01-08',
    price: 60,
    discountedPrice: 45,
    status: 'danger',
    freshness: 'Expires Soon',
    category: 'dairy',
    humidity: '80%',
    ethylene: 'Low',
    temperature: '2°C'
  }
];

const mockCategories = [
  { id: '1', name: 'Fruits', icon: '🍎', totalItems: 80, expiringItems: 5 },
  { id: '2', name: 'Vegetables', icon: '🥕', totalItems: 120, expiringItems: 8 },
  { id: '3', name: 'Dairy', icon: '🥛', totalItems: 45, expiringItems: 3 },
  { id: '4', name: 'Meat', icon: '🥩', totalItems: 30, expiringItems: 2 },
  { id: '5', name: 'Bakery', icon: '🍞', totalItems: 60, expiringItems: 4 },
  { id: 'wholesale', name: 'Wholesale', icon: '📦', totalItems: 200, expiringItems: 10 }
];

const mockWholesaleBoxes = [
  {
    id: '1',
    name: 'Mixed Fruit Box',
    boxCode: 'WB001',
    totalUnits: 24,
    expiry: '2024-01-20',
    individualItems: [
      { id: '1', name: 'Apple', itemCode: 'AP001', expiry: '2024-01-20', sold: false },
      { id: '2', name: 'Orange', itemCode: 'OR001', expiry: '2024-01-18', sold: true }
    ]
  }
];

const mockAlerts = [
  {
    id: '1',
    type: 'expiry',
    severity: 'high',
    title: 'Products Expiring Soon',
    message: '3 products will expire in the next 2 days',
    timestamp: new Date().toISOString(),
    isRead: false,
    productId: '3'
  }
];

const mockSuppliers = [
  {
    id: '1',
    name: 'Fresh Farm Co.',
    contact: '+91 9876543210',
    email: 'contact@freshfarm.com',
    address: '123 Farm Road, Delhi',
    rating: 4.5,
    totalOrders: 150,
    reliability: 'High'
  }
];

const mockSensors = [
  {
    id: '1',
    type: 'temperature',
    location: 'Cold Storage A',
    value: 4.2,
    unit: '°C',
    status: 'online',
    lastUpdate: new Date().toISOString(),
    threshold: { min: 2, max: 6 }
  },
  {
    id: '2',
    type: 'humidity',
    location: 'Fruit Section',
    value: 65,
    unit: '%',
    status: 'online',
    lastUpdate: new Date().toISOString(),
    threshold: { min: 60, max: 80 }
  }
];

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  // Mock authentication - accept any username/password
  res.json({
    success: true,
    token: 'mock-jwt-token',
    user: {
      id: '1',
      username: username,
      role: 'admin',
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    }
  });
});

app.post('/api/auth/register', (req, res) => {
  const { username, password, role } = req.body;
  
  res.json({
    success: true,
    token: 'mock-jwt-token',
    user: {
      id: '2',
      username: username,
      role: role || 'staff',
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    }
  });
});

// Product routes
app.get('/api/products', (req, res) => {
  res.json({ success: true, data: mockProducts });
});

app.get('/api/products/:id', (req, res) => {
  const product = mockProducts.find(p => p.id === req.params.id);
  if (product) {
    res.json({ success: true, data: product });
  } else {
    res.status(404).json({ success: false, error: 'Product not found' });
  }
});

app.get('/api/products/barcode/:barcode', (req, res) => {
  const product = mockProducts.find(p => p.barcode === req.params.barcode);
  if (product) {
    res.json({ success: true, data: product });
  } else {
    res.status(404).json({ success: false, error: 'Product not found' });
  }
});

app.get('/api/products/search', (req, res) => {
  const query = req.query.query?.toString().toLowerCase() || '';
  const filtered = mockProducts.filter(p => 
    p.name.toLowerCase().includes(query) || 
    p.category.toLowerCase().includes(query)
  );
  res.json({ success: true, data: filtered });
});

app.get('/api/products/expiring', (req, res) => {
  const expiring = mockProducts.filter(p => p.status === 'danger' || p.status === 'warning');
  res.json({ success: true, data: expiring });
});

app.get('/api/products/low-stock', (req, res) => {
  const lowStock = mockProducts.filter(p => p.count < 20);
  res.json({ success: true, data: lowStock });
});

// Category routes
app.get('/api/categories', (req, res) => {
  res.json({ success: true, data: mockCategories });
});

app.get('/api/categories/stats', (req, res) => {
  res.json({ 
    success: true, 
    data: {
      totalCategories: mockCategories.length,
      totalProducts: mockCategories.reduce((sum, cat) => sum + cat.totalItems, 0),
      expiringProducts: mockCategories.reduce((sum, cat) => sum + cat.expiringItems, 0)
    }
  });
});

// Wholesale routes
app.get('/api/wholesale', (req, res) => {
  res.json({ success: true, data: mockWholesaleBoxes });
});

app.get('/api/wholesale/stats', (req, res) => {
  res.json({ 
    success: true, 
    data: {
      totalBoxes: mockWholesaleBoxes.length,
      totalItems: mockWholesaleBoxes.reduce((sum, box) => sum + box.totalUnits, 0)
    }
  });
});

// Supplier routes
app.get('/api/suppliers', (req, res) => {
  res.json({ success: true, data: mockSuppliers });
});

app.get('/api/suppliers/stats', (req, res) => {
  res.json({ 
    success: true, 
    data: {
      totalSuppliers: mockSuppliers.length,
      averageRating: mockSuppliers.reduce((sum, s) => sum + s.rating, 0) / mockSuppliers.length
    }
  });
});

app.get('/api/suppliers/top-rated', (req, res) => {
  const topRated = mockSuppliers.filter(s => s.rating >= 4.0);
  res.json({ success: true, data: topRated });
});

// Sales routes
app.get('/api/sales', (req, res) => {
  const mockSales = [
    {
      id: '1',
      productId: '1',
      quantity: 5,
      unitPrice: 120,
      totalPrice: 600,
      discount: 0,
      timestamp: new Date().toISOString(),
      paymentMethod: 'card'
    }
  ];
  res.json({ success: true, data: mockSales });
});

app.get('/api/sales/today', (req, res) => {
  res.json({ 
    success: true, 
    data: { total: 15000, profit: 3500 }
  });
});

app.get('/api/sales/analytics', (req, res) => {
  res.json({ 
    success: true, 
    data: {
      dailySales: 15000,
      weeklySales: 95000,
      monthlySales: 380000,
      topProducts: mockProducts.slice(0, 3)
    }
  });
});

// Sensor routes
app.get('/api/sensors', (req, res) => {
  res.json({ success: true, data: mockSensors });
});

app.get('/api/sensors/stats', (req, res) => {
  res.json({ 
    success: true, 
    data: {
      totalSensors: mockSensors.length,
      onlineSensors: mockSensors.filter(s => s.status === 'online').length,
      offlineSensors: mockSensors.filter(s => s.status === 'offline').length
    }
  });
});

app.get('/api/sensors/online', (req, res) => {
  const online = mockSensors.filter(s => s.status === 'online');
  res.json({ success: true, data: online });
});

app.get('/api/sensors/offline', (req, res) => {
  const offline = mockSensors.filter(s => s.status === 'offline');
  res.json({ success: true, data: offline });
});

// Alert routes
app.get('/api/alerts', (req, res) => {
  res.json({ success: true, data: mockAlerts });
});

app.get('/api/alerts/unread', (req, res) => {
  const unread = mockAlerts.filter(a => !a.isRead);
  res.json({ success: true, data: unread });
});

app.get('/api/alerts/stats', (req, res) => {
  res.json({ 
    success: true, 
    data: {
      totalAlerts: mockAlerts.length,
      unreadAlerts: mockAlerts.filter(a => !a.isRead).length,
      criticalAlerts: mockAlerts.filter(a => a.severity === 'critical').length
    }
  });
});

// ML routes (mock)
app.get('/api/ml/models', (req, res) => {
  res.json({ success: true, data: [] });
});

// Voice routes (mock)
app.post('/api/voice/search', (req, res) => {
  const { query } = req.body;
  const filtered = mockProducts.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase())
  );
  res.json({ success: true, data: filtered });
});

// Health check
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
    message: 'ShelfSense Mock API Server',
    version: '1.0.0',
    status: 'running'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Mock API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Login endpoint: POST http://localhost:${PORT}/api/auth/login`);
  console.log(`📦 Products endpoint: GET http://localhost:${PORT}/api/products`);
});
