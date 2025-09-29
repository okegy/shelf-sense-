// Simple HTTP server without external dependencies
import http from 'http';
import url from 'url';

const PORT = 5000;

// Mock data
const mockProducts = [
  {
    id: '1',
    name: 'Fresh Apples',
    barcode: '1234567890',
    count: 50,
    expiry: '2024-12-15',
    price: 120,
    discountedPrice: 100,
    status: 'safe',
    freshness: 'Fresh',
    category: 'Fruits'
  },
  {
    id: '2',
    name: 'Organic Bananas',
    barcode: '1234567891',
    count: 15,
    expiry: '2024-12-10',
    price: 80,
    discountedPrice: 60,
    status: 'warning',
    freshness: 'Good',
    category: 'Fruits'
  },
  {
    id: '3',
    name: 'Fresh Milk 1L',
    barcode: '1234567892',
    count: 8,
    expiry: '2024-12-08',
    price: 60,
    discountedPrice: 45,
    status: 'danger',
    freshness: 'Expires Soon',
    category: 'Dairy'
  },
  {
    id: '4',
    name: 'Whole Wheat Bread',
    barcode: '1234567893',
    count: 25,
    expiry: '2024-12-12',
    price: 45,
    status: 'safe',
    freshness: 'Fresh',
    category: 'Bakery'
  },
  {
    id: '5',
    name: 'Chicken Breast 1kg',
    barcode: '1234567894',
    count: 12,
    expiry: '2024-12-09',
    price: 350,
    discountedPrice: 300,
    status: 'warning',
    freshness: 'Good',
    category: 'Meat'
  },
  {
    id: '6',
    name: 'Tomatoes 1kg',
    barcode: '1234567895',
    count: 30,
    expiry: '2024-12-14',
    price: 80,
    status: 'safe',
    freshness: 'Fresh',
    category: 'Vegetables'
  },
  {
    id: '7',
    name: 'Coca Cola 500ml',
    barcode: '1234567896',
    count: 45,
    expiry: '2025-06-15',
    price: 35,
    status: 'safe',
    freshness: 'Good',
    category: 'Beverages'
  },
  {
    id: '8',
    name: 'Yogurt Cups 4pk',
    barcode: '1234567897',
    count: 18,
    expiry: '2024-12-11',
    price: 120,
    discountedPrice: 100,
    status: 'warning',
    freshness: 'Good',
    category: 'Dairy'
  },
  {
    id: '9',
    name: 'Potato Chips',
    barcode: '1234567898',
    count: 60,
    expiry: '2025-03-20',
    price: 25,
    status: 'safe',
    freshness: 'Fresh',
    category: 'Snacks'
  },
  {
    id: '10',
    name: 'Orange Juice 1L',
    barcode: '1234567899',
    count: 22,
    expiry: '2024-12-16',
    price: 85,
    status: 'safe',
    freshness: 'Fresh',
    category: 'Beverages'
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
    id: 'box-1',
    name: 'Fresh Fruits Mix Box',
    boxCode: 'FFM-001',
    totalUnits: 8,
    individualItems: [
      { id: 'item-1', name: 'Apple Red', itemCode: 'AR-001', expiry: '2024-12-15', sold: false },
      { id: 'item-2', name: 'Apple Green', itemCode: 'AG-002', expiry: '2024-12-15', sold: true },
      { id: 'item-3', name: 'Banana', itemCode: 'BN-003', expiry: '2024-12-10', sold: false },
      { id: 'item-4', name: 'Orange', itemCode: 'OR-004', expiry: '2024-12-18', sold: false },
      { id: 'item-5', name: 'Grapes', itemCode: 'GR-005', expiry: '2024-12-12', sold: true },
      { id: 'item-6', name: 'Mango', itemCode: 'MG-006', expiry: '2024-12-20', sold: false },
      { id: 'item-7', name: 'Pineapple', itemCode: 'PA-007', expiry: '2024-12-25', sold: false },
      { id: 'item-8', name: 'Strawberry', itemCode: 'SB-008', expiry: '2024-12-08', sold: true }
    ]
  },
  {
    id: 'box-2',
    name: 'Dairy Products Box',
    boxCode: 'DPB-002',
    totalUnits: 5,
    individualItems: [
      { id: 'item-9', name: 'Milk 1L', itemCode: 'ML-009', expiry: '2024-12-08', sold: false },
      { id: 'item-10', name: 'Yogurt', itemCode: 'YG-010', expiry: '2024-12-11', sold: true },
      { id: 'item-11', name: 'Cheese', itemCode: 'CH-011', expiry: '2024-12-20', sold: false },
      { id: 'item-12', name: 'Butter', itemCode: 'BT-012', expiry: '2024-12-15', sold: false },
      { id: 'item-13', name: 'Cream', itemCode: 'CR-013', expiry: '2024-12-10', sold: true }
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

function sendResponse(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

function handleRequest(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  // Parse request body for POST requests
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', () => {
    let requestData = {};
    if (body) {
      try {
        requestData = JSON.parse(body);
      } catch (e) {
        // Invalid JSON
      }
    }

    // Route handling
    if (path === '/api/auth/login' && method === 'POST') {
      const { username } = requestData;
      sendResponse(res, 200, {
        success: true,
        token: 'mock-jwt-token',
        user: {
          id: '1',
          username: username || 'demo',
          role: 'admin',
          isActive: true,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        }
      });
    } else if (path === '/api/auth/register' && method === 'POST') {
      const { username, role } = requestData;
      sendResponse(res, 200, {
        success: true,
        token: 'mock-jwt-token',
        user: {
          id: '2',
          username: username || 'demo',
          role: role || 'staff',
          isActive: true,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        }
      });
    } else if (path === '/api/products' && method === 'GET') {
      sendResponse(res, 200, { success: true, data: mockProducts });
    } else if (path === '/api/products' && method === 'POST') {
      const newProduct = {
        id: Date.now().toString(),
        ...requestData,
        status: 'safe',
        freshness: 'Fresh'
      };
      mockProducts.push(newProduct);
      sendResponse(res, 201, { success: true, data: newProduct });
    } else if (path.startsWith('/api/products/barcode/') && method === 'GET') {
      const barcode = path.split('/').pop();
      const product = mockProducts.find(p => p.barcode === barcode);
      if (product) {
        sendResponse(res, 200, { success: true, data: product });
      } else {
        sendResponse(res, 404, { success: false, error: 'Product not found' });
      }
    } else if (path === '/api/products/search' && method === 'GET') {
      const query = parsedUrl.query.query?.toLowerCase() || '';
      const filtered = mockProducts.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.category.toLowerCase().includes(query)
      );
      sendResponse(res, 200, { success: true, data: filtered });
    } else if (path === '/api/products/expiring' && method === 'GET') {
      const expiring = mockProducts.filter(p => p.status === 'danger' || p.status === 'warning');
      sendResponse(res, 200, { success: true, data: expiring });
    } else if (path === '/api/products/low-stock' && method === 'GET') {
      const lowStock = mockProducts.filter(p => p.count < 20);
      sendResponse(res, 200, { success: true, data: lowStock });
    } else if (path === '/api/categories' && method === 'GET') {
      sendResponse(res, 200, { success: true, data: mockCategories });
    } else if (path === '/api/categories/stats' && method === 'GET') {
      sendResponse(res, 200, { 
        success: true, 
        data: {
          totalCategories: mockCategories.length,
          totalProducts: mockCategories.reduce((sum, cat) => sum + cat.totalItems, 0),
          expiringProducts: mockCategories.reduce((sum, cat) => sum + cat.expiringItems, 0)
        }
      });
    } else if (path === '/api/wholesale' && method === 'GET') {
      sendResponse(res, 200, { success: true, data: mockWholesaleBoxes });
    } else if (path === '/api/wholesale/stats' && method === 'GET') {
      sendResponse(res, 200, { 
        success: true, 
        data: {
          totalBoxes: mockWholesaleBoxes.length,
          totalItems: mockWholesaleBoxes.reduce((sum, box) => sum + box.totalUnits, 0)
        }
      });
    } else if (path === '/api/suppliers' && method === 'GET') {
      sendResponse(res, 200, { success: true, data: mockSuppliers });
    } else if (path === '/api/suppliers/stats' && method === 'GET') {
      sendResponse(res, 200, { 
        success: true, 
        data: {
          totalSuppliers: mockSuppliers.length,
          averageRating: mockSuppliers.reduce((sum, s) => sum + s.rating, 0) / mockSuppliers.length
        }
      });
    } else if (path === '/api/suppliers/top-rated' && method === 'GET') {
      const topRated = mockSuppliers.filter(s => s.rating >= 4.0);
      sendResponse(res, 200, { success: true, data: topRated });
    } else if (path === '/api/sales' && method === 'GET') {
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
      sendResponse(res, 200, { success: true, data: mockSales });
    } else if (path === '/api/sales' && method === 'POST') {
      const newSale = {
        id: `sale-${Date.now()}`,
        ...requestData,
        timestamp: new Date().toISOString()
      };
      sendResponse(res, 201, { success: true, data: newSale });
    } else if (path === '/api/sales/today' && method === 'GET') {
      sendResponse(res, 200, { 
        success: true, 
        data: { total: 15000, profit: 3500 }
      });
    } else if (path === '/api/sales/analytics' && method === 'GET') {
      sendResponse(res, 200, { 
        success: true, 
        data: {
          dailySales: 15000,
          monthlySales: 450000,
          topProducts: ['Apples', 'Bananas', 'Milk'],
          averageTransaction: 75
        }
      });
    } else if (path === '/api/sensors' && method === 'GET') {
      sendResponse(res, 200, { success: true, data: mockSensors });
    } else if (path === '/api/sensors/stats' && method === 'GET') {
      sendResponse(res, 200, { 
        success: true, 
        data: {
          totalSensors: mockSensors.length,
          onlineSensors: mockSensors.filter(s => s.status === 'online').length,
          offlineSensors: mockSensors.filter(s => s.status === 'offline').length,
          averageTemperature: 4.2,
          averageHumidity: 65
        }
      });
    } else if (path === '/api/sensors/online' && method === 'GET') {
      const online = mockSensors.filter(s => s.status === 'online');
      sendResponse(res, 200, { success: true, data: online });
    } else if (path === '/api/sensors/offline' && method === 'GET') {
      const offlineSensors = []; // No offline sensors for now
      sendResponse(res, 200, { success: true, data: offlineSensors });
    } else if (path === '/api/alerts' && method === 'GET') {
      sendResponse(res, 200, { success: true, data: mockAlerts });
    } else if (path === '/api/alerts/unread' && method === 'GET') {
      const unread = mockAlerts.filter(a => !a.isRead);
      sendResponse(res, 200, { success: true, data: unread });
    } else if (path === '/api/alerts/stats' && method === 'GET') {
      sendResponse(res, 200, { 
        success: true, 
        data: {
          totalAlerts: mockAlerts.length,
          unreadAlerts: mockAlerts.filter(a => !a.isRead).length,
          criticalAlerts: mockAlerts.filter(a => a.severity === 'critical').length
        }
      });
    } else if (path === '/api/products/expiring' && method === 'GET') {
      const expiringProducts = mockProducts.filter(p => 
        p.status === 'warning' || p.status === 'danger'
      );
      sendResponse(res, 200, { success: true, data: expiringProducts });
    } else if (path === '/api/products/low-stock' && method === 'GET') {
      const lowStockProducts = mockProducts.filter(p => p.count < 20);
      sendResponse(res, 200, { success: true, data: lowStockProducts });
    } else if (path === '/api/ml/models' && method === 'GET') {
      sendResponse(res, 200, { success: true, data: [] });
    } else if (path === '/api/voice/search' && method === 'POST') {
      const { query } = requestData;
      const filtered = mockProducts.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase())
      );
      sendResponse(res, 200, { success: true, data: filtered });
    } else if (path === '/api/wholesale-boxes' && method === 'GET') {
      sendResponse(res, 200, { success: true, data: mockWholesaleBoxes });
    } else if (path === '/health' && method === 'GET') {
      sendResponse(res, 200, {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    } else if (path === '/' && method === 'GET') {
      sendResponse(res, 200, {
        message: 'ShelfSense Mock API Server',
        version: '1.0.0',
        status: 'running'
      });
    } else {
      sendResponse(res, 404, { success: false, error: 'Endpoint not found' });
    }
  });
}

const server = http.createServer(handleRequest);

server.listen(PORT, () => {
  console.log(`🚀 Mock API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Login endpoint: POST http://localhost:${PORT}/api/auth/login`);
  console.log(`📦 Products endpoint: GET http://localhost:${PORT}/api/products`);
});
