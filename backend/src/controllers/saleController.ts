import { Request, Response } from 'express';
import { SaleModel } from '../models/Sale';
import { ApiResponse } from '../types';

export class SaleController {
  static async getAllSales(req: Request, res: Response): Promise<void> {
    try {
      const sales = await SaleModel.findAll();
      const response: ApiResponse<typeof sales> = {
        success: true,
        data: sales
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to fetch sales'
      };
      res.status(500).json(response);
    }
  }

  static async getSaleById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const sale = await SaleModel.findById(id);

      if (!sale) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Sale not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof sale> = {
        success: true,
        data: sale
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to fetch sale'
      };
      res.status(500).json(response);
    }
  }

  static async getSalesByProduct(req: Request, res: Response): Promise<void> {
    try {
      const { productId } = req.params;
      const sales = await SaleModel.findByProductId(productId);

      const response: ApiResponse<typeof sales> = {
        success: true,
        data: sales
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to fetch sales by product'
      };
      res.status(500).json(response);
    }
  }

  static async getSalesByDateRange(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Start date and end date are required'
        };
        res.status(400).json(response);
        return;
      }

      const sales = await SaleModel.findByDateRange(
        new Date(startDate as string),
        new Date(endDate as string)
      );

      const response: ApiResponse<typeof sales> = {
        success: true,
        data: sales
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to fetch sales by date range'
      };
      res.status(500).json(response);
    }
  }

  static async createSale(req: Request, res: Response): Promise<void> {
    try {
      const saleData = req.body;
      const sale = await SaleModel.create(saleData);

      const response: ApiResponse<typeof sale> = {
        success: true,
        data: sale,
        message: 'Sale created successfully'
      };
      res.status(201).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || 'Failed to create sale'
      };
      res.status(400).json(response);
    }
  }

  static async getTodaySales(req: Request, res: Response): Promise<void> {
    try {
      const sales = await SaleModel.getTodaySales();
      const response: ApiResponse<typeof sales> = {
        success: true,
        data: sales,
        message: sales.length > 0 ? `${sales.length} sales found for today` : 'No sales found for today'
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to fetch today\'s sales'
      };
      res.status(500).json(response);
    }
  }

  static async getSalesAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const analytics = await SaleModel.getSalesAnalytics();
      const response: ApiResponse<typeof analytics> = {
        success: true,
        data: analytics
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to fetch sales analytics'
      };
      res.status(500).json(response);
    }
  }
}
