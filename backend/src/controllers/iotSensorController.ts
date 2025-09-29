import { Request, Response } from 'express';
import { IoTSensorModel } from '../models/IoTSensor';
import { ApiResponse } from '../types';

export class IoTSensorController {
  static async getAllSensors(req: Request, res: Response): Promise<void> {
    try {
      const sensors = await IoTSensorModel.findAll();
      const response: ApiResponse<typeof sensors> = {
        success: true,
        data: sensors
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to fetch sensors'
      };
      res.status(500).json(response);
    }
  }

  static async getSensorById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const sensor = await IoTSensorModel.findById(id);

      if (!sensor) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Sensor not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof sensor> = {
        success: true,
        data: sensor
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to fetch sensor'
      };
      res.status(500).json(response);
    }
  }

  static async getSensorsByType(req: Request, res: Response): Promise<void> {
    try {
      const { type } = req.params;
      const sensors = await IoTSensorModel.findByType(type);

      const response: ApiResponse<typeof sensors> = {
        success: true,
        data: sensors
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to fetch sensors by type'
      };
      res.status(500).json(response);
    }
  }

  static async getSensorsByLocation(req: Request, res: Response): Promise<void> {
    try {
      const { location } = req.params;
      const sensors = await IoTSensorModel.findByLocation(location);

      const response: ApiResponse<typeof sensors> = {
        success: true,
        data: sensors
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to fetch sensors by location'
      };
      res.status(500).json(response);
    }
  }

  static async updateSensorData(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { value } = req.body;

      if (typeof value !== 'number') {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Value must be a number'
        };
        res.status(400).json(response);
        return;
      }

      const sensor = await IoTSensorModel.updateSensorData(id, value);

      if (!sensor) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Sensor not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof sensor> = {
        success: true,
        data: sensor,
        message: 'Sensor data updated successfully'
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to update sensor data'
      };
      res.status(500).json(response);
    }
  }

  static async createSensor(req: Request, res: Response): Promise<void> {
    try {
      const sensorData = req.body;
      const sensor = await IoTSensorModel.create(sensorData);

      const response: ApiResponse<typeof sensor> = {
        success: true,
        data: sensor,
        message: 'Sensor created successfully'
      };
      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to create sensor'
      };
      res.status(500).json(response);
    }
  }

  static async deleteSensor(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await IoTSensorModel.delete(id);

      if (!deleted) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Sensor not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<null> = {
        success: true,
        message: 'Sensor deleted successfully'
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to delete sensor'
      };
      res.status(500).json(response);
    }
  }

  static async getSensorsWithAlerts(req: Request, res: Response): Promise<void> {
    try {
      const sensors = await IoTSensorModel.getSensorsWithAlerts();
      const response: ApiResponse<typeof sensors> = {
        success: true,
        data: sensors
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to fetch sensors with alerts'
      };
      res.status(500).json(response);
    }
  }

  static async getOnlineSensors(req: Request, res: Response): Promise<void> {
    try {
      const sensors = await IoTSensorModel.getOnlineSensors();
      const response: ApiResponse<typeof sensors> = {
        success: true,
        data: sensors
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to fetch online sensors'
      };
      res.status(500).json(response);
    }
  }

  static async getOfflineSensors(req: Request, res: Response): Promise<void> {
    try {
      const sensors = await IoTSensorModel.getOfflineSensors();
      const response: ApiResponse<typeof sensors> = {
        success: true,
        data: sensors
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to fetch offline sensors'
      };
      res.status(500).json(response);
    }
  }

  static async getSensorStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await IoTSensorModel.getSensorStats();
      const response: ApiResponse<typeof stats> = {
        success: true,
        data: stats
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to fetch sensor statistics'
      };
      res.status(500).json(response);
    }
  }

  static async simulateSensorUpdates(req: Request, res: Response): Promise<void> {
    try {
      await IoTSensorModel.simulateSensorUpdates();
      const response: ApiResponse<null> = {
        success: true,
        message: 'Sensor data simulation completed'
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to simulate sensor updates'
      };
      res.status(500).json(response);
    }
  }
}
