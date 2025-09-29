import { Request, Response } from 'express';
import { products, categories } from '../data/products';
import { Product, Category } from '../types';

interface VoiceSearchRequest {
  query: string;
  category?: string;
  limit?: number;
}

interface VoiceSearchResponse {
  success: boolean;
  data: {
    products: Product[];
    categories: Category[];
    suggestions: string[];
    confidence: number;
  };
  message?: string;
}

// Simple voice-to-text simulation (in real implementation, use speech recognition API)
const simulateVoiceRecognition = (audioData: string): string => {
  // This would normally process actual audio data
  // For demo purposes, we'll simulate based on text patterns
  const audioText = audioData.toLowerCase();

  if (audioText.includes('tomato') || audioText.includes('tomatoes')) {
    return 'fresh tomatoes';
  } else if (audioText.includes('milk') || audioText.includes('dairy')) {
    return 'amul milk';
  } else if (audioText.includes('spinach') || audioText.includes('vegetable')) {
    return 'organic spinach';
  } else if (audioText.includes('noodles') || audioText.includes('maggi')) {
    return 'maggi noodles';
  } else if (audioText.includes('cola') || audioText.includes('coke')) {
    return 'coca cola';
  } else if (audioText.includes('chicken') || audioText.includes('frozen')) {
    return 'frozen chicken';
  }

  return audioText;
};

// Enhanced fuzzy search algorithm
const fuzzySearch = (query: string, text: string): number => {
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();

  if (textLower.includes(queryLower)) {
    return 1.0; // Exact match
  }

  let score = 0;
  let queryIndex = 0;

  for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) {
      score += 1;
      queryIndex++;
    }
  }

  return score / queryLower.length;
};

// Voice search endpoint
export const voiceSearch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query, category, limit = 10 }: VoiceSearchRequest = req.body;

    if (!query) {
      res.status(400).json({
        success: false,
        message: 'Voice query is required'
      });
      return;
    }

    // Simulate voice recognition (in real app, this would process audio)
    const recognizedText = simulateVoiceRecognition(query);

    // Search products
    const productResults = products
      .map((product: Product) => ({
        ...product,
        searchScore: Math.max(
          fuzzySearch(recognizedText, product.name),
          fuzzySearch(recognizedText, product.barcode),
          fuzzySearch(recognizedText, product.category)
        )
      }))
      .filter((product: any) => product.searchScore > 0.3)
      .sort((a: any, b: any) => b.searchScore - a.searchScore)
      .slice(0, limit);

    // Search categories
    const categoryResults = categories
      .map((cat: Category) => ({
        ...cat,
        searchScore: fuzzySearch(recognizedText, cat.name)
      }))
      .filter((cat: any) => cat.searchScore > 0.2)
      .sort((a: any, b: any) => b.searchScore - a.searchScore)
      .slice(0, 5);

    // Generate suggestions based on search
    const suggestions = [
      ...productResults.slice(0, 3).map((p: any) => p.name),
      ...categoryResults.slice(0, 2).map((c: any) => c.name)
    ];

    // Calculate overall confidence
    const maxScore = Math.max(
      ...productResults.map((p: any) => p.searchScore),
      ...categoryResults.map((c: any) => c.searchScore)
    );
    const confidence = Math.min(maxScore * 100, 95);

    const response: VoiceSearchResponse = {
      success: true,
      data: {
        products: productResults,
        categories: categoryResults,
        suggestions,
        confidence
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Voice search error:', error);
    res.status(500).json({
      success: false,
      message: 'Voice search failed'
    });
  }
};

// Voice command processing
export const processVoiceCommand = async (req: Request, res: Response): Promise<void> => {
  try {
    const { command, context } = req.body;

    if (!command) {
      res.status(400).json({
        success: false,
        message: 'Voice command is required'
      });
      return;
    }

    const commandLower = command.toLowerCase();
    let action = '';
    let parameters: any = {};

    // Parse voice commands
    if (commandLower.includes('add') || commandLower.includes('sell')) {
      action = 'add_sale';

      // Extract product name
      const productMatch = products.find((p: Product) =>
        commandLower.includes(p.name.toLowerCase().split(' ')[0])
      );
      if (productMatch) {
        parameters.productId = productMatch.id;
        parameters.quantity = 1; // Default quantity
      }

      // Extract quantity if mentioned
      const quantityMatch = commandLower.match(/(\d+)/);
      if (quantityMatch) {
        parameters.quantity = parseInt(quantityMatch[1]);
      }
    } else if (commandLower.includes('check') || commandLower.includes('show')) {
      action = 'check_inventory';

      if (commandLower.includes('expiry') || commandLower.includes('expiring')) {
        parameters.type = 'expiring';
      } else if (commandLower.includes('stock') || commandLower.includes('low')) {
        parameters.type = 'low_stock';
      }
    } else if (commandLower.includes('alert') || commandLower.includes('notification')) {
      action = 'get_alerts';
    }

    res.json({
      success: true,
      data: {
        action,
        parameters,
        confidence: 0.85,
        originalCommand: command
      }
    });
  } catch (error) {
    console.error('Voice command processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Voice command processing failed'
    });
  }
};

// Get voice search suggestions
export const getVoiceSuggestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { prefix } = req.query;

    if (!prefix || typeof prefix !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Search prefix is required'
      });
      return;
    }

    const suggestions = [
      ...products
        .filter((p: Product) => p.name.toLowerCase().startsWith(prefix.toLowerCase()))
        .slice(0, 5)
        .map((p: Product) => p.name),
      ...categories
        .filter((c: Category) => c.name.toLowerCase().startsWith(prefix.toLowerCase()))
        .slice(0, 3)
        .map((c: Category) => c.name)
    ];

    res.json({
      success: true,
      data: {
        suggestions,
        count: suggestions.length
      }
    });
  } catch (error) {
    console.error('Voice suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get voice suggestions'
    });
  }
};
