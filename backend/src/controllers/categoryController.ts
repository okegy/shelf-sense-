import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Category } from '../types';

interface CategoryData {
  id: string;
  name: string;
  icon: string;
  totalItems: number;
  expiringItems: number;
}

class CategoryController {
  private categories: CategoryData[] = [
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

  getAllCategories = (req: Request, res: Response): void => {
    try {
      res.json({
        success: true,
        data: this.categories,
        count: this.categories.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch categories',
        error: (error as Error).message
      });
    }
  };

  getCategoryById = (req: Request, res: Response): void => {
    try {
      const { id } = req.params;
      const category = this.categories.find(cat => cat.id === id);

      if (!category) {
        res.status(404).json({
          success: false,
          message: 'Category not found'
        });
        return;
      }

      res.json({
        success: true,
        data: category
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch category',
        error: (error as Error).message
      });
    }
  };

  createCategory = (req: Request, res: Response): void => {
    try {
      const categoryData: Omit<CategoryData, 'id'> = req.body;

      if (!categoryData.name || !categoryData.icon) {
        res.status(400).json({
          success: false,
          message: 'Name and icon are required'
        });
        return;
      }

      const newCategory: CategoryData = {
        id: uuidv4(),
        ...categoryData
      };

      this.categories.push(newCategory);

      res.status(201).json({
        success: true,
        data: newCategory,
        message: 'Category created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create category',
        error: (error as Error).message
      });
    }
  };

  updateCategory = (req: Request, res: Response): void => {
    try {
      const { id } = req.params;
      const updateData: Partial<CategoryData> = req.body;

      const categoryIndex = this.categories.findIndex(cat => cat.id === id);

      if (categoryIndex === -1) {
        res.status(404).json({
          success: false,
          message: 'Category not found'
        });
        return;
      }

      this.categories[categoryIndex] = {
        ...this.categories[categoryIndex],
        ...updateData
      };

      res.json({
        success: true,
        data: this.categories[categoryIndex],
        message: 'Category updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update category',
        error: (error as Error).message
      });
    }
  };

  deleteCategory = (req: Request, res: Response): void => {
    try {
      const { id } = req.params;
      const categoryIndex = this.categories.findIndex(cat => cat.id === id);

      if (categoryIndex === -1) {
        res.status(404).json({
          success: false,
          message: 'Category not found'
        });
        return;
      }

      this.categories.splice(categoryIndex, 1);

      res.json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete category',
        error: (error as Error).message
      });
    }
  };

  getCategoryStats = (req: Request, res: Response): void => {
    try {
      const totalItems = this.categories.reduce((sum, cat) => sum + cat.totalItems, 0);
      const totalExpiringItems = this.categories.reduce((sum, cat) => sum + cat.expiringItems, 0);

      res.json({
        success: true,
        data: {
          totalCategories: this.categories.length,
          totalItems,
          totalExpiringItems,
          categoriesWithExpiringItems: this.categories.filter(cat => cat.expiringItems > 0).length
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch category stats',
        error: (error as Error).message
      });
    }
  };
}

export const categoryController = new CategoryController();
