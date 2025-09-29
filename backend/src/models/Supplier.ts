import mongoose, { Schema, Document } from 'mongoose';
import { Supplier, CreateSupplierRequest, UpdateSupplierRequest } from '../types';

interface SupplierDocument extends Document {
  _id: mongoose.Types.ObjectId;
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

const SupplierSchema = new Schema<SupplierDocument>({
  name: { type: String, required: true },
  contact: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, default: 3 },
  totalOrders: { type: Number, default: 0 },
  reliability: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
SupplierSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const SupplierModelInstance = mongoose.model<SupplierDocument>('Supplier', SupplierSchema);

export class SupplierModel {
  static async findAll(): Promise<Supplier[]> {
    const suppliers = await SupplierModelInstance.find().sort({ name: 1 });
    return suppliers.map(s => ({
      id: s._id.toString(),
      ...s.toObject()
    }));
  }

  static async findById(id: string): Promise<Supplier | null> {
    const supplier = await SupplierModelInstance.findById(id);
    if (!supplier) return null;
    return {
      id: supplier._id.toString(),
      ...supplier.toObject()
    };
  }

  static async findByEmail(email: string): Promise<Supplier | null> {
    const supplier = await SupplierModelInstance.findOne({ email });
    if (!supplier) return null;
    return {
      id: supplier._id.toString(),
      ...supplier.toObject()
    };
  }

  static async create(supplierData: CreateSupplierRequest): Promise<Supplier> {
    const supplier = new SupplierModelInstance({
      ...supplierData,
      reliability: SupplierModel.calculateReliability(supplierData.rating || 3)
    });
    const savedSupplier = await supplier.save();
    return {
      id: savedSupplier._id.toString(),
      ...savedSupplier.toObject()
    };
  }

  static async update(id: string, updateData: UpdateSupplierRequest): Promise<Supplier | null> {
    const existingSupplier = await this.findById(id);
    if (!existingSupplier) return null;

    const updatedData = {
      ...updateData,
      reliability: updateData.rating ? this.calculateReliability(updateData.rating) : existingSupplier.reliability
    };

    const updatedSupplier = await SupplierModelInstance.findByIdAndUpdate(id, updatedData, { new: true });
    if (!updatedSupplier) return null;
    return {
      id: updatedSupplier._id.toString(),
      ...updatedSupplier.toObject()
    };
  }

  static async delete(id: string): Promise<boolean> {
    const result = await SupplierModelInstance.findByIdAndDelete(id);
    return !!result;
  }

  static async incrementOrders(supplierId: string): Promise<void> {
    const supplier = await this.findById(supplierId);
    if (supplier) {
      await SupplierModelInstance.findByIdAndUpdate(supplierId, {
        $inc: { totalOrders: 1 }
      });
    }
  }

  static async updateRating(supplierId: string, newRating: number): Promise<void> {
    await SupplierModelInstance.findByIdAndUpdate(supplierId, {
      rating: newRating,
      reliability: this.calculateReliability(newRating)
    });
  }

  static async getTopSuppliers(limit: number = 5): Promise<Supplier[]> {
    const suppliers = await SupplierModelInstance
      .find()
      .sort({ rating: -1, totalOrders: -1 })
      .limit(limit);

    return suppliers.map(s => ({
      id: s._id.toString(),
      ...s.toObject()
    }));
  }

  static async getStats(): Promise<{ totalSuppliers: number; averageRating: number; totalOrders: number }> {
    const stats = await SupplierModelInstance.aggregate([
      {
        $group: {
          _id: null,
          totalSuppliers: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          totalOrders: { $sum: '$totalOrders' }
        }
      }
    ]);

    return stats[0] || { totalSuppliers: 0, averageRating: 0, totalOrders: 0 };
  }

  private static calculateReliability(rating: number): 'High' | 'Medium' | 'Low' {
    if (rating >= 4.5) return 'High';
    if (rating >= 3.5) return 'Medium';
    return 'Low';
  }

  // Initialize with sample data if collection is empty
  static async initializeSampleData(): Promise<void> {
    const count = await SupplierModelInstance.countDocuments();
    if (count === 0) {
      const sampleSuppliers: CreateSupplierRequest[] = [
        {
          name: 'Fresh Farms Ltd',
          contact: '+91-9876543210',
          email: 'contact@freshfarms.com',
          address: '123 Green Street, Mumbai, Maharashtra 400001',
          rating: 4.8
        },
        {
          name: 'Dairy Delight Co',
          contact: '+91-9876543211',
          email: 'info@dairydelight.com',
          address: '456 Milk Lane, Pune, Maharashtra 411001',
          rating: 4.5
        },
        {
          name: 'Packaged Foods Inc',
          contact: '+91-9876543212',
          email: 'sales@packagedfoods.com',
          address: '789 Food Plaza, Delhi, Delhi 110001',
          rating: 4.2
        },
        {
          name: 'Beverage World',
          contact: '+91-9876543213',
          email: 'contact@beverageworld.com',
          address: '321 Drink Avenue, Bangalore, Karnataka 560001',
          rating: 4.6
        },
        {
          name: 'Frozen Foods Corp',
          contact: '+91-9876543214',
          email: 'info@frozenfoods.com',
          address: '654 Ice Road, Chennai, Tamil Nadu 600001',
          rating: 4.3
        },
        {
          name: 'Organic Valley',
          contact: '+91-9876543215',
          email: 'hello@organicvalley.com',
          address: '987 Nature Street, Hyderabad, Telangana 500001',
          rating: 4.9
        }
      ];

      await SupplierModelInstance.insertMany(sampleSuppliers.map(s => ({
        ...s,
        reliability: this.calculateReliability(s.rating || 3)
      })));
      console.log('✅ Sample suppliers initialized in MongoDB');
    }
  }

  static async clearAll(): Promise<void> {
    await SupplierModelInstance.deleteMany({});
  }
}
