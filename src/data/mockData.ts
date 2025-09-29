import { Supplier, PurchaseOrder, Sale, Alert, IoTSensor } from '../types/index';

export const suppliers: Supplier[] = [
  {
    id: 'sup-001',
    name: 'Fresh Farm Supplies',
    contact: '+91 98765 43210',
    email: 'orders@freshfarm.com',
    address: '123 Agriculture Hub, Mumbai',
    rating: 4.8,
    totalOrders: 156,
    reliability: 'High'
  },
  {
    id: 'sup-002',
    name: 'Dairy Direct Ltd',
    contact: '+91 87654 32109',
    email: 'supply@dairydirect.com',
    address: '456 Milk Valley, Pune',
    rating: 4.5,
    totalOrders: 89,
    reliability: 'High'
  },
  {
    id: 'sup-003',
    name: 'Packaged Foods Co',
    contact: '+91 76543 21098',
    email: 'orders@packagedfoods.com',
    address: '789 Industrial Area, Delhi',
    rating: 4.2,
    totalOrders: 234,
    reliability: 'Medium'
  }
];

export const purchaseOrders: PurchaseOrder[] = [
  {
    id: 'po-001',
    supplierId: 'sup-001',
    items: [
      { productId: '1', quantity: 50, unitPrice: 40, totalPrice: 2000 },
      { productId: '2', quantity: 30, unitPrice: 35, totalPrice: 1050 }
    ],
    totalAmount: 3050,
    status: 'pending',
    orderDate: '2024-01-15',
    expectedDelivery: '2024-01-18'
  }
];

export const sales: Sale[] = [
  {
    id: 'sale-001',
    productId: '1',
    quantity: 2,
    unitPrice: 32,
    totalPrice: 64,
    discount: 8,
    timestamp: '2024-01-15T10:30:00Z',
    paymentMethod: 'upi'
  },
  {
    id: 'sale-002',
    productId: '3',
    quantity: 1,
    unitPrice: 25.2,
    totalPrice: 25.2,
    discount: 2.8,
    timestamp: '2024-01-15T11:15:00Z',
    paymentMethod: 'card'
  }
];

export const alerts: Alert[] = [
  {
    id: 'alert-001',
    type: 'expiry',
    severity: 'high',
    title: 'Items Expiring Soon',
    message: '5 products will expire within 24 hours',
    timestamp: '2024-01-15T09:00:00Z',
    isRead: false,
    productId: '2'
  },
  {
    id: 'alert-002',
    type: 'stock',
    severity: 'medium',
    title: 'Low Stock Alert',
    message: 'Coca Cola 500ml stock is running low (12 units left)',
    timestamp: '2024-01-15T08:30:00Z',
    isRead: false,
    productId: '5'
  },
  {
    id: 'alert-003',
    type: 'sensor',
    severity: 'critical',
    title: 'Temperature Alert',
    message: 'Dairy section temperature exceeded safe limits (8°C)',
    timestamp: '2024-01-15T07:45:00Z',
    isRead: true
  }
];

export const iotSensors: IoTSensor[] = [
  {
    id: 'sensor-001',
    type: 'temperature',
    location: 'Dairy Section',
    value: 4.2,
    unit: '°C',
    status: 'online',
    lastUpdate: '2024-01-15T12:00:00Z',
    threshold: { min: 2, max: 6 }
  },
  {
    id: 'sensor-002',
    type: 'humidity',
    location: 'Fresh Produce',
    value: 68,
    unit: '%',
    status: 'online',
    lastUpdate: '2024-01-15T12:00:00Z',
    threshold: { min: 60, max: 80 }
  },
  {
    id: 'sensor-003',
    type: 'ethylene',
    location: 'Fruit Storage',
    value: 2.3,
    unit: 'ppm',
    status: 'online',
    lastUpdate: '2024-01-15T12:00:00Z',
    threshold: { min: 0, max: 5 }
  },
  {
    id: 'sensor-004',
    type: 'temperature',
    location: 'Frozen Section',
    value: -18.5,
    unit: '°C',
    status: 'offline',
    lastUpdate: '2024-01-15T10:30:00Z',
    threshold: { min: -20, max: -15 }
  }
];