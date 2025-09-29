import { Request, Response } from 'express';
import { mlService } from '../services/mlService';
import {
  SyntheticDatasetConfig,
  ModelTrainingRequest,
  MLPredictionRequest,
  ApiResponse
} from '../types';

export class MLController {
  /**
   * Generate synthetic dataset for training
   */
  async generateDataset(req: Request, res: Response) {
    try {
      const config: SyntheticDatasetConfig = {
        numSamples: req.body.numSamples || 10000,
        categories: req.body.categories || ['Fruits', 'Vegetables', 'Dairy', 'Bakery', 'Meat', 'Beverages'],
        dateRange: {
          start: new Date(req.body.startDate || '2023-01-01'),
          end: new Date(req.body.endDate || '2024-12-31')
        },
        noiseLevel: req.body.noiseLevel || 0.1,
        seasonality: req.body.seasonality !== false,
        trends: req.body.trends !== false,
        anomalies: req.body.anomalies !== false
      };

      const dataset = await mlService.generateSyntheticDataset(config);

      const response: ApiResponse<typeof dataset> = {
        success: true,
        data: dataset,
        message: `Generated ${dataset.length} training samples`
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate dataset'
      };
      res.status(500).json(response);
    }
  }

  /**
   * Train a machine learning model
   */
  async trainModel(req: Request, res: Response) {
    try {
      const trainingRequest: ModelTrainingRequest = {
        modelType: req.body.modelType,
        trainingDataId: req.body.trainingDataId,
        parameters: req.body.parameters || {},
        testSize: req.body.testSize || 0.2,
        epochs: req.body.epochs || 50,
        batchSize: req.body.batchSize || 32
      };

      const result = await mlService.trainModel(trainingRequest);

      if (result.success) {
        const response: ApiResponse<typeof result> = {
          success: true,
          data: result,
          message: result.message
        };
        res.json(response);
      } else {
        const response: ApiResponse<null> = {
          success: false,
          error: result.error
        };
        res.status(400).json(response);
      }
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to train model'
      };
      res.status(500).json(response);
    }
  }

  /**
   * Make a prediction using a trained model
   */
  async makePrediction(req: Request, res: Response) {
    try {
      const predictionRequest: MLPredictionRequest = {
        modelId: req.body.modelId,
        inputData: req.body.inputData,
        predictionType: req.body.predictionType
      };

      const result = await mlService.makePrediction(predictionRequest);

      if (result.success) {
        const response: ApiResponse<typeof result> = {
          success: true,
          data: result,
          message: `Prediction made with confidence ${(result.confidence * 100).toFixed(2)}%`
        };
        res.json(response);
      } else {
        const response: ApiResponse<null> = {
          success: false,
          error: result.error
        };
        res.status(400).json(response);
      }
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to make prediction'
      };
      res.status(500).json(response);
    }
  }

  /**
   * Get demand forecast for a product
   */
  async getDemandForecast(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const days = parseInt(req.query.days as string) || 7;

      const forecasts = await mlService.getDemandForecast(productId, days);

      const response: ApiResponse<typeof forecasts> = {
        success: true,
        data: forecasts,
        message: `Generated ${days}-day demand forecast for product ${productId}`
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate demand forecast'
      };
      res.status(500).json(response);
    }
  }

  /**
   * Get price optimization recommendations
   */
  async getPriceOptimization(req: Request, res: Response) {
    try {
      const { productId } = req.params;

      const optimization = await mlService.getPriceOptimization(productId);

      const response: ApiResponse<typeof optimization> = {
        success: true,
        data: optimization,
        message: `Generated price optimization for product ${productId}`
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate price optimization'
      };
      res.status(500).json(response);
    }
  }

  /**
   * Get inventory recommendations
   */
  async getInventoryRecommendation(req: Request, res: Response) {
    try {
      const { productId } = req.params;

      const recommendation = await mlService.getInventoryRecommendation(productId);

      const response: ApiResponse<typeof recommendation> = {
        success: true,
        data: recommendation,
        message: `Generated inventory recommendation for product ${productId}`
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate inventory recommendation'
      };
      res.status(500).json(response);
    }
  }

  /**
   * Get quality prediction for a product
   */
  async getQualityPrediction(req: Request, res: Response) {
    try {
      const { productId } = req.params;

      const prediction = await mlService.getQualityPrediction(productId);

      const response: ApiResponse<typeof prediction> = {
        success: true,
        data: prediction,
        message: `Generated quality prediction for product ${productId}`
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate quality prediction'
      };
      res.status(500).json(response);
    }
  }

  /**
   * Get all available models
   */
  async getModels(req: Request, res: Response) {
    try {
      // This would fetch models from database
      // For now, return mock data
      const models = [
        {
          id: 'demand_forecast_model',
          name: 'Demand Forecasting Model',
          type: 'demand_forecasting',
          version: '1.0.0',
          status: 'trained',
          accuracy: 0.85,
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: {
            trainingDataSize: 10000,
            features: ['dayOfWeek', 'month', 'seasonality', 'price', 'stockLevel'],
            algorithm: 'neural_network',
            parameters: {}
          }
        }
      ];

      const response: ApiResponse<typeof models> = {
        success: true,
        data: models,
        message: 'Retrieved available ML models'
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve models'
      };
      res.status(500).json(response);
    }
  }

  /**
   * Get model performance metrics
   */
  async getModelMetrics(req: Request, res: Response) {
    try {
      const { modelId } = req.params;

      // This would fetch metrics from database
      // For now, return mock data
      const metrics = {
        modelId,
        accuracy: 0.85,
        precision: 0.82,
        recall: 0.88,
        f1Score: 0.85,
        trainingHistory: {
          epochs: Array.from({ length: 50 }, (_, i) => i + 1),
          loss: Array.from({ length: 50 }, (_, i) => 0.5 * Math.exp(-i / 20)),
          valLoss: Array.from({ length: 50 }, (_, i) => 0.6 * Math.exp(-i / 25))
        },
        featureImportance: {
          'seasonality': 0.25,
          'dayOfWeek': 0.20,
          'price': 0.18,
          'stockLevel': 0.15,
          'month': 0.12,
          'temperature': 0.10
        }
      };

      const response: ApiResponse<typeof metrics> = {
        success: true,
        data: metrics,
        message: `Retrieved metrics for model ${modelId}`
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve model metrics'
      };
      res.status(500).json(response);
    }
  }

  /**
   * Clean up ML resources
   */
  async cleanup(req: Request, res: Response) {
    try {
      await mlService.cleanup();

      const response: ApiResponse<null> = {
        success: true,
        message: 'ML resources cleaned up successfully'
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cleanup resources'
      };
      res.status(500).json(response);
    }
  }
}

export const mlController = new MLController();
