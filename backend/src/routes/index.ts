import { Router, Request, Response } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';

// Import controllers
import { ProductController } from '../controllers/productController';
import { SaleController } from '../controllers/saleController';
import { IoTSensorController } from '../controllers/iotSensorController';
import { AlertController } from '../controllers/alertController';
import { AuthController } from '../controllers/authController';
import { categoryController } from '../controllers/categoryController';
import { wholesaleController } from '../controllers/wholesaleController';
import { supplierController } from '../controllers/supplierController';
import { voiceSearch, processVoiceCommand, getVoiceSuggestions } from '../controllers/voiceController';
// import { mlController } from '../controllers/mlController'; // Temporarily disabled due to TensorFlow.js issues

const router = Router();

// Authentication routes (public)
router.post('/auth/login', AuthController.login);
router.post('/auth/logout', AuthController.logout);
router.post('/auth/register', AuthController.register);
router.get('/auth/profile', authenticateToken, AuthController.getProfile);

// Product routes
router.get('/products', authenticateToken, ProductController.getAllProducts);
router.get('/products/:id', authenticateToken, ProductController.getProductById);
router.get('/products/barcode/:barcode', authenticateToken, ProductController.getProductByBarcode);
router.get('/products/category/:category', authenticateToken, ProductController.getProductsByCategory);
router.post('/products', authenticateToken, requireRole(['admin', 'manager']), ProductController.createProduct);
router.put('/products/:id', authenticateToken, requireRole(['admin', 'manager']), ProductController.updateProduct);
router.delete('/products/:id', authenticateToken, requireRole(['admin']), ProductController.deleteProduct);
router.put('/products/:id/stock', authenticateToken, requireRole(['admin', 'manager', 'staff']), ProductController.updateProductStock);
router.get('/products/expiring', authenticateToken, ProductController.getExpiringProducts);
router.get('/products/low-stock', authenticateToken, ProductController.getLowStockProducts);
router.get('/products/search', authenticateToken, ProductController.searchProducts);
router.get('/products/search/advanced', authenticateToken, ProductController.advancedSearchProducts);
router.post('/products/apply-discounts', authenticateToken, requireRole(['admin', 'manager']), ProductController.applySmartDiscounts);
router.get('/products/discounted', authenticateToken, ProductController.getDiscountedProducts);

// Sale routes
router.get('/sales', authenticateToken, SaleController.getAllSales);
router.get('/sales/:id', authenticateToken, SaleController.getSaleById);
router.get('/sales/product/:productId', authenticateToken, SaleController.getSalesByProduct);
router.get('/sales/date-range', authenticateToken, SaleController.getSalesByDateRange);
router.post('/sales', authenticateToken, requireRole(['admin', 'manager', 'staff']), SaleController.createSale);
router.get('/sales/today', authenticateToken, SaleController.getTodaySales);
router.get('/sales/analytics', authenticateToken, SaleController.getSalesAnalytics);

// IoT Sensor routes
router.get('/sensors', authenticateToken, IoTSensorController.getAllSensors);
router.get('/sensors/:id', authenticateToken, IoTSensorController.getSensorById);
router.get('/sensors/type/:type', authenticateToken, IoTSensorController.getSensorsByType);
router.get('/sensors/location/:location', authenticateToken, IoTSensorController.getSensorsByLocation);
router.put('/sensors/:id/data', authenticateToken, requireRole(['admin', 'manager']), IoTSensorController.updateSensorData);
router.post('/sensors', authenticateToken, requireRole(['admin']), IoTSensorController.createSensor);
router.delete('/sensors/:id', authenticateToken, requireRole(['admin']), IoTSensorController.deleteSensor);
router.get('/sensors/alerts', authenticateToken, IoTSensorController.getSensorsWithAlerts);
router.get('/sensors/online', authenticateToken, IoTSensorController.getOnlineSensors);
router.get('/sensors/offline', authenticateToken, IoTSensorController.getOfflineSensors);
router.get('/sensors/stats', authenticateToken, IoTSensorController.getSensorStats);
router.post('/sensors/simulate', authenticateToken, requireRole(['admin']), IoTSensorController.simulateSensorUpdates);

// Alert routes
router.get('/alerts', authenticateToken, AlertController.getAllAlerts);
router.get('/alerts/:id', authenticateToken, AlertController.getAlertById);
router.get('/alerts/unread', authenticateToken, AlertController.getUnreadAlerts);
router.get('/alerts/type/:type', authenticateToken, AlertController.getAlertsByType);
router.put('/alerts/:id/read', authenticateToken, AlertController.markAlertAsRead);
router.put('/alerts/read-all', authenticateToken, AlertController.markAllAlertsAsRead);
router.delete('/alerts/:id', authenticateToken, requireRole(['admin']), AlertController.deleteAlert);
router.post('/alerts/generate/expiry', authenticateToken, requireRole(['admin', 'manager']), AlertController.generateExpiryAlerts);
router.post('/alerts/generate/stock', authenticateToken, requireRole(['admin', 'manager']), AlertController.generateStockAlerts);
router.post('/alerts/generate/sensor', authenticateToken, requireRole(['admin', 'manager']), AlertController.generateSensorAlerts);
router.get('/alerts/stats', authenticateToken, AlertController.getAlertStats);

// Category routes
router.get('/categories', authenticateToken, categoryController.getAllCategories);
router.get('/categories/:id', authenticateToken, categoryController.getCategoryById);
router.post('/categories', authenticateToken, requireRole(['admin', 'manager']), categoryController.createCategory);
router.put('/categories/:id', authenticateToken, requireRole(['admin', 'manager']), categoryController.updateCategory);
router.delete('/categories/:id', authenticateToken, requireRole(['admin']), categoryController.deleteCategory);
router.get('/categories/stats', authenticateToken, categoryController.getCategoryStats);

// Wholesale routes
router.get('/wholesale', authenticateToken, wholesaleController.getAllWholesaleBoxes);
router.get('/wholesale/:id', authenticateToken, wholesaleController.getWholesaleBoxById);
router.post('/wholesale', authenticateToken, requireRole(['admin', 'manager']), wholesaleController.createWholesaleBox);
router.put('/wholesale/:id', authenticateToken, requireRole(['admin', 'manager']), wholesaleController.updateWholesaleBox);
router.delete('/wholesale/:id', authenticateToken, requireRole(['admin']), wholesaleController.deleteWholesaleBox);
router.put('/wholesale/:boxId/sell/:itemId', authenticateToken, requireRole(['admin', 'manager', 'staff']), wholesaleController.sellItem);
router.get('/wholesale/stats', authenticateToken, wholesaleController.getWholesaleStats);

// Supplier routes
router.get('/suppliers', authenticateToken, supplierController.getAllSuppliers);
router.get('/suppliers/:id', authenticateToken, supplierController.getSupplierById);
router.post('/suppliers', authenticateToken, requireRole(['admin', 'manager']), supplierController.createSupplier);
router.put('/suppliers/:id', authenticateToken, requireRole(['admin', 'manager']), supplierController.updateSupplier);
router.delete('/suppliers/:id', authenticateToken, requireRole(['admin']), supplierController.deleteSupplier);
router.get('/suppliers/reliability/:reliability', authenticateToken, supplierController.getSuppliersByReliability);
router.get('/suppliers/top-rated', authenticateToken, supplierController.getTopRatedSuppliers);
router.get('/suppliers/stats', authenticateToken, supplierController.getSupplierStats);

// User management routes (admin only)
router.get('/users', authenticateToken, requireRole(['admin']), AuthController.getAllUsers);

// Voice search and command routes
router.post('/voice/search', authenticateToken, voiceSearch);
router.post('/voice/command', authenticateToken, processVoiceCommand);
router.get('/voice/suggestions', authenticateToken, getVoiceSuggestions);

// ML/AI routes (temporarily disabled due to TensorFlow.js issues)
// router.post('/ml/dataset', authenticateToken, requireRole(['admin', 'manager']), mlController.generateDataset);
// router.post('/ml/train', authenticateToken, requireRole(['admin', 'manager']), mlController.trainModel);
// router.post('/ml/predict', authenticateToken, requireRole(['admin', 'manager']), mlController.makePrediction);
// router.get('/ml/demand-forecast/:productId', authenticateToken, requireRole(['admin', 'manager']), mlController.getDemandForecast);
// router.get('/ml/price-optimization/:productId', authenticateToken, requireRole(['admin', 'manager']), mlController.getPriceOptimization);
// router.get('/ml/inventory-recommendation/:productId', authenticateToken, requireRole(['admin', 'manager']), mlController.getInventoryRecommendation);
// router.get('/ml/quality-prediction/:productId', authenticateToken, requireRole(['admin', 'manager']), mlController.getQualityPrediction);
// router.get('/ml/models', authenticateToken, requireRole(['admin', 'manager']), mlController.getModels);
// router.get('/ml/models/:modelId/metrics', authenticateToken, requireRole(['admin', 'manager']), mlController.getModelMetrics);
// router.post('/ml/cleanup', authenticateToken, requireRole(['admin']), mlController.cleanup);

export default router;
