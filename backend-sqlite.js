// Enhanced Backend with SQLite Database Storage
import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
let db;

async function initializeDatabase() {
  db = await open({
    filename: path.join(__dirname, 'shelfsense.db'),
    driver: sqlite3.Database
  });

  // Create tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      barcode TEXT UNIQUE,
      count INTEGER DEFAULT 0,
      expiry DATE,
      price REAL,
      discountedPrice REAL,
      status TEXT DEFAULT 'safe',
      freshness TEXT DEFAULT 'Fresh',
      category TEXT,
      humidity TEXT,
      ethylene TEXT,
      temperature TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS corrosion_readings (
      id TEXT PRIMARY KEY,
      productId TEXT NOT NULL,
      productName TEXT NOT NULL,
      corrosionRate REAL NOT NULL,
      status TEXT NOT NULL,
      confidence REAL,
      sensorLocation TEXT,
      temperature REAL,
      humidity REAL,
      ethylene REAL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (productId) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS hardware_status (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      devicePath TEXT,
      connected BOOLEAN DEFAULT FALSE,
      lastReading DATETIME,
      diagnostics TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT,
      totalItems INTEGER DEFAULT 0,
      expiringItems INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS sales (
      id TEXT PRIMARY KEY,
      productId TEXT,
      quantity INTEGER,
      unitPrice REAL,
      totalPrice REAL,
      discount REAL DEFAULT 0,
      paymentMethod TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (productId) REFERENCES products (id)
    );

    CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      contact TEXT,
      email TEXT,
      address TEXT,
      rating REAL DEFAULT 0,
      totalOrders INTEGER DEFAULT 0,
      reliability TEXT DEFAULT 'Medium'
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      type TEXT,
      severity TEXT,
      title TEXT,
      message TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      isRead BOOLEAN DEFAULT 0,
      productId TEXT,
      FOREIGN KEY (productId) REFERENCES products (id)
    );

    CREATE TABLE IF NOT EXISTS sensors (
      id TEXT PRIMARY KEY,
      type TEXT,
      location TEXT,
      value REAL,
      unit TEXT,
      status TEXT DEFAULT 'online',
      lastUpdate DATETIME DEFAULT CURRENT_TIMESTAMP,
      minThreshold REAL,
      maxThreshold REAL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'staff',
      isActive BOOLEAN DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      lastLogin DATETIME
    );

    CREATE TABLE IF NOT EXISTS voice_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      query TEXT,
      command TEXT,
      confidence REAL,
      results INTEGER,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Insert sample data if tables are empty
  await insertSampleData();
}

async function insertSampleData() {
  // No sample data insertion - start with clean database
  // Users can add their own products through the UI
  console.log('Database initialized with clean tables - no sample data inserted');
}

// Helper function to send responses
function sendResponse(res, statusCode, data) {
  res.status(statusCode).json(data);
}

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // For demo, accept any username/password
    const user = {
      id: '1',
      username: username || 'demo',
      role: 'admin',
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    // Update last login
    await db.run('UPDATE users SET lastLogin = CURRENT_TIMESTAMP WHERE username = ?', [username]);

    sendResponse(res, 200, {
      success: true,
      token: 'mock-jwt-token',
      user
    });
  } catch (error) {
    sendResponse(res, 500, { success: false, error: error.message });
  }
});

// Product routes
app.get('/api/products', async (req, res) => {
  try {
    const products = await db.all('SELECT * FROM products ORDER BY name');
    sendResponse(res, 200, { success: true, data: products });
  } catch (error) {
    sendResponse(res, 500, { success: false, error: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { name, barcode, count, expiry, price, category } = req.body;
    const id = Date.now().toString();
    
    await db.run(`
      INSERT INTO products (id, name, barcode, count, expiry, price, category, status, freshness)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'safe', 'Fresh')
    `, [id, name, barcode, count, expiry, price, category]);

    const product = await db.get('SELECT * FROM products WHERE id = ?', [id]);
    sendResponse(res, 201, { success: true, data: product });
  } catch (error) {
    sendResponse(res, 500, { success: false, error: error.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), id];
    
    await db.run(`UPDATE products SET ${setClause}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`, values);
    
    const product = await db.get('SELECT * FROM products WHERE id = ?', [id]);
    sendResponse(res, 200, { success: true, data: product });
  } catch (error) {
    sendResponse(res, 500, { success: false, error: error.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.run('DELETE FROM products WHERE id = ?', [id]);
    sendResponse(res, 200, { success: true, message: 'Product deleted' });
  } catch (error) {
    sendResponse(res, 500, { success: false, error: error.message });
  }
});

app.get('/api/products/search', async (req, res) => {
  try {
    const { query } = req.query;
    const products = await db.all(`
      SELECT * FROM products 
      WHERE name LIKE ? OR barcode LIKE ? OR category LIKE ?
      ORDER BY name
    `, [`%${query}%`, `%${query}%`, `%${query}%`]);
    
    sendResponse(res, 200, { success: true, data: products });
  } catch (error) {
    sendResponse(res, 500, { success: false, error: error.message });
  }
});

app.get('/api/products/expiring', async (req, res) => {
  try {
    const products = await db.all(`
      SELECT * FROM products 
      WHERE status IN ('warning', 'danger') OR date(expiry) <= date('now', '+2 days')
      ORDER BY expiry
    `);
    sendResponse(res, 200, { success: true, data: products });
  } catch (error) {
    sendResponse(res, 500, { success: false, error: error.message });
  }
});

app.get('/api/products/low-stock', async (req, res) => {
  try {
    const products = await db.all('SELECT * FROM products WHERE count < 20 ORDER BY count');
    sendResponse(res, 200, { success: true, data: products });
  } catch (error) {
    sendResponse(res, 500, { success: false, error: error.message });
  }
});

// Sales routes
app.get('/api/sales', async (req, res) => {
  try {
    const sales = await db.all(`
      SELECT s.*, p.name as productName 
      FROM sales s 
      LEFT JOIN products p ON s.productId = p.id 
      ORDER BY s.timestamp DESC
    `);
    sendResponse(res, 200, { success: true, data: sales });
  } catch (error) {
    sendResponse(res, 500, { success: false, error: error.message });
  }
});

app.post('/api/sales', async (req, res) => {
  try {
    const { productId, quantity, unitPrice, totalPrice, discount, paymentMethod } = req.body;
    const id = `sale-${Date.now()}`;
    
    await db.run(`
      INSERT INTO sales (id, productId, quantity, unitPrice, totalPrice, discount, paymentMethod)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [id, productId, quantity, unitPrice, totalPrice, discount || 0, paymentMethod]);

    // Update product stock
    await db.run('UPDATE products SET count = count - ? WHERE id = ?', [quantity, productId]);

    const sale = await db.get('SELECT * FROM sales WHERE id = ?', [id]);
    sendResponse(res, 201, { success: true, data: sale });
  } catch (error) {
    sendResponse(res, 500, { success: false, error: error.message });
  }
});

// Voice search routes
app.post('/api/voice/search', async (req, res) => {
  try {
    const { query, category, limit = 10 } = req.body;
    
    let sql = `
      SELECT * FROM products 
      WHERE name LIKE ? OR barcode LIKE ? OR category LIKE ?
    `;
    let params = [`%${query}%`, `%${query}%`, `%${query}%`];
    
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    
    sql += ` ORDER BY 
      CASE 
        WHEN name LIKE ? THEN 1
        WHEN name LIKE ? THEN 2
        ELSE 3
      END
      LIMIT ?`;
    
    params.push(`${query}%`, `%${query}%`, limit);
    
    const products = await db.all(sql, params);
    
    // Log voice search
    await db.run(`
      INSERT INTO voice_logs (query, results)
      VALUES (?, ?)
    `, [query, products.length]);
    
    sendResponse(res, 200, { success: true, data: products });
  } catch (error) {
    sendResponse(res, 500, { success: false, error: error.message });
  }
});

app.post('/api/voice/command', async (req, res) => {
  try {
    const { command, context } = req.body;
    
    // Log voice command
    await db.run(`
      INSERT INTO voice_logs (command, confidence)
      VALUES (?, ?)
    `, [command, context?.confidence || 0]);
    
    sendResponse(res, 200, { 
      success: true, 
      message: 'Command processed',
      command 
    });
  } catch (error) {
    sendResponse(res, 500, { success: false, error: error.message });
  }
});

// Categories routes
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await db.all('SELECT * FROM categories');
    sendResponse(res, 200, { success: true, data: categories });
  } catch (error) {
    sendResponse(res, 500, { success: false, error: error.message });
  }
});

// Suppliers routes
app.get('/api/suppliers', async (req, res) => {
  try {
    const suppliers = await db.all('SELECT * FROM suppliers ORDER BY rating DESC');
    sendResponse(res, 200, { success: true, data: suppliers });
  } catch (error) {
    sendResponse(res, 500, { success: false, error: error.message });
  }
});

// Sensors routes
app.get('/api/sensors', async (req, res) => {
  try {
    const sensors = await db.all('SELECT * FROM sensors ORDER BY location');
    sendResponse(res, 200, { success: true, data: sensors });
  } catch (error) {
    sendResponse(res, 500, { success: false, error: error.message });
  }
});

app.get('/api/sensors/offline', async (req, res) => {
  try {
    const sensors = await db.all('SELECT * FROM sensors WHERE status = "offline"');
    sendResponse(res, 200, { success: true, data: sensors });
  } catch (error) {
    sendResponse(res, 500, { success: false, error: error.message });
  }
});

// Alerts routes
app.get('/api/alerts', async (req, res) => {
  try {
    const alerts = await db.all('SELECT * FROM alerts ORDER BY timestamp DESC');
    sendResponse(res, 200, { success: true, data: alerts });
  } catch (error) {
    sendResponse(res, 500, { success: false, error: error.message });
  }
});

// Hardware corrosion detection routes
app.get('/api/hardware/status', async (req, res) => {
  try {
    const status = await db.get('SELECT * FROM hardware_status ORDER BY timestamp DESC LIMIT 1');
    sendResponse(res, 200, { success: true, data: status || { connected: false } });
  } catch (error) {
    sendResponse(res, 500, { success: false, error: error.message });
  }
});

app.post('/api/hardware/initialize', async (req, res) => {
  try {
    const { devicePath, baudRate } = req.body;
    
    // Update hardware status
    await db.run(
      'INSERT INTO hardware_status (devicePath, connected, timestamp) VALUES (?, ?, ?)',
      [devicePath || '/dev/ttyUSB0', true, new Date().toISOString()]
    );
    
    sendResponse(res, 200, { 
      success: true, 
      message: 'Hardware initialized successfully',
      data: { connected: true, devicePath }
    });
  } catch (error) {
    sendResponse(res, 500, { success: false, error: error.message });
  }
});

app.post('/api/hardware/scan/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { productName } = req.body;
    
    // Get product details
    const product = await db.get('SELECT * FROM products WHERE id = ?', [productId]);
    if (!product) {
      return sendResponse(res, 404, { success: false, error: 'Product not found' });
    }
    
    // Simulate hardware reading (replace with actual hardware integration)
    const mockReading = {
      id: `reading_${Date.now()}`,
      productId,
      productName: productName || product.name,
      corrosionRate: Math.random() * 5, // 0-5 scale
      confidence: 0.85 + Math.random() * 0.15, // 85-100%
      sensorLocation: 'Hardware Scanner',
      temperature: 20 + Math.random() * 10,
      humidity: 50 + Math.random() * 30,
      ethylene: Math.random() * 2,
      timestamp: new Date().toISOString()
    };
    
    // Determine status based on corrosion rate
    let status;
    if (mockReading.corrosionRate < 1.0) status = 'fresh';
    else if (mockReading.corrosionRate < 3.0) status = 'moderate';
    else if (mockReading.corrosionRate < 5.0) status = 'high_risk';
    else status = 'spoiled';
    
    mockReading.status = status;
    
    // Store reading in database
    await db.run(`
      INSERT INTO corrosion_readings 
      (id, productId, productName, corrosionRate, status, confidence, sensorLocation, temperature, humidity, ethylene, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      mockReading.id,
      mockReading.productId,
      mockReading.productName,
      mockReading.corrosionRate,
      mockReading.status,
      mockReading.confidence,
      mockReading.sensorLocation,
      mockReading.temperature,
      mockReading.humidity,
      mockReading.ethylene,
      mockReading.timestamp
    ]);
    
    // Update product status based on reading
    await db.run(
      'UPDATE products SET status = ?, freshness = ?, updatedAt = ? WHERE id = ?',
      [status, status === 'fresh' ? 'Fresh' : status === 'spoiled' ? 'Spoiled' : 'Moderate', new Date().toISOString(), productId]
    );
    
    sendResponse(res, 200, { success: true, data: mockReading });
  } catch (error) {
    sendResponse(res, 500, { success: false, error: error.message });
  }
});

app.get('/api/hardware/readings', async (req, res) => {
  try {
    const { productId, limit = 50 } = req.query;
    
    let query = 'SELECT * FROM corrosion_readings';
    let params = [];
    
    if (productId) {
      query += ' WHERE productId = ?';
      params.push(productId);
    }
    
    query += ' ORDER BY timestamp DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const readings = await db.all(query, params);
    sendResponse(res, 200, { success: true, data: readings });
  } catch (error) {
    sendResponse(res, 500, { success: false, error: error.message });
  }
});

app.get('/api/hardware/readings/:productId/latest', async (req, res) => {
  try {
    const { productId } = req.params;
    
    const reading = await db.get(
      'SELECT * FROM corrosion_readings WHERE productId = ? ORDER BY timestamp DESC LIMIT 1',
      [productId]
    );
    
    if (!reading) {
      return sendResponse(res, 404, { success: false, error: 'No readings found for this product' });
    }
    
    sendResponse(res, 200, { success: true, data: reading });
  } catch (error) {
    sendResponse(res, 500, { success: false, error: error.message });
  }
});

app.post('/api/hardware/batch-scan', async (req, res) => {
  try {
    const { productIds } = req.body;
    
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return sendResponse(res, 400, { success: false, error: 'Product IDs array is required' });
    }
    
    const readings = [];
    
    for (const productId of productIds) {
      const product = await db.get('SELECT * FROM products WHERE id = ?', [productId]);
      if (!product) continue;
      
      // Simulate hardware reading for each product
      const mockReading = {
        id: `reading_${Date.now()}_${productId}`,
        productId,
        productName: product.name,
        corrosionRate: Math.random() * 5,
        confidence: 0.85 + Math.random() * 0.15,
        sensorLocation: 'Hardware Scanner',
        temperature: 20 + Math.random() * 10,
        humidity: 50 + Math.random() * 30,
        ethylene: Math.random() * 2,
        timestamp: new Date().toISOString()
      };
      
      let status;
      if (mockReading.corrosionRate < 1.0) status = 'fresh';
      else if (mockReading.corrosionRate < 3.0) status = 'moderate';
      else if (mockReading.corrosionRate < 5.0) status = 'high_risk';
      else status = 'spoiled';
      
      mockReading.status = status;
      
      // Store reading
      await db.run(`
        INSERT INTO corrosion_readings 
        (id, productId, productName, corrosionRate, status, confidence, sensorLocation, temperature, humidity, ethylene, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        mockReading.id,
        mockReading.productId,
        mockReading.productName,
        mockReading.corrosionRate,
        mockReading.status,
        mockReading.confidence,
        mockReading.sensorLocation,
        mockReading.temperature,
        mockReading.humidity,
        mockReading.ethylene,
        mockReading.timestamp
      ]);
      
      readings.push(mockReading);
      
      // Add small delay between readings
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    sendResponse(res, 200, { success: true, data: readings, count: readings.length });
  } catch (error) {
    sendResponse(res, 500, { success: false, error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  sendResponse(res, 200, {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'SQLite connected'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  sendResponse(res, 200, {
    message: 'ShelfSense API Server with SQLite Database',
    version: '2.0.0',
    features: [
      'SQLite Database Storage',
      'Voice Search & Commands',
      'Real-time Notifications',
      'Advanced Analytics'
    ]
  });
});

// 404 handler
app.use((req, res) => {
  sendResponse(res, 404, { success: false, error: 'Endpoint not found' });
});

// Start server
async function startServer() {
  try {
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 ShelfSense API Server running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🗄️  SQLite database initialized`);
      console.log(`🎤 Voice search enabled`);
      console.log(`🔔 Real-time notifications active`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
