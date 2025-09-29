// Clean ShelfSense API Server - No Mock Data
import http from 'http';
import url from 'url';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 5000;
const DATA_FILE = path.join(__dirname, 'shelfsense-data.json');

// Initialize empty data structure
let appData = {
  products: [],
  categories: [],
  wholesaleBoxes: [],
  suppliers: [],
  sales: [],
  alerts: [],
  sensors: [],
  users: [
    {
      id: '1',
      username: 'admin',
      password: 'password', // In production, this should be hashed
      role: 'admin',
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLogin: null
    }
  ],
  settings: {
    currency: '₹',
    lowStockThreshold: 10,
    expiryWarningDays: 3
  }
};

// Load data from file if it exists
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      appData = { ...appData, ...JSON.parse(data) };
      console.log('📂 Data loaded from file');
    } else {
      console.log('📂 Starting with empty data');
    }
  } catch (error) {
    console.error('❌ Error loading data:', error.message);
  }
}

// Save data to file
function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(appData, null, 2));
    console.log('💾 Data saved to file');
  } catch (error) {
    console.error('❌ Error saving data:', error.message);
  }
}

// Generate unique ID
function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// Calculate product status based on expiry date
function calculateProductStatus(expiryDate, warningDays = 3) {
  if (!expiryDate) return 'safe';
  
  const expiry = new Date(expiryDate);
  const today = new Date();
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'expired';
  if (diffDays <= 1) return 'danger';
  if (diffDays <= warningDays) return 'warning';
  return 'safe';
}

// Update category statistics
function updateCategoryStats() {
  appData.categories.forEach(category => {
    const categoryProducts = appData.products.filter(p => p.category === category.name);
    category.totalItems = categoryProducts.length;
    category.expiringItems = categoryProducts.filter(p => 
      p.status === 'warning' || p.status === 'danger' || p.status === 'expired'
    ).length;
  });
}

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

  // Parse request body
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
        sendResponse(res, 400, { success: false, error: 'Invalid JSON' });
        return;
      }
    }

    // Route handling
    try {
      if (path === '/api/auth/login' && method === 'POST') {
        const { username, password } = requestData;
        const user = appData.users.find(u => u.username === username && u.password === password);
        
        if (user) {
          user.lastLogin = new Date().toISOString();
          saveData();
          sendResponse(res, 200, {
            success: true,
            token: 'jwt-token-' + user.id,
            user: {
              id: user.id,
              username: user.username,
              role: user.role,
              isActive: user.isActive,
              createdAt: user.createdAt,
              lastLogin: user.lastLogin
            }
          });
        } else {
          sendResponse(res, 401, { success: false, error: 'Invalid credentials' });
        }

      } else if (path === '/api/auth/register' && method === 'POST') {
        const { username, password, role = 'staff' } = requestData;
        
        if (appData.users.find(u => u.username === username)) {
          sendResponse(res, 409, { success: false, error: 'Username already exists' });
          return;
        }

        const newUser = {
          id: generateId(),
          username,
          password, // In production, hash this
          role,
          isActive: true,
          createdAt: new Date().toISOString(),
          lastLogin: null
        };

        appData.users.push(newUser);
        saveData();

        sendResponse(res, 201, {
          success: true,
          token: 'jwt-token-' + newUser.id,
          user: {
            id: newUser.id,
            username: newUser.username,
            role: newUser.role,
            isActive: newUser.isActive,
            createdAt: newUser.createdAt,
            lastLogin: newUser.lastLogin
          }
        });

      } else if (path === '/api/products' && method === 'GET') {
        // Update product statuses before sending
        appData.products.forEach(product => {
          product.status = calculateProductStatus(product.expiry, appData.settings.expiryWarningDays);
        });
        updateCategoryStats();
        saveData();
        sendResponse(res, 200, { success: true, data: appData.products });

      } else if (path === '/api/products' && method === 'POST') {
        const { name, barcode, count, expiry, price, discountedPrice, category, description } = requestData;
        
        if (!name || !barcode) {
          sendResponse(res, 400, { success: false, error: 'Name and barcode are required' });
          return;
        }

        // Check if barcode already exists
        if (appData.products.find(p => p.barcode === barcode)) {
          sendResponse(res, 409, { success: false, error: 'Barcode already exists' });
          return;
        }

        const newProduct = {
          id: generateId(),
          name,
          barcode,
          count: parseInt(count) || 0,
          expiry,
          price: parseFloat(price) || 0,
          discountedPrice: discountedPrice ? parseFloat(discountedPrice) : null,
          category: category || 'Uncategorized',
          description: description || '',
          status: calculateProductStatus(expiry, appData.settings.expiryWarningDays),
          freshness: 'Fresh',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        appData.products.push(newProduct);
        
        // Add category if it doesn't exist
        if (!appData.categories.find(c => c.name === newProduct.category)) {
          appData.categories.push({
            id: generateId(),
            name: newProduct.category,
            icon: '📦',
            totalItems: 0,
            expiringItems: 0
          });
        }

        updateCategoryStats();
        saveData();
        sendResponse(res, 201, { success: true, data: newProduct });

      } else if (path.startsWith('/api/products/') && method === 'PUT') {
        const productId = path.split('/').pop();
        const productIndex = appData.products.findIndex(p => p.id === productId);
        
        if (productIndex === -1) {
          sendResponse(res, 404, { success: false, error: 'Product not found' });
          return;
        }

        const updatedProduct = {
          ...appData.products[productIndex],
          ...requestData,
          updatedAt: new Date().toISOString()
        };
        
        updatedProduct.status = calculateProductStatus(updatedProduct.expiry, appData.settings.expiryWarningDays);
        appData.products[productIndex] = updatedProduct;
        
        updateCategoryStats();
        saveData();
        sendResponse(res, 200, { success: true, data: updatedProduct });

      } else if (path.startsWith('/api/products/') && method === 'DELETE') {
        const productId = path.split('/').pop();
        const productIndex = appData.products.findIndex(p => p.id === productId);
        
        if (productIndex === -1) {
          sendResponse(res, 404, { success: false, error: 'Product not found' });
          return;
        }

        appData.products.splice(productIndex, 1);
        updateCategoryStats();
        saveData();
        sendResponse(res, 200, { success: true, message: 'Product deleted' });

      } else if (path.startsWith('/api/products/barcode/') && method === 'GET') {
        const barcode = path.split('/').pop();
        const product = appData.products.find(p => p.barcode === barcode);
        
        if (product) {
          product.status = calculateProductStatus(product.expiry, appData.settings.expiryWarningDays);
          sendResponse(res, 200, { success: true, data: product });
        } else {
          sendResponse(res, 404, { success: false, error: 'Product not found' });
        }

      } else if (path === '/api/products/search' && method === 'GET') {
        const query = parsedUrl.query.query?.toLowerCase() || '';
        const filtered = appData.products.filter(p => 
          p.name.toLowerCase().includes(query) || 
          p.category.toLowerCase().includes(query) ||
          p.barcode.toLowerCase().includes(query)
        );
        sendResponse(res, 200, { success: true, data: filtered });

      } else if (path === '/api/products/expiring' && method === 'GET') {
        const expiring = appData.products.filter(p => 
          p.status === 'danger' || p.status === 'warning' || p.status === 'expired'
        );
        sendResponse(res, 200, { success: true, data: expiring });

      } else if (path === '/api/products/low-stock' && method === 'GET') {
        const lowStock = appData.products.filter(p => p.count <= appData.settings.lowStockThreshold);
        sendResponse(res, 200, { success: true, data: lowStock });

      } else if (path === '/api/categories' && method === 'GET') {
        updateCategoryStats();
        sendResponse(res, 200, { success: true, data: appData.categories });

      } else if (path === '/api/categories' && method === 'POST') {
        const { name, icon } = requestData;
        
        if (!name) {
          sendResponse(res, 400, { success: false, error: 'Category name is required' });
          return;
        }

        if (appData.categories.find(c => c.name === name)) {
          sendResponse(res, 409, { success: false, error: 'Category already exists' });
          return;
        }

        const newCategory = {
          id: generateId(),
          name,
          icon: icon || '📦',
          totalItems: 0,
          expiringItems: 0
        };

        appData.categories.push(newCategory);
        saveData();
        sendResponse(res, 201, { success: true, data: newCategory });

      } else if (path === '/api/categories/stats' && method === 'GET') {
        updateCategoryStats();
        const stats = {
          totalCategories: appData.categories.length,
          totalProducts: appData.products.length,
          expiringProducts: appData.products.filter(p => 
            p.status === 'warning' || p.status === 'danger' || p.status === 'expired'
          ).length,
          lowStockProducts: appData.products.filter(p => p.count <= appData.settings.lowStockThreshold).length
        };
        sendResponse(res, 200, { success: true, data: stats });

      } else if (path === '/api/dashboard/stats' && method === 'GET') {
        const totalValue = appData.products.reduce((sum, p) => sum + (p.price * p.count), 0);
        const expiringCount = appData.products.filter(p => 
          p.status === 'warning' || p.status === 'danger' || p.status === 'expired'
        ).length;
        const lowStockCount = appData.products.filter(p => p.count <= appData.settings.lowStockThreshold).length;

        const stats = {
          totalProducts: appData.products.length,
          totalValue: totalValue,
          expiringProducts: expiringCount,
          lowStockProducts: lowStockCount,
          totalCategories: appData.categories.length,
          totalSales: appData.sales.length
        };
        sendResponse(res, 200, { success: true, data: stats });

      } else if (path === '/api/sales' && method === 'POST') {
        const { productId, quantity, unitPrice, paymentMethod } = requestData;
        
        const product = appData.products.find(p => p.id === productId);
        if (!product) {
          sendResponse(res, 404, { success: false, error: 'Product not found' });
          return;
        }

        if (product.count < quantity) {
          sendResponse(res, 400, { success: false, error: 'Insufficient stock' });
          return;
        }

        const totalPrice = quantity * unitPrice;
        const newSale = {
          id: generateId(),
          productId,
          productName: product.name,
          quantity: parseInt(quantity),
          unitPrice: parseFloat(unitPrice),
          totalPrice,
          paymentMethod: paymentMethod || 'cash',
          timestamp: new Date().toISOString()
        };

        // Update product stock
        product.count -= quantity;
        product.updatedAt = new Date().toISOString();

        appData.sales.push(newSale);
        saveData();
        sendResponse(res, 201, { success: true, data: newSale });

      } else if (path === '/api/sales' && method === 'GET') {
        sendResponse(res, 200, { success: true, data: appData.sales });

      } else if (path === '/api/sales/today' && method === 'GET') {
        const today = new Date().toISOString().split('T')[0];
        const todaySales = appData.sales.filter(s => s.timestamp.startsWith(today));
        const total = todaySales.reduce((sum, s) => sum + s.totalPrice, 0);
        sendResponse(res, 200, { success: true, data: { total, count: todaySales.length } });

      } else if (path === '/api/data/export' && method === 'GET') {
        sendResponse(res, 200, { success: true, data: appData });

      } else if (path === '/api/data/import' && method === 'POST') {
        try {
          appData = { ...appData, ...requestData };
          saveData();
          sendResponse(res, 200, { success: true, message: 'Data imported successfully' });
        } catch (error) {
          sendResponse(res, 400, { success: false, error: 'Invalid data format' });
        }

      } else if (path === '/api/data/reset' && method === 'POST') {
        appData.products = [];
        appData.categories = [];
        appData.sales = [];
        appData.alerts = [];
        saveData();
        sendResponse(res, 200, { success: true, message: 'All data cleared' });

      } else if (path === '/health' && method === 'GET') {
        sendResponse(res, 200, {
          status: 'OK',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          dataStats: {
            products: appData.products.length,
            categories: appData.categories.length,
            sales: appData.sales.length
          }
        });

      } else if (path === '/' && method === 'GET') {
        sendResponse(res, 200, {
          message: 'ShelfSense Clean API Server',
          version: '2.0.0',
          status: 'running',
          endpoints: [
            'POST /api/auth/login',
            'POST /api/auth/register',
            'GET /api/products',
            'POST /api/products',
            'PUT /api/products/:id',
            'DELETE /api/products/:id',
            'GET /api/categories',
            'POST /api/categories',
            'GET /api/dashboard/stats',
            'POST /api/sales',
            'GET /api/data/export',
            'POST /api/data/import',
            'POST /api/data/reset'
          ]
        });

      } else {
        sendResponse(res, 404, { success: false, error: 'Endpoint not found' });
      }

    } catch (error) {
      console.error('❌ Server error:', error);
      sendResponse(res, 500, { success: false, error: 'Internal server error' });
    }
  });
}

// Initialize
loadData();

const server = http.createServer(handleRequest);

server.listen(PORT, () => {
  console.log(`🚀 ShelfSense Clean API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📂 Data file: ${DATA_FILE}`);
  console.log(`🔐 Default login: admin/password`);
  console.log(`📦 Products: ${appData.products.length}`);
  console.log(`📋 Categories: ${appData.categories.length}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  saveData();
  process.exit(0);
});
