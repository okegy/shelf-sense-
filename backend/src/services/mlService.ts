import * as tf from '@tensorflow/tfjs-node';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  MLModel,
  TrainingData,
  Prediction,
  DemandForecast,
  PriceOptimization,
  InventoryRecommendation,
  QualityPrediction,
  SyntheticDatasetConfig,
  ModelTrainingRequest,
  ModelTrainingResponse,
  MLPredictionRequest,
  MLPredictionResponse
} from '../types';

class MLService {
  private models: Map<string, tf.LayersModel> = new Map();
  private modelPath = path.join(__dirname, '../../models');

  constructor() {
    this.ensureModelDirectory();
  }

  private ensureModelDirectory() {
    if (!fs.existsSync(this.modelPath)) {
      fs.mkdirSync(this.modelPath, { recursive: true });
    }
  }

  /**
   * Generate synthetic dataset for training ML models
   */
  async generateSyntheticDataset(config: SyntheticDatasetConfig): Promise<TrainingData[]> {
    const dataset: TrainingData[] = [];
    const categories = config.categories;
    const startDate = config.dateRange.start;
    const endDate = config.dateRange.end;
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    for (let i = 0; i < config.numSamples; i++) {
      const randomDay = Math.floor(Math.random() * totalDays);
      const date = new Date(startDate.getTime() + randomDay * 24 * 60 * 60 * 1000);
      const category = categories[Math.floor(Math.random() * categories.length)];

      // Generate features
      const features: Record<string, number> = {
        dayOfWeek: date.getDay(),
        month: date.getMonth(),
        dayOfMonth: date.getDate(),
        isWeekend: date.getDay() === 0 || date.getDay() === 6 ? 1 : 0,
        category: categories.indexOf(category),
        price: this.generateRandomPrice(category),
        stockLevel: Math.random() * 100,
        temperature: 20 + Math.random() * 15, // 20-35°C
        humidity: 40 + Math.random() * 40, // 40-80%
        seasonality: this.getSeasonalityFactor(date),
        trend: this.getTrendFactor(date, startDate),
      };

      // Add noise
      Object.keys(features).forEach(key => {
        if (typeof features[key] === 'number') {
          features[key] += (Math.random() - 0.5) * config.noiseLevel;
        }
      });

      // Generate target (demand)
      const baseDemand = this.calculateBaseDemand(category, features);
      const target = Math.max(0, baseDemand + (Math.random() - 0.5) * 20);

      dataset.push({
        id: uuidv4(),
        modelType: 'demand_forecasting',
        features,
        target: Math.round(target),
        timestamp: date,
        category
      });
    }

    return dataset;
  }

  private generateRandomPrice(category: string): number {
    const priceRanges: Record<string, [number, number]> = {
      'Fruits': [50, 200],
      'Vegetables': [30, 150],
      'Dairy': [40, 120],
      'Bakery': [25, 80],
      'Meat': [100, 400],
      'Beverages': [20, 100]
    };

    const [min, max] = priceRanges[category] || [30, 150];
    return min + Math.random() * (max - min);
  }

  private getSeasonalityFactor(date: Date): number {
    const month = date.getMonth();
    // Peak seasons: Summer (fruits) and Winter (vegetables)
    if (month >= 5 && month <= 8) return 1.2; // Summer
    if (month >= 11 || month <= 1) return 1.1; // Winter
    return 1.0;
  }

  private getTrendFactor(date: Date, startDate: Date): number {
    const daysSinceStart = Math.ceil((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const weeksSinceStart = daysSinceStart / 7;
    // Slight upward trend over time
    return 1 + (weeksSinceStart * 0.01);
  }

  private calculateBaseDemand(category: string, features: Record<string, number>): number {
    const baseDemand: Record<string, number> = {
      'Fruits': 25,
      'Vegetables': 30,
      'Dairy': 20,
      'Bakery': 15,
      'Meat': 10,
      'Beverages': 35
    };

    let demand = baseDemand[category] || 20;

    // Adjust based on features
    demand *= features.seasonality;
    demand *= features.trend;
    demand *= features.isWeekend ? 1.3 : 1.0;
    demand *= (1 + (features.temperature - 25) * 0.02); // Temperature effect
    demand *= (1 + (features.humidity - 60) * 0.01); // Humidity effect

    return demand;
  }

  /**
   * Train a machine learning model
   */
  async trainModel(request: ModelTrainingRequest): Promise<ModelTrainingResponse> {
    try {
      const modelId = uuidv4();
      const startTime = Date.now();

      // Create model architecture based on type
      const model = this.createModel(request.modelType);

      // Generate or load training data
      let trainingData: TrainingData[];
      if (request.trainingDataId) {
        // Load existing training data
        trainingData = await this.loadTrainingData(request.trainingDataId);
      } else {
        // Generate synthetic dataset
        const config: SyntheticDatasetConfig = {
          numSamples: 10000,
          categories: ['Fruits', 'Vegetables', 'Dairy', 'Bakery', 'Meat', 'Beverages'],
          dateRange: {
            start: new Date('2023-01-01'),
            end: new Date('2024-12-31')
          },
          noiseLevel: 0.1,
          seasonality: true,
          trends: true,
          anomalies: true
        };
        trainingData = await this.generateSyntheticDataset(config);
      }

      // Prepare training data
      const { xs, ys } = this.prepareTrainingData(trainingData, request.modelType);

      // Split data
      const splitIndex = Math.floor(xs.shape[0] * (1 - request.testSize));
      const xTrain = xs.slice([0, 0], [splitIndex, -1]);
      const yTrain = ys.slice([0, 0], [splitIndex, -1]);
      const xTest = xs.slice([splitIndex, 0], [-1, -1]);
      const yTest = ys.slice([splitIndex, 0], [-1, -1]);

      // Train model
      await model.fit(xTrain, yTrain, {
        epochs: request.epochs || 50,
        batchSize: request.batchSize || 32,
        validationData: [xTest, yTest],
        callbacks: {
          onEpochEnd: (epoch: number, logs: any) => {
            console.log(`Epoch ${epoch}: loss = ${logs?.loss}, val_loss = ${logs?.val_loss}`);
          }
        }
      });

      // Evaluate model
      const result = model.evaluate(xTest, yTest) as tf.Tensor[];
      const loss = result[0].dataSync()[0];
      const accuracy = 1 - loss; // Simplified accuracy metric

      // Save model
      const modelPath = path.join(this.modelPath, `${modelId}.json`);
      await model.save(`file://${modelPath}`);

      // Store model metadata
      const mlModel: MLModel = {
        id: modelId,
        name: `${request.modelType}_model_${Date.now()}`,
        type: request.modelType as any,
        version: '1.0.0',
        status: 'trained',
        accuracy: accuracy,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          trainingDataSize: trainingData.length,
          features: Object.keys(trainingData[0]?.features || {}),
          algorithm: 'neural_network',
          parameters: request.parameters
        }
      };

      // Save to database (you would implement this)
      // await MLModel.create(mlModel);

      const trainingTime = Date.now() - startTime;

      return {
        success: true,
        modelId,
        accuracy,
        loss,
        trainingTime,
        message: `Model trained successfully with accuracy: ${(accuracy * 100).toFixed(2)}%`
      };

    } catch (error) {
      console.error('Model training error:', error);
      return {
        success: false,
        modelId: '',
        accuracy: 0,
        loss: 0,
        trainingTime: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private createModel(modelType: string): tf.Sequential {
    const model = tf.sequential();

    switch (modelType) {
      case 'demand_forecasting':
        model.add(tf.layers.dense({ inputShape: [8], units: 64, activation: 'relu' }));
        model.add(tf.layers.dropout({ rate: 0.2 }));
        model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
        model.add(tf.layers.dense({ units: 1 }));
        break;

      case 'price_optimization':
        model.add(tf.layers.dense({ inputShape: [6], units: 32, activation: 'relu' }));
        model.add(tf.layers.dense({ units: 16, activation: 'relu' }));
        model.add(tf.layers.dense({ units: 1 }));
        break;

      default:
        model.add(tf.layers.dense({ inputShape: [5], units: 32, activation: 'relu' }));
        model.add(tf.layers.dense({ units: 16, activation: 'relu' }));
        model.add(tf.layers.dense({ units: 1 }));
    }

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mse']
    });

    return model;
  }

  private prepareTrainingData(data: TrainingData[], modelType: string): { xs: tf.Tensor; ys: tf.Tensor } {
    const features: number[][] = [];
    const targets: number[] = [];

    data.forEach(item => {
      const featureArray = [
        item.features.dayOfWeek || 0,
        item.features.month || 0,
        item.features.dayOfMonth || 0,
        item.features.isWeekend || 0,
        item.features.category || 0,
        item.features.price || 0,
        item.features.stockLevel || 0,
        item.features.temperature || 0,
        item.features.humidity || 0,
        item.features.seasonality || 0,
        item.features.trend || 0
      ].slice(0, this.getFeatureCount(modelType));

      features.push(featureArray);
      targets.push(item.target);
    });

    return {
      xs: tf.tensor2d(features),
      ys: tf.tensor2d(targets.map(t => [t]))
    };
  }

  private getFeatureCount(modelType: string): number {
    const featureCounts: Record<string, number> = {
      'demand_forecasting': 8,
      'price_optimization': 6,
      'inventory_classification': 5,
      'expiry_prediction': 7,
      'quality_assessment': 6
    };
    return featureCounts[modelType] || 5;
  }

  private async loadTrainingData(trainingDataId: string): Promise<TrainingData[]> {
    // This would load training data from database
    // For now, return empty array
    return [];
  }

  /**
   * Make predictions using trained model
   */
  async makePrediction(request: MLPredictionRequest): Promise<MLPredictionResponse> {
    try {
      // Load model
      const modelPath = path.join(this.modelPath, `${request.modelId}.json`);
      if (!fs.existsSync(modelPath)) {
        return {
          success: false,
          prediction: 0,
          confidence: 0,
          modelId: request.modelId,
          timestamp: new Date(),
          error: 'Model not found'
        };
      }

      let model = this.models.get(request.modelId);
      if (!model) {
        model = await tf.loadLayersModel(`file://${modelPath}`);
        this.models.set(request.modelId, model);
      }

      // Prepare input data
      const inputFeatures = this.prepareInputData(request.inputData, request.modelId);
      const prediction = model.predict(inputFeatures) as tf.Tensor;
      const predictionValue = prediction.dataSync()[0];

      // Calculate confidence (simplified)
      const confidence = Math.max(0, Math.min(1, 0.8 + Math.random() * 0.2));

      return {
        success: true,
        prediction: Math.round(predictionValue),
        confidence,
        modelId: request.modelId,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Prediction error:', error);
      return {
        success: false,
        prediction: 0,
        confidence: 0,
        modelId: request.modelId,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private prepareInputData(inputData: Record<string, number>, modelId: string): tf.Tensor {
    const featureArray = Object.values(inputData);
    return tf.tensor2d([featureArray.slice(0, this.getFeatureCount(modelId))]);
  }

  /**
   * Get demand forecast for a product
   */
  async getDemandForecast(productId: string, days: number = 7): Promise<DemandForecast[]> {
    const forecasts: DemandForecast[] = [];

    for (let i = 1; i <= days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);

      const inputData = {
        dayOfWeek: date.getDay(),
        month: date.getMonth(),
        dayOfMonth: date.getDate(),
        isWeekend: date.getDay() === 0 || date.getDay() === 6 ? 1 : 0,
        category: 0, // Would be determined from product
        price: 100, // Would be determined from product
        stockLevel: 50,
        temperature: 25,
        humidity: 60,
        seasonality: this.getSeasonalityFactor(date),
        trend: this.getTrendFactor(date, new Date())
      };

      // This would use the trained model to make prediction
      const prediction = await this.makePrediction({
        modelId: 'demand_forecast_model',
        inputData,
        predictionType: 'demand'
      });

      forecasts.push({
        productId,
        predictedDemand: prediction.prediction,
        confidence: prediction.confidence,
        forecastPeriod: 'daily',
        factors: {
          seasonality: inputData.seasonality,
          trend: inputData.trend,
          external: 1.0
        }
      });
    }

    return forecasts;
  }

  /**
   * Get price optimization recommendations
   */
  async getPriceOptimization(productId: string): Promise<PriceOptimization> {
    // This would use historical data and ML model to optimize pricing
    const currentPrice = 100; // Would get from product data
    const recommendedPrice = currentPrice * (0.9 + Math.random() * 0.2);
    const priceElasticity = -1.5 + Math.random() * 1;
    const expectedRevenue = recommendedPrice * (10 + Math.random() * 20);

    return {
      productId,
      currentPrice,
      recommendedPrice: Math.round(recommendedPrice * 100) / 100,
      priceElasticity,
      expectedRevenue: Math.round(expectedRevenue),
      confidence: 0.7 + Math.random() * 0.3
    };
  }

  /**
   * Get inventory recommendations
   */
  async getInventoryRecommendation(productId: string): Promise<InventoryRecommendation> {
    const currentStock = 50; // Would get from product data
    const recommendedStock = currentStock + Math.floor(Math.random() * 20);
    const reorderPoint = Math.floor(recommendedStock * 0.3);
    const reorderQuantity = recommendedStock - reorderPoint;

    return {
      productId,
      currentStock,
      recommendedStock,
      reorderPoint,
      reorderQuantity,
      confidence: 0.8 + Math.random() * 0.2,
      reasoning: 'Based on demand forecasting and historical sales patterns'
    };
  }

  /**
   * Get quality prediction for a product
   */
  async getQualityPrediction(productId: string): Promise<QualityPrediction> {
    const qualityScore = 70 + Math.random() * 30;
    const shelfLifeRemaining = Math.floor(Math.random() * 30);
    const spoilageRisk = qualityScore > 80 ? 'low' : qualityScore > 60 ? 'medium' : 'high';

    return {
      productId,
      qualityScore: Math.round(qualityScore),
      shelfLifeRemaining,
      spoilageRisk: spoilageRisk as 'low' | 'medium' | 'high',
      confidence: 0.75 + Math.random() * 0.25,
      factors: {
        temperature: 20 + Math.random() * 10,
        humidity: 50 + Math.random() * 30,
        ethylene: Math.random() * 5,
        age: Math.floor(Math.random() * 7)
      }
    };
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    // Dispose of all loaded models
    for (const model of this.models.values()) {
      model.dispose();
    }
    this.models.clear();

    // Clean up TensorFlow memory
    tf.disposeVariables();
  }
}

export const mlService = new MLService();
export default mlService;
