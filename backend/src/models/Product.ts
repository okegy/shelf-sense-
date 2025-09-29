import mongoose, { Schema, Document } from 'mongoose';
import { Product, CreateProductRequest, UpdateProductRequest } from '../types';

// Simple ID generator for MongoDB _id
const generateId = () => Math.random().toString(36).substr(2, 9);

interface ProductDocument extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  barcode: string;
  count: number;
  expiry: Date;
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

const ProductSchema = new Schema<ProductDocument>({
  name: { type: String, required: true },
  barcode: { type: String, required: true, unique: true },
  count: { type: Number, required: true, default: 0 },
  expiry: { type: Date, required: true },
  price: { type: Number, required: true },
  discountedPrice: { type: Number },
  status: { type: String, enum: ['safe', 'warning', 'danger'], default: 'safe' },
  freshness: { type: String, default: 'Good' },
  category: { type: String, required: true },
  humidity: { type: String },
  ethylene: { type: String },
  temperature: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
ProductSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const ProductModelInstance = mongoose.model<ProductDocument>('Product', ProductSchema);

export class ProductModel {
  static async findAll(): Promise<Product[]> {
    const products = await ProductModelInstance.find().sort({ createdAt: -1 });
    return products.map(p => ({
      id: p._id.toString(),
      ...p.toObject(),
      expiry: p.expiry.toISOString().split('T')[0]
    }));
  }

  static async findById(id: string): Promise<Product | null> {
    const product = await ProductModelInstance.findById(id);
    if (!product) return null;
    return {
      id: product._id.toString(),
      ...product.toObject(),
      expiry: product.expiry.toISOString().split('T')[0]
    };
  }

  static async findByBarcode(barcode: string): Promise<Product | null> {
    const product = await ProductModelInstance.findOne({ barcode });
    if (!product) return null;
    return {
      id: product._id.toString(),
      ...product.toObject(),
      expiry: product.expiry.toISOString().split('T')[0]
    };
  }

  static async findByCategory(category: string): Promise<Product[]> {
    const products = await ProductModelInstance.find({ category });
    return products.map(p => ({
      id: p._id.toString(),
      ...p.toObject(),
      expiry: p.expiry.toISOString().split('T')[0]
    }));
  }

  static async create(productData: CreateProductRequest): Promise<Product> {
    const product = new ProductModelInstance({
      ...productData,
      expiry: new Date(productData.expiry),
      status: this.calculateStatus(new Date(productData.expiry), productData.count)
    });
    const savedProduct = await product.save();
    return {
      id: savedProduct._id.toString(),
      ...savedProduct.toObject(),
      expiry: savedProduct.expiry.toISOString().split('T')[0]
    };
  }

  static async update(id: string, updateData: UpdateProductRequest): Promise<Product | null> {
    const existingProduct = await this.findById(id);
    if (!existingProduct) return null;

    const updatedData = {
      ...updateData,
      expiry: updateData.expiry ? new Date(updateData.expiry) : existingProduct.expiry,
      status: updateData.expiry || updateData.count !== undefined
        ? this.calculateStatus(
            updateData.expiry ? new Date(updateData.expiry) : new Date(existingProduct.expiry),
            updateData.count ?? existingProduct.count
          )
        : existingProduct.status
    };

    const updatedProduct = await ProductModelInstance.findByIdAndUpdate(id, updatedData, { new: true });
    if (!updatedProduct) return null;
    return {
      id: updatedProduct._id.toString(),
      ...updatedProduct.toObject(),
      expiry: updatedProduct.expiry.toISOString().split('T')[0]
    };
  }

  static async delete(id: string): Promise<boolean> {
    const result = await ProductModelInstance.findByIdAndDelete(id);
    return !!result;
  }

  static async updateStock(id: string, newCount: number): Promise<Product | null> {
    const product = await this.findById(id);
    if (!product) return null;

    const updatedProduct = await ProductModelInstance.findByIdAndUpdate(id, {
      count: newCount,
      status: this.calculateStatus(new Date(product.expiry), newCount)
    }, { new: true });

    if (!updatedProduct) return null;
    return {
      id: updatedProduct._id.toString(),
      ...updatedProduct.toObject(),
      expiry: updatedProduct.expiry.toISOString().split('T')[0]
    };
  }

  static async getExpiringItems(days: number = 2): Promise<Product[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const products = await ProductModelInstance.find({
      expiry: { $lte: futureDate },
      status: { $ne: 'safe' }
    });

    return products.map(p => ({
      id: p._id.toString(),
      ...p.toObject(),
      expiry: p.expiry.toISOString().split('T')[0]
    }));
  }

  static async getLowStockItems(threshold: number = 20): Promise<Product[]> {
    const products = await ProductModelInstance.find({ count: { $lte: threshold } });
    return products.map(p => ({
      id: p._id.toString(),
      ...p.toObject(),
      expiry: p.expiry.toISOString().split('T')[0]
    }));
  }

  private static calculateStatus(expiry: Date, count: number): 'safe' | 'warning' | 'danger' {
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (count <= 0) return 'danger';
    if (daysUntilExpiry <= 1) return 'danger';
    if (daysUntilExpiry <= 3) return 'warning';
    return 'safe';
  }

  static async search(query: string): Promise<Product[]> {
    const products = await ProductModelInstance.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { barcode: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { freshness: { $regex: query, $options: 'i' } },
        { status: { $regex: query, $options: 'i' } }
      ]
    }).sort({ createdAt: -1 });

    return products.map(p => ({
      id: p._id.toString(),
      ...p.toObject(),
      expiry: p.expiry.toISOString().split('T')[0]
    }));
  }

  static async advancedSearch(filters: {
    query?: string;
    category?: string;
    status?: string;
    freshness?: string;
    minPrice?: number;
    maxPrice?: number;
    minStock?: number;
    maxStock?: number;
    expiringWithin?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }): Promise<{ products: Product[]; total: number; totalPages: number }> {
    const searchQuery: any = {};

    // Text search
    if (filters.query) {
      searchQuery.$or = [
        { name: { $regex: filters.query, $options: 'i' } },
        { barcode: { $regex: filters.query, $options: 'i' } },
        { category: { $regex: filters.query, $options: 'i' } },
        { freshness: { $regex: filters.query, $options: 'i' } }
      ];
    }

    // Category filter
    if (filters.category) {
      searchQuery.category = filters.category;
    }

    // Status filter
    if (filters.status) {
      searchQuery.status = filters.status;
    }

    // Freshness filter
    if (filters.freshness) {
      searchQuery.freshness = filters.freshness;
    }

    // Price range filter
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      searchQuery.price = {};
      if (filters.minPrice !== undefined) searchQuery.price.$gte = filters.minPrice;
      if (filters.maxPrice !== undefined) searchQuery.price.$lte = filters.maxPrice;
    }

    // Stock range filter
    if (filters.minStock !== undefined || filters.maxStock !== undefined) {
      searchQuery.count = {};
      if (filters.minStock !== undefined) searchQuery.count.$gte = filters.minStock;
      if (filters.maxStock !== undefined) searchQuery.count.$lte = filters.maxStock;
    }

    // Expiring within filter
    if (filters.expiringWithin) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + filters.expiringWithin);
      searchQuery.expiry = { $lte: futureDate };
    }

    // Build sort options
    let sortOptions: any = { createdAt: -1 };
    if (filters.sortBy) {
      sortOptions = {};
      sortOptions[filters.sortBy] = filters.sortOrder === 'asc' ? 1 : -1;
    }

    // Execute query
    const total = await ProductModelInstance.countDocuments(searchQuery);
    const products = await ProductModelInstance.find(searchQuery)
      .sort(sortOptions)
      .limit(filters.limit || 50)
      .skip(filters.offset || 0);

    const totalPages = Math.ceil(total / (filters.limit || 50));

    return {
      products: products.map(p => ({
        id: p._id.toString(),
        ...p.toObject(),
        expiry: p.expiry.toISOString().split('T')[0]
      })),
      total,
      totalPages
    };
  }

  // Calculate smart discount based on expiry date and stock levels
  static calculateSmartDiscount(product: any): number {
    const today = new Date();
    const expiryDate = new Date(product.expiry);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    let discountPercentage = 0;

    // Apply discount based on days until expiry
    if (daysUntilExpiry <= 1) {
      discountPercentage = 50; // 50% off for items expiring today
    } else if (daysUntilExpiry <= 3) {
      discountPercentage = 30; // 30% off for items expiring in 3 days
    } else if (daysUntilExpiry <= 7) {
      discountPercentage = 20; // 20% off for items expiring in a week
    } else if (daysUntilExpiry <= 14) {
      discountPercentage = 10; // 10% off for items expiring in 2 weeks
    }

    // Additional discount for overstocked items
    if (product.count > 100) {
      discountPercentage += 15; // Extra 15% for high stock
    } else if (product.count > 50) {
      discountPercentage += 10; // Extra 10% for medium stock
    }

    // Cap discount at 70%
    discountPercentage = Math.min(discountPercentage, 70);

    const discountedPrice = product.price * (1 - discountPercentage / 100);
    return Math.round(discountedPrice * 100) / 100; // Round to 2 decimal places
  }

  // Apply smart discounts to all products
  static async applySmartDiscounts(): Promise<void> {
    try {
      const products = await ProductModelInstance.find({
        $or: [
          { expiry: { $lte: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) } }, // Expiring within 14 days
          { count: { $gt: 50 } } // High stock items
        ]
      });

      let updatedCount = 0;
      for (const product of products) {
        const newDiscountedPrice = this.calculateSmartDiscount(product);
        const currentDiscountedPrice = product.discountedPrice || product.price;

        if (newDiscountedPrice !== currentDiscountedPrice) {
          await ProductModelInstance.updateOne(
            { _id: product._id },
            { discountedPrice: newDiscountedPrice }
          );
          updatedCount++;
        }
      }

      if (updatedCount > 0) {
        console.log(`✅ Smart discounts applied to ${updatedCount} products`);
      }
    } catch (error) {
      console.error('❌ Error applying smart discounts:', error);
    }
  }

  // Initialize with sample data - check if products exist before inserting
  static async initializeSampleData(): Promise<void> {
    try {
      // Check if products already exist
      const existingCount = await ProductModelInstance.countDocuments();
      if (existingCount > 0) {
        console.log('✅ Sample products already exist in MongoDB');
        return;
      }

      const sampleProducts: CreateProductRequest[] = [
        {
          name: 'Fresh Tomatoes',
          barcode: 'FRS-TOM-001',
          count: 45,
          expiry: '2024-09-25',
          price: 40,
          discountedPrice: 32,
          category: 'fresh-produce',
          humidity: '65%',
          ethylene: 'Low'
        },
        {
          name: 'Organic Spinach',
          barcode: 'ORG-SPN-002',
          count: 23,
          expiry: '2024-09-24',
          price: 35,
          discountedPrice: 24.5,
          category: 'fresh-produce',
          humidity: '70%',
          ethylene: 'Medium'
        },
        {
          name: 'Amul Milk 500ml',
          barcode: 'AMU-500-001',
          count: 24,
          expiry: '2024-09-26',
          price: 28,
          discountedPrice: 25.2,
          category: 'dairy',
          temperature: '4°C'
        },
        {
          name: 'Maggi Noodles 2-min',
          barcode: 'MAG-2MN-001',
          count: 156,
          expiry: '2024-12-15',
          price: 14,
          category: 'packaged-foods'
        },
        {
          name: 'Coca Cola 500ml',
          barcode: 'COK-500-001',
          count: 89,
          expiry: '2024-11-30',
          price: 35,
          category: 'beverages'
        },
        {
          name: 'Frozen Chicken Wings',
          barcode: 'FRZ-CHK-001',
          count: 45,
          expiry: '2024-10-15',
          price: 250,
          category: 'frozen'
        }
      ];

      await ProductModelInstance.insertMany(sampleProducts.map(p => ({
        ...p,
        expiry: new Date(p.expiry),
        status: this.calculateStatus(new Date(p.expiry), p.count)
      })));
      console.log('✅ Sample products initialized in MongoDB');
    } catch (error) {
      console.error('❌ Error initializing sample data:', error);
      throw error;
    }
  }
}
