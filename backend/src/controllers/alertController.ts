import { Request, Response } from 'express';
import { AlertModel } from '../models/Alert';
import { ApiResponse } from '../types';

export class AlertController {
  static async getAllAlerts(req: Request, res: Response): Promise<void> {
    try {
      const alerts = await AlertModel.findAll();
      const response: ApiResponse<typeof alerts> = {
        success: true,
        data: alerts
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to fetch alerts'
      };
      res.status(500).json(response);
    }
  }

  static async getAlertById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const alert = await AlertModel.findById(id);

      if (!alert) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Alert not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof alert> = {
        success: true,
        data: alert
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to fetch alert'
      };
      res.status(500).json(response);
    }
  }

  static async getUnreadAlerts(req: Request, res: Response): Promise<void> {
    try {
      const alerts = await AlertModel.findUnread();
      const response: ApiResponse<typeof alerts> = {
        success: true,
        data: alerts
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to fetch unread alerts'
      };
      res.status(500).json(response);
    }
  }

  static async getAlertsByType(req: Request, res: Response): Promise<void> {
    try {
      const { type } = req.params;
      const alerts = await AlertModel.findByType(type);

      const response: ApiResponse<typeof alerts> = {
        success: true,
        data: alerts
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to fetch alerts by type'
      };
      res.status(500).json(response);
    }
  }

  static async markAlertAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const alert = await AlertModel.markAsRead(id);

      if (!alert) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Alert not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof alert> = {
        success: true,
        data: alert,
        message: 'Alert marked as read'
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to mark alert as read'
      };
      res.status(500).json(response);
    }
  }

  static async markAllAlertsAsRead(req: Request, res: Response): Promise<void> {
    try {
      const count = await AlertModel.markAllAsRead();
      const response: ApiResponse<null> = {
        success: true,
        message: `${count} alerts marked as read`
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to mark all alerts as read'
      };
      res.status(500).json(response);
    }
  }

  static async deleteAlert(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await AlertModel.delete(id);

      if (!deleted) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Alert not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<null> = {
        success: true,
        message: 'Alert deleted successfully'
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to delete alert'
      };
      res.status(500).json(response);
    }
  }

  static async generateExpiryAlerts(req: Request, res: Response): Promise<void> {
    try {
      const alerts = await AlertModel.generateExpiryAlerts();
      const response: ApiResponse<typeof alerts> = {
        success: true,
        data: alerts,
        message: `${alerts.length} expiry alerts generated`
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to generate expiry alerts'
      };
      res.status(500).json(response);
    }
  }

  static async generateStockAlerts(req: Request, res: Response): Promise<void> {
    try {
      const alerts = await AlertModel.generateStockAlerts();
      const response: ApiResponse<typeof alerts> = {
        success: true,
        data: alerts,
        message: `${alerts.length} stock alerts generated`
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to generate stock alerts'
      };
      res.status(500).json(response);
    }
  }

  static async generateSensorAlerts(req: Request, res: Response): Promise<void> {
    try {
      const alerts = await AlertModel.generateSensorAlerts();
      const response: ApiResponse<typeof alerts> = {
        success: true,
        data: alerts,
        message: `${alerts.length} sensor alerts generated`
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to generate sensor alerts'
      };
      res.status(500).json(response);
    }
  }

  static async getAlertStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await AlertModel.getAlertStats();
      const response: ApiResponse<typeof stats> = {
        success: true,
        data: stats
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to fetch alert statistics'
      };
      res.status(500).json(response);
    }
  }
}
