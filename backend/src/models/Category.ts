import mongoose, { Schema, Document } from 'mongoose';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../types';

interface CategoryDocument extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  icon: string;
  totalItems: number;
  expiringItems: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<CategoryDocument>({
  name: { type: String, required: true, unique: true },
  icon: { type: String, required: true },
  totalItems: { type: Number, default: 0 },
  expiringItems: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
CategorySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const CategoryModelInstance = mongoose.model<CategoryDocument>('Category', CategorySchema);

export class CategoryModel {
  static async findAll(): Promise<Category[]> {
    const categories = await CategoryModelInstance.find().sort({ name: 1 });
    return categories.map(c => ({
      id: c._id.toString(),
      ...c.toObject()
    }));
  }

  static async findById(id: string): Promise<Category | null> {
    const category = await CategoryModelInstance.findById(id);
    if (!category) return null;
    return {
      id: category._id.toString(),
      ...category.toObject()
    };
  }

  static async findByName(name: string): Promise<Category | null> {
    const category = await CategoryModelInstance.findOne({ name });
    if (!category) return null;
    return {
      id: category._id.toString(),
      ...category.toObject()
    };
  }

  static async create(categoryData: CreateCategoryRequest): Promise<Category> {
    const category = new CategoryModelInstance(categoryData);
    const savedCategory = await category.save();
    return {
      id: savedCategory._id.toString(),
      ...savedCategory.toObject()
    };
  }

  static async update(id: string, updateData: UpdateCategoryRequest): Promise<Category | null> {
    const updatedCategory = await CategoryModelInstance.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedCategory) return null;
    return {
      id: updatedCategory._id.toString(),
      ...updatedCategory.toObject()
    };
  }

  static async delete(id: string): Promise<boolean> {
    const result = await CategoryModelInstance.findByIdAndDelete(id);
    return !!result;
  }

  static async updateStats(categoryName: string, totalItemsChange: number = 0, expiringItemsChange: number = 0): Promise<void> {
    await CategoryModelInstance.updateOne(
      { name: categoryName },
      {
        $inc: {
          totalItems: totalItemsChange,
          expiringItems: expiringItemsChange
        }
      }
    );
  }

  static async getStats(): Promise<{ totalCategories: number; totalItems: number; totalExpiring: number }> {
    const stats = await CategoryModelInstance.aggregate([
      {
        $group: {
          _id: null,
          totalCategories: { $sum: 1 },
          totalItems: { $sum: '$totalItems' },
          totalExpiring: { $sum: '$expiringItems' }
        }
      }
    ]);

    return stats[0] || { totalCategories: 0, totalItems: 0, totalExpiring: 0 };
  }

  // Initialize with sample data if collection is empty
  static async initializeSampleData(): Promise<void> {
    const count = await CategoryModelInstance.countDocuments();
    if (count === 0) {
      const sampleCategories: CreateCategoryRequest[] = [
        {
          name: 'Fresh Produce',
          icon: '🥬',
          totalItems: 0,
          expiringItems: 0
        },
        {
          name: 'Dairy',
          icon: '🥛',
          totalItems: 0,
          expiringItems: 0
        },
        {
          name: 'Packaged Foods',
          icon: '🍜',
          totalItems: 0,
          expiringItems: 0
        },
        {
          name: 'Beverages',
          icon: '🥤',
          totalItems: 0,
          expiringItems: 0
        },
        {
          name: 'Frozen',
          icon: '🧊',
          totalItems: 0,
          expiringItems: 0
        },
        {
          name: 'Bakery',
          icon: '🍞',
          totalItems: 0,
          expiringItems: 0
        },
        {
          name: 'Meat',
          icon: '🥩',
          totalItems: 0,
          expiringItems: 0
        },
        {
          name: 'Seafood',
          icon: '🐟',
          totalItems: 0,
          expiringItems: 0
        }
      ];

      await CategoryModelInstance.insertMany(sampleCategories);
      console.log('✅ Sample categories initialized in MongoDB');
    }
  }

  static async clearAll(): Promise<void> {
    await CategoryModelInstance.deleteMany({});
  }
}
