// User types
export interface User {
  id: string;
  username: string;
  role: 'admin' | 'manager' | 'staff';
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

// Product types
export interface Product {
  id: string;
  name: string;
  barcode: string;
  count: number;
  expiry: string;
  price: number;
  discountedPrice?: number;
  status: 'safe' | 'warning' | 'danger';
  freshness: string;
  category: string;
  humidity?: string;
  ethylene?: string;
  temperature?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductRequest {
  name: string;
  barcode: string;
  count: number;
  expiry: string;
  price: number;
  discountedPrice?: number;
  category: string;
  humidity?: string;
  ethylene?: string;
  temperature?: string;
}

export interface UpdateProductRequest {
  name?: string;
  count?: number;
  price?: number;
  discountedPrice?: number;
  status?: 'safe' | 'warning' | 'danger';
  freshness?: string;
  humidity?: string;
  ethylene?: string;
  temperature?: string;
  expiry?: string;
}

// Wholesale types
export interface WholesaleBox {
  id: string;
  name: string;
  boxCode: string;
  totalUnits: number;
  expiry: Date;
  individualItems: IndividualItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IndividualItem {
  id: string;
  name: string;
  itemCode: string;
  expiry: Date;
  sold?: boolean;
}

export interface CreateWholesaleBoxRequest {
  name: string;
  boxCode: string;
  totalUnits: number;
  expiry: string;
  individualItems: Omit<IndividualItem, 'id' | 'expiry'>[];
}

// Category types
export interface Category {
  id: string;
  name: string;
  icon: string;
  totalItems: number;
  expiringItems: number;
}

export interface CreateCategoryRequest {
  name: string;
  icon: string;
  totalItems?: number;
  expiringItems?: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  icon?: string;
}

// Financial types
export interface FinancialData {
  todayProfit: number;
  wastagePrevented: number;
  itemsAtRisk: number;
  profitChange: string;
  date: string;
}

// Supplier types
export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  address: string;
  rating: number;
  totalOrders: number;
  reliability: 'High' | 'Medium' | 'Low';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSupplierRequest {
  name: string;
  contact: string;
  email: string;
  address: string;
  rating?: number;
}

export interface UpdateSupplierRequest {
  name?: string;
  contact?: string;
  email?: string;
  address?: string;
  rating?: number;
}

// Purchase Order types
export interface PurchaseOrder {
  id: string;
  supplierId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'approved' | 'delivered' | 'cancelled';
  orderDate: Date;
  expectedDelivery: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CreatePurchaseOrderRequest {
  supplierId: string;
  items: OrderItem[];
  expectedDelivery: string;
}

// Sale types
export interface Sale {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discount: number;
  timestamp: Date;
  paymentMethod: 'cash' | 'card' | 'upi';
  createdAt: Date;
}

export interface CreateSaleRequest {
  productId: string;
  quantity: number;
  paymentMethod: 'cash' | 'card' | 'upi';
  discount?: number;
}

// Alert types
export interface Alert {
  id: string;
  type: 'expiry' | 'stock' | 'sensor' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  productId?: string;
  createdAt: Date;
}

// IoT Sensor types
export interface IoTSensor {
  id: string;
  type: 'temperature' | 'humidity' | 'ethylene' | 'motion';
  location: string;
  value: number;
  unit: string;
  status: 'online' | 'offline' | 'error';
  lastUpdate: Date;
  threshold: {
    min: number;
    max: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Analytics types
export interface DashboardAnalytics {
  totalProducts: number;
  totalCategories: number;
  totalSuppliers: number;
  totalSales: number;
  todaySales: number;
  monthlyRevenue: number;
  lowStockItems: number;
  expiringItems: number;
  topSellingProducts: Array<{
    productId: string;
    name: string;
    sold: number;
    revenue: number;
  }>;
  salesByCategory: Array<{
    category: string;
    sales: number;
    revenue: number;
  }>;
  dailySales: Array<{
    date: string;
    sales: number;
    revenue: number;
  }>;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// WebSocket message types
export interface WebSocketMessage {
  type: 'alert' | 'sensor_update' | 'sale_update' | 'product_update';
  data: any;
  timestamp: Date;
}

// Authentication types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  data?: any;
  message?: string;
  error?: string;
}

// ML/AI Types
export interface MLModel {
  id: string;
  name: string;
  type: 'demand_forecasting' | 'price_optimization' | 'inventory_classification' | 'expiry_prediction' | 'quality_assessment';
  version: string;
  status: 'training' | 'trained' | 'deployed' | 'failed';
  accuracy: number;
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    trainingDataSize: number;
    features: string[];
    algorithm: string;
    parameters: Record<string, any>;
  };
}

export interface TrainingData {
  id: string;
  modelType: string;
  features: Record<string, number>;
  target: number;
  timestamp: Date;
  productId?: string;
  category?: string;
}

export interface Prediction {
  id: string;
  modelId: string;
  productId: string;
  predictionType: 'demand' | 'price' | 'expiry' | 'quality';
  value: number;
  confidence: number;
  timestamp: Date;
  actualValue?: number;
  error?: number;
}

export interface DemandForecast {
  productId: string;
  predictedDemand: number;
  confidence: number;
  forecastPeriod: 'daily' | 'weekly' | 'monthly';
  factors: {
    seasonality: number;
    trend: number;
    external: number;
  };
}

export interface PriceOptimization {
  productId: string;
  currentPrice: number;
  recommendedPrice: number;
  priceElasticity: number;
  expectedRevenue: number;
  confidence: number;
}

export interface InventoryRecommendation {
  productId: string;
  currentStock: number;
  recommendedStock: number;
  reorderPoint: number;
  reorderQuantity: number;
  confidence: number;
  reasoning: string;
}

export interface QualityPrediction {
  productId: string;
  qualityScore: number;
  shelfLifeRemaining: number;
  spoilageRisk: 'low' | 'medium' | 'high';
  confidence: number;
  factors: {
    temperature: number;
    humidity: number;
    ethylene: number;
    age: number;
  };
}

export interface SyntheticDatasetConfig {
  numSamples: number;
  categories: string[];
  dateRange: {
    start: Date;
    end: Date;
  };
  noiseLevel: number;
  seasonality: boolean;
  trends: boolean;
  anomalies: boolean;
}

export interface ModelTrainingRequest {
  modelType: string;
  trainingDataId?: string;
  parameters: Record<string, any>;
  testSize: number;
  epochs?: number;
  batchSize?: number;
}

export interface ModelTrainingResponse {
  success: boolean;
  modelId: string;
  accuracy: number;
  loss: number;
  trainingTime: number;
  message?: string;
  error?: string;
}

export interface MLPredictionRequest {
  modelId: string;
  inputData: Record<string, number>;
  predictionType: string;
}

export interface MLPredictionResponse {
  success: boolean;
  prediction: number;
  confidence: number;
  modelId: string;
  timestamp: Date;
  error?: string;
}


