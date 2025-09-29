import { useState, useEffect } from 'react';
import { Scan, Activity, AlertTriangle, CheckCircle, Clock, Zap, Thermometer, Droplets } from 'lucide-react';
import { Product } from '../../types/index';
import { apiService } from '../../services/api';
import { useToast } from '../ui/ToastProvider';

interface CorrosionReading {
  id: string;
  productId: string;
  productName: string;
  corrosionRate: number;
  status: 'fresh' | 'moderate' | 'high_risk' | 'spoiled';
  confidence: number;
  sensorLocation: string;
  temperature?: number;
  humidity?: number;
  ethylene?: number;
  timestamp: string;
}

export default function CorrosionDetectionSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [readings, setReadings] = useState<CorrosionReading[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isBatchScanning, setBatchScanning] = useState(false);
  const [hardwareStatus, setHardwareStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    loadProducts();
    loadRecentReadings();
    checkHardwareStatus();

    // Voice command event listeners
    const handleTriggerHardwareInit = () => {
      if (!hardwareStatus?.connected) {
        initializeHardware();
      }
    };

    const handleTriggerBatchScan = () => {
      if (hardwareStatus?.connected) {
        batchScanProducts();
      } else {
        addToast('Hardware not connected. Initializing first...', 'info');
        initializeHardware().then(() => {
          setTimeout(() => batchScanProducts(), 2000);
        });
      }
    };

    window.addEventListener('trigger-hardware-init', handleTriggerHardwareInit);
    window.addEventListener('trigger-batch-scan', handleTriggerBatchScan);

    return () => {
      window.removeEventListener('trigger-hardware-init', handleTriggerHardwareInit);
      window.removeEventListener('trigger-batch-scan', handleTriggerBatchScan);
    };
  }, [hardwareStatus?.connected]);

  const loadProducts = async () => {
    try {
      const data = await apiService.getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading products:', error);
      addToast('Failed to load products', 'error');
    }
  };

  const loadRecentReadings = async () => {
    try {
      const response = await fetch('/api/hardware/readings?limit=20');
      const data = await response.json();
      if (data.success) {
        setReadings(data.data || []);
      }
    } catch (error) {
      console.error('Error loading readings:', error);
    }
  };

  const checkHardwareStatus = async () => {
    try {
      const response = await fetch('/api/hardware/status');
      const data = await response.json();
      if (data.success) {
        setHardwareStatus(data.data);
      }
    } catch (error) {
      console.error('Error checking hardware status:', error);
    }
  };

  const initializeHardware = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/hardware/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          devicePath: '/dev/ttyUSB0', // Adjust for Windows: 'COM3'
          baudRate: 9600
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setHardwareStatus({ connected: true });
        addToast('Hardware initialized successfully', 'success');
      } else {
        addToast('Failed to initialize hardware', 'error');
      }
    } catch (error) {
      addToast('Hardware initialization error', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const scanProduct = async (product: Product) => {
    if (!hardwareStatus?.connected) {
      addToast('Hardware not connected. Please initialize first.', 'error');
      return;
    }

    setIsScanning(true);
    setSelectedProduct(product);
    
    try {
      const response = await fetch(`/api/hardware/scan/${product.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName: product.name })
      });
      
      const data = await response.json();
      if (data.success) {
        const newReading = data.data;
        setReadings(prev => [newReading, ...prev.slice(0, 19)]);
        addToast(`Scan completed: ${newReading.status.toUpperCase()}`, 'success');
        
        // Reload products to get updated status
        loadProducts();
      } else {
        addToast('Scan failed', 'error');
      }
    } catch (error) {
      addToast('Hardware scan error', 'error');
    } finally {
      setIsScanning(false);
      setSelectedProduct(null);
    }
  };

  const batchScanProducts = async () => {
    if (!hardwareStatus?.connected) {
      addToast('Hardware not connected. Please initialize first.', 'error');
      return;
    }

    const selectedProducts = products.filter(p => p.category === 'Fruits' || p.category === 'Vegetables').slice(0, 5);
    
    if (selectedProducts.length === 0) {
      addToast('No fruits or vegetables found for scanning', 'error');
      return;
    }

    setBatchScanning(true);
    
    try {
      const response = await fetch('/api/hardware/batch-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productIds: selectedProducts.map(p => p.id) 
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setReadings(prev => [...data.data, ...prev.slice(0, 20 - data.data.length)]);
        addToast(`Batch scan completed: ${data.count} products scanned`, 'success');
        loadProducts();
      } else {
        addToast('Batch scan failed', 'error');
      }
    } catch (error) {
      addToast('Batch scan error', 'error');
    } finally {
      setBatchScanning(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fresh': return 'text-green-400 bg-green-500/20';
      case 'moderate': return 'text-yellow-400 bg-yellow-500/20';
      case 'high_risk': return 'text-orange-400 bg-orange-500/20';
      case 'spoiled': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'fresh': return <CheckCircle className="w-4 h-4" />;
      case 'moderate': return <Clock className="w-4 h-4" />;
      case 'high_risk': return <AlertTriangle className="w-4 h-4" />;
      case 'spoiled': return <AlertTriangle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const fruitsAndVegetables = products.filter(p => 
    p.category === 'Fruits' || p.category === 'Vegetables'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Corrosion Rate Detection</h1>
          <p className="text-white/70">Hardware-based freshness analysis for fruits and vegetables</p>
        </div>
        <div className="flex items-center gap-4">
          <div className={`bg-white/10 backdrop-blur-lg rounded-xl px-4 py-2 border border-white/20 ${
            hardwareStatus?.connected ? 'border-green-500/30' : 'border-red-500/30'
          }`}>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                hardwareStatus?.connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
              }`}></div>
              <span className="text-white text-sm">
                {hardwareStatus?.connected ? 'Hardware Connected' : 'Hardware Offline'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Hardware Status & Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/70 text-sm">Hardware Status</p>
              <p className={`text-lg font-bold ${hardwareStatus?.connected ? 'text-green-400' : 'text-red-400'}`}>
                {hardwareStatus?.connected ? 'Connected' : 'Disconnected'}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              hardwareStatus?.connected ? 'bg-green-500/20' : 'bg-red-500/20'
            }`}>
              <Zap className={`w-6 h-6 ${hardwareStatus?.connected ? 'text-green-400' : 'text-red-400'}`} />
            </div>
          </div>
          {!hardwareStatus?.connected && (
            <button
              onClick={initializeHardware}
              disabled={isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Initializing...' : 'Initialize Hardware'}
            </button>
          )}
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Products Scanned</p>
              <p className="text-3xl font-bold text-white">{readings.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Scan className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Fresh Products</p>
              <p className="text-3xl font-bold text-green-400">
                {readings.filter(r => r.status === 'fresh').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">At Risk</p>
              <p className="text-3xl font-bold text-orange-400">
                {readings.filter(r => r.status === 'high_risk' || r.status === 'spoiled').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Scan Controls */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-white">Scan Controls</h3>
          <button
            onClick={batchScanProducts}
            disabled={!hardwareStatus?.connected || isBatchScanning || fruitsAndVegetables.length === 0}
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Scan className="w-4 h-4" />
            {isBatchScanning ? 'Scanning...' : 'Batch Scan All'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fruitsAndVegetables.map(product => (
            <div key={product.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-white font-medium">{product.name}</h4>
                  <p className="text-white/70 text-sm">{product.category}</p>
                </div>
                <span className={`px-2 py-1 rounded-lg text-xs ${getStatusColor(product.status || 'unknown')}`}>
                  {product.status || 'Unknown'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-white/70">
                  Stock: {product.count || 0}
                </div>
                <button
                  onClick={() => scanProduct(product)}
                  disabled={!hardwareStatus?.connected || isScanning || isBatchScanning}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                  {isScanning && selectedProduct?.id === product.id ? (
                    <>
                      <Activity className="w-3 h-3 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Scan className="w-3 h-3" />
                      Scan
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Readings */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-4">Recent Readings</h3>
        
        {readings.length === 0 ? (
          <div className="text-center py-8">
            <Scan className="w-12 h-12 text-white/50 mx-auto mb-4" />
            <p className="text-white/70">No readings yet. Start scanning products to see results.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {readings.slice(0, 10).map(reading => (
              <div key={reading.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-white font-medium">{reading.productName}</h4>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs ${getStatusColor(reading.status)}`}>
                        {getStatusIcon(reading.status)}
                        {reading.status.replace('_', ' ').toUpperCase()}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-white/70">Corrosion Rate:</span>
                        <div className="text-white font-medium">{reading.corrosionRate.toFixed(2)}</div>
                      </div>
                      <div>
                        <span className="text-white/70">Confidence:</span>
                        <div className="text-white font-medium">{(reading.confidence * 100).toFixed(1)}%</div>
                      </div>
                      {reading.temperature && (
                        <div>
                          <span className="text-white/70 flex items-center gap-1">
                            <Thermometer className="w-3 h-3" />
                            Temp:
                          </span>
                          <div className="text-white font-medium">{reading.temperature.toFixed(1)}°C</div>
                        </div>
                      )}
                      {reading.humidity && (
                        <div>
                          <span className="text-white/70 flex items-center gap-1">
                            <Droplets className="w-3 h-3" />
                            Humidity:
                          </span>
                          <div className="text-white font-medium">{reading.humidity.toFixed(1)}%</div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right text-sm text-white/70">
                    {new Date(reading.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
