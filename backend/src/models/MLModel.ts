import mongoose, { Schema, Document } from 'mongoose';
import { MLModel } from '../types';

export interface IMLModelDocument extends Document {
  name: string;
  type: 'demand_forecasting' | 'price_optimization' | 'inventory_classification' | 'expiry_prediction' | 'quality_assessment';
  version: string;
  status: 'training' | 'trained' | 'deployed' | 'failed';
  accuracy: number;
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    trainingDataSize: number;
    features: string[];
    algorithm: string;
    parameters: Record<string, any>;
  };
}

const MLModelSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    required: true,
    enum: ['demand_forecasting', 'price_optimization', 'inventory_classification', 'expiry_prediction', 'quality_assessment']
  },
  version: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['training', 'trained', 'deployed', 'failed'],
    default: 'training'
  },
  accuracy: {
    type: Number,
    default: 0
  },
  metadata: {
    trainingDataSize: {
      type: Number,
      default: 0
    },
    features: [{
      type: String
    }],
    algorithm: {
      type: String,
      required: true
    },
    parameters: {
      type: Schema.Types.Mixed,
      default: {}
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
MLModelSchema.index({ type: 1, status: 1 });
MLModelSchema.index({ createdAt: -1 });

export default mongoose.model<IMLModelDocument>('MLModel', MLModelSchema);
