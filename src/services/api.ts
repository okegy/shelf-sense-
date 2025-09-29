import { Product } from '../types/index';


const API_BASE_URL = (import.meta as any)?.env?.VITE_API_BASE_URL ?? 'http://localhost:5000/api';

interface LoginCredentials {
  username: string;
  password: string;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    // Get token from localStorage if available
    this.token = localStorage.getItem('authToken');
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMsg = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMsg = errorData.message || errorData.error || errorMsg;
      } catch (_) {
        // ignore JSON parse error
      }
      if (response.status === 401 || response.status === 403) {
        // Token invalid/expired or permissions issue; clear client auth state
        this.logout();
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || data.error || 'API request failed');
    }

    return data.data;
  }

  async login(credentials: LoginCredentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorData.error || errorMsg;
        } catch (_) {
          // ignore JSON parse error
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || data.error || 'Login failed');
      }

      if (data.token) {
        this.token = data.token;
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(credentials: LoginCredentials & { role?: string }) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorData.error || errorMsg;
        } catch (_) {
          // ignore JSON parse error
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || data.error || 'Registration failed');
      }

      if (data.token) {
        this.token = data.token;
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  logout() {
    this.token = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  // Product API methods
  async getProducts() {
    return this.request('/products');
  }

  async getProductById(id: string) {
    return this.request(`/products/${id}`);
  }

  async getProductByBarcode(barcode: string) {
    return this.request<Product>(`/products/barcode/${barcode}`);
  }

  async searchProducts(query: string) {
    // Backend expects 'query' as the query param name
    return this.request(`/products/search?query=${encodeURIComponent(query)}`);
  }

  async advancedSearchProducts(filters: Record<string, any>) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') return;
      params.append(k, String(v));
    });
    return this.request(`/products/search/advanced?${params.toString()}`);
  }

  async getProductsByCategory(category: string) {
    return this.request(`/products/category/${category}`);
  }

  async createProduct(product: any) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async deleteProduct(id: string) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  async updateProduct(id: string, update: any) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(update),
    });
  }

  async updateProductStock(id: string, count: number) {
    return this.request(`/products/${id}/stock`, {
      method: 'PUT',
      body: JSON.stringify({ count }),
    });
  }

  async getExpiringProducts() {
    return this.request('/products/expiring');
  }

  async getLowStockProducts() {
    return this.request('/products/low-stock');
  }

  // Category API methods
  async getCategories() {
    return this.request('/categories');
  }

  async getCategoryStats() {
    return this.request('/categories/stats');
  }

  // Wholesale API methods
  async getWholesaleBoxes() {
    return this.request('/wholesale');
  }

  async getWholesaleStats() {
    return this.request('/wholesale/stats');
  }

  // Supplier API methods
  async getSuppliers() {
    return this.request('/suppliers');
  }

  async getSupplierStats() {
    return this.request('/suppliers/stats');
  }

  async getTopRatedSuppliers() {
    return this.request('/suppliers/top-rated');
  }

  // Sales API methods
  async getSales() {
    return this.request('/sales');
  }

  async getTodaySales() {
    return this.request('/sales/today');
  }

  async getSalesAnalytics() {
    return this.request('/sales/analytics');
  }

  async createSale(saleData: any) {
    return this.request('/sales', {
      method: 'POST',
      body: JSON.stringify(saleData),
    });
  }

  // IoT Sensor API methods
  async getSensors() {
    return this.request('/sensors');
  }

  async getSensorStats() {
    return this.request('/sensors/stats');
  }

  async getOnlineSensors() {
    return this.request('/sensors/online');
  }

  async getOfflineSensors() {
    return this.request('/sensors/offline');
  }

  // Alert API methods
  async getAlerts() {
    return this.request('/alerts');
  }

  async getUnreadAlerts() {
    return this.request('/alerts/unread');
  }

  async getAlertStats() {
    return this.request('/alerts/stats');
  }

  async markAlertAsRead(alertId: string) {
    return this.request(`/alerts/${alertId}/read`, {
      method: 'PUT',
    });
  }

  async markAllAlertsAsRead() {
    return this.request('/alerts/read-all', {
      method: 'PUT',
    });
  }

  // User API methods
  async getProfile() {
    return this.request('/auth/profile');
  }

  async getAllUsers() {
    return this.request('/users');
  }

  // Voice search API methods
  async voiceSearch(query: string, category?: string, limit?: number) {
    return this.request('/voice/search', {
      method: 'POST',
      body: JSON.stringify({ query, category, limit }),
    });
  }

  async processVoiceCommand(command: string, context?: any) {
    return this.request('/voice/command', {
      method: 'POST',
      body: JSON.stringify({ command, context }),
    });
  }

  async getVoiceSuggestions(prefix: string) {
    return this.request(`/voice/suggestions?prefix=${encodeURIComponent(prefix)}`);
  }

  // ML API methods
  async getMLModels() {
    try {
      return await this.request('/ml/models');
    } catch (err: any) {
      // Backend ML routes may be disabled; return empty list gracefully
      console.warn('ML models endpoint unavailable:', err?.message || err);
      return [];
    }
  }

  async trainMLModel(modelType: string, parameters?: any) {
    try {
      return await this.request('/ml/train', {
        method: 'POST',
        body: JSON.stringify({ modelType, parameters }),
      });
    } catch (err: any) {
      throw new Error('ML training unavailable: ' + (err?.message || 'endpoint disabled on server'));
    }
  }

  async generateMLDataset(datasetConfig: any) {
    try {
      return await this.request('/ml/dataset', {
        method: 'POST',
        body: JSON.stringify(datasetConfig),
      });
    } catch (err: any) {
      throw new Error('Dataset generation unavailable: ' + (err?.message || 'endpoint disabled on server'));
    }
  }

  async predictML(inputData: any) {
    try {
      return await this.request('/ml/predict', {
        method: 'POST',
        body: JSON.stringify(inputData),
      });
    } catch (err: any) {
      throw new Error('Prediction unavailable: ' + (err?.message || 'endpoint disabled on server'));
    }
  }
}

export const apiService = new ApiService();
export default apiService;
