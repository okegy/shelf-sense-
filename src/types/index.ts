export interface Product {
  id: string;
  name: string;
  barcode: string;
  count: number;
  expiry: string;
  price: number;
  discountedPrice?: number;
  status: 'safe' | 'warning' | 'danger' | 'expired';
  freshness: string;
  category: string;
  description?: string;
  humidity?: string;
  ethylene?: 'Low' | 'Medium' | 'High';
  temperature?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WholesaleBox {
  id: string;
  name: string;
  boxCode: string;
  totalUnits: number;
  expiry: string;
  individualItems: IndividualItem[];
}

export interface IndividualItem {
  id: string;
  name: string;
  itemCode: string;
  expiry: string;
  sold?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  totalItems: number;
  expiringItems: number;
}

export interface FinancialData {
  todayProfit: number;
  wastagePrevented: number;
  itemsAtRisk: number;
  profitChange: string;
}

export interface User {
  id?: string;
  username: string;
  isAuthenticated: boolean;
  role?: 'admin' | 'manager' | 'staff';
  avatar?: string;
  isActive?: boolean;
  createdAt?: string;
  lastLogin?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  address: string;
  rating: number;
  totalOrders: number;
  reliability: 'High' | 'Medium' | 'Low';
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'approved' | 'delivered' | 'cancelled';
  orderDate: string;
  expectedDelivery: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Sale {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discount: number;
  timestamp: string;
  paymentMethod: 'cash' | 'card' | 'upi';
}

export interface Alert {
  id: string;
  type: 'expiry' | 'stock' | 'sensor' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  productId?: string;
}

export interface Report {
  id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  title: string;
  data: any;
  generatedAt: string;
}

export interface IoTSensor {
  id: string;
  type: 'temperature' | 'humidity' | 'ethylene' | 'motion';
  location: string;
  value: number;
  unit: string;
  status: 'online' | 'offline' | 'error';
  lastUpdate: string;
  threshold: {
    min: number;
    max: number;
  };
}