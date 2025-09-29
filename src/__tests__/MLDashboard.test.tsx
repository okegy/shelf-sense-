import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MLDashboard from '../components/MLDashboard';

// Mock the API service
jest.mock('../services/api', () => ({
  getMLModels: jest.fn(),
  trainMLModel: jest.fn(),
  generateMLDataset: jest.fn()
}));

const mockApi = require('../services/api');

describe('MLDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the ML Dashboard correctly', () => {
    render(<MLDashboard />);

    expect(screen.getByText('AI/ML Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Model Training')).toBeInTheDocument();
    expect(screen.getByText('Dataset Generation')).toBeInTheDocument();
    expect(screen.getByText('Model Overview')).toBeInTheDocument();
  });

  it('should display model training form', () => {
    render(<MLDashboard />);

    expect(screen.getByText('Train New Model')).toBeInTheDocument();
    expect(screen.getByText('Model Type')).toBeInTheDocument();
    expect(screen.getByText('Training Parameters')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start Training' })).toBeInTheDocument();
  });

  it('should display dataset generation form', () => {
    render(<MLDashboard />);

    expect(screen.getByText('Generate Dataset')).toBeInTheDocument();
    expect(screen.getByText('Number of Samples')).toBeInTheDocument();
    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Generate Dataset' })).toBeInTheDocument();
  });

  it('should handle model training', async () => {
    mockApi.trainMLModel.mockResolvedValue({
      success: true,
      modelId: 'test-model-123',
      accuracy: 0.85,
      message: 'Model trained successfully'
    });

    render(<MLDashboard />);

    const trainButton = screen.getByRole('button', { name: 'Start Training' });
    fireEvent.click(trainButton);

    await waitFor(() => {
      expect(mockApi.trainMLModel).toHaveBeenCalledWith('demand_forecasting');
    });
  });

  it('should handle dataset generation', async () => {
    mockApi.generateMLDataset.mockResolvedValue({
      success: true,
      message: 'Dataset generated successfully',
      datasetSize: 1000
    });

    render(<MLDashboard />);

    const generateButton = screen.getByRole('button', { name: 'Generate Dataset' });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(mockApi.generateMLDataset).toHaveBeenCalledWith({
        numSamples: 1000,
        categories: ['Fruits', 'Vegetables', 'Dairy']
      });
    });
  });

  it('should display error messages', async () => {
    mockApi.trainMLModel.mockRejectedValue(new Error('Training failed'));

    render(<MLDashboard />);

    const trainButton = screen.getByRole('button', { name: 'Start Training' });
    fireEvent.click(trainButton);

    await waitFor(() => {
      expect(screen.getByText('Training failed')).toBeInTheDocument();
    });
  });

  it('should show loading states', async () => {
    mockApi.trainMLModel.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<MLDashboard />);

    const trainButton = screen.getByRole('button', { name: 'Start Training' });
    fireEvent.click(trainButton);

    expect(screen.getByText('Training...')).toBeInTheDocument();
  });

  it('should display model overview section', () => {
    render(<MLDashboard />);

    expect(screen.getByText('Trained Models')).toBeInTheDocument();
    expect(screen.getByText('Model Performance')).toBeInTheDocument();
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
  });

  it('should handle form validation', async () => {
    render(<MLDashboard />);

    const trainButton = screen.getByRole('button', { name: 'Start Training' });
    fireEvent.click(trainButton);

    // Should show validation errors for empty form
    await waitFor(() => {
      expect(screen.getByText('Please select a model type')).toBeInTheDocument();
    });
  });
});
