import { Request, Response } from 'express';
import { ProductModel } from '../models/Product';
import { ApiResponse } from '../types';

export class ProductController {
  static async getAllProducts(req: Request, res: Response): Promise<void> {
    try {
      const products = await ProductModel.findAll();
      const response: ApiResponse<typeof products> = {
        success: true,
        data: products
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to fetch products'
      };
      res.status(500).json(response);
    }
  }

  static async getProductById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const product = await ProductModel.findById(id);

      if (!product) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Product not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof product> = {
        success: true,
        data: product
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to fetch product'
      };
      res.status(500).json(response);
    }
  }

  static async getProductByBarcode(req: Request, res: Response): Promise<void> {
    try {
      const { barcode } = req.params;
      const product = await ProductModel.findByBarcode(barcode);

      if (!product) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Product not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof product> = {
        success: true,
        data: product
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to fetch product by barcode'
      };
      res.status(500).json(response);
    }
  }

  static async getProductsByCategory(req: Request, res: Response): Promise<void> {
    try {
      const { category } = req.params;
      const products = await ProductModel.findByCategory(category);

      const response: ApiResponse<typeof products> = {
        success: true,
        data: products
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to fetch products by category'
      };
      res.status(500).json(response);
    }
  }

  static async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const productData = req.body;
      const product = await ProductModel.create(productData);

      const response: ApiResponse<typeof product> = {
        success: true,
        data: product,
        message: 'Product created successfully'
      };
      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to create product'
      };
      res.status(500).json(response);
    }
  }

  static async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const product = await ProductModel.update(id, updateData);

      if (!product) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Product not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof product> = {
        success: true,
        data: product,
        message: 'Product updated successfully'
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to update product'
      };
      res.status(500).json(response);
    }
  }

  static async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await ProductModel.delete(id);

      if (!deleted) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Product not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<null> = {
        success: true,
        message: 'Product deleted successfully'
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to delete product'
      };
      res.status(500).json(response);
    }
  }

  static async updateProductStock(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { count } = req.body;

      if (typeof count !== 'number') {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Count must be a number'
        };
        res.status(400).json(response);
        return;
      }

      const product = await ProductModel.updateStock(id, count);

      if (!product) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Product not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof product> = {
        success: true,
        data: product,
        message: 'Product stock updated successfully'
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to update product stock'
      };
      res.status(500).json(response);
    }
  }

  static async getExpiringProducts(req: Request, res: Response): Promise<void> {
    try {
      const { days = 2 } = req.query;
      const products = await ProductModel.getExpiringItems(Number(days));

      const response: ApiResponse<typeof products> = {
        success: true,
        data: products
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to fetch expiring products'
      };
      res.status(500).json(response);
    }
  }

  static async getLowStockProducts(req: Request, res: Response): Promise<void> {
    try {
      const { threshold = 20 } = req.query;
      const products = await ProductModel.getLowStockItems(Number(threshold));

      const response: ApiResponse<typeof products> = {
        success: true,
        data: products
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to fetch low stock products'
      };
      res.status(500).json(response);
    }
  }

  static async searchProducts(req: Request, res: Response): Promise<void> {
    try {
      const { query } = req.query;

      if (!query || typeof query !== 'string') {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Search query is required'
        };
        res.status(400).json(response);
        return;
      }

      const products = await ProductModel.search(query);

      const response: ApiResponse<typeof products> = {
        success: true,
        data: products,
        message: `Found ${products.length} products matching "${query}"`
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to search products'
      };
      res.status(500).json(response);
    }
  }

  static async advancedSearchProducts(req: Request, res: Response): Promise<void> {
    try {
      const {
        query,
        category,
        status,
        freshness,
        minPrice,
        maxPrice,
        minStock,
        maxStock,
        expiringWithin,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        limit = 50,
        offset = 0
      } = req.query;

      const filters = {
        query: typeof query === 'string' ? query : undefined,
        category: typeof category === 'string' ? category : undefined,
        status: typeof status === 'string' ? status : undefined,
        freshness: typeof freshness === 'string' ? freshness : undefined,
        minPrice: typeof minPrice === 'string' ? parseFloat(minPrice) : undefined,
        maxPrice: typeof maxPrice === 'string' ? parseFloat(maxPrice) : undefined,
        minStock: typeof minStock === 'string' ? parseInt(minStock) : undefined,
        maxStock: typeof maxStock === 'string' ? parseInt(maxStock) : undefined,
        expiringWithin: typeof expiringWithin === 'string' ? parseInt(expiringWithin) : undefined,
        sortBy: typeof sortBy === 'string' ? sortBy : 'createdAt',
        sortOrder: (typeof sortOrder === 'string' ? sortOrder : 'desc') as 'asc' | 'desc',
        limit: typeof limit === 'string' ? parseInt(limit) : 50,
        offset: typeof offset === 'string' ? parseInt(offset) : 0
      };

      const result = await ProductModel.advancedSearch(filters);

      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        message: `Found ${result.total} products matching the search criteria`
      };
      res.json(response);
    } catch (error) {
      console.error('Error in advanced search:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to perform advanced search'
      };
      res.status(500).json(response);
    }
  }

  static async applySmartDiscounts(req: Request, res: Response): Promise<void> {
    try {
      // Only admins and managers can manually trigger discount application
      if (!req.user || !['admin', 'manager'].includes(req.user.role)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Insufficient permissions'
        };
        res.status(403).json(response);
        return;
      }

      await ProductModel.applySmartDiscounts();

      const response: ApiResponse<null> = {
        success: true,
        message: 'Smart discounts applied successfully'
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to apply smart discounts'
      };
      res.status(500).json(response);
    }
  }

  static async getDiscountedProducts(req: Request, res: Response): Promise<void> {
    try {
      const products = await ProductModel.findAll();
      const discountedProducts = products.filter(p =>
        p.discountedPrice !== undefined &&
        p.discountedPrice !== null &&
        p.discountedPrice < p.price
      );

      const response: ApiResponse<typeof discountedProducts> = {
        success: true,
        data: discountedProducts,
        message: `Found ${discountedProducts.length} products with active discounts`
      };
      res.json(response);
    } catch (error) {
      console.error('Error fetching discounted products:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to fetch discounted products'
      };
      res.status(500).json(response);
    }
  }
}
