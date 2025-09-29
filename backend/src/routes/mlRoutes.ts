import { Router } from 'express';
import { mlController } from '../controllers/mlController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all ML routes
router.use(authenticateToken);

/**
 * @swagger
 * /api/ml/dataset:
 *   post:
 *     summary: Generate synthetic dataset for training
 *     tags: [ML]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               numSamples:
 *                 type: integer
 *                 default: 10000
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               noiseLevel:
 *                 type: number
 *                 default: 0.1
 *               seasonality:
 *                 type: boolean
 *                 default: true
 *               trends:
 *                 type: boolean
 *                 default: true
 *               anomalies:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       200:
 *         description: Dataset generated successfully
 *       500:
 *         description: Server error
 */
router.post('/dataset', mlController.generateDataset);

/**
 * @swagger
 * /api/ml/train:
 *   post:
 *     summary: Train a machine learning model
 *     tags: [ML]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - modelType
 *             properties:
 *               modelType:
 *                 type: string
 *                 enum: [demand_forecasting, price_optimization, inventory_classification, expiry_prediction, quality_assessment]
 *               trainingDataId:
 *                 type: string
 *               parameters:
 *                 type: object
 *               testSize:
 *                 type: number
 *                 default: 0.2
 *               epochs:
 *                 type: integer
 *                 default: 50
 *               batchSize:
 *                 type: integer
 *                 default: 32
 *     responses:
 *       200:
 *         description: Model trained successfully
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.post('/train', mlController.trainModel);

/**
 * @swagger
 * /api/ml/predict:
 *   post:
 *     summary: Make a prediction using a trained model
 *     tags: [ML]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - modelId
 *               - inputData
 *             properties:
 *               modelId:
 *                 type: string
 *               inputData:
 *                 type: object
 *               predictionType:
 *                 type: string
 *     responses:
 *       200:
 *         description: Prediction made successfully
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.post('/predict', mlController.makePrediction);

/**
 * @swagger
 * /api/ml/demand-forecast/{productId}:
 *   get:
 *     summary: Get demand forecast for a product
 *     tags: [ML]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *     responses:
 *       200:
 *         description: Demand forecast generated successfully
 *       500:
 *         description: Server error
 */
router.get('/demand-forecast/:productId', mlController.getDemandForecast);

/**
 * @swagger
 * /api/ml/price-optimization/{productId}:
 *   get:
 *     summary: Get price optimization recommendations
 *     tags: [ML]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Price optimization generated successfully
 *       500:
 *         description: Server error
 */
router.get('/price-optimization/:productId', mlController.getPriceOptimization);

/**
 * @swagger
 * /api/ml/inventory-recommendation/{productId}:
 *   get:
 *     summary: Get inventory recommendations
 *     tags: [ML]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Inventory recommendation generated successfully
 *       500:
 *         description: Server error
 */
router.get('/inventory-recommendation/:productId', mlController.getInventoryRecommendation);

/**
 * @swagger
 * /api/ml/quality-prediction/{productId}:
 *   get:
 *     summary: Get quality prediction for a product
 *     tags: [ML]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Quality prediction generated successfully
 *       500:
 *         description: Server error
 */
router.get('/quality-prediction/:productId', mlController.getQualityPrediction);

/**
 * @swagger
 * /api/ml/models:
 *   get:
 *     summary: Get all available ML models
 *     tags: [ML]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Models retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/models', mlController.getModels);

/**
 * @swagger
 * /api/ml/models/{modelId}/metrics:
 *   get:
 *     summary: Get model performance metrics
 *     tags: [ML]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: modelId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Model metrics retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/models/:modelId/metrics', mlController.getModelMetrics);

/**
 * @swagger
 * /api/ml/cleanup:
 *   post:
 *     summary: Clean up ML resources
 *     tags: [ML]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resources cleaned up successfully
 *       500:
 *         description: Server error
 */
router.post('/cleanup', mlController.cleanup);

export default router;
