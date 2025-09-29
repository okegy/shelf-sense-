import { Product, Category, WholesaleBox } from '../types/index';

export const products: Product[] = [
  {
    id: '1',
    name: 'Fresh Tomatoes',
    barcode: 'FRS-TOM-001',
    count: 45,
    expiry: '2024-09-25',
    price: 40,
    discountedPrice: 32,
    status: 'warning',
    freshness: 'Good',
    category: 'fresh-produce',
    humidity: '65%',
    ethylene: 'Low'
  },
  {
    id: '2',
    name: 'Organic Spinach',
    barcode: 'ORG-SPN-002',
    count: 23,
    expiry: '2024-09-24',
    price: 35,
    discountedPrice: 24.5,
    status: 'danger',
    freshness: 'Near Expiry',
    category: 'fresh-produce',
    humidity: '70%',
    ethylene: 'Medium'
  },
  {
    id: '3',
    name: 'Amul Milk 500ml',
    barcode: 'AMU-500-001',
    count: 24,
    expiry: '2024-09-26',
    price: 28,
    discountedPrice: 25.2,
    status: 'safe',
    freshness: 'Fresh',
    category: 'dairy',
    temperature: '4°C'
  },
  {
    id: '4',
    name: 'Maggi Noodles 2-min',
    barcode: 'MAG-2MN-001',
    count: 156,
    expiry: '2024-12-15',
    price: 14,
    status: 'safe',
    freshness: 'Good',
    category: 'packaged-foods'
  },
  {
    id: '5',
    name: 'Coca Cola 500ml',
    barcode: 'COK-500-001',
    count: 89,
    expiry: '2024-11-30',
    price: 35,
    status: 'safe',
    freshness: 'Good',
    category: 'beverages'
  },
  {
    id: '6',
    name: 'Frozen Chicken Wings',
    barcode: 'FRZ-CHK-001',
    count: 45,
    expiry: '2024-10-15',
    price: 250,
    status: 'safe',
    freshness: 'Good',
    category: 'frozen'
  }
];

export const categories: Category[] = [
  {
    id: 'fresh-produce',
    name: 'Fresh Produce',
    icon: '🥬',
    totalItems: 142,
    expiringItems: 8
  },
  {
    id: 'dairy',
    name: 'Dairy Products',
    icon: '🥛',
    totalItems: 67,
    expiringItems: 5
  },
  {
    id: 'packaged-foods',
    name: 'Packaged Foods',
    icon: '📦',
    totalItems: 298,
    expiringItems: 12
  },
  {
    id: 'beverages',
    name: 'Beverages',
    icon: '🥤',
    totalItems: 89,
    expiringItems: 3
  },
  {
    id: 'frozen',
    name: 'Frozen Items',
    icon: '🧊',
    totalItems: 45,
    expiringItems: 1
  },
  {
    id: 'wholesale',
    name: 'Wholesale Management',
    icon: '📊',
    totalItems: 15,
    expiringItems: 420
  }
];

export const wholesaleBoxes: WholesaleBox[] = [
  {
    id: 'box-001',
    name: 'Amul Milk Box - 500ml',
    boxCode: 'BOX-2024-001',
    totalUnits: 24,
    expiry: '2024-09-25',
    individualItems: Array.from({ length: 24 }, (_, i) => ({
      id: `item-${i + 1}`,
      name: `Unit ${i + 1}`,
      itemCode: `AMU-500-${String(i + 1).padStart(3, '0')}`,
      expiry: '2024-09-25',
      sold: i < 3 // First 3 items are sold
    }))
  }
];