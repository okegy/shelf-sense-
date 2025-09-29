import { Sale, CreateSaleRequest } from '../types';
import { ProductModel } from './Product';

const generateId = () => Math.random().toString(36).substr(2, 9);

export class SaleModel {
  private static sales: Sale[] = [
    {
      id: 'sale-001',
      productId: '1',
      quantity: 2,
      unitPrice: 32,
      totalPrice: 64,
      discount: 8,
      timestamp: new Date('2024-01-15T10:30:00Z'),
      paymentMethod: 'upi',
      createdAt: new Date('2024-01-15T10:30:00Z')
    },
    {
      id: 'sale-002',
      productId: '3',
      quantity: 1,
      unitPrice: 25.2,
      totalPrice: 25.2,
      discount: 2.8,
      timestamp: new Date('2024-01-15T11:15:00Z'),
      paymentMethod: 'card',
      createdAt: new Date('2024-01-15T11:15:00Z')
    }
  ];

  static async findAll(): Promise<Sale[]> {
    return this.sales.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  static async findById(id: string): Promise<Sale | null> {
    return this.sales.find(sale => sale.id === id) || null;
  }

  static async findByProductId(productId: string): Promise<Sale[]> {
    return this.sales.filter(sale => sale.productId === productId);
  }

  static async findByDateRange(startDate: Date, endDate: Date): Promise<Sale[]> {
    return this.sales.filter(sale =>
      sale.timestamp >= startDate && sale.timestamp <= endDate
    );
  }

  static async create(saleData: CreateSaleRequest): Promise<Sale> {
    const product = await ProductModel.findById(saleData.productId);
    if (!product) {
      throw new Error('Product not found');
    }

    if (product.count < saleData.quantity) {
      throw new Error('Insufficient stock');
    }

    const unitPrice = product.discountedPrice || product.price;
    const discount = product.price - unitPrice;
    const totalPrice = unitPrice * saleData.quantity;

    const newSale: Sale = {
      id: generateId(),
      productId: saleData.productId,
      quantity: saleData.quantity,
      unitPrice,
      totalPrice,
      discount: discount * saleData.quantity,
      timestamp: new Date(),
      paymentMethod: saleData.paymentMethod,
      createdAt: new Date()
    };

    this.sales.push(newSale);

    // Update product stock
    await ProductModel.updateStock(saleData.productId, product.count - saleData.quantity);

    return newSale;
  }

  static async getTodaySales(): Promise<Sale[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.findByDateRange(today, tomorrow);
  }

  static async getSalesAnalytics() {
    const todaySales = await this.getTodaySales();
    const totalSales = this.sales;

    const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.totalPrice, 0);
    const totalRevenue = totalSales.reduce((sum, sale) => sum + sale.totalPrice, 0);

    const productSales = totalSales.reduce((acc, sale) => {
      acc[sale.productId] = (acc[sale.productId] || 0) + sale.quantity;
      return acc;
    }, {} as Record<string, number>);

    const topSellingProducts = await Promise.all(
      Object.entries(productSales)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(async ([productId, quantity]) => {
          const product = await ProductModel.findById(productId);
          return {
            productId,
            name: product?.name || 'Unknown Product',
            sold: quantity,
            revenue: productSales[productId] * (product?.price || 0)
          };
        })
    );

    return {
      todaySales: todaySales.length,
      todayRevenue,
      totalSales: totalSales.length,
      totalRevenue,
      topSellingProducts
    };
  }
}
